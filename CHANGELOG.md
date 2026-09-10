# Changelog

Notable user-visible changes. This project follows semantic versioning after the
first stable release; pre-1.0 interfaces may still change.

## [Unreleased]

### Added

- The macOS app runs its own Spaces bridge. It finds `node` on the login shell's
  `PATH`, starts the bridge at launch, restarts it on a backoff if it dies, and
  stops it on quit — so a download from the `.dmg` works with no terminal.
- Spaces tokens refresh themselves through the `spaces` CLI. The bridge renews
  five minutes before expiry and runs `spaces token --update` if Spaces rejects a
  token anyway, rate-limited so a server-side failure cannot spawn browser
  prompts in a loop.
- Credentials live in `~/.config/xyne-island/env` (`0600`, in a `0700`
  directory), outside any checkout.
- Menu bar shows the bridge's state and offers Refresh Spaces Token, Restart
  Bridge, Open Bridge Log, and Open Spaces.
- The notch explains its own silence: "Sign in to Spaces" and "Reconnecting" are
  distinct from "All quiet up here".
- The `.dmg` carries the bridge and its vendored SDK inside the app bundle.
- `npm run scenes` plays every card state without a Spaces session.

### Changed

- One card vocabulary end to end. The bridge sends a finished card — `working`,
  `needsYou`, `approval`, `done`, `overdue`, `fyi` — instead of a stream of
  events for the app to interpret. Protocol version `v: 1`; a higher version is
  dropped rather than misread.
- The cast is Pip, Stub, Ring, Beam, Sage, and Doc: the six things Spaces asks of
  you.
- `@xyne/spaces-sdk` is vendored at `sidecar/vendor/`, so a fresh clone can build
  and run without a private registry.

### Removed

- The terminal-agent integration this project grew out of: the Claude Code,
  Codex, and OpenCode hook installers, the hook helper binary, and their
  characters. Xyne Island is fed by its own bridge and writes to no other
  application's configuration.

### Security

- Only `http` and `https` links are handed to `NSWorkspace`; any other scheme in
  a card is dropped.
- Everything that reaches the screen is collapsed to one line and clamped, and a
  revealed body is capped at 6,000 characters.
