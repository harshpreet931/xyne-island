import XyneIslandCore
import XCTest
@testable import XyneIslandApp

final class NotchMotionTests: XCTestCase {
    func testInteractiveMotionStaysWithinResponsiveBudget() {
        XCTAssertLessThanOrEqual(NotchMotion.expansionDuration, 0.3)
        XCTAssertLessThanOrEqual(NotchMotion.collapseDuration, 0.3)
        XCTAssertLessThan(NotchMotion.collapseDuration, NotchMotion.expansionDuration)
    }

    @MainActor
    func testExpansionStateUsesOneSharedSourceOfTruth() {
        let state = NotchExpansionState(isExpanded: false)
        XCTAssertFalse(state.isExpanded)

        state.isExpanded = true
        XCTAssertTrue(state.isExpanded)
    }

    func testThinkingOrbMapsEveryCardStateToAReadableVisual() {
        XCTAssertEqual(ThinkingOrbVisualState(.fyi), .quiet)
        XCTAssertEqual(ThinkingOrbVisualState(.working), .thinking)
        XCTAssertEqual(ThinkingOrbVisualState(.approval), .attention)
        XCTAssertEqual(ThinkingOrbVisualState(.needsYou), .attention)
        XCTAssertEqual(ThinkingOrbVisualState(.done), .settled)
        XCTAssertEqual(ThinkingOrbVisualState(.overdue), .failed)
    }

    func testStaticThinkingOrbIsDeterministicForReducedMotionAndMiniatures() {
        let first = ThinkingOrbLayout.sample(for: .working, phase: 1, animated: false)
        let later = ThinkingOrbLayout.sample(for: .working, phase: 900, animated: false)

        XCTAssertEqual(first, later)
    }

    func testWorkingThinkingOrbChangesAcrossAnimatedFrames() {
        let first = ThinkingOrbLayout.sample(for: .working, phase: 1, animated: true)
        let later = ThinkingOrbLayout.sample(for: .working, phase: 1.5, animated: true)

        XCTAssertNotEqual(first, later)
    }

    func testThinkingOrbGeometryStaysInsideItsCanvas() {
        let states: [CardState] = CardState.allCases

        for state in states {
            for dot in ThinkingOrbLayout.sample(for: state, phase: 42, animated: true) {
                XCTAssertGreaterThanOrEqual(dot.x - dot.radius, 0)
                XCTAssertLessThanOrEqual(dot.x + dot.radius, 1)
                XCTAssertGreaterThanOrEqual(dot.y - dot.radius, 0)
                XCTAssertLessThanOrEqual(dot.y + dot.radius, 1)
                XCTAssertGreaterThan(dot.opacity, 0)
                XCTAssertLessThanOrEqual(dot.opacity, 1)
            }
        }
    }
}
