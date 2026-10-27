# QA — V11 Mobile

Headless Chromium with touch + mobile emulation (deviceScaleFactor 2.5):
390×844 (primary), 360×640 (9:16), 1440×900 desktop browser.

Verified: deal from deck, tap-select (touchscreen tap), play → play-zone scoring → orb to Run Score,
tier celebration (A-K-Q-J-10 straight = 181 → 0.5×), discard + refill, three plays → result modal,
How to Play and Settings modals. No page errors.
Screenshots: `assets/reference/mobile_*.jpg`.

## Fix: game could freeze mid-play (busy lock never released) — 2026-10-27
Root cause: the particle loop (js/fx.js) rescheduled itself only at the end of each frame, so a single
exception (e.g. drawing a sprite image that failed to load) stopped it for good. The score "orb" that carries
points to Run Score only finishes inside that loop, so playHand() waited forever with the busy lock held:
cards could no longer be selected and Play/Discard stayed disabled.
Fixes: fx/cards loops reschedule first and catch errors; sprites are drawn only when loaded; orb and count-up
animations have timer fallbacks; every action runs under one lock released in `finally` (plus table re-sync);
20 s watchdog; result screen no longer races with New Round / Play Again (taps during an action are queued).
Verified: blocked-sprite fault test (old build freezes, new build continues), full rounds, randomized tap fuzzing.
