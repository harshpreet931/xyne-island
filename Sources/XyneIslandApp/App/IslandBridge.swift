import Foundation
import XyneIslandCore

/// Listens on the user-only Unix socket the sidecar sends cards to.
final class IslandBridge {
    private let server = UnixSocketServer()
    private weak var store: IslandStore?

    init(store: IslandStore) {
        self.store = store
    }

    func start() throws {
        try server.start { [weak store] event, responder in
            Task { @MainActor in
                store?.ingest(event, responder: responder)
            }
        }
    }

    func stop() {
        server.stop()
    }
}
