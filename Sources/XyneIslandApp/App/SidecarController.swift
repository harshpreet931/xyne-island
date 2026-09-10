import AppKit
import Foundation
import XyneIslandCore

/// Runs the Spaces bridge for you.
///
/// A downloaded app cannot ask someone to keep a terminal open, so the app owns
/// the sidecar's lifetime: it starts it at launch, restarts it with backoff if
/// it dies, and stops it on quit. Everything the sidecar prints goes to a log
/// file rather than a terminal nobody is watching.
@MainActor
final class SidecarController {
    private weak var store: IslandStore?
    private var process: Process?
    private var restartTask: Task<Void, Never>?
    private var consecutiveFailures = 0
    private var isStopping = false

    /// Where `node` and `spaces` actually live for this user.
    private let environment = LoginEnvironment()

    init(store: IslandStore) {
        self.store = store
    }

    var logURL: URL {
        let directory = FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library/Logs/Xyne Island", isDirectory: true)
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory.appendingPathComponent("sidecar.log")
    }

    func start() {
        guard process == nil, !isStopping else { return }

        guard let entry = Self.sidecarEntry() else {
            store?.updateBridge(.degraded, message: "Bridge missing from the app bundle · reinstall Xyne Island")
            return
        }
        guard let node = environment.locate("node") else {
            store?.updateBridge(.degraded, message: "Node 22.6+ not found · install Node, then reopen Xyne Island")
            return
        }

        let task = Process()
        task.executableURL = node
        task.arguments = ["--experimental-strip-types", "--no-warnings", entry.path]
        task.currentDirectoryURL = entry.deletingLastPathComponent()

        var childEnvironment = ProcessInfo.processInfo.environment
        childEnvironment["PATH"] = environment.path
        childEnvironment["XYNE_ISLAND_ENV"] = Self.credentialsPath().path
        task.environment = childEnvironment

        if let handle = try? FileHandle(forWritingTo: prepareLog()) {
            handle.seekToEndOfFile()
            task.standardOutput = handle
            task.standardError = handle
        }

        task.terminationHandler = { [weak self] finished in
            Task { @MainActor in
                self?.handleExit(status: finished.terminationStatus)
            }
        }

        do {
            try task.run()
            process = task
            store?.updateBridge(.waiting, message: "Connecting to Spaces…")
        } catch {
            store?.updateBridge(.degraded, message: "Could not start the bridge: \(error.localizedDescription)")
            scheduleRestart()
        }
    }

    func stop() {
        terminate(permanently: true)
    }

    func restart() {
        terminate(permanently: false)
        consecutiveFailures = 0
        start()
    }

    private func terminate(permanently: Bool) {
        isStopping = true
        restartTask?.cancel()
        restartTask = nil
        process?.terminationHandler = nil
        process?.terminate()
        process = nil
        isStopping = permanently
    }

    /// Forces a new Spaces token, then restarts the bridge with it.
    func refreshToken() {
        guard let spaces = environment.locate("spaces") else {
            presentMissingCLI()
            return
        }
        store?.updateBridge(.waiting, message: "Refreshing your Spaces token…")

        let task = Process()
        task.executableURL = spaces
        task.arguments = ["token", "--update", "--env", Self.credentialsPath().path]
        var childEnvironment = ProcessInfo.processInfo.environment
        childEnvironment["PATH"] = environment.path
        task.environment = childEnvironment
        let pipe = Pipe()
        task.standardOutput = pipe
        task.standardError = pipe

        do {
            try task.run()
        } catch {
            store?.updateBridge(.degraded, message: "Could not run `spaces token --update`")
            return
        }

        Task.detached {
            let output = String(decoding: pipe.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self)
            task.waitUntilExit()
            let status = task.terminationStatus
            await MainActor.run { [weak self] in
                guard let self else { return }
                if status == 0 {
                    self.restart()
                } else {
                    self.store?.updateBridge(
                        .signedOut,
                        message: output.split(separator: "\n").last.map(String.init) ?? "Sign in to Spaces in your browser, then try again"
                    )
                }
            }
        }
    }

    // MARK: - Lifetime

    private func handleExit(status: Int32) {
        process = nil
        guard !isStopping else { return }
        // Exit code 78 (EX_CONFIG) is the sidecar saying "no Spaces session".
        // Restarting cannot fix that, so leave the notch showing what to do.
        if status == 78 {
            store?.updateBridge(.signedOut, message: "Sign in to Spaces in your browser, then choose Refresh Token")
            return
        }
        consecutiveFailures += 1
        store?.updateBridge(.degraded, message: "Bridge stopped (code \(status)) · restarting")
        scheduleRestart()
    }

    private func scheduleRestart() {
        restartTask?.cancel()
        // 2s, 4s, 8s … capped at a minute, so a permanently broken install
        // does not spin.
        let delay = min(60, Int(pow(2.0, Double(min(consecutiveFailures, 5)))) * 2)
        restartTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(delay))
            guard !Task.isCancelled else { return }
            await MainActor.run { self?.start() }
        }
    }

    private func prepareLog() -> URL {
        let url = logURL
        if !FileManager.default.fileExists(atPath: url.path) {
            FileManager.default.createFile(atPath: url.path, contents: nil)
        }
        // Keep the log from growing without bound across months of launches.
        if let size = try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int, size > 2_000_000 {
            try? FileManager.default.removeItem(at: url)
            FileManager.default.createFile(atPath: url.path, contents: nil)
        }
        return url
    }

    private func presentMissingCLI() {
        store?.updateBridge(.signedOut, message: "The Spaces CLI is not installed · npm i -g @xyne/spaces-cli")
        let alert = NSAlert()
        alert.alertStyle = .informational
        alert.messageText = "The Spaces CLI is not installed"
        alert.informativeText = """
        Xyne Island reads your Spaces session through the `spaces` command line tool.

        Install it, then choose Refresh Token again:

            npm install -g @xyne/spaces-cli
        """
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }

    // MARK: - Locations

    /// The credential file the app and the sidecar share. It lives outside the
    /// repository so a checkout can never carry someone's token.
    static func credentialsPath() -> URL {
        let directory = FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent(".config/xyne-island", isDirectory: true)
        try? FileManager.default.createDirectory(
            at: directory,
            withIntermediateDirectories: true,
            attributes: [.posixPermissions: 0o700]
        )
        return directory.appendingPathComponent("env")
    }

    /// The bundled bridge, or a working copy when running from a checkout.
    private static func sidecarEntry() -> URL? {
        var candidates: [URL] = []
        if let override = ProcessInfo.processInfo.environment["XYNE_ISLAND_SIDECAR"] {
            candidates.append(URL(fileURLWithPath: override))
        }
        if let resources = Bundle.main.resourceURL {
            candidates.append(resources.appendingPathComponent("sidecar/src/main.ts"))
        }
        // `swift run` from the repository: walk up from the built binary.
        if let executable = Bundle.main.executableURL {
            var directory = executable.deletingLastPathComponent()
            for _ in 0..<6 {
                candidates.append(directory.appendingPathComponent("sidecar/src/main.ts"))
                directory = directory.deletingLastPathComponent()
            }
        }
        return candidates.first { FileManager.default.isReadableFile(atPath: $0.path) }
    }
}

/// The PATH a person actually has, not the one a double-clicked app inherits.
///
/// Launching from Finder gives a bare `/usr/bin:/bin:/usr/sbin:/sbin`, which
/// contains neither `node` nor `spaces` on a normal developer Mac. Asking the
/// login shell once is what makes the packaged app behave like the terminal.
private final class LoginEnvironment {
    lazy var path: String = Self.resolvePath()

    func locate(_ tool: String) -> URL? {
        for directory in path.split(separator: ":") {
            let candidate = URL(fileURLWithPath: String(directory)).appendingPathComponent(tool)
            if FileManager.default.isExecutableFile(atPath: candidate.path) { return candidate }
        }
        return nil
    }

    private static func resolvePath() -> String {
        let fallback = [
            "/opt/homebrew/bin",
            "/usr/local/bin",
            NSHomeDirectory() + "/.npm-global/bin",
            "/usr/bin",
            "/bin",
            "/usr/sbin",
            "/sbin",
        ].joined(separator: ":")

        let shell = ProcessInfo.processInfo.environment["SHELL"] ?? "/bin/zsh"
        let task = Process()
        task.executableURL = URL(fileURLWithPath: shell)
        task.arguments = ["-lc", "printf %s \"$PATH\""]
        let pipe = Pipe()
        task.standardOutput = pipe
        task.standardError = FileHandle.nullDevice

        do {
            try task.run()
        } catch {
            return fallback
        }
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        task.waitUntilExit()
        let resolved = String(decoding: data, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines)
        return resolved.isEmpty ? fallback : resolved + ":" + fallback
    }
}
