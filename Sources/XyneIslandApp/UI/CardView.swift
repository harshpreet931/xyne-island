import SwiftUI
import XyneIslandCore

struct CardView: View {
    let card: IslandCard
    let reveal: IslandStore.Reveal?
    let isFeatured: Bool
    let open: () -> Void
    let markHandled: () -> Void
    let jump: () -> Void
    let dismiss: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isHovered = false

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                Button(action: jump) {
                    HStack(spacing: 10) {
                        CastAvatarView(
                            cast: card.id.cast,
                            state: card.state,
                            isHovered: isHovered,
                            phaseOffset: avatarPhaseOffset
                        )

                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 6) {
                                Text(card.title)
                                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                                    .foregroundStyle(.white.opacity(0.92))
                                    .lineLimit(1)
                                statusPill
                            }
                            Text(card.activity)
                                .font(.system(size: 10.5, weight: .medium, design: .rounded))
                                .foregroundStyle(.white.opacity(0.46))
                                .lineLimit(1)
                        }

                        Spacer(minLength: 8)

                        TimelineView(.periodic(from: .now, by: 1)) { context in
                            Text(elapsed(from: card.startedAt, to: context.date))
                                .font(.system(size: 10, weight: .medium, design: .monospaced))
                                .monospacedDigit()
                                .foregroundStyle(.white.opacity(0.34))
                        }

                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundStyle(.white.opacity(0.28))
                    }
                    .padding(.leading, 10)
                    .padding(.trailing, card.state.isFinished ? 4 : 10)
                    .frame(height: 60)
                    .contentShape(Rectangle())
                }
                .buttonStyle(NotchPressButtonStyle())

                if card.state.isFinished {
                    Button(action: dismiss) {
                        Image(systemName: "xmark")
                            .font(.system(size: 8.5, weight: .semibold))
                            .foregroundStyle(.white.opacity(isHovered ? 0.5 : 0.26))
                            .frame(width: 28, height: 28)
                            .contentShape(Rectangle())
                    }
                    .buttonStyle(NotchPressButtonStyle())
                    .frame(width: 40, height: 40)
                    .accessibilityLabel("Dismiss \(card.title) from Xyne Island")
                }
            }

            if let reveal {
                revealPanel(reveal)
                    .transition(.asymmetric(
                        insertion: .opacity.combined(with: .offset(y: -5)),
                        removal: .opacity
                    ))
            } else if let prompt = card.prompt {
                promptPanel(prompt)
                    .transition(.asymmetric(
                        insertion: .opacity.combined(with: .offset(y: -5)),
                        removal: .opacity
                    ))
            }
        }
        .background {
            ZStack {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(.white.opacity(hasDetail ? 0.072 : 0.055))
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(card.id.cast.color.opacity(castTintOpacity))
                if isFeatured {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(card.id.cast.color.opacity(0.17), lineWidth: 1)
                }
            }
        }
        .onHover { inside in
            withAnimation(reduceMotion ? nil : .spring(duration: 0.22, bounce: 0)) {
                isHovered = inside
            }
        }
        .animation(detailAnimation, value: reveal?.id)
        .animation(detailAnimation, value: card.prompt)
    }

    private var statusPill: some View {
        HStack(spacing: 4) {
            ThinkingStatusOrb(state: card.state, size: 10, animates: false)
                .accessibilityHidden(true)
            Text(card.state.label(for: card.id.cast))
                .font(.system(size: 8, weight: .bold, design: .monospaced))
        }
        .foregroundStyle(card.state.color)
        .padding(.horizontal, 6)
        .padding(.vertical, 3)
        .background(card.state.color.opacity(0.09), in: Capsule())
    }

    private func promptPanel(_ prompt: CardPrompt) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Rectangle()
                .fill(.white.opacity(0.07))
                .frame(height: 1)

            HStack(alignment: .top, spacing: 9) {
                Image(systemName: prompt.kind == .approval ? "exclamationmark.triangle.fill" : "questionmark.circle.fill")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.notchAmber)
                    .padding(.top, 1)
                VStack(alignment: .leading, spacing: 3) {
                    Text(prompt.title)
                        .font(.system(size: 10.5, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white.opacity(0.86))
                    Text(prompt.detail)
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                        .foregroundStyle(.white.opacity(0.42))
                        .lineLimit(2)
                }
            }

            HStack(spacing: 8) {
                if prompt.isAnswerable {
                    Button(prompt.kind == .approval ? "Reject" : "Done", action: markHandled)
                        .buttonStyle(NotchActionButtonStyle(role: .secondary))
                    Button(prompt.kind == .approval ? "Approve" : "Open", action: open)
                        .buttonStyle(NotchActionButtonStyle(role: .primary))
                } else {
                    Text("Handle this in Spaces")
                        .font(.system(size: 9, weight: .medium, design: .rounded))
                        .foregroundStyle(.white.opacity(0.34))
                    Spacer()
                    Button("Open in Spaces", action: jump)
                        .buttonStyle(NotchActionButtonStyle(role: .primary))
                }
            }
        }
        .padding(.horizontal, 11)
        .padding(.bottom, 11)
    }

    private func revealPanel(_ reveal: IslandStore.Reveal) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Rectangle()
                .fill(.white.opacity(0.07))
                .frame(height: 1)

            HStack(spacing: 6) {
                Image(systemName: "sparkles")
                    .font(.system(size: 8, weight: .semibold))
                Text("THE ANSWER")
                    .font(.system(size: 8.5, weight: .bold, design: .monospaced))
                    .tracking(0.3)
            }
            .foregroundStyle(card.id.cast.color.opacity(0.92))

            Text(reveal.text)
                .font(.system(size: 10.5, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.72))
                .lineSpacing(2)
                .lineLimit(5)
                .textSelection(.enabled)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 11)
        .padding(.bottom, 12)
    }

    private var hasDetail: Bool {
        reveal != nil || card.prompt != nil
    }

    private var castTintOpacity: Double {
        if isFeatured { return 0.045 }
        if isHovered { return 0.026 }
        return 0
    }

    private var detailAnimation: Animation? {
        guard !reduceMotion else { return nil }
        return hasDetail ? .spring(duration: 0.24, bounce: 0) : .easeIn(duration: 0.15)
    }

    private func elapsed(from start: Date, to end: Date) -> String {
        let seconds = max(0, Int(end.timeIntervalSince(start)))
        if seconds < 60 { return "\(seconds)s" }
        if seconds < 3_600 { return "\(seconds / 60)m" }
        return "\(seconds / 3_600)h"
    }

    private var avatarPhaseOffset: TimeInterval {
        let seed = card.id.id.unicodeScalars.reduce(0) { partial, scalar in
            (partial &* 31 &+ Int(scalar.value)) % 10_000
        }
        return TimeInterval(seed) / 731
    }
}

extension CastID {
    var color: Color {
        switch self {
        case .mention: .islandCoral
        case .ticket: .islandSaffron
        case .call: .islandCallGreen
        case .architect: .islandBlueprint
        case .askai: .islandViolet
        case .bot: .islandTeal
        case .xyne: .islandPaper
        }
    }
}

extension CardState {
    var color: Color {
        switch self {
        case .working: .notchGreen
        case .needsYou, .approval: .notchAmber
        case .done: .white.opacity(0.46)
        case .overdue: .red.opacity(0.88)
        case .fyi: .white.opacity(0.38)
        }
    }

    /// One cast member changes the wording: a call that is "working" is a call
    /// that has not started yet.
    func label(for cast: CastID) -> String {
        if self == .working, cast == .call { return "SOON" }
        return label
    }

    var label: String {
        switch self {
        case .working: "LIVE"
        case .needsYou: "NEEDS YOU"
        case .approval: "APPROVAL"
        case .done: "DONE"
        case .overdue: "OVERDUE"
        case .fyi: "FYI"
        }
    }
}
