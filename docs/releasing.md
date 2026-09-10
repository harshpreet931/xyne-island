# Releasing

A release is a signed, notarized, universal `.dmg` attached to a GitHub release,
with published checksums.

## Cutting one

```bash
# 1. Version the bundle and the changelog together.
plutil -replace CFBundleShortVersionString -string 0.2.0 Resources/Info.plist
$EDITOR CHANGELOG.md

# 2. Prove it builds and passes.
swift test -Xswiftc -warnings-as-errors
swift build -c release -Xswiftc -warnings-as-errors
(cd sidecar && npm ci && npx tsc --noEmit)
./scripts/package-app.sh

# 3. Tag it.
git commit -am "Release 0.2.0"
git tag v0.2.0 && git push origin main v0.2.0
```

The tag triggers [`.github/workflows/release.yml`](../.github/workflows/release.yml),
which on a `macos-15` runner:

1. Fails immediately if the tag disagrees with `CFBundleShortVersionString`.
2. Runs the Swift tests and the bridge typecheck with warnings as errors.
3. Builds a universal binary (`arm64` + `x86_64`) and verifies both slices.
4. Verifies the bundle actually contains the bridge and its vendored SDK — a
   download missing those is an app that can never connect.
5. Signs with Developer ID and Hardened Runtime, then asserts the signature
   really is a Developer ID one and the runtime flag is set.
6. Notarizes and staples the app, so first launch works offline.
7. Builds, signs, notarizes, and staples the disk image.
8. Runs `spctl --assess --type execute` — the same decision a downloader's Mac
   makes.
9. Publishes SHA-256 checksums and creates a **draft** release.

Then do the last gate by hand, because it is the one CI cannot do: install from
the draft's `.dmg` on a machine that has never built this project, follow
[docs/install.md](install.md) exactly as a stranger would, confirm the bridge
connects and a card answers, and uninstall. Then publish the draft.

`workflow_dispatch` runs everything except release creation, which is how to
exercise the pipeline without spending a tag.

## Signed versus ad-hoc

The workflow picks its mode from whether the signing secrets exist.

**Signed and notarized** is the goal: Gatekeeper opens the download with no
warning and no workaround.

**Ad-hoc** is what happens without the secrets: the same universal build and the
same checksums, but no Developer ID signature and no notarization. macOS
quarantines the download, so the release notes tell the user to clear the
quarantine flag, and the release is marked a prerelease no matter what the tag
says. Two things about that mode are load-bearing:

- **The checksum is the only integrity story.** With no signature,
  `SHA256SUMS.txt` is the sole evidence that a download matches what CI built.
  It is published on every release and referenced from the notes; do not drop it.
- **The instruction is scoped on purpose.** The notes say
  `xattr -d com.apple.quarantine`, never `xattr -cr`. The former removes one
  attribute from one app; the latter recursively strips every extended attribute,
  which is a broader habit to teach than this problem needs.

Adding the secrets below is the only change needed to switch modes. Nothing in
the workflow or the scripts needs editing.

## Entitlements

The reviewed entitlement set is **empty**. Xyne Island is unsandboxed, touches
only the invoking user's own files, and reaches other apps through `NSWorkspace`
rather than Apple Events, so it needs no entitlement — including no
`com.apple.security.automation.apple-events`. Adding one later means re-reviewing
this line.

The bundle does spawn a child process (`node`). Under Hardened Runtime that is
allowed without an entitlement because the child is a separate, independently
signed binary being executed, not a library being loaded into this process. If a
future change ever loads unsigned code *into* the app, that needs
`com.apple.security.cs.disable-library-validation` and a fresh review.

## Signing secrets

All six are repository secrets. Never commit any of them; `gitleaks` runs in CI,
but it is the last line, not the first.

| Secret | How to produce it |
| --- | --- |
| `MACOS_CERTIFICATE_P12` | In Keychain Access, export the **Developer ID Application** certificate *and its private key* as `.p12`, then `base64 -i cert.p12 \| pbcopy` |
| `MACOS_CERTIFICATE_PASSWORD` | The password chosen during that export |
| `MACOS_SIGNING_IDENTITY` | Exact string from `security find-identity -v -p codesigning`, e.g. `Developer ID Application: Your Name (TEAMID)` |
| `APPLE_API_KEY_P8` | App Store Connect → Users and Access → Integrations → Keys. Create a key with **Developer ID** access, then `base64 -i AuthKey_XXX.p8 \| pbcopy`. The file downloads exactly once |
| `APPLE_API_KEY_ID` | The key ID shown beside that key |
| `APPLE_API_ISSUER_ID` | The issuer UUID on the same page |

An App Store Connect API key is used rather than an Apple ID and app-specific
password because it is scoped, revocable without touching the account password,
and does not carry the account's other privileges.

Prerequisite: an Apple Developer Program membership. There is no way to notarize
without one, and without notarization macOS refuses a downloaded build.

Because these are repository secrets they are unavailable to pull requests from
forks, which is what keeps signing material out of fork CI.

## Local packaging

`scripts/package-app.sh`:

| Variable | Effect |
| --- | --- |
| `XYNE_ISLAND_SIGNING_IDENTITY` | Signs with Developer ID and Hardened Runtime. Omitting it deliberately produces only an ad-hoc local build |
| `XYNE_ISLAND_UNIVERSAL` | `1` builds `arm64` + `x86_64` and verifies both slices. Off by default so local builds stay fast |
| `XYNE_ISLAND_VERSION` | Stamps `CFBundleShortVersionString` |
| `XYNE_ISLAND_BUILD` | Stamps `CFBundleVersion` |

`scripts/make-dmg.sh` turns `build/Xyne Island.app` into
`build/XyneIsland-<version>.dmg` and signs the image when an identity is set.
Neither script notarizes; that needs credentials and is the workflow's job.

Do not distribute the output of the default local command. It is ad-hoc signed
for local testing only.

## The vendored SDK

`sidecar/vendor/xyne-spaces-sdk` is committed because `@xyne/spaces-sdk` is not
on a public registry: without it in the tree, a fresh clone cannot run the
bridge and a release cannot be built. Its `scripts` block is stripped on
purpose — the upstream `prepare` script runs `rm -rf dist`, which would delete
the prebuilt output an install is supposed to be using.

To update it, drop in a new copy of the package's `dist/`, remove `scripts` and
`devDependencies` from its `package.json`, and note the version bump in
`CHANGELOG.md` and [NOTICE.md](../NOTICE.md).
