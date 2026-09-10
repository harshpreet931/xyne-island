import Darwin
import Foundation
import XCTest
@testable import XyneIslandCore

final class UnixSocketTests: XCTestCase {
    func testReadLineRejectsOversizedMessages() throws {
        var descriptors: [Int32] = [-1, -1]
        XCTAssertEqual(socketpair(AF_UNIX, SOCK_STREAM, 0, &descriptors), 0)
        defer {
            Darwin.close(descriptors[0])
            Darwin.close(descriptors[1])
        }

        let oversized = Data(repeating: 0x41, count: 64) + Data([0x0A])
        _ = oversized.withUnsafeBytes { bytes in
            Darwin.write(descriptors[0], bytes.baseAddress, oversized.count)
        }

        XCTAssertThrowsError(try readLine(from: descriptors[1], maxBytes: 32)) { error in
            guard case UnixSocketError.messageTooLarge(32) = error else {
                return XCTFail("Expected messageTooLarge, received \(error)")
            }
        }
    }

    func testHeldOpenCardRoundTripsAnAnswer() throws {
        let socketPath = "/tmp/xyne-island-test-\(UUID().uuidString.prefix(8)).sock"
        let server = UnixSocketServer(socketPath: socketPath)
        let received = expectation(description: "server received the card")

        try server.start { event, responder in
            XCTAssertEqual(event.kind, .card)
            XCTAssertEqual(event.card?.cast, .mention)
            XCTAssertTrue(event.expectsAnswer)
            received.fulfill()
            let answer = IslandAnswer(eventID: event.id, choice: .open)
            responder?.respond(with: try! JSONEncoder().encode(answer))
        }
        defer { server.stop() }

        let event = IslandEvent(
            id: "event-1",
            kind: .card,
            card: CardPayload(
                id: "act:1",
                cast: .mention,
                title: "Priya Raman",
                activity: "POT for #1653?",
                state: .needsYou
            ),
            expectsAnswer: true
        )
        let response = try UnixSocketClient.send(envelope: event, socketPath: socketPath)
        let answer = try JSONDecoder().decode(IslandAnswer.self, from: try XCTUnwrap(response))

        XCTAssertEqual(answer.choice, .open)
        XCTAssertEqual(answer.eventID, "event-1")
        wait(for: [received], timeout: 1)
    }
}
