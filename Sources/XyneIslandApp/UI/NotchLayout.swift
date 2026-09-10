import Foundation

enum NotchLayout {
    static let expandedSize = CGSize(width: 548, height: 382)
    static let activeWingWidth: CGFloat = 120
    static let activeFallbackSize = CGSize(width: 208, height: 40)
    static let idleFallbackSize = CGSize(width: 46, height: 24)

    static func collapsedSize(
        hasHardwareNotch: Bool,
        hardwareNotchWidth: CGFloat,
        hardwareNotchHeight: CGFloat,
        menuBarHeight: CGFloat,
        hasSessions: Bool
    ) -> CGSize {
        guard hasHardwareNotch else {
            return hasSessions ? activeFallbackSize : idleFallbackSize
        }

        let notchHeight = min(max(hardwareNotchHeight, 30), 40)
        let measuredBarHeight = menuBarHeight >= 20 ? menuBarHeight : notchHeight
        let activeHeight = min(max(measuredBarHeight, notchHeight), 40)
        let activityWidth = hardwareNotchWidth + (activeWingWidth * 2)
        return CGSize(
            width: hasSessions ? activityWidth : hardwareNotchWidth,
            height: hasSessions ? activeHeight : notchHeight
        )
    }
}
