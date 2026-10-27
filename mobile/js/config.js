/* Ultra Hand Poker — static configuration (rules values preserved from V10) */
window.UHP = window.UHP || {};
(function (U) {
  U.SUITS = [
    { k: 'S', name: 'Spades', red: false },
    { k: 'H', name: 'Hearts', red: true },
    { k: 'D', name: 'Diamonds', red: true },
    { k: 'C', name: 'Clubs', red: false },
  ];
  // v = poker rank value, sv = scoring-card value (2–10 face, J/Q/K 10, A 11)
  U.RANKS = [
    { r: '2', v: 2, sv: 2 }, { r: '3', v: 3, sv: 3 }, { r: '4', v: 4, sv: 4 }, { r: '5', v: 5, sv: 5 },
    { r: '6', v: 6, sv: 6 }, { r: '7', v: 7, sv: 7 }, { r: '8', v: 8, sv: 8 }, { r: '9', v: 9, sv: 9 },
    { r: '10', v: 10, sv: 10 }, { r: 'J', v: 11, sv: 10 }, { r: 'Q', v: 12, sv: 10 }, { r: 'K', v: 13, sv: 10 },
    { r: 'A', v: 14, sv: 11 },
  ];
  // Poker-hand base values (the values the game actually scores with)
  U.PAY = {
    'High Card': 20, 'Pair': 42, 'Two Pair': 68, 'Three of a Kind': 92, 'Straight': 130,
    'Flush': 145, 'Full House': 190, 'Four of a Kind': 280, 'Straight Flush': 430, 'Royal Flush': 600,
  };
  // Run score → wager multiplier
  U.LADDER = [
    { min: 0, max: 179, mult: 0 }, { min: 180, max: 239, mult: .5 }, { min: 240, max: 319, mult: 1 },
    { min: 320, max: 399, mult: 1.5 }, { min: 400, max: 499, mult: 2.5 }, { min: 500, max: 649, mult: 4 },
    { min: 650, max: 899, mult: 7.5 }, { min: 900, max: Infinity, mult: 15 },
  ];
  // Visual styling per ladder tier (tile gradient, border, multiplier colour)
  U.TIER_STYLE = [
    { t1: '#13233a', t2: '#0a1424', tb: '#2a4466', tc: '#ffffff' },
    { t1: '#14284a', t2: '#0a1730', tb: '#2e4f80', tc: '#ffffff' },
    { t1: '#0f3050', t2: '#081a30', tb: '#2c6090', tc: '#5fd0ff' },
    { t1: '#123a5c', t2: '#0a2036', tb: '#36709e', tc: '#ffffff' },
    { t1: '#173a1c', t2: '#0b1f0f', tb: '#3f6a2a', tc: '#ffe066' },
    { t1: '#1a3d1a', t2: '#0b200c', tb: '#4a7a2c', tc: '#ffe066' },
    { t1: '#43121c', t2: '#22070d', tb: '#7a2a36', tc: '#ffe066' },
    { t1: '#3e0f26', t2: '#1e0612', tb: '#7a2a52', tc: '#ffe066' },
  ];
  // Reference strip: name, slug of icon in assets/hands
  U.HANDS = [
    ['Royal Flush', 'royal_flush'], ['Straight Flush', 'straight_flush'], ['Four of a Kind', 'four_of_a_kind'],
    ['Full House', 'full_house'], ['Flush', 'flush'], ['Straight', 'straight'], ['Three of a Kind', 'three_of_a_kind'],
    ['Two Pair', 'two_pair'], ['Pair', 'pair'], ['High Card', 'high_card'],
  ];
  U.RULES = { handSize: 7, plays: 3, discards: 2, maxSelect: 5, betMin: 1, betMax: 10000, betDefault: 10 };
  // Guided first hand (matches the presentation reference)
  U.GUIDED = [['A', 'S'], ['K', 'H'], ['Q', 'H'], ['J', 'D'], ['10', 'D'], ['3', 'C'], ['2', 'S']];
  U.SUIT_PATH = {
    H: 'M50 92 C47 86 38 77 27 67 C12 53 3 43 3 29 C3 15 14 5 27 5 C37 5 45 11 50 21 C55 11 63 5 73 5 C86 5 97 15 97 29 C97 43 88 53 73 67 C62 77 53 86 50 92 Z',
    D: 'M50 2 C59 20 72 37 90 50 C72 63 59 80 50 98 C41 80 28 63 10 50 C28 37 41 20 50 2 Z',
    S: 'M50 3 C55 14 66 24 78 34 C91 45 98 53 98 66 C98 79 88 87 76 87 C67 87 60 83 55 76 C56 85 60 92 68 97 L32 97 C40 92 44 85 45 76 C40 83 33 87 24 87 C12 87 2 79 2 66 C2 53 9 45 22 34 C34 24 45 14 50 3 Z',
    C: 'M50 4 C62 4 71 13 71 25 C71 32 68 37 64 41 C67 40 70 39 74 39 C87 39 97 49 97 62 C97 75 87 85 74 85 C65 85 58 80 54 73 C55 83 59 91 67 97 L33 97 C41 91 45 83 46 73 C42 80 35 85 26 85 C13 85 3 75 3 62 C3 49 13 39 26 39 C30 39 33 40 36 41 C32 37 29 32 29 25 C29 13 38 4 50 4 Z',
  };
  // Stage layouts (design pixels). Portrait is used on tall/mobile screens.
  // Mobile portrait stage (design pixels, ~9:19.5 phone)
  U.LAYOUT = {
    mobile: { w: 1080, h: 2340, cw: 188, ch: 274, handCx: 540, handY: 1215, spacing: 133, fan: 2.8, arc: 5.5, selLift: 46,
      playY: 902, playSpacing: 160, playScale: .8, restDrop: 120,
      deck: { x: 30, y: 906, r: -12 }, discardTo: { x: 1260, y: 1150 } },
  };
})(window.UHP);
