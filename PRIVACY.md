# Privacy

Xyne Island has no account system, no analytics, no telemetry, no advertising
SDK, no crash reporter, and no server of its own. The only network traffic it
creates is the Spaces API calls your own session already has the right to make,
to the host you are already signed in to.

## What talks to what

| Hop | What crosses it |
| --- | --- |
| Bridge → Xyne Spaces | HTTPS requests to your Spaces host, authenticated with your own token, through `@xyne/spaces-sdk`. Reads only: unread activities, missed calls, unread DM channels and their latest message, your recent messages and their agent replies, your tickets with an ETA, scheduled and active calls, and the workspace user directory. Writes only when you press a button: mark an activity read, mark a channel viewed. |
| Bridge → notch app | One JSON card per event over `/tmp/xyne-island-<uid>.sock`. Title, one line of activity, a scope label, a state, a Spaces URL, and — for a finished card — the text of the answer. |
| Notch app → bridge | One line: which card you answered and whether you chose Open or Dismiss. |
| Notch app → your browser | The Spaces URL of the card you pressed Open on, handed to `NSWorkspace`. |
| `spaces` CLI → your browser's cookie store | Reads your existing Spaces session cookie to mint a token. This is the CLI's own behaviour; Xyne Island invokes it and never touches the cookie store itself. |

Nothing else leaves the machine. There is no path in this source that sends
anything anywhere except your Spaces host.

## What is written to disk

Three things, all under your home directory:

| Path | Contents | Permissions |
| --- | --- | --- |
| `~/.config/xyne-island/env` | `XYNE_TOKEN` and `XYNE_BASE_URL`, written by the `spaces` CLI | `0600` file in a `0700` directory |
| `~/Library/Logs/Xyne Island/sidecar.log` | The bridge's own output: timestamps, card titles and activity lines, warnings, errors. Truncated past 2 MB | Default user permissions |
| `/tmp/xyne-island-<uid>.sock` | The socket itself; holds no data at rest | `0600`, peer UID verified on every connection |

**Message bodies do reach the log.** The bridge logs one line per card on its
first successful poll, and those lines contain the card's title and activity
text — which is Spaces content. If that matters for your threat model, delete
the log; nothing depends on it.

Card content is otherwise held only in memory. A revealed answer is clamped to
6,000 characters and is dropped when its card retires. No database, no cache, no
history, no transcript.

## What Xyne Island does not do

- It does not modify any other application's configuration.
- It does not read your files, your terminal, your clipboard, or your other apps.
- It does not persist Spaces content, prompts, or transcripts.
- It does not proxy, mirror, or copy your Spaces data anywhere.
- It does not phone home, check for updates, or report crashes.

Removing a card from the notch never deletes anything in Spaces. Pressing Done
marks the source activity read or the channel viewed — the same action the
Spaces UI would take — and nothing more.

## Uninstalling

```bash
rm -rf "/Applications/Xyne Island.app"
rm -rf ~/.config/xyne-island "$HOME/Library/Logs/Xyne Island"
```

That is everything. Your Spaces data is untouched; revoke the session in Spaces
itself if you also want the token invalidated server-side.

## Changing any of this

A contribution that adds persistence, networking, analytics, or a new thing on
disk must update this document in the same pull request and add a test around
the new boundary. See [CONTRIBUTING.md](CONTRIBUTING.md).
