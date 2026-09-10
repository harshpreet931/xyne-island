# Security policy

## Supported versions

| Version | Security fixes |
| --- | --- |
| The latest release, and `main` | Yes |
| Older releases | No |

## Reporting a vulnerability

Use the repository's **Security** tab and choose **Report a vulnerability**, so
the details stay private. Include the affected version or commit, reproduction
steps, the impact you expect, and any mitigation you have in mind.

If private reporting is unavailable, open a public issue containing **no exploit
detail** and ask a maintainer to open a private channel. Never publish
credentials, tokens, Spaces content, or a working exploit in an issue.

Maintainers aim to acknowledge within 3 business days, give an initial
assessment within 7, and coordinate disclosure once a fix exists. Those are
targets, not a paid support guarantee.

## Where the risk is

If you are looking for somewhere to start, these are the parts where a mistake
would matter most:

- **The token.** `sidecar/src/token.ts` and the file at
  `~/.config/xyne-island/env`. A Spaces token authenticates the user's whole
  identity. Anything that widens its permissions, copies it somewhere else, logs
  it, or puts it in a process argument is a finding.
- **The socket.** `Sources/XyneIslandCore/Transport/UnixSocket.swift`. It is
  `0600` and verifies the peer UID on every connection, with a size cap, a read
  timeout, and a connection bound. A way past any of those is a finding.
- **The protocol.** `IslandEvent` and `CardNormalizer`. Payloads arrive as JSON
  from another process; everything that reaches the screen is clamped, and only
  `http`/`https` links are ever handed to `NSWorkspace`. A way to get an
  arbitrary URL scheme opened, or unbounded text into memory, is a finding.
- **Process launch.** `SidecarController` resolves `node` from the login shell's
  `PATH`. A way to make it execute something else is a finding.
- **Packaging.** Signing, notarization, and what `scripts/package-app.sh` copies
  into the bundle.

## What is out of scope

- The `spaces` CLI's own reading of browser cookies. That is upstream behaviour;
  report it to the CLI.
- A local attacker who is already running as your user. The socket's UID check
  is a boundary between users, not against yourself.
- Anything requiring physical access to an unlocked machine.

See [PRIVACY.md](PRIVACY.md) for exactly what crosses which boundary.
