# Ultra Hand Poker — V11 (reference rebuild)

Full presentation rebuild of the V10 vertical slice against `assets/reference/target_reference.png`.
Game rules are unchanged; the HTML/CSS/JS and every visual asset were rebuilt.

## Run
Double-click `index.html` (works from `file://`), or for the best audio (WebAudio layering):

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

Desktop 16:9 is the primary target (1920×1080 design stage, scaled to fit any window).
Tall/mobile screens switch to a 1080×1920 portrait layout automatically.

## Round flow
1. **Place your bet** — before any card is dealt, the stake panel opens on the table. Add chips (1 / 5 / 10 / 25 / 100)
   and fine-tune with −1 / +1 / ½ / ×2 / Clear (or the − / + in the Bet panel). Max-payout preview updates live.
2. **Confirm & Deal** — the wager locks, the deck shuffles and 7 cards are dealt.
3. Play 3 hands / use 2 discards.
4. Result → **Next Round** returns to the stake panel (last bet remembered). There is no New Round button.

## Gameplay (preserved from V10)
- 7-card hand from one finite, shuffled 52-card deck
- 3 Plays, 2 Discards per round; used cards refill from the same deck
- Score = poker-hand value + values of the cards that form the hand (2–10 face, J/Q/K 10, A 11)
- Hand values: Royal Flush 600 · Straight Flush 430 · Four of a Kind 280 · Full House 190 · Flush 145 · Straight 130 · Three of a Kind 92 · Two Pair 68 · Pair 42 · High Card 20
- Run Score ladder → wager multiplier (0× … 15×); payout = bet × multiplier
- Wager is chosen before the deal and locked for the round; guided opening hand (A♠ K♥ Q♥ J♦ 10♦ 3♣ 2♠) on first load
- Sort by rank / suit (click again for dealt order; suit icons put that suit first)

Shortcuts: `1–7` select card · `Enter`/`Space` play (or Confirm & Deal while betting) · `D` discard · `Esc` close dialogs.

## Project structure
```
index.html
css/      fonts · stage (layout) · components · cards · effects · portrait
js/       config (rules data) · rules (pure logic) · audio · fx · cards (spring physics) · ui · game (flow)
assets/cards/        52 SVG faces (custom J/Q/K court art, ornate A♠) + back
assets/hands/        10 poker-hand reference icons (kickers dimmed)
assets/ui/           logo (PNG + SVG source), emblem, chips, chip stacks, glass, icons/, fx_* particle sprites
assets/backgrounds/  casino_lounge.jpg (room) + table.png (felt table layer)
assets/fonts/        Barlow Condensed, Oswald, Great Vibes, Cinzel (SIL OFL)
assets/reference/    target reference + implementation screenshots
audio/               20 synthesized WAV effects (layered at runtime)
tools/               asset generators (Node/opentype.js, canvas, numpy) used to build the art & audio
```

## Juice
Spring-driven cards (hover lift + 3D tilt toward cursor, lean into motion, idle float),
squash & stretch on select/deal/land, deal-from-deck flips, discard flings, play-row lift,
per-card score pops with floating values and rising-pitch ticks, hand banner with count-ups,
golden orb to the Run Score, screen shake (trauma model), flashes, particle bursts, rings,
confetti and coin showers, payout-tier stamp with spinning rays, ladder flash, payout count-up.
Settings: volume, screen shake, fast animations, reduced motion, scoring detail.
