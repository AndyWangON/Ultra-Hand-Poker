/* Ultra Hand Poker — card views driven by springs (hover tilt, squash & stretch, flips, lean) */
(function (U) {
  const host = () => document.getElementById('hand');
  const views = new Map();
  let L = U.LAYOUT.landscape, onClick = null, onHover = null, reduced = false, speed = 1;

  function el(tag, cls, parent) { const e = document.createElement(tag); if (cls) e.className = cls; parent && parent.appendChild(e); return e; }
  function create(card, { x, y, r = 0, faceDown = true, s = 1 } = {}) {
    const root = el('div', 'card'); root.dataset.id = card.id;
    el('div', 'shadow', root);
    const tilt = el('div', 'tilt', root), flip = el('div', 'flip', tilt);
    const front = el('div', 'face front', flip), back = el('div', 'face back', flip);
    const fi = el('img', '', front); fi.src = `assets/cards/${card.rank}${card.suit}.svg`; fi.alt = `${card.rank} of ${card.suitName}`; fi.draggable = false;
    const bi = el('img', '', back); bi.src = 'assets/cards/back.svg'; bi.alt = ''; bi.draggable = false;
    el('div', 'shine', tilt); el('div', 'glow', tilt); el('div', 'marker', root);
    host().appendChild(root);
    const d = L.deck;
    const v = {
      card, root, tilt, flip,
      x: x ?? d.x, y: y ?? d.y, r: r ?? d.r, s, vx: 0, vy: 0, vr: 0, vs: 0,
      tx: x ?? d.x, ty: y ?? d.y, tr: r ?? d.r, ts: s,
      f: faceDown ? 180 : 0, tf: faceDown ? 180 : 0, vf: 0,
      sx: 1, sy: 1, vsx: 0, vsy: 0, hx: 0, hy: 0, vhx: 0, vhy: 0, thx: 0, thy: 0, hover: false, z: 1, idle: Math.random() * 6, float: true, opacity: 1,
    };
    root.addEventListener('pointerenter', () => { v.hover = true; onHover && onHover(v); });
    root.addEventListener('pointerleave', () => { v.hover = false; v.thx = v.thy = 0; root.style.setProperty('--mx', 0); });
    root.addEventListener('pointermove', e => {
      const b = root.getBoundingClientRect(); const mx = ((e.clientX - b.left) / b.width) * 2 - 1, my = ((e.clientY - b.top) / b.height) * 2 - 1;
      v.thx = -my * 14; v.thy = mx * 16; root.style.setProperty('--mx', mx.toFixed(2));
    });
    root.addEventListener('pointerdown', e => { e.preventDefault(); onClick && onClick(v); });
    views.set(card.id, v);
    return v;
  }
  function target(v, o) { Object.assign(v, o); }
  function squash(v, amt = .12) { v.vsx += amt * 24; v.vsy -= amt * 24; }
  function stretch(v, amt = .12) { v.vsy += amt * 24; v.vsx -= amt * 16; }
  function destroy(v) { v.root.remove(); views.delete(v.card.id); }

  function handSlot(i, n) {
    const o = i - (n - 1) / 2; const sp = n > 7 ? L.spacing * 7 / n : L.spacing;
    return { x: L.handCx + o * sp - L.cw / 2, y: L.handY + o * o * L.arc, r: o * L.fan };
  }
  function layoutHand(order, selected) {
    order.forEach((c, i) => {
      const v = views.get(c.id); if (!v) return;
      const p = handSlot(i, order.length); const sel = selected.has(c.id);
      v.tx = p.x; v.ty = p.y - (sel ? L.selLift : 0); v.tr = p.r; v.ts = 1; v.z = 10 + i; v.float = true;
      v.root.classList.toggle('sel', sel);
    });
  }
  function springAxis(cur, vel, tgt, k, c, dt) { const a = k * (tgt - cur) - c * vel; vel += a * dt; cur += vel * dt; return [cur, vel]; }
  let lastT = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    try { tick(t); } catch (err) { console.error('[UHP] card frame error', err); }
  }
  function tick(t) {
    const dt = Math.min(.033, (t - lastT) / 1000 || .016) * speed; lastT = t; const time = t / 1000;
    for (const v of views.values()) {
      const kP = reduced ? 400 : 190, cP = reduced ? 40 : 21;
      const hov = v.hover && v.float;
      const ty = v.ty - (hov ? 16 : 0), ts = v.ts * (hov ? 1.06 : 1);
      [v.x, v.vx] = springAxis(v.x, v.vx, v.tx, kP, cP, dt);
      [v.y, v.vy] = springAxis(v.y, v.vy, ty, kP, cP, dt);
      [v.r, v.vr] = springAxis(v.r, v.vr, v.tr, kP, cP, dt);
      [v.s, v.vs] = springAxis(v.s, v.vs, ts, 260, 18, dt);
      [v.f, v.vf] = springAxis(v.f, v.vf, v.tf, 140, 17, dt);
      [v.sx, v.vsx] = springAxis(v.sx, v.vsx, 1, 420, 11, dt);
      [v.sy, v.vsy] = springAxis(v.sy, v.vsy, 1, 420, 11, dt);
      [v.hx, v.vhx] = springAxis(v.hx, v.vhx, hov ? v.thx : 0, 220, 20, dt);
      [v.hy, v.vhy] = springAxis(v.hy, v.vhy, hov ? v.thy : 0, 220, 20, dt);
      // idle float + lean into motion (velocity-based tilt)
      const fl = v.float && !reduced ? Math.sin(time * 1.7 + v.idle) * 3 : 0, fr = v.float && !reduced ? Math.sin(time * 1.2 + v.idle) * .5 : 0;
      const lean = Math.max(-18, Math.min(18, v.vx * .02));
      const lift = Math.max(0, (v.ty - v.y) + (hov ? 16 : 0));
      v.root.style.transform = `translate3d(${v.x.toFixed(2)}px,${(v.y + fl).toFixed(2)}px,0) rotate(${(v.r + fr + lean).toFixed(2)}deg) scale(${v.s.toFixed(3)})`;
      v.root.style.zIndex = hov ? 99 : v.z;
      v.root.style.setProperty('--lift', (lift + (v.s - 1) * 200).toFixed(1));
      v.tilt.style.transform = `perspective(800px) rotateX(${v.hx.toFixed(2)}deg) rotateY(${v.hy.toFixed(2)}deg) scale(${v.sx.toFixed(3)},${v.sy.toFixed(3)})`;
      v.flip.style.transform = `rotateY(${v.f.toFixed(2)}deg)`;
      if (v.opacity !== v._op) { v.root.style.opacity = v.opacity; v._op = v.opacity; }
    }
  }
  // centre point of a view in stage coordinates
  function center(v) { return { x: v.x + L.cw / 2, y: v.y + L.ch / 2 }; }
  U.cards = {
    views, create, target, squash, stretch, destroy, layoutHand, handSlot, center,
    get layout() { return L; },
    setLayout(l) { L = l; const h = host(); h.style.setProperty('--cw', L.cw + 'px'); h.style.setProperty('--ch', L.ch + 'px'); },
    onClick(fn) { onClick = fn; }, onHover(fn) { onHover = fn; },
    setReduced(r) { reduced = r; }, setSpeed(s) { speed = s; },
    start() { requestAnimationFrame(frame); },
  };
})(window.UHP);
