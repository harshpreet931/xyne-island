import Foundation

/// Turns a wire payload into a card the notch can draw.
///
/// The sidecar already decided what each card means, so there is no
/// interpretation left here — only the trust boundary. Everything that reaches
/// the screen is collapsed to one line and clamped, because the payload is JSON
/// from another process and a message from Spaces can be arbitrarily long.
public enum CardNormalizer {
    /// The most of a revealed body we keep in memory for one card.
    public static let detailLimit = 6_000

    static let titleLimit = 64
    static let activityLimit = 96
    static let promptDetailLimit = 240

    public static func card(from event: IslandEvent, existing: IslandCard? = nil) -> IslandCard? {
        guard event.version <= IslandEvent.currentVersion, let payload = event.card else { return nil }
        let id = compact(payload.id, limit: 200)
        guard !id.isEmpty else { return nil }

        let title = compact(payload.title, limit: titleLimit)
        let context = compact(payload.context ?? "", limit: 48)
        return IslandCard(
            id: CardKey(cast: payload.cast, id: id),
            title: title.isEmpty ? (existing?.title ?? payload.cast.displayName) : title,
            activity: compact(payload.activity, limit: activityLimit),
            context: context.isEmpty ? (existing?.context ?? "") : context,
            state: payload.state,
            link: link(payload.link) ?? existing?.link,
            startedAt: existing?.startedAt ?? event.sentAt,
            updatedAt: .now,
            prompt: prompt(payload.prompt, eventID: event.id, expectsAnswer: event.expectsAnswer)
        )
    }

    /// The body a finished card reveals, or nil when there is nothing to show.
    public static func detail(from event: IslandEvent) -> String? {
        guard let raw = event.card?.detail else { return nil }
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        guard trimmed.count > detailLimit else { return trimmed }
        return String(trimmed.prefix(detailLimit - 1)) + "…"
    }

    /// The card an event asks to retire.
    public static func retirement(from event: IslandEvent) -> CardKey? {
        guard event.kind == .retire, let payload = event.card else { return nil }
        let id = compact(payload.id, limit: 200)
        return id.isEmpty ? nil : CardKey(cast: payload.cast, id: id)
    }

    private static func prompt(_ payload: PromptPayload?, eventID: String, expectsAnswer: Bool) -> CardPrompt? {
        guard let payload else { return nil }
        return CardPrompt(
            id: eventID,
            kind: payload.kind,
            title: compact(payload.title, limit: activityLimit),
            detail: compact(payload.detail, limit: promptDetailLimit),
            isAnswerable: expectsAnswer
        )
    }

    /// Only http(s) links are followable; anything else would hand an arbitrary
    /// URL scheme to `NSWorkspace` on a button press.
    private static func link(_ raw: String?) -> String? {
        guard let raw, let url = URL(string: raw), let scheme = url.scheme?.lowercased() else { return nil }
        return scheme == "https" || scheme == "http" ? raw : nil
    }

    public static func compact(_ value: String, limit: Int) -> String {
        let singleLine = value.split(whereSeparator: \Character.isWhitespace).joined(separator: " ")
        guard singleLine.count > limit else { return singleLine }
        return String(singleLine.prefix(limit - 1)) + "…"
    }
}
