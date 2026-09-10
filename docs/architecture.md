# Architecture

Xyne Island is two processes and one socket.

```
                    ┌──────────────────────────────────────────────┐
   Xyne Spaces      │  bridge — sidecar/src, Node 22.6+            │
   (HTTPS, the      │                                              │
    user's own      │   token.ts    keeps a Spaces token valid     │
    session)  ◀────▶│   spaces.ts   reads the slices we care about │
                    │   cards.ts    decides what each thing means  │
                    │   main.ts     diffs, and sends the change    │
                    │   island.ts   the socket client              │
                    └───────────────────┬──────────────────────────┘
                                        │  one JSON event per connection
                          /tmp/xyne-island-<uid>.sock  (0600, peer UID checked)
                                        │
                    ┌───────────────────▼──────────────────────────┐
                    │  notch app — Sources/, SwiftUI + AppKit      │
                    │                                              │
                    │   UnixSocketServer   accepts events          │
                    │   CardNormalizer     clamps them             │
                    │   IslandStore        what is on screen       │
                    │   NotchRootView      draws it                │
                    │   SidecarController  owns the bridge's life  │
                    └──────────────────────────────────────────────┘
```

The split is deliberate. Spaces has a first-party TypeScript SDK and a
first-party CLI that can turn a browser session into a token; reimplementing
either in Swift would mean maintaining a second, worse copy of somebody else's
API. The app owns the screen, the bridge owns the network, and the socket
between them is small enough to read in one sitting.

## Who starts whom

The app starts the bridge. A downloaded app cannot ask someone to keep a
terminal open, so `SidecarController` finds `node`, spawns
`Contents/Resources/sidecar/src/main.ts`, restarts it on a doubling backoff if
it exits, and terminates it on quit. Its output goes to
`~/Library/Logs/Xyne Island/sidecar.log`, capped at 2 MB.

Two exit codes mean something:

| Code | Meaning | What the app does |
| --- | --- | --- |
| `78` | No Spaces session; a person has to sign in | Stops restarting, shows "Sign in to Spaces" |
| anything else | Crash, network death, a bug | Restarts with backoff |

Finding `node` is a real problem worth naming: an app launched from Finder
inherits `/usr/bin:/bin:/usr/sbin:/sbin`, which contains neither `node` nor
`spaces` on a normal developer Mac. `LoginEnvironment` asks the user's login
shell for its `PATH` once and caches it, which is what makes an nvm or Homebrew
install visible to a double-clicked app.

## Credentials

`sidecar/src/token.ts` is the whole story.

- **Where.** `~/.config/xyne-island/env`, `0600`, in a `0700` directory. Outside
  any checkout on purpose: the CLI refuses to write a credential into a
  git-tracked file, and a token for the user's whole identity should never be
  one `git add -A` away from a commit.
- **Getting one.** `spaces token --env <file>`. The CLI reads the session from
  the browser the user is already signed in to. It is a no-op when the stored
  token is still good, so calling it is cheap.
- **Keeping it.** The bridge decodes the JWT's `exp` itself and refreshes five
  minutes early, before every poll. No timer, so a laptop that slept through the
  expiry refreshes on its next poll rather than at a moment that has already
  passed.
- **When Spaces rejects one anyway.** `isAuthFailure` recognises the SDK's
  `AuthError` (401/403); the bridge runs `spaces token --update`, rebuilds the
  client, and retries. Forced refreshes are rate-limited to one a minute, so a
  server-side problem that merely *looks* like an auth failure cannot spawn
  browser prompts in a loop.
- **Interactive versus not.** A background refresh sets `XYNE_NO_OPEN=1` so the
  CLI does not throw a browser tab at someone mid-sentence. **Refresh Spaces
  Token** in the menu bar leaves it unset, because taking you to the sign-in
  page is exactly what you just asked for.

`XYNE_TOKEN` in the environment overrides all of this and is never refreshed —
the escape hatch for CI and for pointing at another deployment.

## The wire protocol

One JSON object per connection, newline-terminated. Defined in
`Sources/XyneIslandCore/Transport/IslandEvent.swift` and mirrored in
`sidecar/src/island.ts`; the two must change together.

```jsonc
{
  "v": 1,
  "id": "b2c3…",              // names this event, so an answer can refer to it
  "kind": "card",             // card | retire | status
  "card": {
    "id": "activity:42",      // stable across updates; (cast, id) is the identity
    "cast": "mention",        // mention | ticket | call | architect | askai | bot | xyne
    "title": "Priya Raman · #xyne-spaces",
    "activity": "POT for #1653?",
    "context": "/pending",
    "state": "needsYou",      // working | needsYou | approval | done | overdue | fyi
    "link": "https://spaces.xyne.juspay.net/chat/dir/…",
    "detail": "…",            // the body a finished card reveals
    "prompt": { "kind": "question", "title": "Mentioned you · 4:12 pm", "detail": "…" }
  },
  "expectsAnswer": true,      // the bridge is holding this connection open
  "sentAt": "2026-09-10T07:45:53Z"
}
```

The bridge sends a **finished card**, not a stream of events to be interpreted.
Deciding what a thing means happens once, in `cards.ts`, where the Spaces
vocabulary still exists. The app draws what it is told. There is no second
interpretation layer to disagree with the first.

`kind: "status"` carries `{ state, message }` so an empty island can explain
itself — "Sign in to Spaces" is a different silence from "nothing needs you".

### Answers

When `expectsAnswer` is set, the app holds the connection until someone presses
a button, then writes one line back:

```json
{ "v": 1, "eventID": "b2c3…", "choice": "open" }
```

`open` means the app already opened the Spaces link and the bridge should mark
the thing handled in Spaces. `dismiss` means mark it handled without leaving.
The app opens the link rather than the bridge, so the jump is instant instead of
waiting on a round trip.

### Compatibility

`v` is the protocol version. `CardNormalizer` drops any event with a higher `v`
than it knows, so a newer bridge paired with an older app shows nothing rather
than misreading fields. Both halves ship in the same bundle, so this only
matters while a stale bridge from a previous install is still running.

## The socket

`/tmp/xyne-island-<uid>.sock`, one per user.

- Created `0600`, and `chmod`ed again after bind.
- Every accepted connection is checked with `getpeereid`; a different UID is
  closed without being read.
- An initial message is capped at 1 MiB and a stalled read times out after five
  seconds, so a wedged writer cannot hold a worker.
- Concurrent readers are bounded by a semaphore.

The app is the server. If it is not running there is nothing to connect to, and
the bridge waits rather than buffering. A bridge the app spawned exits after a
minute without the app, so the next launch gets a fresh one instead of two.

## What the app keeps

`IslandStore` holds the cards currently on screen and nothing else. No database,
no cache on disk, no history.

- A card is identified by `(cast, id)`. An update replaces it in place and keeps
  its `startedAt`, so the elapsed timer does not restart.
- A revealed body — an agent's answer — is held in memory, clamped to 6,000
  characters, and dies with its card.
- `done`, `overdue`, and `fyi` retire after 30 seconds. `working`, `needsYou`,
  and `approval` stay until the bridge retires them, because a timer must never
  make something that needs you disappear.
- Answering a prompt moves the card to `working` for four seconds so the
  interaction visibly lands, then it goes; the bridge's `retire` normally
  arrives first.

## What the bridge reads

`spaces.ts` builds one snapshot per poll:

| Reader | Becomes |
| --- | --- |
| Unread activities, missed calls | Pip, Stub, Ring — mentions, replies, assignments, misses |
| Unread DM and group-DM channels | Pip |
| Your recent messages that `@` an app user, and their replies | Beam, Sage, Doc |
| Your tickets with an ETA inside the window | Stub, `working` or `overdue` |
| Scheduled and active calls | Ring |
| The workspace directory | Names, and which actors are agents |

`cards.ts` then applies the judgement: which activity kinds actually need you
(mentions, replies, assignments, missed calls), which are only worth knowing
(status changes, merged PRs, scheduled calls — and only for twenty minutes),
and which cast member carries each one.

## Failure behaviour

Every layer degrades to the layer below rather than taking it down.

- One failing Spaces endpoint costs one kind of card. Each reader is wrapped in
  `safe()`, which records a warning and returns a fallback.
- A failing poll leaves the last cards on screen and reports `degraded`.
- A missing token reports `signedOut` and stops retrying, because retrying
  cannot fix it.
- A missing app leaves the bridge polling nothing; a missing bridge leaves the
  notch quiet and the menu bar honest about why.

## Testing

`swift test` covers the parts where being wrong is expensive: the normalizer's
clamping and link filtering, protocol version rejection, store identity and
retirement rules, the socket's size limits, and the held-open answer round trip.
`npx tsc --noEmit` in `sidecar/` typechecks the bridge against the real SDK
types. `npm run scenes` exercises every card state against a running app without
a Spaces session.
