import Darwin
import Foundation

public enum UnixSocketError: LocalizedError {
    case createFailed(Int32)
    case bindFailed(Int32)
    case connectFailed(Int32)
    case listenFailed(Int32)
    case pathTooLong
    case messageTooLarge(Int)
    case readTimedOut
    case readFailed(Int32)
    case writeFailed(Int32)

    public var errorDescription: String? {
        switch self {
        case let .createFailed(code): "Unable to create socket (errno \(code))."
        case let .bindFailed(code): "Unable to bind socket (errno \(code))."
        case let .connectFailed(code): "Unable to connect to Xyne Island (errno \(code))."
        case let .listenFailed(code): "Unable to listen on socket (errno \(code))."
        case .pathTooLong: "Unix socket path is too long."
        case let .messageTooLarge(limit): "Message exceeds the \(limit)-byte limit."
        case .readTimedOut: "Timed out while reading a message."
        case let .readFailed(code): "Unable to read from socket (errno \(code))."
        case let .writeFailed(code): "Unable to write to socket (errno \(code))."
        }
    }
}

private func socketAddress(for path: String) throws -> sockaddr_un {
    var address = sockaddr_un()
    address.sun_family = sa_family_t(AF_UNIX)

    let utf8 = Array(path.utf8CString)
    let capacity = MemoryLayout.size(ofValue: address.sun_path)
    guard utf8.count <= capacity else { throw UnixSocketError.pathTooLong }

    withUnsafeMutablePointer(to: &address.sun_path) { pointer in
        pointer.withMemoryRebound(to: CChar.self, capacity: capacity) { destination in
            _ = utf8.withUnsafeBufferPointer { source in
                memcpy(destination, source.baseAddress, utf8.count)
            }
        }
    }
    return address
}

private func writeAll(_ data: Data, to descriptor: Int32) throws {
    try data.withUnsafeBytes { rawBuffer in
        guard let baseAddress = rawBuffer.baseAddress else { return }
        var offset = 0
        while offset < data.count {
            let result = Darwin.write(descriptor, baseAddress.advanced(by: offset), data.count - offset)
            if result < 0 {
                if errno == EINTR { continue }
                throw UnixSocketError.writeFailed(errno)
            }
            offset += result
        }
    }
}

func readLine(from descriptor: Int32, maxBytes: Int = 1_048_576) throws -> Data {
    var result = Data()
    var buffer = [UInt8](repeating: 0, count: 4_096)

    while true {
        let count = Darwin.read(descriptor, &buffer, buffer.count)
        if count == 0 { return result }
        if count < 0 {
            if errno == EINTR { continue }
            if errno == EAGAIN || errno == EWOULDBLOCK { throw UnixSocketError.readTimedOut }
            throw UnixSocketError.readFailed(errno)
        }

        if let newline = buffer[..<count].firstIndex(of: 0x0A) {
            guard result.count + newline <= maxBytes else {
                throw UnixSocketError.messageTooLarge(maxBytes)
            }
            result.append(contentsOf: buffer[..<newline])
            return result
        }
        guard result.count + count <= maxBytes else {
            throw UnixSocketError.messageTooLarge(maxBytes)
        }
        result.append(contentsOf: buffer[..<count])
    }
}

public enum UnixSocketClient {
    public static func send(
        envelope: IslandEvent,
        socketPath: String = IslandSocket.current
    ) throws -> Data? {
        let descriptor = Darwin.socket(AF_UNIX, SOCK_STREAM, 0)
        guard descriptor >= 0 else { throw UnixSocketError.createFailed(errno) }
        defer { Darwin.close(descriptor) }
        var noSignal: Int32 = 1
        setsockopt(
            descriptor,
            SOL_SOCKET,
            SO_NOSIGPIPE,
            &noSignal,
            socklen_t(MemoryLayout<Int32>.size)
        )

        var address = try socketAddress(for: socketPath)
        let result = withUnsafePointer(to: &address) { pointer in
            pointer.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                Darwin.connect(descriptor, $0, socklen_t(MemoryLayout<sockaddr_un>.size))
            }
        }
        guard result == 0 else { throw UnixSocketError.connectFailed(errno) }

        var data = try JSONEncoder.island.encode(envelope)
        data.append(0x0A)
        try writeAll(data, to: descriptor)

        guard envelope.expectsAnswer else { return nil }
        let response = try readLine(from: descriptor)
        return response.isEmpty ? nil : response
    }
}

public final class IslandResponder: @unchecked Sendable {
    private let lock = NSLock()
    private var descriptor: Int32?

    fileprivate init(descriptor: Int32) {
        self.descriptor = descriptor
    }

    public func respond(with data: Data) {
        lock.lock()
        guard let descriptor else {
            lock.unlock()
            return
        }
        self.descriptor = nil
        lock.unlock()

        var response = data
        response.append(0x0A)
        try? writeAll(response, to: descriptor)
        Darwin.close(descriptor)
    }

    public func cancel() {
        lock.lock()
        guard let descriptor else {
            lock.unlock()
            return
        }
        self.descriptor = nil
        lock.unlock()
        Darwin.close(descriptor)
    }

    deinit {
        cancel()
    }
}

public final class UnixSocketServer: @unchecked Sendable {
    public typealias Handler = (IslandEvent, IslandResponder?) -> Void

    private let socketPath: String
    private let maximumMessageBytes: Int
    private let readTimeout: TimeInterval
    private let queue = DispatchQueue(label: "in.juspay.xyne-island.socket-listener", qos: .userInitiated)
    private let workerQueue = DispatchQueue(label: "in.juspay.xyne-island.socket-workers", qos: .utility, attributes: .concurrent)
    private let connectionLimiter: DispatchSemaphore
    private var descriptor: Int32 = -1
    private var source: DispatchSourceRead?
    private var handler: Handler?

    public init(
        socketPath: String = IslandSocket.current,
        maximumMessageBytes: Int = 1_048_576,
        readTimeout: TimeInterval = 5,
        maximumConcurrentConnections: Int = 16
    ) {
        self.socketPath = socketPath
        self.maximumMessageBytes = max(1, maximumMessageBytes)
        self.readTimeout = max(0.1, readTimeout)
        connectionLimiter = DispatchSemaphore(value: max(1, maximumConcurrentConnections))
    }

    public func start(handler: @escaping Handler) throws {
        stop()
        self.handler = handler
        unlink(socketPath)

        let descriptor = Darwin.socket(AF_UNIX, SOCK_STREAM, 0)
        guard descriptor >= 0 else { throw UnixSocketError.createFailed(errno) }
        self.descriptor = descriptor
        _ = fcntl(descriptor, F_SETFL, O_NONBLOCK)

        var address = try socketAddress(for: socketPath)
        let bindResult = withUnsafePointer(to: &address) { pointer in
            pointer.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                Darwin.bind(descriptor, $0, socklen_t(MemoryLayout<sockaddr_un>.size))
            }
        }
        guard bindResult == 0 else {
            let code = errno
            stop()
            throw UnixSocketError.bindFailed(code)
        }
        chmod(socketPath, S_IRUSR | S_IWUSR)

        guard Darwin.listen(descriptor, 32) == 0 else {
            let code = errno
            stop()
            throw UnixSocketError.listenFailed(code)
        }

        let source = DispatchSource.makeReadSource(fileDescriptor: descriptor, queue: queue)
        source.setEventHandler { [weak self] in self?.acceptPendingConnections() }
        source.setCancelHandler { Darwin.close(descriptor) }
        self.source = source
        source.resume()
    }

    public func stop() {
        if let source {
            source.cancel()
            self.source = nil
        } else if descriptor >= 0 {
            Darwin.close(descriptor)
        }
        descriptor = -1
        unlink(socketPath)
    }

    private func acceptPendingConnections() {
        guard descriptor >= 0 else { return }
        while true {
            let client = Darwin.accept(descriptor, nil, nil)
            if client < 0 {
                if errno == EINTR { continue }
                break
            }
            let flags = fcntl(client, F_GETFL)
            if flags >= 0 { _ = fcntl(client, F_SETFL, flags & ~O_NONBLOCK) }
            var noSignal: Int32 = 1
            setsockopt(
                client,
                SOL_SOCKET,
                SO_NOSIGPIPE,
                &noSignal,
                socklen_t(MemoryLayout<Int32>.size)
            )
            var timeout = timeval(
                tv_sec: Int(readTimeout),
                tv_usec: Int32((readTimeout.truncatingRemainder(dividingBy: 1)) * 1_000_000)
            )
            setsockopt(
                client,
                SOL_SOCKET,
                SO_RCVTIMEO,
                &timeout,
                socklen_t(MemoryLayout<timeval>.size)
            )

            guard connectionLimiter.wait(timeout: .now()) == .success else {
                Darwin.close(client)
                continue
            }
            workerQueue.async { [weak self] in
                guard let self else {
                    Darwin.close(client)
                    return
                }
                defer { self.connectionLimiter.signal() }
                self.handle(client: client)
            }
        }
    }

    private func handle(client: Int32) {
        do {
            var peerUserID: uid_t = 0
            var peerGroupID: gid_t = 0
            guard getpeereid(client, &peerUserID, &peerGroupID) == 0,
                  peerUserID == getuid() else {
                Darwin.close(client)
                return
            }
            let data = try readLine(from: client, maxBytes: maximumMessageBytes)
            let envelope = try JSONDecoder.island.decode(IslandEvent.self, from: data)
            if envelope.expectsAnswer {
                handler?(envelope, IslandResponder(descriptor: client))
            } else {
                handler?(envelope, nil)
                Darwin.close(client)
            }
        } catch {
            Darwin.close(client)
        }
    }

    deinit {
        stop()
    }
}

private extension JSONEncoder {
    static var island: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }
}

private extension JSONDecoder {
    static var island: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }
}
