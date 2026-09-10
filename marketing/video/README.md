# Xyne Island launch video

Remotion compositions for the project's animated assets, built on the Xyne Island
video system (MIT). These are **recreations**, not screen captures: every
colour, motion rate, and piece of geometry is ported from the Swift source so
the output matches shipped behaviour.

## Run

```bash
npm install
npm run dev          # Remotion Studio
npm run hero         # 1200x460 @ 60fps MP4
npm run hero:gif     # 900x345 @ 20fps GIF for the README
npm run film         # 1920x1080 @ 60fps MP4
npm run assets       # render both and copy them into docs/
```

## Compositions

| ID | Size | Length | Use |
| --- | --- | --- | --- |
| `HeroLoop` | 1200×460 | 6s, seamless | README banner and link cards |
| `LaunchFilm` | 1920×1080 | 18s | Launch post, hackathon submission, social |
| `TourFilm` | 1920×1080 | 105s @ 30fps | Every feature, chapter by chapter, with captions and a synthesized sound design (`npm run tour`; `sound/tour-sound.py` generates the audio from the chapter timeline, no licensed music) |

`HeroLoop` returns to its opening geometry on the final frame, so it loops
without a visible seam. Its `drift` prop adds a slow breathing scale; it is on
for video and off for the GIF, because a full-frame scale changes every pixel
each frame and quadruples the GIF (100 kB → 388 kB) for an effect nobody
notices on a banner. `gif-props.json` carries that override.

`LaunchFilm` tells one story: quiet notch → the standup countdown → a mention
needs you → Open → the ticket and the Architect arrive → an RCA lands → quiet
collapse → home mark and the cast on the baseline.

Energy comes from cinematography, not from decorating the UI — brand.md bans
"perpetual confetti, bouncing notification badges, or decorative background
animation," so the film adds a keyframed camera, staggered card entrances,
drawer open/close, a word-by-word answer reveal, and the three approved promise
lines from brand.md's message architecture. No invented UI.

## Camera

The camera keyframes are `[frame, zoom, originY]`. Because the panel top sits
at `SCREEN_TOP`, a keyframe's visible top edge is
`originY - (SCREEN_TOP - originY) * zoom` — keep that comfortably positive or
clearly off-frame, or the header gets sliced by a few pixels and reads as a
render fault.

## What is ported, and from where

| Video source | Swift source |
| --- | --- |
| `brand.ts` colours | `docs/brand.md`, `UI/Components.swift:76` |
| `brand.ts` `sampleOrb` | `UI/ThinkingStatusOrb.swift:168` |
| `brand.ts` motion rates, bob, lean | `UI/ProviderAvatarView.swift:703` |
| `Folk.tsx` bodies and faces | `UI/ProviderAvatarView.swift` — Ember/Orbit/Moss plus the Xyne cast: Pip, Stub, Ring, Beam, Sage, Doc |
| `Mark.tsx` | `UI/BrandIdentity.swift` — the coral x on the notch |
| `ExpandedPanel.tsx` cards | `UI/AgentSessionCard.swift` |
| `ExpandedPanel.tsx` header | `UI/NotchRootView.swift:182` |
| `Folkline.tsx` | `docs/brand.md` — "The folkline" |
| Panel size | `UI/NotchLayout.swift:4` |

Geometry is expressed in thousandths of the avatar size so the SVG mirrors the
Swift `size * fraction` idiom line for line.

## Known divergences

- **SF Symbols** are unavailable to a browser renderer. `Icons.tsx` redraws the
  arrow, xmark, check, warning, and sparkle glyphs at matching optical weights.
- **Continuous (squircle) corners** become circular SVG/CSS corners.
- **The notch is oversized** relative to a real display so the label and cast
  stay legible at README scale. The proportions inside the notch are correct;
  its share of the screen is not.
- **The menu bar is abstract.** Imitating another vendor's menu bar would be a
  trademark problem, and the brand asset rules forbid captures with real
  session content.
- **No amber edge treatment was invented.** Attention is signalled only the way
  the app signals it: the summary orb turns amber, the label changes, and the
  provider tile gains the amber stroke from `ProviderAvatarView.swift:120`.

## Claims discipline

These renders show the pre-alpha interface. Do not describe them as a signed
download, an official integration, complete Codex monitoring, or production
ready — none of those are true yet, and the README's own compatibility table is
the honest boundary.
