import AppKit
import Combine
import SwiftUI

final class NotchPanel: NSPanel {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { false }
}

@MainActor
final class NotchPanelController {
    struct Geometry {
        let expandedSize = NSSize(
            width: NotchLayout.expandedSize.width,
            height: NotchLayout.expandedSize.height
        )
        let hasHardwareNotch: Bool
        let hardwareNotchWidth: CGFloat
        let hardwareNotchHeight: CGFloat
        let menuBarHeight: CGFloat

        init(screen: NSScreen) {
            if let left = screen.auxiliaryTopLeftArea,
               let right = screen.auxiliaryTopRightArea {
                let notchWidth = max(0, right.minX - left.maxX)
                hasHardwareNotch = notchWidth > 20
                hardwareNotchWidth = hasHardwareNotch ? notchWidth : 0
                hardwareNotchHeight = hasHardwareNotch ? max(left.height, right.height) : 0
                menuBarHeight = max(0, screen.frame.maxY - screen.visibleFrame.maxY)
            } else {
                hasHardwareNotch = false
                hardwareNotchWidth = 0
                hardwareNotchHeight = 0
                menuBarHeight = 0
            }
        }

        func collapsedSize(hasSessions: Bool) -> NSSize {
            NotchLayout.collapsedSize(
                hasHardwareNotch: hasHardwareNotch,
                hardwareNotchWidth: hardwareNotchWidth,
                hardwareNotchHeight: hardwareNotchHeight,
                menuBarHeight: menuBarHeight,
                hasSessions: hasSessions
            )
        }
    }

    private let store: IslandStore
    private let panel: NotchPanel
    private let geometry: Geometry
    private let expansionState: NotchExpansionState
    private var expanded: Bool
    private var sessionActivityObserver: AnyCancellable?

    init(store: IslandStore, initiallyExpanded: Bool = false) {
        self.store = store
        let screen = NSScreen.main ?? NSScreen.screens[0]
        geometry = Geometry(screen: screen)
        expanded = initiallyExpanded
        expansionState = NotchExpansionState(isExpanded: initiallyExpanded)
        let size = initiallyExpanded
            ? geometry.expandedSize
            : geometry.collapsedSize(hasSessions: !store.cards.isEmpty)
        let frame = Self.frame(for: size, on: screen)

        panel = NotchPanel(
            contentRect: frame,
            styleMask: [.borderless, .nonactivatingPanel, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        panel.level = .statusBar
        panel.backgroundColor = .clear
        panel.isOpaque = false
        panel.hasShadow = false
        panel.hidesOnDeactivate = false
        panel.isMovable = false
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        panel.animationBehavior = .none
        panel.becomesKeyOnlyIfNeeded = true

        let root = NotchRootView(
            store: store,
            hasHardwareNotch: geometry.hasHardwareNotch,
            hardwareNotchWidth: geometry.hardwareNotchWidth,
            collapsedBarHeight: geometry.collapsedSize(hasSessions: true).height,
            initiallyExpanded: initiallyExpanded,
            expansionState: expansionState,
            onExpansionChange: { [weak self] value in self?.setExpanded(value) }
        )
        let hostingView = NSHostingView(rootView: root)
        hostingView.wantsLayer = true
        hostingView.layerContentsRedrawPolicy = .duringViewResize
        hostingView.layer?.backgroundColor = .clear
        panel.contentView = hostingView
        panel.orderFrontRegardless()

        sessionActivityObserver = store.$cards
            .map { !$0.isEmpty }
            .removeDuplicates()
            .dropFirst()
            .sink { [weak self] hasSessions in
                self?.refreshCollapsedSize(hasSessions: hasSessions)
            }
    }

    func showExpanded() {
        requestExpanded(true)
    }

    func toggle() {
        requestExpanded(!expanded)
    }

    private func requestExpanded(_ value: Bool) {
        guard value != expansionState.isExpanded || value != expanded else { return }
        setExpanded(value)
        let animation = NSWorkspace.shared.accessibilityDisplayShouldReduceMotion
            ? nil
            : NotchMotion.animation(expanding: value)
        withAnimation(animation) {
            expansionState.isExpanded = value
        }
    }

    private func setExpanded(_ value: Bool) {
        guard value != expanded else { return }
        expanded = value
        guard let screen = panel.screen ?? NSScreen.main else { return }
        let targetSize = value
            ? geometry.expandedSize
            : geometry.collapsedSize(hasSessions: !store.cards.isEmpty)
        resizePanel(
            to: targetSize,
            on: screen,
            duration: value ? NotchMotion.expansionDuration : NotchMotion.collapseDuration,
            growing: value
        )
    }

    private func refreshCollapsedSize(hasSessions: Bool) {
        guard !expanded, let screen = panel.screen ?? NSScreen.main else { return }
        let targetSize = geometry.collapsedSize(hasSessions: hasSessions)

        resizePanel(
            to: targetSize,
            on: screen,
            duration: hasSessions ? 0.22 : 0.16,
            growing: hasSessions
        )
    }

    private func resizePanel(
        to targetSize: NSSize,
        on screen: NSScreen,
        duration: TimeInterval,
        growing: Bool
    ) {
        let targetFrame = Self.frame(for: targetSize, on: screen)
        let effectiveDuration = NSWorkspace.shared.accessibilityDisplayShouldReduceMotion ? 0 : duration

        NSAnimationContext.runAnimationGroup { context in
            context.duration = effectiveDuration
            context.allowsImplicitAnimation = true
            context.timingFunction = NotchMotion.timingFunction(expanding: growing)
            panel.animator().setFrame(targetFrame, display: true)
        }
    }

    private static func frame(for size: NSSize, on screen: NSScreen) -> NSRect {
        NSRect(
            x: screen.frame.midX - (size.width / 2),
            y: screen.frame.maxY - size.height,
            width: size.width,
            height: size.height
        )
    }
}
