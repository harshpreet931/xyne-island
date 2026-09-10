# Contributing

Small, single-purpose pull requests are easiest to review.

## Setup

macOS 14+, Xcode 16+ / Swift 6, Node 22.6+.

```bash
swift test -Xswiftc -warnings-as-errors
swift build -c release -Xswiftc -warnings-as-errors
./scripts/package-app.sh

cd sidecar && npm install
npx tsc --noEmit
```

## Working on the app

Run the app against your working copy of the bridge instead of the bundled one:

```bash
XYNE_ISLAND_NO_SIDECAR=1 open "build/Xyne Island.app"   # app only
cd sidecar && npm start                                  # bridge, output visible
```

Design work needs no Spaces session at all — `npm run scenes` plays every card
state, and `npm run demo` is a keyboard-driven director for showing it to a room.

Useful environment variables:

| Variable | Effect |
| --- | --- |
| `XYNE_ISLAND_NO_SIDECAR=1` | The app does not start a bridge |
| `XYNE_ISLAND_PREVIEW=1` | Launch straight into the example day |
| `XYNE_ISLAND_SIDECAR=<path>` | Point the app at a bridge entry point |
| `XYNE_ISLAND_POLL_MS` | Poll interval for the bridge (default 12000) |
| `XYNE_ISLAND_DEBUG=1` | The bridge logs per-endpoint warnings |
| `XYNE_TOKEN` / `XYNE_BASE_URL` | Override the stored credentials entirely |

## Change rules

1. **The protocol has two halves.** `Sources/XyneIslandCore/Transport/IslandEvent.swift`
   and `sidecar/src/island.ts` describe the same bytes. Change them in the same
   commit, and bump `v` if an older reader would misread the result.
2. **Judgement lives in the bridge.** Deciding that a mention needs you and a
   merged PR does not belongs in `cards.ts`, where the Spaces vocabulary still
   exists. The app draws what it is told; do not add a second interpretation
   layer.
3. **A timer must never hide something that needs you.** `working`, `needsYou`,
   and `approval` retire only when the bridge says so.
4. **Fail open, degrade narrowly.** One failing endpoint costs one kind of card.
   Wrap new readers in `safe()`.
5. **Treat Spaces content as sensitive.** Message text, ticket titles, and agent
   answers are other people's words. Clamp them, keep them in memory, and do not
   add new places they are written down.
6. **Privacy-affecting changes update [PRIVACY.md](PRIVACY.md)** in the same pull
   request, with a test around the new boundary. Persistence, networking,
   analytics, or a new file on disk needs a design discussion first.
7. **Every animation needs a Reduce Motion form**, and that form has to still
   communicate the state.
8. **New cast members follow [the brand system](docs/brand.md)**: an original
   silhouette, one signature movement, a state-readable face, and an
   accessibility label. No third-party logos as characters.

## Tests

Add a test when the cost of being wrong is real: protocol decoding, clamping,
card identity and retirement, socket limits, token refresh decisions. `swift
test` runs in under a second, so there is no reason to skip it.

Never point tests at a real home directory, a real Spaces workspace, or a real
token.

## What not to contribute

Proprietary assets, extracted application code, copied sound packs, scraped
branding, or reverse-engineered private protocols. Contributions must be
original or carry a compatible license, with attribution recorded in
[NOTICE.md](NOTICE.md).

Report vulnerabilities through [SECURITY.md](SECURITY.md), not a public pull
request.
