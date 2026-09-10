import AppKit
import XyneIslandCore

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private let store = IslandStore()
    private var bridge: IslandBridge?
    private var sidecar: SidecarController?
    private var panelController: NotchPanelController?
    private var statusItemController: StatusItemController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        let environment = ProcessInfo.processInfo.environment
        let isPreview = environment["XYNE_ISLAND_PREVIEW"] == "1"
        let initiallyExpanded = environment["XYNE_ISLAND_PREVIEW_EXPANDED"] == "1"
        let capturePath = environment["XYNE_ISLAND_CAPTURE_PATH"]

        // A render pass must not unlink or replace the live app's socket.
        if capturePath == nil {
            bridge = IslandBridge(store: store)
            try? bridge?.start()
        }

        if isPreview {
            store.loadPreview()
        }

        panelController = NotchPanelController(store: store, initiallyExpanded: initiallyExpanded)
        statusItemController = StatusItemController(target: self, store: store)

        // Preview and capture runs are self-contained; only a real launch should
        // start talking to Spaces.
        if capturePath == nil, !isPreview, environment["XYNE_ISLAND_NO_SIDECAR"] != "1" {
            let sidecar = SidecarController(store: store)
            self.sidecar = sidecar
            sidecar.start()
        }

        if let capturePath {
            renderCapture(to: capturePath, environment: environment)
        }
    }

    func applicationWillTerminate(_ notification: Notification) {
        sidecar?.stop()
        bridge?.stop()
    }

    @objc func openNotch() {
        panelController?.showExpanded()
    }

    @objc func loadPreview() {
        store.loadPreview()
        panelController?.showExpanded()
    }

    @objc func openSpaces() {
        OpenInSpaces.openDashboard()
    }

    @objc func refreshToken() {
        sidecar?.refreshToken()
    }

    @objc func restartBridge() {
        sidecar?.restart()
    }

    @objc func openBridgeLog() {
        guard let sidecar else { return }
        NSWorkspace.shared.open(sidecar.logURL)
    }

    private func renderCapture(to path: String, environment: [String: String]) {
        let screen = NSScreen.main ?? NSScreen.screens[0]
        let geometry = NotchPanelController.Geometry(screen: screen)
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(350))
            let destination = URL(fileURLWithPath: path)
            if environment["XYNE_ISLAND_CAPTURE_COLLAPSED"] == "1" {
                try? PreviewRenderer.renderCollapsed(
                    store: store,
                    hasHardwareNotch: geometry.hasHardwareNotch,
                    hardwareNotchWidth: geometry.hardwareNotchWidth,
                    hardwareNotchHeight: geometry.hardwareNotchHeight,
                    menuBarHeight: geometry.menuBarHeight,
                    to: destination
                )
            } else {
                try? PreviewRenderer.renderExpanded(
                    store: store,
                    hasHardwareNotch: geometry.hasHardwareNotch,
                    to: destination
                )
            }
            NSApp.terminate(nil)
        }
    }
}
