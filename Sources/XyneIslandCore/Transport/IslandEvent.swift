import Foundation

/// The wire protocol between the sidecar and the notch app.
///
/// One JSON object per connection, newline-terminated, over a user-only Unix
/// socket. The sidecar already knows what each card means, so it sends the card
/// rather than a stream of events for the app to interpret.
public struct IslandEvent: Codable, Sendable {
    public enum Kind: String, Codable, Sendable {
        /// Add this card, or update the one with the same `cast` + `id`.
        case card
        /// Remove the named card; it is no longer relevant.
        case retire
        /// How the sidecar itself is doing.
        case status
    }

    /// Bumped when a change would make an older app misread a newer sidecar.
    public static let currentVersion = 1

    public let version: Int
    /// Identifies this event so an answer can be matched back to it.
    public let id: String
    public let kind: Kind
    public let card: CardPayload?
    public let status: StatusPayload?
    /// True when the sidecar is holding the connection open for an answer.
    public let expectsAnswer: Bool
    public let sentAt: Date

    enum CodingKeys: String, CodingKey {
        case version = "v"
        case id
        case kind
        case card
        case status
        case expectsAnswer
        case sentAt
    }

    public init(
        version: Int = IslandEvent.currentVersion,
        id: String = UUID().uuidString,
        kind: Kind,
        card: CardPayload? = nil,
        status: StatusPayload? = nil,
        expectsAnswer: Bool = false,
        sentAt: Date = .now
    ) {
        self.version = version
        self.id = id
        self.kind = kind
        self.card = card
        self.status = status
        self.expectsAnswer = expectsAnswer
        self.sentAt = sentAt
    }
}

/// A card as it arrives on the wire. Field-for-field what the notch draws,
/// deliberately with no room for a second interpretation.
public struct CardPayload: Codable, Sendable {
    public let id: String
    public let cast: CastID
    public let title: String
    public let activity: String
    public let context: String?
    public let state: CardState
    public let link: String?
    /// The body a finished card reveals: an agent's answer, a message in full.
    public let detail: String?
    public let prompt: PromptPayload?

    public init(
        id: String,
        cast: CastID,
        title: String,
        activity: String,
        context: String? = nil,
        state: CardState,
        link: String? = nil,
        detail: String? = nil,
        prompt: PromptPayload? = nil
    ) {
        self.id = id
        self.cast = cast
        self.title = title
        self.activity = activity
        self.context = context
        self.state = state
        self.link = link
        self.detail = detail
        self.prompt = prompt
    }
}

public struct PromptPayload: Codable, Sendable {
    public let kind: CardPrompt.Kind
    public let title: String
    public let detail: String

    public init(kind: CardPrompt.Kind, title: String, detail: String) {
        self.kind = kind
        self.title = title
        self.detail = detail
    }
}

public struct StatusPayload: Codable, Sendable {
    public let state: BridgeState
    public let message: String

    public init(state: BridgeState, message: String) {
        self.state = state
        self.message = message
    }
}

/// What the notch writes back when someone presses a button on a held-open card.
public struct IslandAnswer: Codable, Sendable {
    public enum Choice: String, Codable, Sendable {
        /// Open it in Spaces and mark it handled.
        case open
        /// Mark it handled without leaving what you were doing.
        case dismiss
    }

    public let version: Int
    public let eventID: String
    public let choice: Choice

    enum CodingKeys: String, CodingKey {
        case version = "v"
        case eventID
        case choice
    }

    public init(version: Int = IslandEvent.currentVersion, eventID: String, choice: Choice) {
        self.version = version
        self.eventID = eventID
        self.choice = choice
    }
}

public enum IslandSocket {
    /// One socket per user, in a directory only that user can write.
    public static var current: String {
        "/tmp/xyne-island-\(getuid()).sock"
    }
}
