import AppKit
import Combine
import XyneIslandCore

@MainActor
final class StatusItemController {
    private let statusItem: NSStatusItem
    private let bridgeItem: NSMenuItem
    private var cancellable: AnyCancellable?

    init(target: AnyObject, store: IslandStore) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = statusItem.button {
            button.image = Self.menuBarMark()
            button.toolTip = IslandBrand.tagline
        }

        bridgeItem = NSMenuItem(title: "Connecting to Spaces…", action: nil, keyEquivalent: "")
        bridgeItem.isEnabled = false

        let menu = NSMenu()
        menu.addItem(bridgeItem)
        menu.addItem(.separator())
        menu.addItem(withTitle: "Open Xyne Island", action: #selector(AppDelegate.openNotch), keyEquivalent: "o").target = target
        menu.addItem(withTitle: "Open Spaces", action: #selector(AppDelegate.openSpaces), keyEquivalent: "s").target = target
        menu.addItem(.separator())
        menu.addItem(withTitle: "Refresh Spaces Token", action: #selector(AppDelegate.refreshToken), keyEquivalent: "r").target = target
        menu.addItem(withTitle: "Restart Bridge", action: #selector(AppDelegate.restartBridge), keyEquivalent: "").target = target
        menu.addItem(withTitle: "Open Bridge Log", action: #selector(AppDelegate.openBridgeLog), keyEquivalent: "l").target = target
        menu.addItem(.separator())
        menu.addItem(withTitle: "Show Example Day", action: #selector(AppDelegate.loadPreview), keyEquivalent: "p").target = target
        menu.addItem(.separator())
        menu.addItem(withTitle: "Quit Xyne Island", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        statusItem.menu = menu

        cancellable = store.$bridge.sink { [weak self] bridge in
            self?.bridgeItem.title = "\(bridge.state.menuLabel) · \(bridge.message)"
        }
    }

    private static func menuBarMark() -> NSImage {
        let image = NSImage(size: NSSize(width: 18, height: 18), flipped: false) { _ in
            NSColor.black.setStroke()
            NSColor.black.setFill()

            let island = NSBezierPath(
                roundedRect: NSRect(x: 1.5, y: 4.5, width: 15, height: 9),
                xRadius: 4.5,
                yRadius: 4.5
            )
            island.lineWidth = 1.2
            island.stroke()

            // The Xyne x, drawn as two strokes inside the island.
            let cross = NSBezierPath()
            cross.move(to: NSPoint(x: 6.2, y: 6.6))
            cross.line(to: NSPoint(x: 11.8, y: 11.4))
            cross.move(to: NSPoint(x: 11.4, y: 6.6))
            cross.line(to: NSPoint(x: 6.6, y: 11.4))
            cross.lineWidth = 1.5
            cross.lineCapStyle = .round
            cross.stroke()
            return true
        }
        image.isTemplate = true
        image.accessibilityDescription = IslandBrand.name
        return image
    }
}

private extension BridgeState {
    var menuLabel: String {
        switch self {
        case .waiting: "Connecting"
        case .connected: "Connected"
        case .signedOut: "Signed out"
        case .degraded: "Reconnecting"
        }
    }
}
