# Brand

## Thesis

Xyne Island gives the things that need you presence without giving them more
screen space.

Spaces is where the work happens, but the thing that needs you is always one tab
away from being missed. Xyne Island turns that into a small cast in the notch:
alive enough to notice, quiet enough to forget when nothing needs you.

One tension holds the whole system:

> **Warm characters. Serious infrastructure.**

If it becomes sterile, the cast stops being memorable. If it becomes toy-like,
people stop trusting it with an approval. Every visual and verbal choice holds
both sides.

## Message architecture

| Role | Approved line |
| --- | --- |
| Product descriptor | **Everything from Spaces that needs you, in the notch.** |
| Emotional line | **Your Spaces, with a pulse.** |
| Functional promise | **See what needs you. Answer it. Get back to work.** |
| Category | A native macOS companion for Xyne Spaces |

The descriptor explains the product. The emotional line supplies character. The
functional promise proves the warmth has a job.

## Name and language

- Product name in prose: **Xyne Island**
- Wordmark: **XYNE ISLAND**
- The characters collectively: **the cast**
- One character: its proper name — Pip, Stub, Ring, Beam, Sage, Doc
- Never "XI", "Xyne-Island", or "the Island app"

Say "the cast" when talking about the characters as a group. Say "a card" when
talking about one thing on screen — a card is the unit of the product; the
character is how you recognise it at a glance.

## Voice

Xyne Island sounds observant, warm, and precise. It never begs for attention.

**Write like this**

- "All quiet up here."
- "Priya mentioned you."
- "2 needs you."
- "Overdue by 40 min."
- "Sign in to Spaces."

**Not like this**

- "Your workspace is supercharged."
- "Never miss a beat with AI-powered awareness."
- "Oops! Something magical went wrong."
- "Your adorable little buddy misses you."

Plain verbs, sentence case, short clauses. Keep technical caveats exact.
Personality belongs in the nouns and the rhythm, not in jokes that obscure what
happened.

State labels are the one uppercase exception, because they are read at a glance
rather than read as prose: `LIVE`, `NEEDS YOU`, `APPROVAL`, `DONE`, `OVERDUE`,
`FYI`.

## Identity

### The mark

The permanent mark is the island — a soft black capsule, the shape of the notch
itself — carrying the Xyne cross on warm paper.

- The capsule is the island.
- The cross is Xyne.
- Amber is the pulse.

The mark never contains a fixed number of characters, so it stays right as the
cast grows. Use [`assets/app-icon.svg`](../assets/app-icon.svg) for the app icon
and the same flat construction in product UI (`IslandMark` in
`Sources/XyneIslandApp/UI/BrandIdentity.swift`).

Do not add eyes, a face, letters, or extra dots to the mark. The characters carry
personality; the mark carries continuity.

### Wordmark

Set `XYNE ISLAND` in a sturdy system monospace with generous tracking:

```text
SF Mono, SFMono-Regular, Menlo, monospace
```

Uppercase only. Body copy uses the platform sans-serif stack so the product still
feels native to macOS.

## Colour

Colour is identity and state, not atmosphere. Flat fills only — no gradients, no
neon glows, no coloured page backgrounds.

| Token | Hex | Role |
| --- | --- | --- |
| Island ink | `#0E0F11` | Notch, mark, dark surfaces, facial details |
| Island paper | `#F2EDDE` | Mark tile, primary type, light controls |
| Coral | `#FF4F4F` | Pip — mentions |
| Saffron | `#FAB040` | Stub — tickets |
| Call green | `#45D98F` | Ring — calls |
| Blueprint | `#5C9EFF` | Beam — the Architect |
| Violet | `#A88FFF` | Sage — Ask AI |
| Teal | `#2ECCB3` | Doc — every other agent |
| Signal green | `#6EE89C` | Live work only |
| Signal amber | `#FFB847` | What needs you, and the pulse |

Large surfaces stay black, paper, or transparent. Character colours appear on
characters, tiny dots, and that character's own card tint. Never recolour the
whole notch for one card.

Source of truth: `Color` extension in
`Sources/XyneIslandApp/UI/Components.swift`, mirrored for the films in
`marketing/video/src/brand.ts`.

## The cast

Each character has an original silhouette, one signature movement, a
state-readable face, and an accessibility label. They share one face grammar so
a new character is recognisable as family on the day it ships.

| Name | Carries | Silhouette | Signature movement |
| --- | --- | --- | --- |
| **Pip** | Mentions, replies, DMs | Coral speech bubble | A quick tail-flick when it needs you |
| **Stub** | Tickets | Saffron ticket stub with a torn perforation | Barely moves; shivers when overdue |
| **Ring** | Calls | Green handset | Rings — a fast rock when live or starting |
| **Beam** | The Spaces Architect | Blueprint square with a rising line | A slow, measured lift while working |
| **Sage** | Ask AI | Violet orb with an orbiting spark | The spark circles faster while working |
| **Doc** | Every other Spaces agent | Teal shield with a cross | A steady, unhurried nod |

### Adding one

A new character needs all four: an original silhouette that reads at 17 px, one
signature movement distinct from the six above, a face that changes with state,
and an accessibility label. It also needs a colour that survives beside the
existing six on a black surface.

Never use a third party's logo as a character. The cast is drawn in code
(`CastAvatarView.swift`), which is what keeps it consistent, themeable, and
animatable at every size.

## Motion

Motion communicates state; it is never decoration.

- **Quiet is the default.** An idle island barely moves. The ambient sway is
  under two degrees, and each character sways on its own phase so a row never
  reads as one rigid strip.
- **Attention is faster, not louder.** What needs you moves at a higher rate and
  bobs further. It does not flash, bounce, or grow.
- **Finished settles.** `done` and `overdue` stop moving entirely. Stillness is
  how you know something is over.
- **Reduce Motion is honoured everywhere.** Every animation has a static form,
  and the static form must still be readable — the face and the pill carry the
  state when the movement is gone.

## Films

`assets/` holds the rendered films; `marketing/video/` holds their Remotion
sources, with tokens and motion math ported from the Swift so the films and the
product cannot drift.

| File | Use |
| --- | --- |
| [`assets/hero-loop.gif`](../assets/hero-loop.gif) | README banner, link cards |
| [`assets/launch-film.mp4`](../assets/launch-film.mp4) | Launch post, social |
| [`assets/tour-film.mp4`](../assets/tour-film.mp4) | The full walkthrough, with sound |
| [`assets/tour-film-silent.mp4`](../assets/tour-film-silent.mp4) | The same tour where sound would be rude |
| [`assets/social-preview.png`](../assets/social-preview.png) | The repository's social preview (1280×640) and link cards |

The social preview is rendered from [`marketing/social-preview.html`](../marketing/social-preview.html)
at 2× and downsampled, so it can be regenerated when the brand moves:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --force-device-scale-factor=2 --window-size=1280,640 \
  --screenshot=og.png marketing/social-preview.html
```

GitHub has no API for setting it — upload it under **Settings → General → Social preview**.

These are interface recreations built from the real geometry, not screen
captures. Describe them as such, and prefer real footage the moment there is
some.
