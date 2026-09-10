// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "XyneIsland",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .library(name: "XyneIslandCore", targets: ["XyneIslandCore"]),
        .executable(name: "XyneIsland", targets: ["XyneIslandApp"]),
    ],
    targets: [
        .target(
            name: "XyneIslandCore"
        ),
        .executableTarget(
            name: "XyneIslandApp",
            dependencies: ["XyneIslandCore"]
        ),
        .testTarget(
            name: "XyneIslandCoreTests",
            dependencies: ["XyneIslandCore"]
        ),
        .testTarget(
            name: "XyneIslandAppTests",
            dependencies: ["XyneIslandApp", "XyneIslandCore"]
        ),
    ],
    swiftLanguageModes: [.v5]
)
