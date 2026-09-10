import Combine
import Foundation
import XyneIslandCore

/// Everything the notch is currently showing.
///
/// The sidecar owns what is true in Spaces; this store owns what is on screen
/// and for how long. Answers to held-open cards travel back through the
/// responder that arrived with the event.
@MainActor
final class IslandStore: ObservableObject {
    /// A finished card's body, held in memory only while the card is on screen.
    struct Reveal: Identifiable, Equatable {
        let id: UUID
        let card: CardKey
        let text: String
        let receivedAt: Date
    }

    struct Bridge: Equatable {
        var state: BridgeState = .waiting
        var message = "Waiting for the Spaces bridge"
    }

    @Published private(set) var cards: [IslandCard] = []
    @Published private(set) var bridge = Bridge()
    @Published private(set) var isPreview = false
    @Published private(set) var latestReveal: Reveal?

    private var responders: [CardKey: IslandResponder] = [:]
    private var reveals: [CardKey: Reveal] = [:]
    private var retirementTasks: [CardKey: Task<Void, Never>] = [:]
    private let retention: Duration

    init(retention: Duration = .seconds(30)) {
        self.retention = retention
    }

    var visibleCards: [IslandCard] {
        cards.sorted { lhs, rhs in
            let lhsFeatured = isFeatured(lhs)
            let rhsFeatured = isFeatured(rhs)
            if lhsFeatured != rhsFeatured { return lhsFeatured }
            if lhs.state.sortPriority != rhs.state.sortPriority {
                return lhs.state.sortPriority < rhs.state.sortPriority
            }
            return lhs.updatedAt > rhs.updatedAt
        }
    }

    var attentionCount: Int {
        cards.filter { $0.state.needsAttention }.count
    }

    var finishedCount: Int {
        cards.filter { $0.state.isFinished }.count
    }

    func updateBridge(_ state: BridgeState, message: String) {
        bridge = Bridge(state: state, message: message)
    }

    // MARK: - Ingest

    func ingest(_ event: IslandEvent, responder: IslandResponder?) {
        switch event.kind {
        case .status:
            responder?.cancel()
            guard let status = event.status else { return }
            updateBridge(status.state, message: CardNormalizer.compact(status.message, limit: 120))
        case .retire:
            responder?.cancel()
            guard let key = CardNormalizer.retirement(from: event) else { return }
            remove(key)
        case .card:
            upsert(event, responder: responder)
        }
    }

    private func upsert(_ event: IslandEvent, responder: IslandResponder?) {
        let existing = event.card.map { CardKey(cast: $0.cast, id: $0.id) }.flatMap { key in
            cards.first { $0.id == key }
        }
        guard let card = CardNormalizer.card(from: event, existing: existing) else {
            responder?.cancel()
            return
        }

        isPreview = false
        if bridge.state == .waiting {
            updateBridge(.connected, message: "Connected to Spaces")
        }

        cards.removeAll { $0.id == card.id }
        cards.append(card)

        retirementTasks.removeValue(forKey: card.id)?.cancel()
        if let text = CardNormalizer.detail(from: event) {
            let reveal = Reveal(id: UUID(), card: card.id, text: text, receivedAt: .now)
            reveals[card.id] = reveal
            latestReveal = reveal
        } else {
            reveals.removeValue(forKey: card.id)
            if latestReveal?.card == card.id { latestReveal = nil }
        }
        if card.state.retiresQuietly {
            scheduleRetirement(of: card.id)
        }

        if let responder {
            responders[card.id]?.cancel()
            responders[card.id] = responder
        }
    }

    // MARK: - Answers

    func open(_ card: IslandCard) {
        answer(card, with: .open, activity: "Opening in Spaces")
    }

    func dismissPrompt(_ card: IslandCard) {
        answer(card, with: .dismiss, activity: "Marked as handled")
    }

    private func answer(_ card: IslandCard, with choice: IslandAnswer.Choice, activity: String) {
        guard let prompt = card.prompt else { return }
        guard let responder = responders.removeValue(forKey: card.id) else {
            // Preview and replayed cards have nobody listening; still move the card on
            // so a demo does not look frozen.
            if isPreview { resolve(card, activity: activity) }
            return
        }
        let reply = IslandAnswer(eventID: prompt.id, choice: choice)
        if let data = try? JSONEncoder().encode(reply) {
            responder.respond(with: data)
        } else {
            responder.cancel()
        }
        resolve(card, activity: activity)
    }

    // MARK: - Removal

    func clearFinished() {
        cards.filter { $0.state.isFinished }.map(\.id).forEach(remove)
    }

    func dismiss(_ card: IslandCard) {
        remove(card.id)
    }

    func reveal(for card: IslandCard) -> Reveal? {
        reveals[card.id]
    }

    func isFeatured(_ card: IslandCard) -> Bool {
        latestReveal?.card == card.id
    }

    private func resolve(_ card: IslandCard, activity: String) {
        guard let index = cards.firstIndex(where: { $0.id == card.id }) else { return }
        cards[index].state = .working
        cards[index].activity = activity
        cards[index].prompt = nil
        cards[index].updatedAt = .now
        scheduleRetirement(of: card.id, after: .seconds(4))
    }

    private func scheduleRetirement(of key: CardKey, after delay: Duration? = nil) {
        let wait = delay ?? retention
        retirementTasks[key] = Task { [weak self] in
            try? await Task.sleep(for: wait)
            guard !Task.isCancelled else { return }
            self?.remove(key)
        }
    }

    private func remove(_ key: CardKey) {
        retirementTasks.removeValue(forKey: key)?.cancel()
        responders.removeValue(forKey: key)?.cancel()
        cards.removeAll { $0.id == key }
        reveals.removeValue(forKey: key)
        if latestReveal?.card == key { latestReveal = nil }
    }

    // MARK: - Preview

    /// A scripted day, for design work and for showing the product with no session.
    func loadPreview() {
        responders.values.forEach { $0.cancel() }
        responders.removeAll()
        retirementTasks.values.forEach { $0.cancel() }
        retirementTasks.removeAll()
        reveals.removeAll()
        isPreview = true
        updateBridge(.connected, message: "Example day · not your real Spaces")

        let now = Date()
        let spaces = "https://spaces.xyne.juspay.net"
        cards = [
            IslandCard(
                id: CardKey(cast: .mention, id: "preview-mention"),
                title: "Priya Raman · #xyne-spaces",
                activity: "POT for #1653? Need it before the 6pm release cut.",
                context: "/pending",
                state: .needsYou,
                link: spaces,
                startedAt: now.addingTimeInterval(-240),
                updatedAt: now,
                prompt: CardPrompt(
                    id: "preview-mention",
                    kind: .question,
                    title: "Mentioned you in XYNE-61392 · 4:12 pm",
                    detail: "@Harshpreet POT for #1653? Need it before the 6pm release cut.",
                    isAnswerable: true
                )
            ),
            IslandCard(
                id: CardKey(cast: .ticket, id: "preview-ticket"),
                title: "XYNE-62857 · Add flag for custom runners",
                activity: "Assigned to you by Devin · low · To be picked up",
                context: "/XYNE-62857",
                state: .needsYou,
                link: spaces,
                startedAt: now.addingTimeInterval(-600),
                updatedAt: now,
                prompt: CardPrompt(
                    id: "preview-ticket",
                    kind: .question,
                    title: "New ticket for you · 3:58 pm",
                    detail: "Add flag to enable custom runners in ci.yaml",
                    isAnswerable: true
                )
            ),
            IslandCard(
                id: CardKey(cast: .call, id: "preview-call"),
                title: "Standup",
                activity: "Starts in 4 min · 6 joining",
                context: "/call",
                state: .working,
                link: spaces,
                startedAt: now.addingTimeInterval(-30),
                updatedAt: now
            ),
            IslandCard(
                id: CardKey(cast: .ticket, id: "preview-overdue"),
                title: "XYNE-61392 · Custom field not persisting",
                activity: "Overdue by 40 min · critical · PR Review",
                context: "/XYNE-61392",
                state: .overdue,
                link: spaces,
                startedAt: now.addingTimeInterval(-2_400),
                updatedAt: now
            ),
            IslandCard(
                id: CardKey(cast: .architect, id: "preview-architect"),
                title: "Architect · XYNE-62857",
                activity: "Reading ci.yaml and the runner config",
                context: "/xyne-spaces",
                state: .working,
                link: spaces,
                startedAt: now.addingTimeInterval(-96),
                updatedAt: now.addingTimeInterval(-2)
            ),
            IslandCard(
                id: CardKey(cast: .bot, id: "preview-doctor"),
                title: "infra-doctor · #production-logs",
                activity: "RCA ready",
                context: "/production-logs",
                state: .done,
                link: spaces,
                startedAt: now.addingTimeInterval(-214),
                updatedAt: now
            ),
        ]

        let reveal = Reveal(
            id: UUID(),
            card: CardKey(cast: .bot, id: "preview-doctor"),
            text: "RCA complete. CPU alarm on checkout-api-v5 self-resolved at 13:08 UTC after peaking at 70.5%. Root cause: imposter SQL flood of ~1M/min from 19:30, decayed by 21:00. Full report attached in the thread.",
            receivedAt: now
        )
        reveals[reveal.card] = reveal
        latestReveal = reveal
    }
}

private extension CardState {
    var sortPriority: Int {
        switch self {
        case .needsYou, .approval: 0
        case .working: 1
        case .fyi: 2
        case .done: 3
        case .overdue: 4
        }
    }
}
