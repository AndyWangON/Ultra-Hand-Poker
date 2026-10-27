// Ultra Hand Poker logo + chips + emblem SVG generator
const fs = require('fs');
const { textPath, suit, SUIT_PATH, font } = require('./lib');
const UI = '/home/claude/uhp/assets/ui';
fs.mkdirSync(UI, { recursive: true });

function chip(id, main, edge = '#f4e6c2', size = 200, { emblem = true } = {}) {
  const c = size / 2; const r = c - 4;
  let stripes = '';
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    stripes += `<rect x="${-r * 0.13}" y="${-r}" width="${r * 0.26}" height="${r * 0.2}" fill="${edge}" transform="translate(${c} ${c}) rotate(${i * 45})"/>`;
  }
  return `<g>
  <defs><radialGradient id="${id}g" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
  <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe7a6"/><stop offset=".5" stop-color="#d4a03a"/><stop offset="1" stop-color="#7d5514"/></linearGradient></defs>
  <circle cx="${c}" cy="${c}" r="${r}" fill="${main}" stroke="#0006" stroke-width="2"/>
  ${stripes}
  <circle cx="${c}" cy="${c}" r="${r * 0.72}" fill="none" stroke="url(#${id}r)" stroke-width="${r * 0.06}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.62}" fill="${main}" stroke="#0005" stroke-width="1.5"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.62}" fill="none" stroke="${edge}" stroke-width="${r * 0.025}" stroke-dasharray="${r * 0.05} ${r * 0.07}"/>
  ${emblem ? suit('S', c, c - r * 0.02, r * 0.62, { fill: `url(#${id}r)` }) : ''}
  <circle cx="${c}" cy="${c}" r="${r}" fill="url(#${id}g)"/>
  </g>`;
}
const chipColors = { red: '#b3122a', blue: '#1d3f92', black: '#17171a', green: '#11683a', gold: '#c48a1c' };
for (const [k, v] of Object.entries(chipColors)) fs.writeFileSync(`${UI}/chip_${k}_blank.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">${chip('b' + k, v, k === 'gold' ? '#2a1a08' : '#f4e6c2', 200, { emblem: false })}</svg>`);
for (const [k, v] of Object.entries(chipColors)) {
  fs.writeFileSync(`${UI}/chip_${k}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">${chip('c' + k, v, k === 'gold' ? '#2a1a08' : '#f4e6c2')}</svg>`);
}

// ---------- Logo ----------
const LW = 900, LH = 340;
function arcText(fontName, str, cx, baseY, size, radius, { scaleX = 1, spacing = 0 } = {}) {
  // place each glyph along a circle (center below text) for a gentle arch
  const f = font(fontName); const sc = size / f.unitsPerEm;
  const glyphs = [...str].map(ch => f.charToGlyph(ch));
  const widths = glyphs.map(g => g.advanceWidth * sc * scaleX);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (glyphs.length - 1);
  let x = -total / 2; let out = '';
  glyphs.forEach((g, i) => {
    const w = widths[i]; const mid = x + w / 2;
    const ang = mid / radius; // radians
    const px = cx + Math.sin(ang) * radius, py = baseY + radius - Math.cos(ang) * radius;
    const t = textPath(fontName, [...str][i], 0, 0, size, { anchor: 'middle', scaleX });
    out += `<path d="${t.d}" transform="translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${(ang * 180 / Math.PI).toFixed(2)})"/>`;
    x += w + spacing;
  });
  return out;
}
const title = arcText('alfa', 'ULTRA HAND', 450, 240, 134, 4200, { scaleX: 0.66, spacing: 3 });
const poker = textPath('mont', 'POKER', 450, 300, 42, { anchor: 'middle', letterSpacing: 16 });
function miniCard(x, y, rot, rank, s, red) {
  const col = red ? '#c4122f' : '#15161a';
  const t = textPath('slab', rank, 22, 40, 30, { anchor: 'middle', scaleX: .9 });
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-55" y="-75" width="110" height="150" rx="10" fill="url(#lcard)" stroke="#b9a983" stroke-width="2"/>
  <g transform="translate(-55 -75)"><path d="${t.d}" fill="${col}"/>${suit(s, 22, 56, 18)}${suit(s, 66, 82, 46)}</g></g>`;
}
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LW} ${LH}" width="${LW}" height="${LH}">
<defs>
 <linearGradient id="lcard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#e8dcc0"/></linearGradient>
 <linearGradient id="tgold" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#fff4b8"/><stop offset=".28" stop-color="#ffcc45"/><stop offset=".47" stop-color="#f09d16"/>
  <stop offset=".53" stop-color="#9c4f06"/><stop offset=".7" stop-color="#e2911c"/><stop offset="1" stop-color="#ffd66e"/></linearGradient>
 <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".5" stop-color="#c88a26"/><stop offset="1" stop-color="#6e430c"/></linearGradient>
 <linearGradient id="plaque" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a30"/><stop offset=".5" stop-color="#0c0c10"/><stop offset="1" stop-color="#050507"/></linearGradient>
 <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e9e6df"/><stop offset="1" stop-color="#b7b0a2"/></linearGradient>
 <radialGradient id="emb" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#4a4a52"/><stop offset=".6" stop-color="#121216"/><stop offset="1" stop-color="#000"/></radialGradient>
 <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf6a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient>
 <filter id="bevel" x="-10%" y="-20%" width="120%" height="140%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b"/>
  <feSpecularLighting in="b" surfaceScale="3.2" specularConstant=".9" specularExponent="30" lighting-color="#fff6d8" result="s"><feDistantLight azimuth="235" elevation="48"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
  <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".38" k4="0"/>
 </filter>
 <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".75"/></filter>
 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>
<ellipse cx="450" cy="150" rx="380" ry="140" fill="url(#halo)"/>
<!-- fanned cards -->
<g filter="url(#shadow)">
 ${miniCard(300, 95, -24, 'A', 'H', true)}${miniCard(360, 72, -12, 'A', 'S', false)}
 ${miniCard(540, 72, 12, 'A', 'D', true)}${miniCard(600, 95, 24, 'A', 'C', false)}
</g>
<!-- spade emblem -->
<g filter="url(#shadow)" transform="translate(450 70)">
 <g transform="scale(1.25) translate(-50 -52)"><path d="${SUIT_PATH.S}" fill="url(#rim)"/></g>
 <g transform="scale(1.06) translate(-50 -51)"><path d="${SUIT_PATH.S}" fill="url(#emb)"/></g>
 <path d="M-14 -22 C-6 -30 0 -36 0 -44 C2 -36 10 -30 16 -24" stroke="#ffffff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>
<!-- chips -->
<g filter="url(#shadow)">
 <g transform="translate(58 112) rotate(-18) scale(.62)">${chip('l1', '#1d3f92')}</g>
 <g transform="translate(10 176) rotate(-8) scale(.56)">${chip('l2', '#17171a')}</g>
 <g transform="translate(718 110) rotate(14) scale(.62)">${chip('r1', '#17171a')}</g>
 <g transform="translate(778 176) rotate(8) scale(.56)">${chip('r2', '#b3122a')}</g>
</g>
<!-- title -->
<g filter="url(#shadow)">
 <g fill="#2a1203" stroke="#2a1203" stroke-width="18" stroke-linejoin="round" transform="translate(0 9)">${title}</g>
 <g fill="#7a3f0a" stroke="#7a3f0a" stroke-width="10" stroke-linejoin="round" transform="translate(0 6)">${title}</g>
 <g fill="#5b2c06" stroke="#3a1a04" stroke-width="10" stroke-linejoin="round">${title}</g>
 <g fill="none" stroke="url(#rim)" stroke-width="4" stroke-linejoin="round">${title}</g>
 <g fill="url(#tgold)" filter="url(#bevel)">${title}</g>
</g>
<!-- POKER plaque -->
<g filter="url(#shadow)">
 <path d="M250 262 L640 262 L668 290 L640 318 L250 318 L222 290Z" fill="url(#rim)"/>
 <path d="M255 267 L635 267 L660 290 L635 313 L255 313 L230 290Z" fill="url(#plaque)"/>
 <path d="M262 272 L628 272 L650 290 L628 308 L262 308 L240 290Z" fill="none" stroke="#c99a3a" stroke-width="1.2" opacity=".7"/>
 <path d="M206 290 l10 -7 l10 7 l-10 7Z M674 290 l10 -7 l10 7 l-10 7Z" fill="url(#rim)"/>
 <path d="${poker.d}" fill="url(#silver)"/>
</g>
<g fill="#fff8dc">
 <path d="M168 120 l3 10 l10 3 l-10 3 l-3 10 l-3 -10 l-10 -3 l10 -3Z" opacity=".9"/>
 <path d="M735 238 l2.4 8 l8 2.4 l-8 2.4 l-2.4 8 l-2.4 -8 l-8 -2.4 l8 -2.4Z" opacity=".85"/>
 <path d="M612 150 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2Z" opacity=".8"/>
</g>
</svg>`;
fs.writeFileSync(`${UI}/logo.svg`, logo);

// ---------- Small ULTRA emblem (bottom-left brand mark) ----------
const ul = textPath('cinzel', 'ULTRA', 100, 150, 34, { anchor: 'middle', letterSpacing: 3 });
const sub1 = textPath('mont7', 'MORE THAN', 100, 182, 13, { anchor: 'middle', letterSpacing: 3 });
const sub2 = textPath('mont7', 'JUST A HAND', 100, 200, 13, { anchor: 'middle', letterSpacing: 3 });
fs.writeFileSync(`${UI}/emblem.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 210" width="200" height="210">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe7a6"/><stop offset=".5" stop-color="#d5a23c"/><stop offset="1" stop-color="#8a5f17"/></linearGradient></defs>
<g transform="translate(100 62)"><g transform="scale(.9) translate(-50 -52)"><path d="${SUIT_PATH.S}" fill="none" stroke="url(#g)" stroke-width="4"/></g>
<g transform="scale(.55) translate(-50 -52)"><path d="${SUIT_PATH.S}" fill="url(#g)"/></g></g>
<path d="M40 112 H160" stroke="url(#g)" stroke-width="1.5"/>
<path d="${ul.d}" fill="url(#g)"/><path d="${sub1.d}" fill="#cdb98a"/><path d="${sub2.d}" fill="#cdb98a"/></svg>`);
console.log('logo ok');
