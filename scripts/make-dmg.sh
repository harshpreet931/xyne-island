#!/bin/zsh

# Builds a distributable disk image from an already-signed "build/Xyne Island.app".
#
# Run scripts/package-app.sh first. Signing and notarization are the caller's
# job: this script only signs the image itself when an identity is supplied,
# because an unsigned image is still useful for local verification.

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
PROJECT_DIR="${SCRIPT_DIR:h}"
APP_PATH="$PROJECT_DIR/build/Xyne Island.app"
STAGING_DIR="$PROJECT_DIR/build/dmg-staging"
SIGNING_IDENTITY="${XYNE_ISLAND_SIGNING_IDENTITY:--}"

if [[ ! -d "$APP_PATH" ]]; then
  echo "Missing $APP_PATH. Run scripts/package-app.sh first." >&2
  exit 1
fi

VERSION="${XYNE_ISLAND_VERSION:-$(plutil -extract CFBundleShortVersionString raw "$APP_PATH/Contents/Info.plist")}"
DMG_PATH="$PROJECT_DIR/build/XyneIsland-$VERSION.dmg"

rm -rf "$STAGING_DIR" "$DMG_PATH"
mkdir -p "$STAGING_DIR"

# ditto preserves the signature and extended attributes; cp -R does not.
ditto "$APP_PATH" "$STAGING_DIR/Xyne Island.app"
ln -s /Applications "$STAGING_DIR/Applications"

# HFS+ rather than the APFS default: the image stays mountable on every macOS
# version the app itself supports.
hdiutil create \
  -volname "Xyne Island" \
  -srcfolder "$STAGING_DIR" \
  -fs HFS+ \
  -format UDZO \
  -imagekey zlib-level=9 \
  -ov \
  -quiet \
  "$DMG_PATH"

rm -rf "$STAGING_DIR"

if [[ "$SIGNING_IDENTITY" != "-" ]]; then
  /usr/bin/codesign --force --timestamp --sign "$SIGNING_IDENTITY" "$DMG_PATH"
  /usr/bin/codesign --verify --strict --verbose=2 "$DMG_PATH"
else
  echo "Built an unsigned disk image. Do not publish it as a download."
fi

echo "Created $DMG_PATH"
