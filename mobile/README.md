# Ultra Hand Poker — V11 Mobile (portrait)

Phone-first portrait edition of V11. Same rules, assets and juice; layout, background and card
handling rebuilt for one-handed play on a vertical screen.

## Run
Open `index.html` directly, or serve the folder for the best (WebAudio) sound:

```bash
python3 -m http.server 8080   # then open http://<your-ip>:8080 on the phone
```

Design stage is 1080 × 2340 (≈ 9:19.5, modern phones) and scales to fit; 9:16 phones get thin
blurred side bars. On a desktop browser it shows as a centred phone-shaped screen.
Tip: "Add to Home Screen" launches it full-screen (web-app meta tags included).

## Round flow (mobile)
1. **Place your bet** — the stake panel opens on the table before any card is dealt. Add chips (1 / 5 / 10 / 25 / 100),
   fine-tune with −1 / +1 / ½ / ×2 / Clear (or the − / + in the Bet bar). Max-payout preview updates live.
2. **Confirm & Deal** — the wager locks, the deck shuffles and 7 cards are dealt.
3. Play 3 hands / use 2 discards as usual.
4. Result → **Next Round** returns to the stake panel (last bet is remembered). There is no New Round button.

## What changed vs. V11 desktop
- New portrait lounge + table art (`assets/backgrounds/mobile_lounge.jpg`, `mobile_table.png`)
- Top bar with icon buttons (How to Play · Sound · Settings) above the logo
- Payout ladder as a 4 × 2 grid; HUD and Bet / Current Winning / Multiplier as full-width bars
- Larger cards (188 × 274) in an overlapping fan for big tap targets; tap to select
- Dedicated PLAY ZONE on the felt: played cards rise there, score breakdown appears below them
- Bigger Discard / Play Hand / New Round buttons and sort controls sized for thumbs
- Hand reference strip as a 2 × 5 grid

## Gameplay (unchanged from V10/V11)
7-card hand · 3 Plays · 2 Discards · finite 52-card deck · score = hand value + scoring-card values
(2–10 face, J/Q/K 10, A 11) · Run Score ladder → wager multiplier · payout = bet × multiplier.
