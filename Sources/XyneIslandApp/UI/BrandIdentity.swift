import SwiftUI

enum IslandBrand {
    static let name = "Xyne Island"
    static let wordmark = "XYNE ISLAND"
    static let descriptor = "Everything from Spaces that needs you, in the notch."
    static let tagline = "Your Spaces, with a pulse."
}

/// The in-product companion to the app icon: the island shape with the Xyne
/// cross inside it, drawn at any size.
struct IslandMark: View {
    var size: CGFloat = 28

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.23, style: .continuous)
                .fill(Color.islandPaper)
                .overlay {
                    RoundedRectangle(cornerRadius: size * 0.23, style: .continuous)
                        .stroke(.black.opacity(0.10), lineWidth: max(0.5, size * 0.008))
                }

            Capsule(style: .continuous)
                .fill(Color.islandInk)
                .frame(width: size * 0.76, height: size * 0.36)
                .overlay {
                    ZStack {
                        Capsule(style: .continuous)
                            .fill(Color.islandCoral)
                            .frame(width: size * 0.3, height: max(1.5, size * 0.07))
                            .rotationEffect(.degrees(40))
                        Capsule(style: .continuous)
                            .fill(Color.islandCoral)
                            .frame(width: size * 0.3, height: max(1.5, size * 0.07))
                            .rotationEffect(.degrees(-40))
                    }
                }
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }
}
