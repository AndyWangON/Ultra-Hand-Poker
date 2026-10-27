# Visual / Interaction QA — V11

Primary QA viewport 1920×1080 (headless Chromium). Secondary: 430×932 portrait.

Compared side-by-side against `assets/reference/target_reference.png` (3:2 reference mapped onto the 16:9 stage)
and iterated on: logo proportions, room lighting/warmth, table rail, panel spacing, bet panel fit, prop prominence.

Automated passes (no page errors, http:// and file://):
- Round start: shuffle → 7 cards dealt from the deck prop, guided A♠ pre-selected
- Play: scoring animation, Run Score/Plays update, refill from finite deck
- Tier crossing (A-K-Q-J-10 straight = 181 → 0.5×) triggers tier celebration and Current Winning count-up
- Discard: decrements Discards, refills, badge updates
- Three plays → result modal with payout count-up (e.g. 321 → 1.5× → $15.00 on a $10 bet)
- How to Play / Settings modals; hover tilt; sound toggle; portrait layout

Intentional deviations from the reference image:
- The strip at the bottom shows the hand values the game actually scores (600/430/…/20) rather than the reference's
  placeholder numbers (800/400/…/10), and adds High Card as the tenth entry.
- The Play Hand button carries a live preview of the selected hand (e.g. `PAIR · 42 + 22 = 64`).
- Current Winning shows bet × multiplier (`$25.00`) instead of the reference's `$ - 250`.

Bet-first flow (r2): boot shows the stake panel with no cards; Play/Discard ignored before confirming; chips/±/½/×2
update stake, Bet panel and max-payout preview; Confirm & Deal locks the bet and deals; after 3 plays the result
modal's Next Round returns to the stake panel (round 2, bet kept, table cleared). New Round button removed.
Checked at 1920×1080 and the 430×932 portrait fallback.

## Fix: game could freeze mid-play (busy lock never released) — 2026-10-27
Root cause: the particle loop (js/fx.js) rescheduled itself only at the end of each frame, so a single
exception (e.g. drawing a sprite image that failed to load) stopped it for good. The score "orb" that carries
points to Run Score only finishes inside that loop, so playHand() waited forever with the busy lock held:
cards could no longer be selected and Play/Discard stayed disabled.
Fixes: fx/cards loops reschedule first and catch errors; sprites are drawn only when loaded; orb and count-up
animations have timer fallbacks; every action runs under one lock released in `finally` (plus table re-sync);
20 s watchdog; result screen no longer races with New Round / Play Again (taps during an action are queued).
Verified: blocked-sprite fault test (old build freezes, new build continues), full rounds, randomized tap fuzzing.
