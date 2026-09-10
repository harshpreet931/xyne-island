import SwiftUI
import XyneIslandCore

/// What the notch shows when nothing needs you — and what to do about it when
/// the reason for the quiet is that the bridge cannot reach Spaces.
struct QuietIslandView: View {
    let bridge: IslandStore.Bridge

    var body: some View {
        VStack(spacing: 14) {
            HStack(spacing: 7) {
                ForEach(Array(CastID.allCases.prefix(6).enumerated()), id: \.element) { index, cast in
                    CastAvatarView(
                        cast: cast,
                        state: .fyi,
                        size: 38,
                        phaseOffset: 0.7 + Double(index) * 1.4
                    )
                }
            }

            VStack(spacing: 5) {
                Text(headline)
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.92))
                Text(explanation)
                    .font(.system(size: 11, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.4))
                    .multilineTextAlignment(.center)
                    .lineSpacing(2)
            }

            Text(bridge.message)
                .font(.system(size: 9, weight: .medium, design: .monospaced))
                .foregroundStyle(.white.opacity(0.28))
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .padding(.horizontal, 18)
        .padding(.bottom, 10)
    }

    private var headline: String {
        switch bridge.state {
        case .signedOut: "Sign in to Spaces."
        case .degraded: "Reconnecting to Spaces."
        case .waiting, .connected: "All quiet up here."
        }
    }

    private var explanation: String {
        switch bridge.state {
        case .signedOut:
            "Open Spaces in your browser, then choose\nRefresh Spaces Token from the menu bar."
        case .degraded:
            "The bridge lost its connection.\nIt is trying again on its own."
        case .waiting, .connected:
            "Mentions, agents, calls and deadlines from Spaces land here.\nNothing needs you right now."
        }
    }
}

struct NotchPressButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct NotchActionButtonStyle: ButtonStyle {
    enum Role { case primary, secondary }
    let role: Role

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 10, weight: .semibold, design: .rounded))
            .foregroundStyle(role == .primary ? .black : .white.opacity(0.66))
            .padding(.horizontal, 13)
            .frame(height: 30)
            .background {
                RoundedRectangle(cornerRadius: 9, style: .continuous)
                    .fill(role == .primary ? .white.opacity(configuration.isPressed ? 0.78 : 0.92) : .white.opacity(configuration.isPressed ? 0.11 : 0.07))
            }
            .contentShape(Rectangle())
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

/// The island palette. One warm paper, one ink, and a colour per cast member.
extension Color {
    static let islandInk = Color(red: 0.055, green: 0.058, blue: 0.065)
    static let islandPaper = Color(red: 0.95, green: 0.93, blue: 0.87)
    static let islandCoral = Color(red: 1.0, green: 0.31, blue: 0.31)
    static let islandSaffron = Color(red: 0.98, green: 0.69, blue: 0.25)
    static let islandCallGreen = Color(red: 0.27, green: 0.85, blue: 0.56)
    static let islandBlueprint = Color(red: 0.36, green: 0.62, blue: 1.0)
    static let islandViolet = Color(red: 0.66, green: 0.56, blue: 1.0)
    static let islandTeal = Color(red: 0.18, green: 0.80, blue: 0.70)
    static let notchGreen = Color(red: 0.43, green: 0.91, blue: 0.61)
    static let notchAmber = Color(red: 1.0, green: 0.72, blue: 0.28)
}
