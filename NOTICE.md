# Notices and provenance

Xyne Island is a macOS companion for Xyne Spaces. Source code, vector artwork,
characters, motion, and copy in this repository were created for Xyne Island and
are distributed under the repository's MIT license, unless an entry below says
otherwise.

## Third-party material

| Component | Where | License | Why it is here |
| --- | --- | --- | --- |
| `@xyne/spaces-sdk` 0.1.0 | `sidecar/vendor/xyne-spaces-sdk` | MIT | The official TypeScript SDK for the Spaces API. Vendored because it is not published to a public registry, so a fresh clone could not otherwise build or run the bridge. The copy is the package's prebuilt `dist/` with its `scripts` and `devDependencies` removed — the upstream `prepare` script deletes `dist/`, which would break an install that depends on it. |

`@xyne/spaces-cli` is a runtime prerequisite, not a bundled dependency: users
install it themselves with `npm install -g @xyne/spaces-cli`, and Xyne Island
invokes the `spaces` command it provides.

No other third-party runtime packages, fonts, sounds, or visual assets are
included.

## Trademarks

Xyne and Xyne Spaces are names of their respective owner. macOS, Finder, and
Gatekeeper are product names of Apple Inc. Node.js is a trademark of the OpenJS
Foundation. These names are used only to identify compatibility.

## The cast

Pip, Stub, Ring, Beam, Sage, and Doc are original characters drawn in code
(`Sources/XyneIslandApp/UI/CastAvatarView.swift`). They are not derived from,
and must not be replaced by, any third party's logo or artwork. See
[docs/brand.md](docs/brand.md).
