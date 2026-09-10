import Combine
import QuartzCore
import SwiftUI

/// One timing language for both the SwiftUI shell and its AppKit panel.
/// Matching curves keeps the content, corners, and native window attached while resizing.
enum NotchMotion {
    static let expansionDuration: TimeInterval = 0.28
    static let collapseDuration: TimeInterval = 0.20

    static func animation(expanding: Bool) -> Animation {
        if expanding {
            return .timingCurve(0.16, 1, 0.30, 1, duration: expansionDuration)
        }
        return .timingCurve(0.40, 0, 1, 1, duration: collapseDuration)
    }

    static func timingFunction(expanding: Bool) -> CAMediaTimingFunction {
        if expanding {
            return CAMediaTimingFunction(controlPoints: 0.16, 1, 0.30, 1)
        }
        return CAMediaTimingFunction(controlPoints: 0.40, 0, 1, 1)
    }
}

@MainActor
final class NotchExpansionState: ObservableObject {
    @Published var isExpanded: Bool

    init(isExpanded: Bool) {
        self.isExpanded = isExpanded
    }
}
