/* Ultra Hand Poker — pure game rules (logic preserved from V10) */
(function (U) {
  let uid = 0;
  function makeDeck() {
    const a = [];
    for (const s of U.SUITS) for (const r of U.RANKS)
      a.push({ id: ++uid, rank: r.r, value: r.v, scoreValue: r.sv, suit: s.k, suitName: s.name, red: s.red });
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function pull(deck, rank, suit) { const i = deck.findIndex(c => c.rank === rank && c.suit === suit); return i < 0 ? null : deck.splice(i, 1)[0]; }

  // Evaluate 1–5 selected cards. Returns hand name, base value, scoring cards and totals.
  function evaluate(cards) {
    if (!cards.length) return null;
    const counts = {};
    cards.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
    const groups = Object.entries(counts).map(([v, c]) => ({ v: +v, c })).sort((a, b) => b.c - a.c || b.v - a.v);
    const flush = cards.length === 5 && cards.every(c => c.suit === cards[0].suit);
    let vals = [...new Set(cards.map(c => c.value))].sort((a, b) => a - b);
    if (vals.includes(14)) vals = [1, ...vals];
    let straight = false;
    if (cards.length === 5) {
      for (let i = 0; i <= vals.length - 5; i++) { const w = vals.slice(i, i + 5); if (w[4] - w[0] === 4 && new Set(w).size === 5) { straight = true; break; } }
    }
    const royal = flush && straight && cards.some(c => c.value === 14) && cards.some(c => c.value === 10);
    let name = 'High Card';
    if (cards.length === 5 && royal) name = 'Royal Flush';
    else if (cards.length === 5 && flush && straight) name = 'Straight Flush';
    else if (groups[0]?.c === 4) name = 'Four of a Kind';
    else if (cards.length === 5 && groups[0]?.c === 3 && groups[1]?.c === 2) name = 'Full House';
    else if (cards.length === 5 && flush) name = 'Flush';
    else if (cards.length === 5 && straight) name = 'Straight';
    else if (groups[0]?.c === 3) name = 'Three of a Kind';
    else if (groups.filter(g => g.c === 2).length >= 2) name = 'Two Pair';
    else if (groups[0]?.c === 2) name = 'Pair';
    let scoring = cards;
    if (name === 'High Card') scoring = [cards.reduce((a, b) => a.value > b.value ? a : b)];
    else if (name === 'Pair') { const v = groups.find(g => g.c === 2).v; scoring = cards.filter(c => c.value === v); }
    else if (name === 'Two Pair') { const vs = groups.filter(g => g.c === 2).slice(0, 2).map(g => g.v); scoring = cards.filter(c => vs.includes(c.value)); }
    else if (name === 'Three of a Kind') { const v = groups.find(g => g.c === 3).v; scoring = cards.filter(c => c.value === v); }
    else if (name === 'Four of a Kind') { const v = groups.find(g => g.c === 4).v; scoring = cards.filter(c => c.value === v); }
    const base = U.PAY[name], cardValue = scoring.reduce((s, c) => s + c.scoreValue, 0), total = base + cardValue;
    return { name, base, cardValue, total, scoringCards: scoring };
  }
  function payoutMult(score) { return U.LADDER.find(x => score >= x.min && score <= x.max)?.mult || 0; }
  function tierIndex(score) { return U.LADDER.findIndex(x => score >= x.min && score <= x.max); }
  U.rules = { makeDeck, pull, evaluate, payoutMult, tierIndex };
})(window.UHP);
