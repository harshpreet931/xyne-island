# Installing Xyne Island

macOS 14 or later, Apple silicon or Intel.

## 1. Install the two things Xyne Island uses

Xyne Island talks to Spaces through the official SDK and gets its token from the
official CLI rather than reimplementing either. Both run on Node.

```bash
# Node 22.6 or newer
node --version
# If that fails or prints something older:
#   brew install node        (or use nvm, or nodejs.org)

# The Spaces CLI
npm install -g @xyne/spaces-cli
spaces token --status
```

`spaces token --status` prints the state of the stored token without touching
your browser. Before you have one it says so; that is the expected answer here.

## 2. Install the app

Download `XyneIsland-<version>.dmg` from the
[latest release](../../../releases/latest), open it, and drag **Xyne Island** to
Applications.

Signed and notarized builds open with no warning. If the release notes say the
build is **not** notarized, verify the checksum published with it before you
open it:

```bash
shasum -a 256 ~/Downloads/XyneIsland-<version>.dmg
```

## 3. Open it

Xyne Island has no window. It lives in the notch and in the menu bar.

On first launch it starts its bridge, which runs `spaces token` to read your
Spaces session out of the browser you are already signed in to. Within a few
seconds the notch shows what needs you.

The menu bar icon carries the state and everything you might need:

| Menu item | What it does |
| --- | --- |
| *(top line)* | Connected / Connecting / Signed out / Reconnecting, and why |
| Open Xyne Island | Expands the notch |
| Open Spaces | Opens the Spaces dashboard |
| Refresh Spaces Token | Runs `spaces token --update` and restarts the bridge |
| Restart Bridge | Restarts the bridge without touching the token |
| Open Bridge Log | Opens `~/Library/Logs/Xyne Island/sidecar.log` |
| Show Example Day | Plays a scripted day, so you can see it with no session |

## When it does not connect

The notch tells you which of these you are in; the bridge log has the detail.

**"Sign in to Spaces."** The CLI could not find a signed-in session. Open
Spaces in your browser, sign in, then choose **Refresh Spaces Token**. The CLI
reads Chrome's cookie jar, so the session has to be in a browser it can see.

**"The Spaces CLI is not installed."** Run `npm install -g @xyne/spaces-cli`,
then **Refresh Spaces Token**.

**"Node 22.6+ not found."** Xyne Island looks for `node` on the PATH your login
shell reports, which is how it finds an nvm or Homebrew install that a
double-clicked app would otherwise miss. If `node --version` works in your
terminal but the app disagrees, the install is in a shell rc file that a login
shell does not read — move it to `~/.zprofile` and reopen the app.

**"Reconnecting."** The bridge stopped and is restarting on a backoff. This is
usually a network blip. `Open Bridge Log` shows what it hit.

## Where things live

| | |
| --- | --- |
| The app | `/Applications/Xyne Island.app` |
| Your token | `~/.config/xyne-island/env` (`0600`, in a `0700` directory) |
| The bridge log | `~/Library/Logs/Xyne Island/sidecar.log` |
| The socket | `/tmp/xyne-island-<uid>.sock` (`0600`, peer UID checked) |

## Uninstalling

```bash
rm -rf "/Applications/Xyne Island.app"
rm -rf ~/.config/xyne-island "$HOME/Library/Logs/Xyne Island"
```

Nothing else is written. Xyne Island keeps no database, edits no other
application's configuration, and leaves your Spaces data untouched.
