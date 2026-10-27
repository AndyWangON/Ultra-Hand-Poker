/* Ultra Hand Poker — game flow (7-card hand, 3 plays, 2 discards, finite deck, wager ladder) */
(function (U) {
  const $ = id => document.getElementById(id);
  const R = U.RULES, rules = U.rules, ui = U.ui, fx = U.fx, sfx = U.audio.sfx, C = U.cards;
  let SPEED = 1;
  const sleep = ms => new Promise(r => setTimeout(r, ms / SPEED));
  // ---------- busy lock ----------
  // Every multi-step action runs under one lock. The lock is ALWAYS released (finally), the
  // table is re-synced, and a watchdog frees it if an action ever hangs — so play can't get stuck.
  let opSeq = 0, busySince = 0, pendingNext = false;
  async function locked(fn) {
    if (state.busy) return false;
    const my = ++opSeq; state.busy = true; busySince = performance.now();
    try { await fn(); }
    catch (err) { console.error('[UHP] action failed — recovering', err); }
    finally { if (my === opSeq) releaseLock(); }
    return true;
  }
  function syncViews() {
    const ids = new Set(state.hand.map(c => c.id));
    for (const v of [...C.views.values()]) if (!ids.has(v.card.id)) C.destroy(v);
    for (const c of state.hand) if (!C.views.get(c.id)) C.create(c, { faceDown: false });
    for (const v of C.views.values()) { v.opacity = 1; v.float = true; v.tf = 0; v.root.classList.remove('kicker', 'score-hit'); }
    for (const id of [...state.selected]) if (!ids.has(id)) state.selected.delete(id);
  }
  function releaseLock() {
    state.busy = false; busySince = 0;
    $('actions').classList.remove('dim'); document.querySelector('.sort-bar').classList.remove('dim');
    document.body.classList.remove('scoring'); $('scorePanel').classList.remove('show'); $('shuffleOverlay').classList.remove('show');
    render.countingScore = false; render.countingMoney = false; render.ladderScore = null;
    syncViews(); layout(); render();
    if (pendingNext) { pendingNext = false; setTimeout(openBetting, 0); }
  }
  setInterval(() => {
    if (state.busy && busySince && !document.hidden && performance.now() - busySince > 20000) {
      console.warn('[UHP] watchdog: action exceeded 20s — releasing lock'); opSeq++; releaseLock();
    }
  }, 2000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && state.busy) busySince = performance.now(); });
  const state = {
    deck: [], hand: [], selected: new Set(), plays: R.plays, discards: R.discards, score: 0, history: [],
    bet: R.betDefault, busy: false, sort: 'rank', suitFirst: null, dealSeq: 0, firstRound: true, detail: true, round: 0, phase: 'bet',
  };

  // ---------- helpers ----------
  const SUIT_ORDER = ['S', 'H', 'D', 'C'];
  function suitOrder() { const o = {}; const base = state.suitFirst ? [state.suitFirst, ...SUIT_ORDER.filter(s => s !== state.suitFirst)] : SUIT_ORDER; base.forEach((s, i) => o[s] = i); return o; }
  function sortedHand() {
    const order = suitOrder(), a = [...state.hand];
    if (state.sort === 'rank') a.sort((x, y) => y.value - x.value || order[x.suit] - order[y.suit]);
    else if (state.sort === 'suit') a.sort((x, y) => order[x.suit] - order[y.suit] || y.value - x.value);
    else a.sort((x, y) => x.dealOrder - y.dealOrder);
    return a;
  }
  const selectedCards = () => sortedHand().filter(c => state.selected.has(c.id));
  function layout() { C.layoutHand(sortedHand(), state.selected); }
  function addToHand(c) { if (!c) return; c.dealOrder = ++state.dealSeq; state.hand.push(c); }

  // ---------- render (non-animated state) ----------
  function render() {
    const mult = rules.payoutMult(state.score);
    $('playsLeft').textContent = state.plays; $('discardsLeft').textContent = state.discards; $('discardBadge').textContent = state.discards;
    const deckN = (state.phase === 'bet' || (!state.deck.length && !state.hand.length)) ? 52 : state.deck.length; $('deckLeft').textContent = deckN; ui.renderDeck(deckN);
    if (!render.countingScore) $('runScore').textContent = state.score.toLocaleString('en-US');
    if (!render.countingMoney) { $('currentMult').textContent = ui.fmtMult(mult); $('livePayout').textContent = ui.money(state.bet * mult); }
    $('livePayout').classList.toggle('zero', mult === 0);
    const cards = selectedCards(), ev = rules.evaluate(cards);
    const valid = cards.length > 0 && cards.length <= R.maxSelect && !state.busy;
    $('playBtn').disabled = !valid || state.plays <= 0;
    $('discardBtn').disabled = !valid || state.discards <= 0;
    $('playBtn').classList.toggle('ready', valid && state.plays > 0);
    $('playHint').textContent = state.phase === 'bet' ? 'PLACE YOUR BET' : ev ? (state.detail ? `${ev.name.toUpperCase()} · ${ev.base} + ${ev.cardValue} = ${ev.total}` : `${ev.name.toUpperCase()} · +${ev.total}`) : (state.plays > 0 ? 'SELECT 1–5 CARDS' : 'ROUND OVER');
    ui.highlightGuide(ev ? ev.name : null);
    const betLocked = state.phase !== 'bet' || state.busy;
    renderStake();
    $('betInput').disabled = betLocked; $('betMinus').disabled = betLocked; $('betPlus').disabled = betLocked;
    $('sortRankBtn').classList.toggle('active', state.sort === 'rank'); $('sortSuitBtn').classList.toggle('active', state.sort === 'suit');
    ui.renderSuitPick(state.sort === 'suit' ? state.suitFirst : null);
    $('finalBanner').classList.toggle('show', state.plays === 1 && !state.busy && state.hand.length > 0);
    ui.renderLadder(render.ladderScore ?? state.score);
  }

  // ---------- dealing ----------
  async function dealCards(cards, { gap = 95 } = {}) {
    for (const c of cards) {
      addToHand(c);
      const v = C.create(c, { faceDown: true });
      v.z = 50; layout(); render();
      sfx.deal(state.hand.length);
      const vv = v; setTimeout(() => { vv.tf = 0; C.stretch(vv, .1); }, 170 / SPEED);
      setTimeout(() => { C.squash(vv, .14); sfx.land(); }, 380 / SPEED);
      await sleep(gap);
    }
    await sleep(320);
  }
  function drawN(n) { const out = []; while (out.length < n && state.deck.length) out.push(state.deck.pop()); return out; }

  // ---------- selection ----------
  function toggle(v) {
    if (state.busy || !state.hand.some(c => c.id === v.card.id)) return;
    const id = v.card.id;
    if (state.selected.has(id)) { state.selected.delete(id); sfx.deselect(); C.squash(v, .1); }
    else {
      if (state.selected.size >= R.maxSelect) { sfx.error(); v.vr += 120; fx.floater('MAX 5 CARDS', v.x + C.layout.cw / 2, v.y - 10, 'red'); return; }
      state.selected.add(id); sfx.select(); C.stretch(v, .16);
      const c = C.center(v); fx.burst(c.x, c.y - C.layout.ch * .45 - 30, { count: 8, speed: 220, gravity: 120, size: 22, life: .5 });
    }
    layout(); render();
  }
  C.onClick(toggle);
  C.onHover(v => { if (!state.busy && v.float) sfx.hover(); });

  function setSort(mode, suit) {
    if (state.busy) return;
    if (suit) { state.sort = 'suit'; state.suitFirst = suit; }
    else if (state.sort === mode && !suit) { state.sort = 'deal'; state.suitFirst = null; }
    else { state.sort = mode; if (mode !== 'suit') state.suitFirst = null; }
    sfx.button(); sfx.chip();
    for (const v of C.views.values()) C.squash(v, .06);
    layout(); render();
  }

  // ---------- play ----------
  async function playHand() {
    if (state.busy || state.phase !== 'play') return;
    const cards = selectedCards();
    if (!cards.length || cards.length > R.maxSelect || state.plays <= 0) { sfx.error(); $('playBtn').classList.add('shake-x'); setTimeout(() => $('playBtn').classList.remove('shake-x'), 400); return; }
    return locked(() => playSequence(cards));
  }
  async function playSequence(cards) {
    const ev = rules.evaluate(cards), oldScore = state.score, oldTier = rules.tierIndex(oldScore);
    render(); document.body.classList.add('scoring'); $('actions').classList.add('dim'); document.querySelector('.sort-bar').classList.add('dim'); $('finalBanner').classList.remove('show');
    sfx.play(); fx.shake(.12);
    const L = C.layout, n = cards.length;
    const played = cards.map(c => C.views.get(c.id) || C.create(c, { faceDown: false }));
    const scoringIds = new Set(ev.scoringCards.map(c => c.id));
    // lift played cards into a centred row; push the rest down
    const PS = L.playScale || 1.06, PSp = L.playSpacing || (L.spacing + 8), PY = L.playY ?? (L.handY - 8);
    played.forEach((v, i) => { const o = i - (n - 1) / 2; v.tx = L.handCx + o * PSp - L.cw / 2; v.ty = PY - L.ch * (1 - PS) / 2; v.tr = 0; v.ts = PS; v.z = 60 + i; v.float = false; v.root.classList.remove('sel'); C.stretch(v, .2); });
    for (const v of C.views.values()) if (!cards.includes(v.card)) { v.ty += (L.restDrop ?? 150); v.ts = .82; v.opacity = .22; v.float = false; }
    await sleep(420);
    played.forEach(v => { if (!scoringIds.has(v.card.id)) v.root.classList.add('kicker'); });

    // hand banner
    $('spName').textContent = ev.name.toUpperCase(); $('spBase').textContent = '0'; $('spCards').textContent = '0'; $('spTotal').textContent = '0';
    $('scorePanel').classList.add('show'); sfx.banner(); fx.shake(.22); fx.flash(); ui.highlightGuide(ev.name, true);
    const sp = ui.stagePoint($('spName')); fx.burst(sp.x, sp.y, { count: 26, speed: 600, gravity: 200 });
    await ui.countUp($('spBase'), 0, ev.base, 380 / SPEED, undefined, t => sfx.tick(t * .5));
    ui.bump($('spBase').parentElement);
    await sleep(160);

    // score each scoring card in order
    let cardSum = 0, k = 0;
    for (const v of played) {
      if (!scoringIds.has(v.card.id)) continue;
      v.root.classList.add('score-hit'); v.ts = PS * 1.14; v.vr += (k % 2 ? 1 : -1) * 160; C.stretch(v, .25);
      cardSum += v.card.scoreValue;
      const c = C.center(v);
      fx.floater(`+${v.card.scoreValue}`, c.x, v.y - 30, ''); fx.burst(c.x, v.y + 10, { count: 16, speed: 420, gravity: 300, size: 30 }); fx.ring(c.x, c.y, .5, .45);
      $('spCards').textContent = cardSum; ui.bump($('spCards'));
      sfx.scoreCard(k); fx.shake(.08 + k * .02);
      await sleep(300);
      v.ts = PS; v.root.classList.remove('score-hit'); k++;
    }
    await sleep(120);
    const totalEl = $('spTotal');
    await ui.countUp(totalEl, 0, ev.total, 360 / SPEED, undefined, t => sfx.tick(.5 + t * .5));
    ui.bump(totalEl.parentElement); fx.flash(); fx.shake(Math.min(.55, .15 + ev.total / 900));
    const tp = ui.stagePoint(totalEl); fx.burst(tp.x, tp.y, { count: 30, speed: 700 });
    await sleep(260);

    // send score to the HUD
    state.score += ev.total; state.plays--; state.history.push({ name: ev.name, score: ev.total });
    state.firstRound = false;
    const hp = ui.stagePoint($('runScore'));
    await new Promise(res => fx.orb(tp.x, tp.y, hp.x, hp.y, 560 / SPEED, res));
    fx.ring(hp.x, hp.y, .8, .5); fx.burst(hp.x, hp.y, { count: 24, speed: 500, gravity: 150 }); fx.pulseWorld();
    $('scorePanel').classList.remove('show');
    const sc = $('runScore'); sc.parentElement.parentElement.classList.remove('glow'); void sc.offsetWidth; sc.parentElement.parentElement.classList.add('glow');
    render.countingScore = true; render.ladderScore = oldScore;
    await ui.countUp(sc, oldScore, state.score, 700 / SPEED, undefined, t => sfx.tick(t));
    render.countingScore = false; render.ladderScore = null; ui.bump(sc);

    // ladder / payout tier celebration
    const newTier = rules.tierIndex(state.score);
    render.countingMoney = newTier > oldTier;
    render();
    if (newTier > oldTier) await celebrateTier(newTier, oldTier);
    render.countingMoney = false; render();

    // clear played cards and refill
    played.forEach((v, i) => { v.tx = L.discardTo.x + i * 30; v.ty = L.discardTo.y - 260 - i * 40; v.tr = 40 + i * 15; v.ts = .8; v.tf = 180; });
    sfx.discard();
    state.hand = state.hand.filter(c => !state.selected.has(c.id)); state.selected.clear();
    for (const v of C.views.values()) if (!played.includes(v)) { v.ts = 1; v.opacity = 1; v.float = true; }
    layout();
    await sleep(380);
    played.forEach(v => C.destroy(v));
    $('actions').classList.remove('dim'); document.body.classList.remove('scoring'); document.querySelector('.sort-bar').classList.remove('dim');
    if (state.plays > 0) await dealCards(drawN(R.handSize - state.hand.length));
    if (state.plays === 0) await endRound();
  }

  async function celebrateTier(ti, oldTi) {
    const t = U.LADDER[ti];
    $('tierValue').textContent = ui.fmtMult(t.mult);
    $('tierRange').textContent = t.max === Infinity ? `${t.min}+ RUN SCORE` : `${t.min} – ${t.max} RUN SCORE`;
    const tb = $('tierBurst'); tb.classList.remove('show', 'big'); void tb.offsetWidth; tb.classList.add('show'); if (ti >= 5) tb.classList.add('big');
    ui.flashTier(ti); sfx.tier(ti); fx.flash(); fx.shake(.45 + ti * .05);
    const L = C.layout, cx = L.w / 2, cy = L.h / 2;
    fx.ring(cx, cy, 1.6, .8); fx.burst(cx, cy, { count: 50, speed: 900, gravity: 300, size: 40 });
    fx.confetti(cx, cy + 40, 40 + ti * 12); if (ti >= 4) fx.coins(cx, cy + 60, 14 + ti * 4);
    $('logoWrap')?.classList.add('pulse');
    await sleep(500);
    const mult = t.mult, oldMult = U.LADDER[oldTi].mult;
    ui.bump($('currentMult'));
    $('currentMult').textContent = ui.fmtMult(mult);
    await ui.countUp($('livePayout'), state.bet * oldMult, state.bet * mult, 700 / SPEED, ui.money, () => { });
    ui.bump($('livePayout')); sfx.chip(); sfx.chip();
    const lp = ui.stagePoint($('livePayout')); fx.burst(lp.x, lp.y, { count: 22, speed: 380, gravity: 200 });
    await sleep(700);
  }

  // ---------- discard ----------
  async function discard() {
    if (state.busy || state.phase !== 'play') return;
    const cards = selectedCards();
    if (!cards.length || cards.length > R.maxSelect || state.discards <= 0) { sfx.error(); return; }
    return locked(() => discardSequence(cards));
  }
  async function discardSequence(cards) {
    render(); sfx.discard();
    const L = C.layout;
    cards.forEach((c, i) => {
      const v = C.views.get(c.id); if (!v) return; v.float = false; v.root.classList.remove('sel');
      v.tx = L.discardTo.x + i * 26; v.ty = L.discardTo.y - i * 30; v.tr = 70 + i * 22; v.ts = .85; v.vr += 300; v.vy -= 900; C.stretch(v, .3);
      setTimeout(() => { v.tf = 180; }, (120 + i * 40) / SPEED);
    });
    fx.shake(.1);
    state.discards--; ui.bump($('discardBadge')); ui.bump($('discardsLeft'));
    state.hand = state.hand.filter(c => !state.selected.has(c.id)); state.selected.clear();
    layout(); render();
    await sleep(460);
    cards.forEach(c => { const v = C.views.get(c.id); v && C.destroy(v); });
    state.firstRound = false;
    await dealCards(drawN(R.handSize - state.hand.length));
  }

  // ---------- round lifecycle ----------
  async function collectCards() {
    const L = C.layout; const vs = [...C.views.values()];
    if (!vs.length) return;
    vs.forEach((v, i) => { v.float = false; v.root.classList.remove('sel', 'kicker'); v.tx = L.deck.x; v.ty = L.deck.y - i * 2; v.tr = L.deck.r; v.ts = .9; v.tf = 180; v.opacity = 1; setTimeout(() => sfx.deal(i), i * 40); });
    await sleep(520);
    vs.forEach(v => C.destroy(v));
  }
  // ---------- bet stake phase ----------
  const CHIPS = [[1, 'green'], [5, 'red'], [10, 'blue'], [25, 'black'], [100, 'gold']];
  const clampBet = v => Math.max(R.betMin, Math.min(R.betMax, Math.round(v) || R.betMin));
  function renderStake() {
    $('stakeValue').textContent = state.bet.toLocaleString('en-US');
    $('stakeMax').textContent = ui.money(state.bet * 15);
    $('confirmHint').textContent = `BET ${ui.money(state.bet)}`;
    $('stakeRound').textContent = state.round + 1;
    if (document.activeElement !== $('betInput')) $('betInput').value = state.bet;
    document.body.classList.toggle('betting', state.phase === 'bet');
  }
  function setBet(v, from) {
    if (state.phase !== 'bet' || state.busy) return;
    const nv = clampBet(v); if (nv === state.bet) { sfx.error(); return; }
    state.bet = nv; sfx.chip(); ui.bump($('stakeValue')); ui.bump($('betInput'));
    if (from) { const a = ui.stagePoint(from), b = ui.stagePoint($('stakeValue')); fx.orb(a.x, a.y, b.x, b.y, 300, () => fx.burst(b.x, b.y, { count: 12, speed: 300, gravity: 120, size: 24 })); }
    render();
  }
  function openBetting() { if (state.busy) { pendingNext = true; return; } return locked(bettingSequence); }
  async function bettingSequence() {
    ui.close('resultModal');
    await collectCards();
    state.deck = []; state.hand = []; state.selected.clear(); state.plays = R.plays; state.discards = R.discards;
    state.score = 0; state.history = []; state.phase = 'bet';
    render();
    U.audio.play('swoosh', { vol: .5 });
  }
  async function confirmBet() {
    if (state.phase !== 'bet' || state.busy) return;
    state.bet = clampBet(state.bet); sfx.button(); sfx.chip(); sfx.chip();
    const p = ui.stagePoint($('stakeValue')), q = ui.stagePoint($('livePayout'));
    fx.orb(p.x, p.y, q.x, q.y, 420); fx.burst(p.x, p.y, { count: 20, speed: 500, gravity: 200 });
    state.phase = 'play'; render();
    await locked(async () => { await sleep(320); await startSequence(); });
  }
  function startRound() { return locked(startSequence); }
  async function startSequence() {
    state.deck = rules.makeDeck(); state.hand = []; state.selected.clear(); state.plays = R.plays; state.discards = R.discards;
    state.score = 0; state.history = []; state.dealSeq = 0; state.sort = 'rank'; state.suitFirst = null; state.round++;
    render();
    // shuffle animation
    sfx.shuffle(); $('shuffleOverlay').classList.add('show');
    const deck = $('deck'); deck.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-14px) rotate(-3deg)' }, { transform: 'translateY(0) rotate(2deg)' }, { transform: 'translateY(-8px) rotate(-1deg)' }, { transform: 'none' }], { duration: 760 / SPEED });
    const dp = ui.stagePoint(deck); fx.burst(dp.x, dp.y, { count: 14, speed: 260, gravity: -40, size: 26, life: .8 });
    await sleep(820);
    $('shuffleOverlay').classList.remove('show');
    let first = [];
    if (state.firstRound) first = U.GUIDED.map(([r, s]) => rules.pull(state.deck, r, s)).filter(Boolean);
    first = first.concat(drawN(R.handSize - first.length));
    await dealCards(first, { gap: 105 });
    if (state.firstRound && state.round === 1) {
      const ace = state.hand.find(c => c.rank === 'A' && c.suit === 'S');
      if (ace) { state.selected.add(ace.id); const v = C.views.get(ace.id); if (v) C.stretch(v, .16); sfx.select(); }
    }
  }
  async function endRound() {
    await sleep(350);
    const mult = rules.payoutMult(state.score), payout = state.bet * mult;
    $('finalSub').textContent = `Run Score ${state.score.toLocaleString('en-US')} · ${ui.fmtMult(mult)} wager multiplier · Bet ${ui.money(state.bet)}`;
    $('finalHands').innerHTML = state.history.map(h => `<span>${h.name}<b>+${h.score}</b></span>`).join('');
    const fp = $('finalPayout'); fp.classList.toggle('none', payout === 0); fp.textContent = ui.money(0);
    $('resTitle').textContent = payout > 0 ? (mult >= 4 ? 'ULTRA PAYOUT' : 'YOU WIN') : 'NO PAYOUT';
    ui.open('resultModal');
    if (payout > 0) {
      sfx.payout(mult >= 4); fx.coinRain(30 + Math.min(90, mult * 8)); if (mult >= 2.5) fx.confetti(C.layout.w / 2, C.layout.h * .55, 90);
      sleep(250).then(() => ui.countUp(fp, 0, payout, 1200 / SPEED, ui.money, t => sfx.tick(t))).then(() => fx.shake(.3));
    } else { sfx.noPayout(); fp.textContent = ui.money(0); }
    state.phase = 'over';
  }

  // ---------- wager ----------
  function changeBet(d) { if ($('betInput').disabled) return; setBet(state.bet + d); }

  // ---------- wiring ----------
  function wire() {
    $('playBtn').onclick = playHand; $('discardBtn').onclick = discard;
    $('playAgainBtn').onclick = () => { sfx.button(); openBetting(); };
    $('confirmBet').onclick = confirmBet;
    $('stakeChips').innerHTML = CHIPS.map(([v, c]) => `<button class="stake-chip" data-v="${v}" aria-label="Add ${v}"><img src="assets/ui/chip_${c}_blank.svg" alt=""><b>${v}</b></button>`).join('');
    $('stakeChips').addEventListener('click', e => { const b = e.target.closest('.stake-chip'); if (!b) return; b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); setBet(state.bet + +b.dataset.v, b); });
    $('stakeClear').onclick = () => setBet(R.betMin); $('stakeMinus').onclick = () => setBet(state.bet - 1); $('stakePlus').onclick = () => setBet(state.bet + 1);
    $('stakeHalf').onclick = () => setBet(Math.floor(state.bet / 2)); $('stakeDouble').onclick = () => setBet(state.bet * 2);
    $('sortRankBtn').onclick = () => setSort('rank'); $('sortSuitBtn').onclick = () => setSort('suit');
    $('suitPick').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setSort('suit', b.dataset.suit); });
    $('betMinus').onclick = e => changeBet(e.shiftKey ? -10 : -1); $('betPlus').onclick = e => changeBet(e.shiftKey ? 10 : 1);
    $('betInput').onchange = () => { if (state.phase === 'bet') { state.bet = clampBet(Number($('betInput').value)); render(); } };
    $('howToBtn').onclick = () => { sfx.button(); ui.open('howModal'); };
    $('settingsBtn').onclick = () => { sfx.button(); ui.open('settingsModal'); };
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { sfx.button(); ui.close(b.dataset.close); }));
    ['howModal', 'settingsModal'].forEach(id => $(id).addEventListener('click', e => { if (e.target === $(id)) ui.close(id); }));
    $('soundBtn').onclick = () => {
      const on = !U.audio.enabled; U.audio.setEnabled(on);
      $('soundIcon').src = `assets/ui/icons/${on ? 'sound_on' : 'sound_off'}.svg`; $('soundBtn').classList.toggle('muted', !on); if (on) sfx.button();
    };
    $('volume').oninput = e => U.audio.setVolume(e.target.value / 100);
    $('shakeToggle').onchange = e => { fx.opts.shake = e.target.checked; };
    $('fastToggle').onchange = e => { SPEED = e.target.checked ? 1.8 : 1; C.setSpeed(e.target.checked ? 1.4 : 1); };
    $('motionToggle').onchange = e => { const r = e.target.checked; document.body.classList.toggle('reduced-motion', r); fx.opts.reduced = r; C.setReduced(r); };
    $('detailToggle').onchange = e => { state.detail = e.target.checked; render(); };
    document.querySelectorAll('.big-btn,.btn-ghost,.seg').forEach(b => b.addEventListener('pointerenter', () => { if (!b.disabled) U.audio.play('card_hover', { vol: .25, rate: 1.4 }); }));
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (document.querySelector('.modal.show')) { if (e.key === 'Escape') document.querySelectorAll('.modal.show').forEach(m => m.id !== 'resultModal' && ui.close(m.id)); return; }
      if (state.phase === 'bet') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); confirmBet(); } return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playHand(); }
      else if (e.key.toLowerCase() === 'd') discard();
      else if (/^[1-7]$/.test(e.key)) { const c = sortedHand()[+e.key - 1]; if (c) toggle(C.views.get(c.id)); }
    });
    window.addEventListener('resize', ui.fit);
  }

  U.game = { state, relayout() { if (C.views.size) layout(); }, openBetting, confirmBet, setBet, playHand, discard, evaluate: rules.evaluate };

  // ---------- boot ----------
  U.audio.init(); fx.init(); C.start(); ui.renderGuide(); ui.renderLadder(0); wire(); ui.fit(); render();
  const boot = () => openBetting();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(boot, 250));
})(window.UHP);
