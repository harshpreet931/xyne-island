# Demoing Xyne Island live

Two minutes, one story, you control the pace. The notch does the next thing
when you press a key in the director; nothing fires on a timer.

## Preflight (do this at your seat, before you walk up)

1. **Connect the room display first, then launch the app.** The notch panel
   measures the screen once at launch. If you mirror the MacBook, it sits in
   the real notch; on an external-only screen it becomes a top-centre pill.
   Mirroring is the better demo: the audience sees it where you see it.
2. **Quit any other notch app.** They fight for the menu bar's top edge.
3. **Do Not Disturb on.** macOS notifications drop right onto the notch.
4. **Dark menu bar wallpaper.** The panel is black; on a bright wallpaper the
   corners read as a hole. Any dark desktop is fine.
5. **Reduce Motion off** (System Settings → Accessibility → Display), or the
   cast stands still.
6. Open a terminal in `sidecar/` and run:

   ```bash
   npm run demo
   ```

   It launches the app if needed, clears the notch, and prints the scene list.
   The director drives scripted cards, so it works with no Spaces session — but
   if you have one, quit the app first so the live bridge does not add real
   cards mid-story.
7. Keep Spaces open in a browser tab behind everything. "Open" on a card
   jumps there, and that jump is the moment people believe it.

## The run (press a key, say the line)

| Key | What appears | Say |
| --- | --- | --- |
| `1` | The notch wakes: "Standup in 4 min", Ring on the right | "Everything in Spaces that needs me, above my work. No window, no tab. Standup in four." |
| `2` | Amber. The panel opens itself on Priya's mention with Open / Done | "Priya mentions me. It turns amber and opens on its own. I can jump to the thread, or clear it, without leaving this screen." *(press Open in the notch: Spaces comes forward)* |
| `3` | Stub: a ticket assigned to you | "A ticket lands on me. Same two buttons. The stub is the ticket; you learn the cast in a minute." |
| `4` | Beam works, then the answer reveals for 8 seconds and settles | "I tagged the Architect on a PR. It works while I keep typing. When it answers, the notch shows me the answer for eight seconds and goes quiet." |
| `5` | Stub frowns; OVERDUE | "A critical ticket slips past its ETA. The face tells me before the pill does." |
| `6` | Doc finishes; the RCA reveals | "infra-doctor finishes an RCA in production-logs. I catch the summary without opening the channel." |
| `7` | Approve / Reject on a stage gate | "A stage gate needs an approver. I approve from here and it round-trips to Spaces." *(press Approve)* |
| `8` | Ring holds a missed call | "A missed call waits until I deal with it." |
| `r` | Quiet notch | "And when nothing needs me, it disappears." |

`n` or space fires the next scene in order if you would rather not remember
numbers. `a` plays the whole run with narration-sized pauses. `h` reprints the
list.

## Closing line

"Mentions, tickets, calls, agents, approvals. One glance, one click, and the
rest of the screen stays yours."

## If something goes wrong

- **Notch shows nothing:** the app is not running or another notch app owns the
  edge. `open "build/Xyne Island.app"`, then `r` in the director.
- **A card is stuck:** `r` clears every demo card.
- **The app crashed or the display changed:** quit it (menu bar x → Quit),
  relaunch, `r`. It comes back in about two seconds.
- **The room can't see the notch at all:** play [`assets/launch-film.mp4`](../assets/launch-film.mp4)
  full screen. It is the same story in 18 seconds.

## The live demo: someone messages you and it appears

This is the one that lands. It needs your Spaces session token once.

### Get access (one click)

Have the **Xyne Spaces desktop app** open. The sidecar asks it for access and
Spaces shows a native dialog: "Xyne Island wants access". Choose **Allow
(Session)** so it lasts the whole demo. No cookies, no browser profiles, no
copying tokens.

If you would rather pin a token, put one in `sidecar/.env` as `XYNE_TOKEN=…`
(`spaces token --env sidecar/.env` from the project root fills it from
Chrome's default profile). A pinned token wins over the dialog.

### Run it

```bash
cd ~/Desktop/xyne-island/sidecar
npm run live          # real Spaces, polling every 4 seconds
```

**Be on the VPN (GlobalProtect).** Off it, Spaces answers every request with a
bare 403 and the sidecar prints `poll failed: Forbidden`. Chrome may keep
working on an old connection, so the sidecar is the honest signal.

The first line it prints is who you are and your workspace. Then it prints a
one-line summary every poll: how many things need you, agents working, calls,
tickets due.

### Rehearse it with a teammate (do this the day before)

1. Ask them to **DM you** a sentence. Within 4 seconds Pip appears with their
   name and the text; the notch turns amber and opens itself. Press **Open**:
   Spaces comes forward on that DM and the card clears. That is the moment.
2. Ask them to **@mention you** in any channel. Same card, different subtitle:
   "Mentioned you".
3. Ask them to **assign you a ticket**. Stub appears with the ticket title.
4. If you can, have a **call scheduled** 10 minutes into the slot. Ring shows
   the countdown all through your talk and flips to "Starting now" on cue.
5. Tag the **Architect** on something small five minutes before you go up.
   Beam works during your intro and the answer reveals mid-demo.

Real cards and scripted ones share the notch, so you can run `npm run demo` in
a second terminal for the beats nobody can trigger live (overdue, approval).

### What it does and does not catch

Catches: DMs and group DMs, mentions, replies to you, group mentions,
tickets assigned to you, tickets due or overdue, calls in the next two hours or
live, missed calls, agents you tagged (and their answers), PR events on your
tickets as brief FYI cards.

Does not catch yet: reactions, email desks, canvas comments, stage approvals
waiting on you (the API lists them per stage, not per approver). Use the
scripted approval scene for that beat.
