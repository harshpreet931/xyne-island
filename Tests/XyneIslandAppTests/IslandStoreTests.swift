import XCTest
@testable import XyneIslandApp
@testable import XyneIslandCore

@MainActor
final class IslandStoreTests: XCTestCase {
    private func cardEvent(
        id: String,
        cast: CastID = .bot,
        state: CardState,
        title: String = "infra-doctor · #production-logs",
        activity: String = "Working",
        detail: String? = nil,
        prompt: PromptPayload? = nil,
        expectsAnswer: Bool = false,
        eventID: String = UUID().uuidString
    ) -> IslandEvent {
        IslandEvent(
            id: eventID,
            kind: .card,
            card: CardPayload(
                id: id,
                cast: cast,
                title: title,
                activity: activity,
                state: state,
                link: "https://spaces.xyne.juspay.net",
                detail: detail,
                prompt: prompt
            ),
            expectsAnswer: expectsAnswer
        )
    }

    func testAFinishedCardKeepsItsAnswerOnScreen() throws {
        let store = IslandStore()
        store.ingest(cardEvent(id: "doc-1", state: .done, activity: "RCA ready", detail: "Finished and verified the change."), responder: nil)

        let card = try XCTUnwrap(store.cards.first)
        XCTAssertEqual(card.state, .done)
        XCTAssertEqual(store.reveal(for: card)?.text, "Finished and verified the change.")
        XCTAssertTrue(store.isFeatured(card))
    }

    func testAnUpdateWithoutAnAnswerClearsTheOldOne() throws {
        let store = IslandStore()
        store.ingest(cardEvent(id: "doc-1", state: .done, detail: "First answer."), responder: nil)
        store.ingest(cardEvent(id: "doc-1", state: .working, activity: "Following up"), responder: nil)

        let card = try XCTUnwrap(store.cards.first)
        XCTAssertNil(store.reveal(for: card))
        XCTAssertNil(store.latestReveal)
    }

    func testFinishedCardsRetireOnTheirOwn() async {
        let store = IslandStore(retention: .milliseconds(20))
        store.ingest(cardEvent(id: "doc-1", state: .done, detail: "Done."), responder: nil)
        XCTAssertEqual(store.cards.count, 1)

        try? await Task.sleep(for: .milliseconds(80))

        XCTAssertTrue(store.cards.isEmpty)
        XCTAssertNil(store.latestReveal)
    }

    func testWorkingCardsStayUntilTheSidecarRetiresThem() async throws {
        let store = IslandStore(retention: .milliseconds(20))
        store.ingest(cardEvent(id: "arch-1", cast: .architect, state: .working), responder: nil)

        try? await Task.sleep(for: .milliseconds(80))
        XCTAssertEqual(store.cards.count, 1, "Work in motion must not disappear on a timer")

        store.ingest(
            IslandEvent(kind: .retire, card: CardPayload(id: "arch-1", cast: .architect, title: "", activity: "", state: .done)),
            responder: nil
        )
        XCTAssertTrue(store.cards.isEmpty)
    }

    func testTheSameCardFromTwoCastMembersStaysTwoCards() {
        let store = IslandStore()
        store.ingest(cardEvent(id: "shared", cast: .mention, state: .needsYou), responder: nil)
        store.ingest(cardEvent(id: "shared", cast: .ticket, state: .needsYou), responder: nil)

        XCTAssertEqual(store.cards.count, 2)
    }

    func testAttentionCountsOnlyWhatIsWaitingOnYou() {
        let store = IslandStore()
        store.ingest(cardEvent(id: "a", cast: .mention, state: .needsYou), responder: nil)
        store.ingest(cardEvent(id: "b", cast: .ticket, state: .approval), responder: nil)
        store.ingest(cardEvent(id: "c", cast: .architect, state: .working), responder: nil)
        store.ingest(cardEvent(id: "d", cast: .ticket, state: .overdue), responder: nil)

        XCTAssertEqual(store.attentionCount, 2)
        XCTAssertEqual(store.finishedCount, 1)
    }

    func testWhatNeedsYouSortsAboveEverythingElse() throws {
        let store = IslandStore()
        store.ingest(cardEvent(id: "working", cast: .architect, state: .working), responder: nil)
        store.ingest(cardEvent(id: "fyi", cast: .ticket, state: .fyi), responder: nil)
        store.ingest(cardEvent(id: "needs", cast: .mention, state: .needsYou), responder: nil)

        XCTAssertEqual(store.visibleCards.first?.id.id, "needs")
    }

    func testStatusEventsExplainAnEmptyIsland() {
        let store = IslandStore()
        store.ingest(
            IslandEvent(kind: .status, status: StatusPayload(state: .signedOut, message: "No Spaces session")),
            responder: nil
        )

        XCTAssertEqual(store.bridge.state, .signedOut)
        XCTAssertEqual(store.bridge.message, "No Spaces session")
    }

    func testTheFirstCardMarksTheBridgeConnected() {
        let store = IslandStore()
        XCTAssertEqual(store.bridge.state, .waiting)

        store.ingest(cardEvent(id: "a", cast: .mention, state: .needsYou), responder: nil)

        XCTAssertEqual(store.bridge.state, .connected)
    }

    func testAnsweringAPromptWithNobodyListeningStillMovesThePreviewOn() throws {
        let store = IslandStore()
        store.loadPreview()
        let card = try XCTUnwrap(store.cards.first { $0.prompt != nil })

        store.dismissPrompt(card)

        let updated = try XCTUnwrap(store.cards.first { $0.id == card.id })
        XCTAssertNil(updated.prompt)
        XCTAssertEqual(updated.state, .working)
    }
}
