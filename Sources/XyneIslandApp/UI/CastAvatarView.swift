import SwiftUI
import XyneIslandCore

/// One character per cast member, drawn in code rather than shipped as art.
/// Colour and silhouette say who it is; the face says what it wants.
struct CastAvatarView: View {
    let cast: CastID
    let state: CardState
    var size: CGFloat = 34
    var isHovered = false
    var showsContainer = true
    var animates = true
    var phaseOffset: TimeInterval = 0

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var reactionScale: CGFloat = 1
    @State private var reactionOffset: CGFloat = 0
    @State private var reactionRotation: Double = 0
    @State private var reactionTask: Task<Void, Never>?

    var body: some View {
        TimelineView(
            .animation(
                minimumInterval: state == .fyi ? 1.0 / 12.0 : 1.0 / 24.0,
                paused: !shouldAnimate
            )
        ) { context in
            avatar(at: context.date.timeIntervalSinceReferenceDate + phaseOffset)
        }
        .frame(width: size, height: size)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(
            "\(cast.castName), \(cast.displayName), \(state.accessibilityLabel)"
        )
        .onChange(of: state) { _, newState in
            playReaction(for: newState)
        }
        .onDisappear {
            reactionTask?.cancel()
        }
    }

    private func avatar(at time: TimeInterval) -> some View {
        let bodySize = size * (showsContainer ? 0.74 : 0.94)
        let pulse = shouldAnimate ? normalizedSine(time * state.motionRate) : 0.5
        let bob = shouldAnimate
            ? state.bobAmplitude * cast.bobMultiplier * sin(time * state.motionRate)
            : 0
        let stretch = shouldAnimate ? 0.985 + (pulse * 0.03) : 1
        let ambientLean = shouldAnimate ? cast.ambientLean(at: time, state: state) : 0

        return ZStack {
            if showsContainer {
                avatarContainer(pulse: pulse)
            }

            groundShadow(bob: bob, pulse: pulse)

            Group {
                switch cast {
                case .mention:
                    PipCharacter(size: bodySize, state: state, time: time, isAnimated: shouldAnimate, isHovered: isHovered)
                case .ticket:
                    StubCharacter(size: bodySize, state: state, time: time, isAnimated: shouldAnimate, isHovered: isHovered)
                case .call:
                    RingCharacter(size: bodySize, state: state, time: time, isAnimated: shouldAnimate, isHovered: isHovered)
                case .architect:
                    BeamCharacter(size: bodySize, state: state, time: time, isAnimated: shouldAnimate, isHovered: isHovered)
                case .askai:
                    SageCharacter(size: bodySize, state: state, time: time, isAnimated: shouldAnimate, isHovered: isHovered)
                case .bot:
                    DocCharacter(size: bodySize, state: state, time: time, isAnimated: shouldAnimate, isHovered: isHovered)
                case .xyne:
                    DotCharacter(size: bodySize, state: state, time: time, isAnimated: shouldAnimate, isHovered: isHovered)
                }
            }
            .scaleEffect(x: 2 - stretch, y: stretch, anchor: .bottom)
            .rotationEffect(.degrees(
                ambientLean
                    + (isHovered && !reduceMotion ? cast.hoverTilt : 0)
                    + reactionRotation
            ))
            .offset(y: bob + reactionOffset)
            .scaleEffect(reactionScale)
            .scaleEffect(isHovered && !reduceMotion ? 1.035 : 1)
        }
        .animation(
            reduceMotion ? nil : .spring(duration: 0.22, bounce: 0),
            value: isHovered
        )
    }

    private func avatarContainer(pulse: CGFloat) -> some View {
        let attention = state.needsAttention

        return RoundedRectangle(cornerRadius: size * 0.31, style: .continuous)
            .fill(cast.color.opacity(isHovered ? 0.16 : 0.105))
            .overlay(alignment: .topLeading) {
                if size >= 28 {
                    Capsule(style: .continuous)
                        .fill(.white.opacity(isHovered ? 0.10 : 0.055))
                        .frame(width: size * 0.24, height: max(1, size * 0.035))
                        .offset(x: size * 0.18, y: size * 0.14)
                }
            }
            .overlay {
                RoundedRectangle(cornerRadius: size * 0.31, style: .continuous)
                    .stroke(
                        attention
                            ? Color.notchAmber.opacity(0.18 + (pulse * 0.14))
                            : .white.opacity(isHovered ? 0.13 : 0.07),
                        lineWidth: max(0.6, size * 0.024)
                    )
            }
            .shadow(
                color: attention
                    ? Color.notchAmber.opacity(0.05 + (pulse * 0.04))
                    : cast.color.opacity(isHovered ? 0.10 : 0.04),
                radius: isHovered ? 8 : 5
            )
    }

    private var shouldAnimate: Bool {
        !reduceMotion && ((animates && state.animatesContinuously) || isHovered)
    }

    private func groundShadow(bob: CGFloat, pulse: CGFloat) -> some View {
        Capsule(style: .continuous)
            .fill(.black.opacity(showsContainer ? 0.22 : 0.14))
            .frame(width: size * (0.34 + (pulse * 0.035)), height: max(1, size * 0.055))
            .scaleEffect(x: 1 - min(abs(bob) / max(size, 1), 0.035))
            .offset(y: size * (showsContainer ? 0.31 : 0.36))
            .opacity(state == .overdue ? 0.3 : 0.72)
            .accessibilityHidden(true)
    }

    private func playReaction(for newState: CardState) {
        reactionTask?.cancel()
        guard !reduceMotion else {
            reactionScale = 1
            reactionOffset = 0
            reactionRotation = 0
            return
        }

        let anticipation: (scale: CGFloat, offset: CGFloat, rotation: Double)
        switch newState {
        case .needsYou, .approval:
            anticipation = (0.965, 0.8, -cast.hoverTilt * 0.7)
        case .done:
            anticipation = (0.97, 1.1, cast.hoverTilt * 0.55)
        case .working:
            anticipation = (0.985, 0.45, -cast.hoverTilt * 0.25)
        case .fyi, .overdue:
            return
        }

        var transaction = Transaction(animation: nil)
        transaction.disablesAnimations = true
        withTransaction(transaction) {
            reactionScale = anticipation.scale
            reactionOffset = anticipation.offset
            reactionRotation = anticipation.rotation
        }

        reactionTask = Task { @MainActor in
            await Task.yield()
            guard !Task.isCancelled else { return }
            withAnimation(.spring(duration: 0.28, bounce: 0.16)) {
                reactionScale = 1
                reactionOffset = 0
                reactionRotation = 0
            }
        }
    }
}

private struct CastFace: View {
    let size: CGFloat
    let state: CardState
    let time: TimeInterval
    let isAnimated: Bool
    let isHovered: Bool
    let personalityOffset: TimeInterval
    let cheekOpacity: Double

    var body: some View {
        ZStack {
            if size >= 19 {
                HStack(spacing: size * 0.43) {
                    Capsule(style: .continuous)
                        .rotationEffect(.degrees(leftBrowRotation))
                    Capsule(style: .continuous)
                        .rotationEffect(.degrees(rightBrowRotation))
                }
                .foregroundStyle(Color.islandInk.opacity(browOpacity))
                .frame(width: size * 0.51, height: max(1, size * 0.027))
                .offset(y: -(size * 0.055) + browLift)
            }

            HStack(spacing: size * 0.46) {
                Circle()
                Circle()
            }
            .foregroundStyle(Color.islandPaper.opacity(resolvedCheekOpacity))
            .frame(width: size * 0.68, height: size * 0.075)
            .offset(y: size * 0.18)

            VStack(spacing: size * 0.105) {
                HStack(spacing: size * 0.17) {
                    eye(rotation: state == .overdue ? 9 : 0)
                    eye(rotation: state == .overdue ? -9 : 0)
                }
                mouth
            }
            .offset(x: gazeX, y: size * 0.08 + gazeY)
        }
    }

    private func eye(rotation: Double) -> some View {
        Group {
            if state == .done || state == .overdue {
                Capsule(style: .continuous)
                    .fill(Color.islandInk.opacity(0.88))
                    .frame(width: size * 0.12, height: max(1, size * 0.035))
                    .rotationEffect(.degrees(rotation + (state == .done ? 12 : 0)))
            } else {
                Circle()
                    .fill(Color.islandInk)
                    .overlay(alignment: .topLeading) {
                        if size >= 20 {
                            Circle()
                                .fill(Color.islandPaper.opacity(0.9))
                                .frame(width: size * 0.031, height: size * 0.031)
                                .padding(size * 0.027)
                        }
                    }
                    .frame(
                        width: size * eyeScale,
                        height: size * eyeScale
                    )
                    .scaleEffect(y: blinkScale, anchor: .center)
            }
        }
    }

    @ViewBuilder
    private var mouth: some View {
        switch state {
        case .needsYou, .approval:
            Circle()
                .stroke(Color.islandInk.opacity(0.82), lineWidth: max(1, size * 0.045))
                .frame(width: size * 0.10, height: size * 0.10)
        case .done:
            SmileShape()
                .stroke(
                    Color.islandInk.opacity(0.86),
                    style: StrokeStyle(lineWidth: max(1, size * 0.045), lineCap: .round)
                )
                .frame(width: size * 0.21, height: size * 0.10)
        case .overdue:
            FrownShape()
                .stroke(
                    Color.islandInk.opacity(0.72),
                    style: StrokeStyle(lineWidth: max(1, size * 0.04), lineCap: .round)
                )
                .frame(width: size * 0.18, height: size * 0.08)
        case .fyi where isHovered:
            SmileShape()
                .stroke(
                    Color.islandInk.opacity(0.78),
                    style: StrokeStyle(lineWidth: max(1, size * 0.04), lineCap: .round)
                )
                .frame(width: size * 0.17, height: size * 0.075)
        case .working where isHovered:
            SmileShape()
                .stroke(
                    Color.islandInk.opacity(0.72),
                    style: StrokeStyle(lineWidth: max(1, size * 0.038), lineCap: .round)
                )
                .frame(width: size * 0.15, height: size * 0.065)
        case .working:
            Capsule(style: .continuous)
                .fill(Color.islandInk.opacity(0.76))
                .frame(width: workingMouthWidth, height: max(1, size * 0.035))
                .offset(x: sin((time * 1.1) + personalityOffset) * size * 0.008)
        case .fyi:
            Capsule(style: .continuous)
                .fill(Color.islandInk.opacity(0.54))
                .frame(width: size * 0.12, height: max(1, size * 0.035))
        }
    }

    private var eyeScale: CGFloat {
        if state.needsAttention { return 0.138 }
        if isHovered { return 0.123 }
        return 0.115
    }

    private var gazeX: CGFloat {
        guard isAnimated else { return isHovered ? size * 0.012 : 0 }
        switch state {
        case .working:
            return (
                sin((time * 0.82) + personalityOffset) * size * 0.022
                    + sin((time * 1.9) + personalityOffset) * size * 0.007
            )
        case .fyi:
            return sin((time * 0.34) + personalityOffset) * size * 0.014
        case .needsYou, .approval, .done, .overdue:
            return 0
        }
    }

    private var gazeY: CGFloat {
        guard isAnimated, state == .working else { return 0 }
        return sin((time * 0.61) + personalityOffset) * size * 0.006
    }

    private var blinkScale: CGFloat {
        guard isAnimated, !state.needsAttention else { return 1 }
        let period = 4.6 + personalityOffset
        let phase = positiveRemainder(time + personalityOffset, modulus: period)
        if let firstBlink = blinkWave(phase: phase, start: period - 0.42, duration: 0.15) {
            return firstBlink
        }
        if let secondBlink = blinkWave(phase: phase, start: period - 0.17, duration: 0.12) {
            return secondBlink
        }
        return 1
    }

    private func blinkWave(phase: Double, start: Double, duration: Double) -> CGFloat? {
        guard phase >= start, phase <= start + duration else { return nil }
        let progress = (phase - start) / duration
        return max(0.1, abs(CGFloat(cos(progress * .pi))))
    }

    private var resolvedCheekOpacity: Double {
        var opacity = cheekOpacity
        if state.needsAttention { opacity += 0.12 }
        if isHovered { opacity += 0.14 }
        if state == .working, isAnimated {
            opacity += Double(normalizedSine((time * 1.7) + personalityOffset)) * 0.07
        }
        return min(opacity, 0.72)
    }

    private var browOpacity: Double {
        if state.needsAttention { return 0.58 }
        if state == .working { return 0.36 }
        if isHovered { return 0.28 }
        return 0
    }

    private var browLift: CGFloat {
        if state.needsAttention { return -(size * 0.018) }
        if isHovered { return -(size * 0.01) }
        return 0
    }

    private var leftBrowRotation: Double {
        if state.needsAttention { return -5 }
        if state == .working { return 8 + sin((time * 0.55) + personalityOffset) * 1.5 }
        return -2
    }

    private var rightBrowRotation: Double {
        if state.needsAttention { return 5 }
        if state == .working { return -8 - sin((time * 0.55) + personalityOffset) * 1.5 }
        return 2
    }

    private var workingMouthWidth: CGFloat {
        let pulse = isAnimated ? normalizedSine((time * 1.45) + personalityOffset) : 0.5
        return size * (0.115 + (pulse * 0.025))
    }
}

private struct SmileShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.minY + rect.height * 0.2))
        path.addQuadCurve(
            to: CGPoint(x: rect.maxX, y: rect.minY + rect.height * 0.2),
            control: CGPoint(x: rect.midX, y: rect.maxY)
        )
        return path
    }
}

private struct FrownShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.addQuadCurve(
            to: CGPoint(x: rect.maxX, y: rect.maxY),
            control: CGPoint(x: rect.midX, y: rect.minY)
        )
        return path
    }
}

private func normalizedSine(_ value: Double) -> CGFloat {
    CGFloat((sin(value) + 1) * 0.5)
}

private func positiveRemainder(_ value: Double, modulus: Double) -> Double {
    let remainder = value.truncatingRemainder(dividingBy: modulus)
    return remainder >= 0 ? remainder : remainder + modulus
}

extension CardState {
    var needsAttention: Bool {
        self == .approval || self == .needsYou
    }

    fileprivate var animatesContinuously: Bool {
        self != .done && self != .overdue
    }

    fileprivate var accessibilityLabel: String {
        switch self {
        case .fyi: "waiting"
        case .working: "working"
        case .approval: "needs approval"
        case .needsYou: "needs an answer"
        case .done: "completed"
        case .overdue: "failed"
        }
    }

    fileprivate var motionRate: Double {
        switch self {
        case .needsYou, .approval: 3.1
        case .working: 2.2
        case .fyi: 1.15
        case .done, .overdue: 0
        }
    }

    fileprivate var bobAmplitude: CGFloat {
        switch self {
        case .needsYou, .approval: 0.7
        case .working: 0.45
        case .fyi: 0.18
        case .done, .overdue: 0
        }
    }
}

private extension CastID {
    /// How far a character leans when you hover it. Each one leans its own way,
    /// so a row of them never reads as a single rigid strip.
    var hoverTilt: Double {
        switch self {
        case .mention: -2.6
        case .ticket: 1.6
        case .call: -2.0
        case .architect: 1.2
        case .askai: 2.0
        case .bot: 0.8
        case .xyne: -1.0
        }
    }

    /// How much of the shared bob each character takes: Ring bounces, Stub barely moves.
    var bobMultiplier: CGFloat {
        switch self {
        case .mention: 1.15
        case .ticket: 0.55
        case .call: 1.3
        case .architect: 0.6
        case .askai: 0.95
        case .bot: 0.7
        case .xyne: 0.9
        }
    }

    /// The slow idle sway that keeps a quiet island alive without demanding attention.
    func ambientLean(at time: TimeInterval, state: CardState) -> Double {
        guard state == .working || state == .fyi else { return 0 }
        let quietMultiplier = state == .fyi ? 0.38 : 1
        switch self {
        case .mention:
            return sin((time * 0.8) + 0.9) * 1.1 * quietMultiplier
        case .ticket:
            return sin((time * 0.45) + 1.9) * 0.3 * quietMultiplier
        case .call:
            return sin((time * 1.1) + 0.2) * (state == .working ? 2.2 : 0.8) * quietMultiplier
        case .architect:
            return sin((time * 0.5) + 2.1) * 0.22 * quietMultiplier
        case .askai:
            return sin((time * 0.7) + 1.3) * 0.7 * quietMultiplier
        case .bot:
            return sin((time * 0.6) + 3.0) * 0.4 * quietMultiplier
        case .xyne:
            return sin((time * 0.8) + 0.9) * 0.6 * quietMultiplier
        }
    }
}


// MARK: - The Xyne cast

/// Dot stands in for anything from Spaces with no better home.
private struct DotCharacter: View {
    let size: CGFloat
    let state: CardState
    let time: TimeInterval
    let isAnimated: Bool
    let isHovered: Bool

    var body: some View {
        let sway = isAnimated ? sin(time * (state == .fyi ? 0.7 : 2.3)) * (state == .fyi ? 1.5 : 4) : 0
        ZStack {
            ZStack {
                Capsule(style: .continuous).frame(width: size * 0.34, height: size * 0.085).rotationEffect(.degrees(42 + sway))
                Capsule(style: .continuous).frame(width: size * 0.34, height: size * 0.085).rotationEffect(.degrees(-42 - sway))
            }
            .foregroundStyle(Color.islandCoral)
            .offset(y: -(size * 0.4))

            RoundedRectangle(cornerRadius: size * 0.3, style: .continuous)
                .fill(Color.islandPaper.opacity(0.9))
                .frame(width: size * 0.84, height: size * 0.72)
                .shadow(color: .black.opacity(0.16), radius: 1.2, y: 0.9)
                .overlay(alignment: .topLeading) {
                    Circle().fill(Color.islandPaper.opacity(0.18)).frame(width: size * 0.2, height: size * 0.12).offset(x: size * 0.2, y: size * 0.1)
                }
                .offset(y: size * 0.06)

            CastFace(size: size, state: state, time: time, isAnimated: isAnimated, isHovered: isHovered, personalityOffset: 0.2, cheekOpacity: 0.2)
        }
        .frame(width: size, height: size * 0.82)
        .offset(y: size * 0.06)
        .opacity(state == .overdue ? 0.64 : 1)
    }
}

/// Beam is the Architect: a squared blueprint body with a hard-hat brim.
private struct BeamCharacter: View {
    let size: CGFloat
    let state: CardState
    let time: TimeInterval
    let isAnimated: Bool
    let isHovered: Bool

    var body: some View {
        let lift = isAnimated ? normalizedSine(time * (state == .working ? 2.0 : 0.8)) * size * 0.03 : 0
        ZStack {
            Capsule(style: .continuous)
                .fill(Color.islandBlueprint)
                .frame(width: size * 0.92, height: size * 0.12)
                .offset(y: -(size * 0.36) - lift)
            RoundedRectangle(cornerRadius: size * 0.3, style: .continuous)
                .fill(Color.islandBlueprint)
                .frame(width: size * 0.56, height: size * 0.18)
                .offset(y: -(size * 0.46) - lift)

            RoundedRectangle(cornerRadius: size * 0.18, style: .continuous)
                .fill(Color.islandBlueprint)
                .frame(width: size * 0.82, height: size * 0.7)
                .shadow(color: .black.opacity(0.16), radius: 1.2, y: 0.9)
                .overlay {
                    VStack(spacing: size * 0.12) {
                        Rectangle().fill(Color.islandPaper.opacity(0.12)).frame(height: max(0.5, size * 0.015))
                        Rectangle().fill(Color.islandPaper.opacity(0.12)).frame(height: max(0.5, size * 0.015))
                    }
                    .frame(width: size * 0.6)
                    .offset(y: size * 0.16)
                }
                .offset(y: size * 0.08)

            CastFace(size: size, state: state, time: time, isAnimated: isAnimated, isHovered: isHovered, personalityOffset: 0.9, cheekOpacity: 0.1)
        }
        .frame(width: size, height: size * 0.82)
        .offset(y: size * 0.06)
        .opacity(state == .overdue ? 0.64 : 1)
    }
}

/// Sage is Ask AI: a round violet body with an orbiting spark.
private struct SageCharacter: View {
    let size: CGFloat
    let state: CardState
    let time: TimeInterval
    let isAnimated: Bool
    let isHovered: Bool

    var body: some View {
        let angle = isAnimated ? time * (state == .working ? 2.6 : 0.9) : 0.6
        ZStack {
            Circle()
                .fill(Color.islandViolet)
                .frame(width: size * 0.8, height: size * 0.8)
                .shadow(color: .black.opacity(0.16), radius: 1.2, y: 0.9)
                .overlay(alignment: .topLeading) {
                    Circle().fill(Color.islandPaper.opacity(0.18)).frame(width: size * 0.2, height: size * 0.12).offset(x: size * 0.18, y: size * 0.12)
                }
                .offset(y: size * 0.04)

            Circle()
                .fill(Color.islandPaper)
                .frame(width: size * 0.11, height: size * 0.11)
                .offset(x: cos(angle) * size * 0.46, y: -(size * 0.1) + sin(angle) * size * 0.2)
                .opacity(state == .done || state == .overdue ? 0.4 : 0.95)

            CastFace(size: size, state: state, time: time, isAnimated: isAnimated, isHovered: isHovered, personalityOffset: 1.6, cheekOpacity: 0.14)
        }
        .frame(width: size, height: size * 0.82)
        .offset(y: size * 0.06)
        .opacity(state == .overdue ? 0.64 : 1)
    }
}

/// Doc stands in for every other Spaces agent: the doctors, automations, custom bots.
private struct DocCharacter: View {
    let size: CGFloat
    let state: CardState
    let time: TimeInterval
    let isAnimated: Bool
    let isHovered: Bool

    var body: some View {
        ZStack {
            ShieldShape()
                .fill(Color.islandTeal)
                .frame(width: size * 0.84, height: size * 0.86)
                .shadow(color: .black.opacity(0.16), radius: 1.2, y: 0.9)
                .overlay {
                    ShieldShape()
                        .stroke(Color.islandPaper.opacity(0.22), lineWidth: max(0.6, size * 0.03))
                        .frame(width: size * 0.66, height: size * 0.68)
                        .offset(y: size * 0.02)
                }
                .offset(y: size * 0.02)

            CastFace(size: size, state: state, time: time, isAnimated: isAnimated, isHovered: isHovered, personalityOffset: 2.4, cheekOpacity: 0.08)
        }
        .frame(width: size, height: size * 0.82)
        .offset(y: size * 0.06)
        .opacity(state == .overdue ? 0.64 : 1)
    }
}

private struct ShieldShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let r = rect.width * 0.22
        path.move(to: CGPoint(x: rect.minX + r, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX - r, y: rect.minY))
        path.addQuadCurve(to: CGPoint(x: rect.maxX, y: rect.minY + r), control: CGPoint(x: rect.maxX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
        path.addQuadCurve(to: CGPoint(x: rect.midX, y: rect.maxY), control: CGPoint(x: rect.maxX, y: rect.maxY * 0.92))
        path.addQuadCurve(to: CGPoint(x: rect.minX, y: rect.midY), control: CGPoint(x: rect.minX, y: rect.maxY * 0.92))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + r))
        path.addQuadCurve(to: CGPoint(x: rect.minX + r, y: rect.minY), control: CGPoint(x: rect.minX, y: rect.minY))
        path.closeSubpath()
        return path
    }
}


// MARK: - Scenario folk

/// Pip is a mention: a coral speech bubble with a tail, tail flicks when it needs you.
private struct PipCharacter: View {
    let size: CGFloat
    let state: CardState
    let time: TimeInterval
    let isAnimated: Bool
    let isHovered: Bool

    var body: some View {
        let flick = isAnimated && state.needsAttention ? sin(time * 6) * 4 : 0
        ZStack {
            SpeechBubbleShape(tail: size * 0.16)
                .fill(Color.islandCoral)
                .frame(width: size * 0.9, height: size * 0.8)
                .rotationEffect(.degrees(flick), anchor: .bottomLeading)
                .shadow(color: .black.opacity(0.16), radius: 1.2, y: 0.9)
                .overlay(alignment: .topLeading) {
                    Circle().fill(Color.islandPaper.opacity(0.18)).frame(width: size * 0.2, height: size * 0.12).offset(x: size * 0.18, y: size * 0.1)
                }
                .offset(y: size * 0.02)

            CastFace(size: size, state: state, time: time, isAnimated: isAnimated, isHovered: isHovered, personalityOffset: 0.2, cheekOpacity: 0.2)
                .offset(y: -(size * 0.05))
        }
        .frame(width: size, height: size * 0.82)
        .offset(y: size * 0.06)
        .opacity(state == .overdue ? 0.64 : 1)
    }
}

private struct SpeechBubbleShape: Shape {
    let tail: CGFloat
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let body = CGRect(x: rect.minX, y: rect.minY, width: rect.width, height: rect.height - tail)
        path.addRoundedRect(in: body, cornerSize: CGSize(width: body.height * 0.34, height: body.height * 0.34), style: .continuous)
        var tailPath = Path()
        tailPath.move(to: CGPoint(x: body.minX + body.width * 0.18, y: body.maxY - 1))
        tailPath.addLine(to: CGPoint(x: body.minX + body.width * 0.12, y: rect.maxY))
        tailPath.addLine(to: CGPoint(x: body.minX + body.width * 0.4, y: body.maxY - 1))
        tailPath.closeSubpath()
        path.addPath(tailPath)
        return path
    }
}

/// Stub is a ticket: a saffron stub with side notches and a perforation, it leans when overdue.
private struct StubCharacter: View {
    let size: CGFloat
    let state: CardState
    let time: TimeInterval
    let isAnimated: Bool
    let isHovered: Bool

    var body: some View {
        let shiver = isAnimated && state == .overdue ? sin(time * 14) * 1.5 : 0
        ZStack {
            TicketStubShape(notch: size * 0.09)
                .fill(Color.islandSaffron)
                .frame(width: size * 0.94, height: size * 0.72)
                .shadow(color: .black.opacity(0.16), radius: 1.2, y: 0.9)
                .overlay {
                    // Perforation: a column of dots on the stub's tear line.
                    VStack(spacing: size * 0.05) {
                        ForEach(0..<4, id: \.self) { _ in
                            Circle().fill(Color.islandInk.opacity(0.28)).frame(width: max(1, size * 0.035), height: max(1, size * 0.035))
                        }
                    }
                    .offset(x: size * 0.3)
                }
                .rotationEffect(.degrees(shiver))
                .offset(y: size * 0.06)

            CastFace(size: size, state: state, time: time, isAnimated: isAnimated, isHovered: isHovered, personalityOffset: 1.1, cheekOpacity: 0.12)
                .offset(x: -(size * 0.08))
        }
        .frame(width: size, height: size * 0.82)
        .offset(y: size * 0.06)
        .opacity(state == .overdue ? 0.8 : 1)
    }
}

private struct TicketStubShape: Shape {
    let notch: CGFloat
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let r = rect.height * 0.22
        path.move(to: CGPoint(x: rect.minX + r, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX - r, y: rect.minY))
        path.addQuadCurve(to: CGPoint(x: rect.maxX, y: rect.minY + r), control: CGPoint(x: rect.maxX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY - notch))
        path.addArc(center: CGPoint(x: rect.maxX, y: rect.midY), radius: notch, startAngle: .degrees(-90), endAngle: .degrees(90), clockwise: true)
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - r))
        path.addQuadCurve(to: CGPoint(x: rect.maxX - r, y: rect.maxY), control: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX + r, y: rect.maxY))
        path.addQuadCurve(to: CGPoint(x: rect.minX, y: rect.maxY - r), control: CGPoint(x: rect.minX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.midY + notch))
        path.addArc(center: CGPoint(x: rect.minX, y: rect.midY), radius: notch, startAngle: .degrees(90), endAngle: .degrees(-90), clockwise: true)
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + r))
        path.addQuadCurve(to: CGPoint(x: rect.minX + r, y: rect.minY), control: CGPoint(x: rect.minX, y: rect.minY))
        path.closeSubpath()
        return path
    }
}

/// Ring is a call: a green round body wearing a handset, which rings when the call is close.
private struct RingCharacter: View {
    let size: CGFloat
    let state: CardState
    let time: TimeInterval
    let isAnimated: Bool
    let isHovered: Bool

    var body: some View {
        let ring = isAnimated && (state == .working || state.needsAttention) ? sin(time * 9) * (state.needsAttention ? 7 : 3) : 0
        ZStack {
            // Handset: a bent capsule resting on the head.
            HandsetShape()
                .fill(Color.islandCallGreen)
                .frame(width: size * 0.8, height: size * 0.4)
                .rotationEffect(.degrees(-26 + ring))
                .offset(x: size * 0.04, y: -(size * 0.4))

            Circle()
                .fill(Color.islandCallGreen)
                .frame(width: size * 0.78, height: size * 0.78)
                .shadow(color: .black.opacity(0.16), radius: 1.2, y: 0.9)
                .overlay(alignment: .topLeading) {
                    Circle().fill(Color.islandPaper.opacity(0.18)).frame(width: size * 0.2, height: size * 0.12).offset(x: size * 0.18, y: size * 0.12)
                }
                .offset(y: size * 0.06)

            CastFace(size: size, state: state, time: time, isAnimated: isAnimated, isHovered: isHovered, personalityOffset: 2.0, cheekOpacity: 0.14)
        }
        .frame(width: size, height: size * 0.82)
        .offset(y: size * 0.06)
        .opacity(state == .overdue ? 0.64 : 1)
    }
}

private struct HandsetShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width, h = rect.height
        // Two ear cups joined by a thin bridge, the classic handset silhouette.
        // Receiver: two fat ear pieces and a thinner bent handle between them.
        path.addRoundedRect(in: CGRect(x: rect.minX, y: rect.minY + h * 0.3, width: w * 0.3, height: h * 0.7), cornerSize: CGSize(width: w * 0.1, height: w * 0.1), style: .continuous)
        path.addRoundedRect(in: CGRect(x: rect.maxX - w * 0.3, y: rect.minY + h * 0.3, width: w * 0.3, height: h * 0.7), cornerSize: CGSize(width: w * 0.1, height: w * 0.1), style: .continuous)
        var bridge = Path()
        bridge.move(to: CGPoint(x: rect.minX + w * 0.15, y: rect.minY + h * 0.5))
        bridge.addQuadCurve(to: CGPoint(x: rect.maxX - w * 0.15, y: rect.minY + h * 0.5), control: CGPoint(x: rect.midX, y: rect.minY - h * 0.45))
        path.addPath(bridge.strokedPath(StrokeStyle(lineWidth: h * 0.3, lineCap: .round)))
        return path
    }
}
