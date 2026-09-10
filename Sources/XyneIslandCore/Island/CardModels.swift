import Foundation

/// The cast: one character per kind of thing Xyne Spaces can need from you.
///
/// The raw values are the wire vocabulary the sidecar sends, so renaming a case
/// is a protocol change.
public enum CastID: String, Codable, CaseIterable, Sendable {
    /// Someone needs you in a thread: mentions, replies, group mentions, DMs.
    case mention
    /// A ticket: assigned to you, due, changed, or waiting on your approval.
    case ticket
    /// A call: upcoming, starting, live, or missed.
    case call
    /// The Spaces Architect.
    case architect
    /// Ask AI.
    case askai
    /// Every other Spaces agent: the doctors, automations, custom bots.
    case bot
    /// Anything from Spaces with no better home.
    case xyne

    /// The character's name, as the brand and the accessibility labels use it.
    public var castName: String {
        switch self {
        case .mention: "Pip"
        case .ticket: "Stub"
        case .call: "Ring"
        case .architect: "Beam"
        case .askai: "Sage"
        case .bot: "Doc"
        case .xyne: "Dot"
        }
    }

    /// What the character stands for, spoken in full.
    public var displayName: String {
        switch self {
        case .mention: "Mention"
        case .ticket: "Ticket"
        case .call: "Call"
        case .architect: "Spaces Architect"
        case .askai: "Ask AI"
        case .bot: "Spaces agent"
        case .xyne: "Xyne Spaces"
        }
    }
}

/// What a card is asking of you. One vocabulary from the sidecar's snapshot
/// through the wire to the notch, so nothing is translated twice.
public enum CardState: String, Codable, CaseIterable, Sendable {
    /// Something is in motion and will finish on its own.
    case working
    /// A person or a thread is waiting on you.
    case needsYou
    /// Waiting on your approval specifically.
    case approval
    /// Finished, usually with an answer worth reading.
    case done
    /// A deadline has already passed.
    case overdue
    /// Worth knowing; nothing to do.
    case fyi

    /// States that pull the notch open on their own.
    public var needsAttention: Bool {
        self == .needsYou || self == .approval
    }

    /// States a card cannot move on from, so it can be retired or dismissed.
    public var isFinished: Bool {
        self == .done || self == .overdue
    }

    /// States that retire quietly once their moment has passed.
    public var retiresQuietly: Bool {
        isFinished || self == .fyi
    }
}

/// A question or approval a card carries, answerable from the notch.
public struct CardPrompt: Identifiable, Codable, Equatable, Sendable {
    public enum Kind: String, Codable, Sendable {
        case question
        case approval
    }

    public let id: String
    public let kind: Kind
    public let title: String
    public let detail: String
    /// False when the sidecar is not holding a connection open for an answer,
    /// so the notch offers "Open in Spaces" instead of buttons that go nowhere.
    public let isAnswerable: Bool

    public init(id: String, kind: Kind, title: String, detail: String, isAnswerable: Bool) {
        self.id = id
        self.kind = kind
        self.title = title
        self.detail = detail
        self.isAnswerable = isAnswerable
    }
}

/// Identity of one card. `cast` plus `id` is what the sidecar keys its own
/// state on, so both sides agree on what "the same card" means.
public struct CardKey: Hashable, Codable, Sendable {
    public let cast: CastID
    public let id: String

    public init(cast: CastID, id: String) {
        self.cast = cast
        self.id = id
    }
}

/// One thing in the notch.
public struct IslandCard: Identifiable, Codable, Equatable, Sendable {
    public var id: CardKey
    public var title: String
    public var activity: String
    /// A short scope label — a ticket key, a channel, `/pending`.
    public var context: String
    public var state: CardState
    /// Where "Open" goes in Spaces.
    public var link: String?
    public var startedAt: Date
    public var updatedAt: Date
    public var prompt: CardPrompt?

    public init(
        id: CardKey,
        title: String,
        activity: String,
        context: String,
        state: CardState,
        link: String? = nil,
        startedAt: Date = .now,
        updatedAt: Date = .now,
        prompt: CardPrompt? = nil
    ) {
        self.id = id
        self.title = title
        self.activity = activity
        self.context = context
        self.state = state
        self.link = link
        self.startedAt = startedAt
        self.updatedAt = updatedAt
        self.prompt = prompt
    }
}

/// How the sidecar itself is doing. The notch shows this when it has no cards,
/// so a missing token reads as "sign in", not as an empty, healthy island.
public enum BridgeState: String, Codable, Sendable {
    /// No sidecar has connected yet.
    case waiting
    /// Connected to Spaces and polling.
    case connected
    /// There is no usable Spaces session; `spaces token` needs a signed-in browser.
    case signedOut
    /// Connected, but something is failing.
    case degraded
}
