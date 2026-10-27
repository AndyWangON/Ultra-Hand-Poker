/* Ultra Hand Poker — particles, screen shake, flashes, floaters, ambient dust */
(function (U) {
  const $ = id => document.getElementById(id);
  const img = src => { const i = new Image(); i.src = src; return i; };
  const SPR = { spark: img('assets/ui/fx_spark.png'), star: img('assets/ui/fx_star.png'), coin: img('assets/ui/fx_coin.png'), ring: img('assets/ui/fx_ring.png'), smoke: img('assets/ui/fx_smoke.png') };
  let cv, ctx, amb, actx, parts = [], dust = [], orbs = [], trauma = 0, last = 0, W = 1080, H = 2340;
  const opts = { shake: true, reduced: false };
  const rand = (a, b) => a + Math.random() * (b - a);
  const GOLDS = ['#ffe08a', '#ffd04a', '#fff3c2', '#f0a82a', '#ffffff'];
  const CONF = ['#ffd04a', '#ff4a5a', '#4cc9ff', '#3fe07c', '#ffffff', '#c77dff'];

  function spawn(p) { parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: .985, life: 1, age: 0, size: 20, rot: 0, vr: 0, kind: 'spark', alpha: 1, color: '#fff', add: true, shrink: true }, p)); }
  function burst(x, y, o = {}) {
    const n = opts.reduced ? Math.ceil((o.count || 20) / 3) : (o.count || 20);
    for (let i = 0; i < n; i++) {
      const a = o.dir != null ? o.dir + rand(-(o.spread || Math.PI), (o.spread || Math.PI)) : rand(0, Math.PI * 2);
      const sp = rand(o.speedMin || 80, o.speed || 520);
      const kind = o.kind || (Math.random() < .3 ? 'star' : 'spark');
      spawn({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.gravity ?? 260, life: rand(.5, o.life || 1.1), size: rand(o.sizeMin || 10, o.size || 34), kind, rot: rand(0, 6), vr: rand(-6, 6), drag: o.drag || .965 });
    }
  }
  function confetti(x, y, n = 60, spread = 1) {
    if (opts.reduced) n = Math.ceil(n / 3);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + rand(-1.2, 1.2) * spread, sp = rand(300, 900);
      spawn({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 900, drag: .975, life: rand(1.4, 2.4), size: rand(8, 16), kind: 'conf', color: CONF[i % CONF.length], rot: rand(0, 6), vr: rand(-12, 12), add: false, shrink: false, flip: rand(0, 6), vf: rand(6, 14) });
    }
  }
  function coins(x, y, n = 30, o = {}) {
    if (opts.reduced) n = Math.ceil(n / 3);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + rand(-o.spread || -1, o.spread || 1), sp = rand(o.speedMin || 400, o.speed || 1000);
      spawn({ x: x + rand(-20, 20), y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 1500, drag: .99, life: rand(1.2, 2), size: rand(26, 44), kind: 'coin', add: false, shrink: false, flip: rand(0, 6), vf: rand(8, 18) });
    }
  }
  function coinRain(n = 80) { for (let i = 0; i < n; i++) setTimeout(() => spawn({ x: rand(0, W), y: -40, vx: rand(-60, 60), vy: rand(100, 400), g: 900, drag: .995, life: 2.6, size: rand(26, 46), kind: 'coin', add: false, shrink: false, flip: rand(0, 6), vf: rand(8, 18) }), i * 22); }
  function ring(x, y, scale = 1, life = .6) { spawn({ x, y, kind: 'ring', life, size: 40 * scale, grow: 900 * scale, add: true, shrink: false }); }
  // golden orb that flies from a to b, trailing sparks
  function orb(ax, ay, bx, by, dur = 520, onArrive) {
    const o = { ax, ay, bx, by, cx: (ax + bx) / 2 + rand(-200, 200), cy: Math.min(ay, by) - 220, t: 0, dur: dur / 1000, done: false };
    o.arrive = () => { if (o.done) return; o.done = true; clearTimeout(o.timer); const i = orbs.indexOf(o); if (i >= 0) orbs.splice(i, 1); try { onArrive && onArrive(); } catch (e) { console.error(e); } };
    o.timer = setTimeout(o.arrive, dur + 500); // fallback if animation frames are paused
    orbs.push(o);
  }
  function shake(amount = .3) { if (opts.shake && !opts.reduced) trauma = Math.min(1, trauma + amount); }
  function flash() { const f = $('flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
  function pulseWorld() { const w = $('world'); w.classList.remove('pulse'); void w.offsetWidth; w.classList.add('pulse'); }
  function floater(text, x, y, cls = '') {
    const el = document.createElement('div'); el.className = 'floater ' + cls; el.textContent = text; el.style.left = x + 'px'; el.style.top = y + 'px';
    $('floaters').appendChild(el); setTimeout(() => el.remove(), 1100);
  }

  const ready = im => im && im.complete && im.naturalWidth > 0;
  function step(t) {
    requestAnimationFrame(step);
    try { frame(t); } catch (err) { console.error('[UHP] fx frame error', err); parts = []; }
  }
  function frame(t) {
    const dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
    ctx.clearRect(0, 0, cv.width, cv.height);
    // orbs
    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i]; o.t += dt / o.dur; const k = Math.min(1, o.t), e = k * k * (3 - 2 * k);
      const x = (1 - e) * (1 - e) * o.ax + 2 * (1 - e) * e * o.cx + e * e * o.bx, y = (1 - e) * (1 - e) * o.ay + 2 * (1 - e) * e * o.cy + e * e * o.by;
      for (let j = 0; j < 3; j++) spawn({ x: x + rand(-6, 6), y: y + rand(-6, 6), vx: rand(-40, 40), vy: rand(-40, 40), life: rand(.25, .5), size: rand(14, 30), kind: 'spark' });
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1; if (ready(SPR.spark)) ctx.drawImage(SPR.spark, x - 40, y - 40, 80, 80); if (ready(SPR.star)) ctx.drawImage(SPR.star, x - 30, y - 30, 60, 60);
      if (k >= 1) o.arrive();
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.age += dt; if (p.age >= p.life) { parts.splice(i, 1); continue; }
      p.vx *= Math.pow(p.drag, dt * 60); p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const k = p.age / p.life, a = p.kind === 'conf' || p.kind === 'coin' ? (k > .8 ? (1 - k) / .2 : 1) : 1 - k * k;
      ctx.globalAlpha = Math.max(0, a); ctx.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
      let s = p.shrink ? p.size * (1 - k * .6) : p.size;
      if (p.kind === 'ring') { s = p.size + p.grow * (1 - Math.pow(1 - k, 2)); ctx.globalAlpha = .8 * (1 - k); if (ready(SPR.ring)) ctx.drawImage(SPR.ring, p.x - s / 2, p.y - s / 2, s, s); continue; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.kind === 'conf') { p.flip += p.vf * dt; ctx.scale(1, Math.cos(p.flip)); ctx.fillStyle = p.color; ctx.fillRect(-s / 2, -s / 4, s, s / 2); }
      else if (p.kind === 'coin') { p.flip += p.vf * dt; ctx.scale(Math.max(.08, Math.abs(Math.cos(p.flip))), 1); if (ready(SPR.coin)) ctx.drawImage(SPR.coin, -s / 2, -s / 2, s, s); }
      else { const im = SPR[p.kind] || SPR.spark; if (ready(im)) ctx.drawImage(im, -s / 2, -s / 2, s, s); }
      ctx.restore();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // shake (trauma model)
    const w = $('world');
    if (trauma > 0) {
      trauma = Math.max(0, trauma - dt * 1.6); const s = trauma * trauma;
      w.style.transform = `translate(${(Math.random() * 2 - 1) * 26 * s}px,${(Math.random() * 2 - 1) * 20 * s}px) rotate(${(Math.random() * 2 - 1) * 1.1 * s}deg)`;
    } else if (w.style.transform) w.style.transform = '';
    // ambient dust
    if (actx && !opts.reduced) {
      actx.clearRect(0, 0, amb.width, amb.height);
      for (const d of dust) {
        d.x += d.vx * dt; d.y += d.vy * dt; d.ph += dt * d.f;
        if (d.y < -10) { d.y = amb.height + 10; d.x = rand(0, amb.width); }
        if (d.x < -10) d.x = amb.width + 10; if (d.x > amb.width + 10) d.x = -10;
        actx.globalAlpha = d.a * (.5 + .5 * Math.sin(d.ph)); if (ready(SPR.spark)) actx.drawImage(SPR.spark, d.x - d.s / 2, d.y - d.s / 2, d.s, d.s);
      }
    }
  }
  function resize(w, h) { W = w; H = h; cv.width = w; cv.height = h; if (amb) { amb.width = w; amb.height = h; } }
  function init() {
    cv = $('fx'); ctx = cv.getContext('2d'); amb = $('ambient'); actx = amb.getContext('2d');
    for (let i = 0; i < 80; i++) dust.push({ x: rand(0, 1080), y: rand(0, 1100), vx: rand(-8, 8), vy: rand(-14, -4), s: rand(4, 14), a: rand(.15, .55), ph: rand(0, 6), f: rand(.5, 2) });
    requestAnimationFrame(step);
  }
  U.fx = { init, burst, confetti, coins, coinRain, ring, orb, shake, flash, pulseWorld, floater, resize, opts, GOLDS };
})(window.UHP);
