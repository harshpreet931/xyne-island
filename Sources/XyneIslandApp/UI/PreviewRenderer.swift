import AppKit
import SwiftUI

@MainActor
enum PreviewRenderer {
    enum RenderError: Error {
        case imageUnavailable
        case pngUnavailable
    }

    static func renderExpanded(
        store: IslandStore,
        hasHardwareNotch: Bool,
        to destination: URL
    ) throws {
        // XYNE_ISLAND_CAPTURE_HEIGHT lets design reviews see every card instead of the scroll viewport.
        let height = ProcessInfo.processInfo.environment["XYNE_ISLAND_CAPTURE_HEIGHT"].flatMap(Double.init) ?? 382
        let size = CGSize(width: 548, height: height)
        let view = NotchRootView(
            store: store,
            hasHardwareNotch: hasHardwareNotch,
            initiallyExpanded: true,
            captureMode: true,
            onExpansionChange: { _ in }
        )
        .frame(width: size.width, height: size.height)

        try render(view, size: size, to: destination)
    }

    static func renderCollapsed(
        store: IslandStore,
        hasHardwareNotch: Bool,
        hardwareNotchWidth: CGFloat,
        hardwareNotchHeight: CGFloat,
        menuBarHeight: CGFloat,
        to destination: URL
    ) throws {
        let size = NotchLayout.collapsedSize(
            hasHardwareNotch: hasHardwareNotch,
            hardwareNotchWidth: hardwareNotchWidth,
            hardwareNotchHeight: hardwareNotchHeight,
            menuBarHeight: menuBarHeight,
            hasSessions: !store.cards.isEmpty
        )
        let view = NotchRootView(
            store: store,
            hasHardwareNotch: hasHardwareNotch,
            hardwareNotchWidth: hardwareNotchWidth,
            collapsedBarHeight: size.height,
            initiallyExpanded: false,
            captureMode: true,
            onExpansionChange: { _ in }
        )
        .frame(width: size.width, height: size.height)

        try render(view, size: size, to: destination)
    }

    private static func render<Content: View>(
        _ content: Content,
        size: CGSize,
        to destination: URL
    ) throws {
        let renderer = ImageRenderer(content: content)
        renderer.scale = 2
        renderer.proposedSize = ProposedViewSize(size)
        guard let image = renderer.nsImage else { throw RenderError.imageUnavailable }
        guard
            let tiff = image.tiffRepresentation,
            let representation = NSBitmapImageRep(data: tiff),
            let png = representation.representation(using: .png, properties: [:])
        else { throw RenderError.pngUnavailable }
        try png.write(to: destination, options: .atomic)
    }
}
