import Foundation
import XCTest
@testable import XyneIslandCore

final class CardNormalizerTests: XCTestCase {
    private func event(
        id: String = "event-1",
        kind: IslandEvent.Kind = .card,
        expectsAnswer: Bool = false,
        card: CardPayload?
    ) -> IslandEvent {
        IslandEvent(id: id, kind: kind, card: card, expectsAnswer: expectsAnswer)
    }

    func testCardCarriesEveryFieldTheNotchDraws() throws {
        let card = try XCTUnwrap(CardNormalizer.card(from: event(card: CardPayload(
            id: "act:42",
            cast: .ticket,
            title: "XYNE-62857 · Add flag for custom runners",
            activity: "Assigned to you by Devin",
            context: "/XYNE-62857",
            state: .needsYou,
            link: "https://spaces.xyne.juspay.net/chat/dir/c1/tickets/t1"
        ))))

        XCTAssertEqual(card.id, CardKey(cast: .ticket, id: "act:42"))
        XCTAssertEqual(card.title, "XYNE-62857 · Add flag for custom runners")
        XCTAssertEqual(card.context, "/XYNE-62857")
        XCTAssertEqual(card.state, .needsYou)
        XCTAssertEqual(card.link, "https://spaces.xyne.juspay.net/chat/dir/c1/tickets/t1")
        XCTAssertNil(card.prompt)
    }

    func testMultilineTextCollapsesToOneLineAndIsClamped() throws {
        let card = try XCTUnwrap(CardNormalizer.card(from: event(card: CardPayload(
            id: "act:43",
            cast: .mention,
            title: "  Priya\n  Raman  ",
            activity: String(repeating: "long ", count: 80),
            state: .needsYou
        ))))

        XCTAssertEqual(card.title, "Priya Raman")
        XCTAssertLessThanOrEqual(card.activity.count, CardNormalizer.activityLimit)
        XCTAssertFalse(card.activity.contains("\n"))
    }

    func testPromptIsAnswerableOnlyWhileTheSidecarWaits() throws {
        let payload = CardPayload(
            id: "act:44",
            cast: .mention,
            title: "Priya Raman",
            activity: "POT for #1653?",
            state: .needsYou,
            prompt: PromptPayload(kind: .question, title: "Mentioned you · 4:12 pm", detail: "@Harshpreet POT for #1653?")
        )

        let held = try XCTUnwrap(CardNormalizer.card(from: event(expectsAnswer: true, card: payload)))
        XCTAssertEqual(held.prompt?.isAnswerable, true)
        XCTAssertEqual(held.prompt?.id, "event-1", "The answer has to name the event it belongs to")

        let replayed = try XCTUnwrap(CardNormalizer.card(from: event(expectsAnswer: false, card: payload)))
        XCTAssertEqual(replayed.prompt?.isAnswerable, false)
    }

    func testNonWebLinksAreRefused() throws {
        let card = try XCTUnwrap(CardNormalizer.card(from: event(card: CardPayload(
            id: "act:45",
            cast: .bot,
            title: "infra-doctor",
            activity: "RCA ready",
            state: .done,
            link: "file:///etc/passwd"
        ))))

        XCTAssertNil(card.link, "Only http(s) links may be handed to the workspace opener")
    }

    func testStartedAtSurvivesAnUpdateSoTheTimerDoesNotRestart() throws {
        let first = try XCTUnwrap(CardNormalizer.card(from: IslandEvent(
            kind: .card,
            card: CardPayload(id: "act:46", cast: .architect, title: "Beam", activity: "Reading ci.yaml", state: .working),
            sentAt: Date(timeIntervalSince1970: 1_000)
        )))
        let second = try XCTUnwrap(CardNormalizer.card(
            from: IslandEvent(
                kind: .card,
                card: CardPayload(id: "act:46", cast: .architect, title: "Beam", activity: "Writing the patch", state: .working),
                sentAt: Date(timeIntervalSince1970: 2_000)
            ),
            existing: first
        ))

        XCTAssertEqual(second.startedAt, first.startedAt)
        XCTAssertEqual(second.activity, "Writing the patch")
    }

    func testRevealedDetailIsClamped() throws {
        let long = String(repeating: "a", count: CardNormalizer.detailLimit + 500)
        let detail = try XCTUnwrap(CardNormalizer.detail(from: event(card: CardPayload(
            id: "act:47", cast: .bot, title: "infra-doctor", activity: "RCA ready", state: .done, detail: long
        ))))

        XCTAssertEqual(detail.count, CardNormalizer.detailLimit)
        XCTAssertTrue(detail.hasSuffix("…"))
    }

    func testBlankDetailRevealsNothing() {
        XCTAssertNil(CardNormalizer.detail(from: event(card: CardPayload(
            id: "act:48", cast: .bot, title: "infra-doctor", activity: "Working", state: .working, detail: "   \n  "
        ))))
    }

    func testRetirementNamesTheCardToRemove() throws {
        let key = try XCTUnwrap(CardNormalizer.retirement(from: event(
            kind: .retire,
            card: CardPayload(id: "act:49", cast: .call, title: "Standup", activity: "", state: .done)
        )))

        XCTAssertEqual(key, CardKey(cast: .call, id: "act:49"))
    }

    func testAFutureProtocolVersionIsIgnoredRatherThanMisread() {
        let event = IslandEvent(
            version: IslandEvent.currentVersion + 1,
            kind: .card,
            card: CardPayload(id: "act:50", cast: .mention, title: "Someone", activity: "Something new", state: .needsYou)
        )

        XCTAssertNil(CardNormalizer.card(from: event))
    }

    func testCardWithoutAnIdentityIsRefused() {
        XCTAssertNil(CardNormalizer.card(from: event(card: CardPayload(
            id: "   ", cast: .mention, title: "Someone", activity: "Something", state: .needsYou
        ))))
        XCTAssertNil(CardNormalizer.card(from: event(card: nil)))
    }
}
