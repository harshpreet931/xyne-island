## What changed

<!-- The user-visible outcome, in a sentence or two. -->

## Validation

- [ ] `swift test -Xswiftc -warnings-as-errors`
- [ ] `swift build -c release -Xswiftc -warnings-as-errors`
- [ ] `cd sidecar && npx tsc --noEmit`
- [ ] Checked against a running app (`npm run scenes`, or a real Spaces session)
- [ ] Reduce Motion behaviour checked, for motion changes

## Boundaries

- [ ] Protocol changes touch both `IslandEvent.swift` and `island.ts`, with `v` bumped if an older reader would misread it
- [ ] This change still degrades narrowly: one failing endpoint costs one kind of card
- [ ] `PRIVACY.md` updated if anything new crosses a boundary or lands on disk
- [ ] `CHANGELOG.md` updated for user-visible changes
- [ ] No credentials, tokens, Spaces content, private source, or proprietary assets included
- [ ] New third-party material has a compatible license and is recorded in `NOTICE.md`
