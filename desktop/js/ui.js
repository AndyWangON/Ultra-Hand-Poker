/* Ultra Hand Poker — HUD rendering, stage scaling, modals, number count-ups */
(function (U) {
  const $ = id => document.getElementById(id);
  const money = n => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtMult = m => (Number.isInteger(m) ? m : m.toFixed(1)) + 'x';
  const suitSvg = (k, size = 24) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><path d="${U.SUIT_PATH[k]}" fill="${k === 'H' || k === 'D' ? '#ff3a46' : '#f4f1ea'}"/></svg>`;
  let portrait = false;

  function fit() {
    const w = innerWidth, h = innerHeight;
    const wantPortrait = h > w * 1.12;
    if (wantPortrait !== portrait || !fit.done) {
      portrait = wantPortrait; fit.done = true;
      document.body.classList.toggle('portrait', portrait);
      const L = portrait ? U.LAYOUT.portrait : U.LAYOUT.landscape;
      const st = $('stage'); st.style.width = L.w + 'px'; st.style.height = L.h + 'px';
      U.fx.resize(L.w, L.h); U.cards.setLayout(L);
      U.game && U.game.relayout();
    }
    const L = U.cards.layout; const s = Math.min(w / L.w, h / L.h);
    $('stage').style.transform = `scale(${s}) translate(-50%,-50%)`;
    U.ui.scale = s;
  }

  function renderLadder(score) {
    const ti = U.rules.tierIndex(score);
    if (!$('ladder').children.length) {
      $('ladder').innerHTML = U.LADDER.map((t, i) => {
        const st = U.TIER_STYLE[i];
        return `<div class="tier" data-i="${i}" style="--t1:${st.t1};--t2:${st.t2};--tb:${st.tb};--tc:${st.tc}"><span>${t.max === Infinity ? t.min + '+' : t.min + ' - ' + t.max}</span><strong>${fmtMult(t.mult)}</strong></div>`;
      }).join('');
    }
    [...$('ladder').children].forEach((el, i) => { el.classList.toggle('cur', i === ti); el.classList.toggle('passed', i < ti); });
    const t = U.LADDER[ti], next = U.LADDER[ti + 1];
    const p = next ? (score - t.min) / (next.min - t.min) : 1;
    $('tierFill').style.width = `${((ti + Math.max(0, Math.min(1, p))) / U.LADDER.length) * 100}%`;
  }
  function flashTier(i) { const el = $('ladder').children[i]; if (!el) return; el.classList.remove('tflash'); void el.offsetWidth; el.classList.add('tflash'); }

  function renderGuide() {
    $('guide').innerHTML = U.HANDS.map(([n, slug]) => `<div class="g-item" data-hand="${n}"><img src="assets/hands/${slug}.svg" alt=""><span class="gn">${n.toUpperCase()}</span><b class="gv">${U.PAY[n]}</b></div>`).join('');
    $('howTable').innerHTML = U.HANDS.map(([n]) => `<div>${n}<b>${U.PAY[n]}</b></div>`).join('');
  }
  function highlightGuide(name, fire) {
    [...$('guide').children].forEach(el => {
      const on = el.dataset.hand === name; el.classList.toggle('hl', on);
      if (on && fire) { el.classList.remove('fire'); void el.offsetWidth; el.classList.add('fire'); }
    });
  }
  function renderSuitPick(active) {
    if (!$('suitPick').children.length) {
      $('suitPick').innerHTML = ['S', 'H', 'D', 'C'].map(k => `<button data-suit="${k}" aria-label="Sort ${k} first">${suitSvg(k)}</button>`).join('');
    }
    [...$('suitPick').children].forEach(b => b.classList.toggle('active', b.dataset.suit === active));
  }
  function renderDeck(n) {
    const layers = Math.max(0, Math.min(14, Math.ceil(n / 4)));
    const el = $('deck');
    if (el.dataset.n == layers) return; el.dataset.n = layers;
    let h = '<div class="dshadow"></div><div class="stack3d">';
    for (let i = 0; i < layers; i++) h += `<div class="edge" style="transform:translateZ(${i * 1.6}px)"></div>`;
    if (layers) h += `<img src="assets/cards/back.svg" alt="" style="transform:translateZ(${layers * 1.6}px)">`;
    el.innerHTML = h + '</div>';
  }
  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  function countUp(el, from, to, dur, fmt = v => Math.round(v).toLocaleString('en-US'), onTick) {
    return new Promise(res => {
      const st = performance.now(); let lastV = null, done = false;
      const finish = () => { if (done) return; done = true; clearTimeout(guard); el.textContent = fmt(to); res(); };
      const guard = setTimeout(finish, dur + 400); // fallback if animation frames are paused
      (function tick() {
        if (done) return;
        const t = Math.min(1, Math.max(0, (performance.now() - st) / dur)), e = 1 - Math.pow(1 - t, 3), v = from + (to - from) * e;
        const shown = fmt(v); if (shown !== lastV) { el.textContent = shown; if (onTick && lastV !== null) { try { onTick(t); } catch (err) { } } lastV = shown; }
        t < 1 ? requestAnimationFrame(tick) : finish();
      })();
    });
  }
  function open(id) { $(id).classList.add('show'); }
  function close(id) { $(id).classList.remove('show'); }
  // stage-space centre of a DOM element (works with the scaled stage)
  function stagePoint(el) {
    const st = $('stage').getBoundingClientRect(), b = el.getBoundingClientRect(), s = U.ui.scale || 1;
    return { x: (b.left + b.width / 2 - st.left) / s, y: (b.top + b.height / 2 - st.top) / s };
  }
  U.ui = { fit, renderLadder, flashTier, renderGuide, highlightGuide, renderSuitPick, renderDeck, bump, countUp, open, close, stagePoint, money, fmtMult, scale: 1, get portrait() { return portrait; } };
})(window.UHP);
