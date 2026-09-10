import XyneIslandCore
import SwiftUI

/// A tiny, provider-neutral status constellation for the notch.
///
/// Continuous motion is reserved for the collapsed summary. Smaller instances
/// can render a representative still frame so rows remain calm and scannable.
struct ThinkingStatusOrb: View {
    let state: CardState
    var size: CGFloat = 18
    var animates = true

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        TimelineView(
            .animation(
                minimumInterval: visualState.minimumFrameInterval,
                paused: isPaused
            )
        ) { timelineContext in
            Canvas { graphicsContext, canvasSize in
                draw(
                    in: &graphicsContext,
                    canvasSize: canvasSize,
                    time: timelineContext.date.timeIntervalSinceReferenceDate
                )
            }
        }
        .frame(width: size, height: size)
        .allowsHitTesting(false)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(visualState.accessibilityLabel)
    }

    private var visualState: ThinkingOrbVisualState {
        ThinkingOrbVisualState(state)
    }

    private var isPaused: Bool {
        reduceMotion || !animates || !visualState.animatesContinuously
    }

    private func draw(
        in context: inout GraphicsContext,
        canvasSize: CGSize,
        time: TimeInterval
    ) {
        let side = min(canvasSize.width, canvasSize.height)
        let origin = CGPoint(
            x: (canvasSize.width - side) / 2,
            y: (canvasSize.height - side) / 2
        )
        let dots = ThinkingOrbLayout.sample(
            for: state,
            phase: time,
            animated: !isPaused
        )

        for dot in dots.sorted(by: { $0.depth < $1.depth }) {
            let radius = max(0.48, dot.radius * side)
            let center = CGPoint(
                x: origin.x + (dot.x * side),
                y: origin.y + (dot.y * side)
            )
            let rect = CGRect(
                x: center.x - radius,
                y: center.y - radius,
                width: radius * 2,
                height: radius * 2
            )
            context.fill(
                Path(ellipseIn: rect),
                with: .color(visualState.color.opacity(dot.opacity))
            )
        }
    }
}

enum ThinkingOrbVisualState: Equatable {
    case quiet
    case thinking
    case attention
    case settled
    case failed

    init(_ state: CardState) {
        switch state {
        case .fyi:
            self = .quiet
        case .working:
            self = .thinking
        case .needsYou, .approval:
            self = .attention
        case .done:
            self = .settled
        case .overdue:
            self = .failed
        }
    }

    fileprivate var animatesContinuously: Bool {
        switch self {
        case .quiet, .thinking, .attention:
            true
        case .settled, .failed:
            false
        }
    }

    fileprivate var minimumFrameInterval: TimeInterval {
        switch self {
        case .thinking, .attention:
            1.0 / 24.0
        case .quiet, .settled, .failed:
            1.0 / 12.0
        }
    }

    fileprivate var stillPhase: TimeInterval {
        switch self {
        case .quiet: 0.7
        case .thinking: 1.1
        case .attention: 0.9
        case .settled, .failed: 0
        }
    }

    fileprivate var color: Color {
        switch self {
        case .thinking:
            .notchGreen
        case .attention:
            .notchAmber
        case .failed:
            .red.opacity(0.88)
        case .settled:
            .white.opacity(0.52)
        case .quiet:
            .white.opacity(0.56)
        }
    }

    fileprivate var accessibilityLabel: String {
        switch self {
        case .quiet:
            "Agents waiting"
        case .thinking:
            "Agents working"
        case .attention:
            "Agent needs attention"
        case .settled:
            "Agents finished"
        case .failed:
            "Agent failed"
        }
    }
}

struct ThinkingOrbDot: Equatable {
    let x: CGFloat
    let y: CGFloat
    let radius: CGFloat
    let opacity: Double
    let depth: CGFloat
}

enum ThinkingOrbLayout {
    /// Returns normalized geometry so the same art direction can be tuned and
    /// tested independently of SwiftUI's rendering clock.
    static func sample(
        for state: CardState,
        phase: TimeInterval,
        animated: Bool
    ) -> [ThinkingOrbDot] {
        let visualState = ThinkingOrbVisualState(state)
        let time = animated
            ? phase.truncatingRemainder(dividingBy: 10_000)
            : visualState.stillPhase

        switch visualState {
        case .quiet:
            return orbit(
                count: 5,
                time: time,
                speed: 0.34,
                horizontalRadius: 0.24,
                verticalRadius: 0.105,
                baseRadius: 0.052,
                depthRadius: 0.018,
                baseOpacity: 0.28,
                depthOpacity: 0.42
            ) + [centerDot(radius: 0.07, opacity: 0.66)]

        case .thinking:
            let centerDrift = CGFloat(sin(time * 0.72)) * 0.018
            return orbit(
                count: 7,
                time: time,
                speed: 0.96,
                horizontalRadius: 0.31,
                verticalRadius: 0.17,
                baseRadius: 0.054,
                depthRadius: 0.03,
                baseOpacity: 0.26,
                depthOpacity: 0.62
            ) + [ThinkingOrbDot(
                x: 0.5 + centerDrift,
                y: 0.5,
                radius: 0.09,
                opacity: 0.92,
                depth: 0.54
            )]

        case .attention:
            let anticipation = 1 + (CGFloat(sin(time * 2.15)) * 0.035)
            return orbit(
                count: 6,
                time: time,
                speed: 1.32,
                horizontalRadius: 0.27 * anticipation,
                verticalRadius: 0.23 * anticipation,
                baseRadius: 0.058,
                depthRadius: 0.022,
                baseOpacity: 0.34,
                depthOpacity: 0.54
            ) + [centerDot(
                radius: 0.092 * anticipation,
                opacity: 0.94
            )]

        case .settled:
            return [
                ThinkingOrbDot(x: 0.25, y: 0.48, radius: 0.052, opacity: 0.34, depth: 0.1),
                ThinkingOrbDot(x: 0.36, y: 0.58, radius: 0.062, opacity: 0.48, depth: 0.2),
                ThinkingOrbDot(x: 0.48, y: 0.68, radius: 0.075, opacity: 0.74, depth: 0.4),
                ThinkingOrbDot(x: 0.62, y: 0.50, radius: 0.075, opacity: 0.84, depth: 0.6),
                ThinkingOrbDot(x: 0.76, y: 0.31, radius: 0.082, opacity: 0.96, depth: 0.8),
            ]

        case .failed:
            return [
                ThinkingOrbDot(x: 0.24, y: 0.43, radius: 0.052, opacity: 0.24, depth: 0.1),
                ThinkingOrbDot(x: 0.37, y: 0.50, radius: 0.064, opacity: 0.34, depth: 0.2),
                ThinkingOrbDot(x: 0.50, y: 0.58, radius: 0.074, opacity: 0.52, depth: 0.4),
                ThinkingOrbDot(x: 0.64, y: 0.63, radius: 0.062, opacity: 0.34, depth: 0.2),
                ThinkingOrbDot(x: 0.77, y: 0.67, radius: 0.05, opacity: 0.22, depth: 0.1),
            ]
        }
    }

    private static func orbit(
        count: Int,
        time: TimeInterval,
        speed: Double,
        horizontalRadius: CGFloat,
        verticalRadius: CGFloat,
        baseRadius: CGFloat,
        depthRadius: CGFloat,
        baseOpacity: Double,
        depthOpacity: Double
    ) -> [ThinkingOrbDot] {
        (0..<count).map { index in
            let angle = (time * speed) + (Double(index) * 2 * .pi / Double(count))
            let sine = sin(angle)
            let depth = CGFloat((sine + 1) * 0.5)

            return ThinkingOrbDot(
                x: 0.5 + (CGFloat(cos(angle)) * horizontalRadius),
                y: 0.5 + (CGFloat(sine) * verticalRadius),
                radius: baseRadius + (depth * depthRadius),
                opacity: baseOpacity + (Double(depth) * depthOpacity),
                depth: depth
            )
        }
    }

    private static func centerDot(radius: CGFloat, opacity: Double) -> ThinkingOrbDot {
        ThinkingOrbDot(x: 0.5, y: 0.5, radius: radius, opacity: opacity, depth: 0.5)
    }
}
