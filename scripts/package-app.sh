#!/bin/zsh
#
# Builds "Xyne Island.app" from source.
#
# The bundle carries both halves of the product: the notch app, and the Node
# bridge it runs to talk to Spaces. A downloaded copy therefore needs nothing
# from this repository, only Node and the `spaces` CLI on the user's machine.
#
# Environment:
#   XYNE_ISLAND_SIGNING_IDENTITY  Developer ID identity. Unset means an ad-hoc
#                                 local build, which must not be published.
#   XYNE_ISLAND_UNIVERSAL=1       Build arm64 + x86_64 and verify both slices.
#   XYNE_ISLAND_VERSION           Stamps CFBundleShortVersionString.
#   XYNE_ISLAND_BUILD             Stamps CFBundleVersion.

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
PROJECT_DIR="${SCRIPT_DIR:h}"
APP_PATH="$PROJECT_DIR/build/Xyne Island.app"
ICON_SOURCE="$PROJECT_DIR/assets/app-icon.svg"
ICON_RENDER_DIR="$PROJECT_DIR/build/icon-render"
ICONSET_PATH="$PROJECT_DIR/build/XyneIsland.iconset"

SIGNING_IDENTITY="${XYNE_ISLAND_SIGNING_IDENTITY:--}"
# Local builds stay single-arch for speed; release packaging sets this so Intel
# Macs get a working download too.
UNIVERSAL="${XYNE_ISLAND_UNIVERSAL:-0}"

cd "$PROJECT_DIR"
plutil -lint "$PROJECT_DIR/Resources/Info.plist" >/dev/null
xmllint --noout "$ICON_SOURCE"

BUILD_ARGS=(-c release)
if [[ "$UNIVERSAL" == "1" ]]; then
  BUILD_ARGS+=(--arch arm64 --arch x86_64)
fi

swift build "${BUILD_ARGS[@]}"
BIN_PATH="$(swift build "${BUILD_ARGS[@]}" --show-bin-path)"

rm -rf "$APP_PATH" "$ICON_RENDER_DIR" "$ICONSET_PATH"
mkdir -p "$APP_PATH/Contents/MacOS" "$APP_PATH/Contents/Resources"
cp "$PROJECT_DIR/Resources/Info.plist" "$APP_PATH/Contents/Info.plist"

if [[ -n "${XYNE_ISLAND_VERSION:-}" ]]; then
  plutil -replace CFBundleShortVersionString -string "$XYNE_ISLAND_VERSION" "$APP_PATH/Contents/Info.plist"
fi
if [[ -n "${XYNE_ISLAND_BUILD:-}" ]]; then
  plutil -replace CFBundleVersion -string "$XYNE_ISLAND_BUILD" "$APP_PATH/Contents/Info.plist"
fi

cp "$BIN_PATH/XyneIsland" "$APP_PATH/Contents/MacOS/XyneIsland"
chmod 755 "$APP_PATH/Contents/MacOS/XyneIsland"

# The bridge, as sources plus its vendored SDK. Node strips the TypeScript at
# run time, so the release path needs no build step and no bundler.
SIDECAR_DEST="$APP_PATH/Contents/Resources/sidecar"
mkdir -p "$SIDECAR_DEST/node_modules/@xyne"
cp -R "$PROJECT_DIR/sidecar/src" "$SIDECAR_DEST/src"
cp "$PROJECT_DIR/sidecar/package.json" "$SIDECAR_DEST/package.json"
# A real directory rather than the symlink npm would create: symlinks inside a
# bundle trip up codesigning and notarization.
cp -R "$PROJECT_DIR/sidecar/vendor/xyne-spaces-sdk" "$SIDECAR_DEST/node_modules/@xyne/spaces-sdk"
test -f "$SIDECAR_DEST/node_modules/@xyne/spaces-sdk/dist/index.js" \
  || { echo "Vendored SDK is missing its dist/. Restore sidecar/vendor/xyne-spaces-sdk." >&2; exit 1; }
test -f "$SIDECAR_DEST/src/main.ts" || { echo "Bridge sources did not copy." >&2; exit 1; }

mkdir -p "$ICON_RENDER_DIR" "$ICONSET_PATH"
qlmanage -t -s 1024 -o "$ICON_RENDER_DIR" "$ICON_SOURCE" >/dev/null 2>&1
ICON_RENDER="$ICON_RENDER_DIR/app-icon.svg.png"
sips -z 16 16 "$ICON_RENDER" --out "$ICONSET_PATH/icon_16x16.png" >/dev/null
sips -z 32 32 "$ICON_RENDER" --out "$ICONSET_PATH/icon_16x16@2x.png" >/dev/null
sips -z 32 32 "$ICON_RENDER" --out "$ICONSET_PATH/icon_32x32.png" >/dev/null
sips -z 64 64 "$ICON_RENDER" --out "$ICONSET_PATH/icon_32x32@2x.png" >/dev/null
sips -z 128 128 "$ICON_RENDER" --out "$ICONSET_PATH/icon_128x128.png" >/dev/null
sips -z 256 256 "$ICON_RENDER" --out "$ICONSET_PATH/icon_128x128@2x.png" >/dev/null
sips -z 256 256 "$ICON_RENDER" --out "$ICONSET_PATH/icon_256x256.png" >/dev/null
sips -z 512 512 "$ICON_RENDER" --out "$ICONSET_PATH/icon_256x256@2x.png" >/dev/null
sips -z 512 512 "$ICON_RENDER" --out "$ICONSET_PATH/icon_512x512.png" >/dev/null
cp "$ICON_RENDER" "$ICONSET_PATH/icon_512x512@2x.png"
iconutil -c icns "$ICONSET_PATH" -o "$APP_PATH/Contents/Resources/XyneIsland.icns"

if [[ "$SIGNING_IDENTITY" == "-" ]]; then
  /usr/bin/codesign --force --sign - "$APP_PATH"
  echo "Created an ad-hoc signed local build. Do not publish it as a downloadable release."
else
  # No entitlements: the app is unsandboxed, touches only the invoking user's
  # own files, and reaches other apps through NSWorkspace rather than Apple
  # Events, so the reviewed set is empty.
  /usr/bin/codesign --force --options runtime --timestamp --sign "$SIGNING_IDENTITY" "$APP_PATH"
fi

if [[ "$UNIVERSAL" == "1" ]]; then
  archs="$(lipo -archs "$APP_PATH/Contents/MacOS/XyneIsland")"
  if [[ "$archs" != *arm64* || "$archs" != *x86_64* ]]; then
    echo "Expected a universal binary, got '$archs'" >&2
    exit 1
  fi
  echo "Universal binary verified (arm64 + x86_64)."
fi

echo "Packaged $APP_PATH"
