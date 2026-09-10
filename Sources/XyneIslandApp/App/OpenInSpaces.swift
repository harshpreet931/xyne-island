import AppKit
import XyneIslandCore

/// "Open" on a card means one thing: go to that thing in Spaces.
@MainActor
enum OpenInSpaces {
    static func open(_ card: IslandCard) {
        guard let link = card.link, let url = URL(string: link) else {
            NSSound.beep()
            return
        }
        NSWorkspace.shared.open(url)
    }

    static func openDashboard() {
        guard let url = URL(string: "https://spaces.xyne.juspay.net") else { return }
        NSWorkspace.shared.open(url)
    }
}
