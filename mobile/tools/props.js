// Hand reference icons, chip stacks, glass, UI icons
const fs = require('fs');
const { textPath, suit, suitColor, SUIT_PATH } = require('./lib');
const ROOT = '/home/claude/uhp/assets';
fs.mkdirSync(`${ROOT}/hands`, { recursive: true }); fs.mkdirSync(`${ROOT}/ui/icons`, { recursive: true });

// ---------- hand icons ----------
const HANDS = {
  royal_flush: [['10', 'S'], ['J', 'S'], ['Q', 'S'], ['K', 'S'], ['A', 'S']],
  straight_flush: [['6', 'H'], ['7', 'H'], ['8', 'H'], ['9', 'H'], ['10', 'H']],
  four_of_a_kind: [['A', 'S'], ['A', 'H'], ['A', 'D'], ['A', 'C'], ['K', 'S', 1]],
  full_house: [['K', 'S'], ['K', 'H'], ['K', 'D'], ['Q', 'C'], ['Q', 'H']],
  flush: [['A', 'H'], ['K', 'H'], ['J', 'H'], ['9', 'H'], ['5', 'H']],
  straight: [['6', 'C'], ['7', 'D'], ['8', 'S'], ['9', 'H'], ['10', 'C']],
  three_of_a_kind: [['Q', 'S'], ['Q', 'H'], ['Q', 'D'], ['7', 'C', 1], ['2', 'H', 1]],
  two_pair: [['J', 'S'], ['J', 'H'], ['8', 'C'], ['8', 'D'], ['3', 'H', 1]],
  pair: [['A', 'S'], ['A', 'H'], ['7', 'C', 1], ['5', 'D', 1], ['2', 'S', 1]],
  high_card: [['A', 'S'], ['J', 'D', 1], ['8', 'C', 1], ['5', 'H', 1], ['3', 'S', 1]],
};
function mini(rank, s, dim) {
  const col = suitColor(s);
  const t = textPath('slab', rank, 13, 22, 19, { anchor: 'middle', scaleX: rank === '10' ? .62 : .9, letterSpacing: rank === '10' ? -1 : 0 });
  return `<rect x="0" y="0" width="50" height="72" rx="6" fill="url(#mp)" stroke="#a8946a" stroke-width="1.2"/>
  <path d="${t.d}" fill="${col}"/>${suit(s, 13, 32, 11)}${suit(s, 32, 52, 22)}
  ${dim ? '<rect x="0" y="0" width="50" height="72" rx="6" fill="#0d0d12" opacity=".42"/>' : ''}`;
}
for (const [slug, cards] of Object.entries(HANDS)) {
  const parts = cards.map(([r, s, dim], i) => {
    const ang = (i - 2) * 9, tx = 40 + i * 30, ty = 24 + Math.abs(i - 2) * 3.5;
    return `<g transform="translate(${tx} ${ty}) rotate(${ang} 25 72)" filter="url(#ds)">${mini(r, s, dim)}</g>`;
  }).join('');
  fs.writeFileSync(`${ROOT}/hands/${slug}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="14 6 208 104" width="208" height="104">
<defs><linearGradient id="mp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf5"/><stop offset="1" stop-color="#ebdfc4"/></linearGradient>
<filter id="ds" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="1.5" dy="2" stdDeviation="1.6" flood-opacity=".55"/></filter></defs>${parts}</svg>`);
}

// ---------- chip stacks (3/4 view) ----------
function chipStack(main, edge, n, id) {
  const cx = 70, rx = 60, ry = 24, h = 11; let out = '';
  const top0 = 30 + n * h;
  for (let i = 0; i < n; i++) {
    const y = top0 - i * h; // y of top face center of this chip
    let stripes = '';
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k + .5 + (i % 2) * .5) * Math.PI / 6 * 2; const sx = cx + Math.cos(a) * rx; if (Math.sin(a) > 0.02) stripes += `<rect x="${(sx - 6 * Math.abs(Math.sin(a))).toFixed(1)}" y="${(y + ry * Math.sin(a)).toFixed(1)}" width="${(12 * Math.abs(Math.sin(a))).toFixed(1)}" height="${h}" fill="${edge}"/>`; }
    out += `<path d="M${cx - rx} ${y} v${h} a${rx} ${ry} 0 0 0 ${rx * 2} 0 v-${h}Z" fill="${main}"/>${stripes}
    <path d="M${cx - rx} ${y} v${h} a${rx} ${ry} 0 0 0 ${rx * 2} 0 v-${h}" fill="url(#${id}side)"/>`;
    if (i === n - 1 || true) out += `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="${main}" stroke="#0005"/>`;
  }
  const ty = top0 - (n - 1) * h;
  out += `<ellipse cx="${cx}" cy="${ty}" rx="${rx * .74}" ry="${ry * .74}" fill="none" stroke="${edge}" stroke-width="2.5" stroke-dasharray="6 7"/>
  <ellipse cx="${cx}" cy="${ty}" rx="${rx * .6}" ry="${ry * .6}" fill="#0002" stroke="#e4b85a" stroke-width="2"/>
  <g transform="translate(${cx} ${ty}) scale(1 .4)">${suit('S', 0, 0, 34, { fill: '#e4b85a' })}</g>
  <ellipse cx="${cx}" cy="${ty}" rx="${rx}" ry="${ry}" fill="url(#${id}top)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 ${top0 + 40}" width="140" height="${top0 + 40}">
<defs><linearGradient id="${id}side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity=".15"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
<radialGradient id="${id}top" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs>${out}</svg>`;
}
fs.writeFileSync(`${ROOT}/ui/chipstack_black.svg`, chipStack('#17171a', '#e9dcc0', 12, 'k'));
fs.writeFileSync(`${ROOT}/ui/chipstack_red.svg`, chipStack('#b3122a', '#f4e6c2', 9, 'r'));
fs.writeFileSync(`${ROOT}/ui/chipstack_blue.svg`, chipStack('#1d3f92', '#f4e6c2', 7, 'b'));
fs.writeFileSync(`${ROOT}/ui/chipstack_gold.svg`, chipStack('#c48a1c', '#2a1a08', 5, 'g'));

// ---------- whisky glass ----------
fs.writeFileSync(`${ROOT}/ui/glass.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140">
<defs><linearGradient id="gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".2" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>
<linearGradient id="wh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3a43a" stop-opacity=".9"/><stop offset="1" stop-color="#7a3a08" stop-opacity=".95"/></linearGradient></defs>
<path d="M14 62 L106 62 L100 128 Q100 134 92 134 L28 134 Q20 134 20 128Z" fill="url(#wh)"/>
<ellipse cx="60" cy="62" rx="46" ry="8" fill="#ffc46a" opacity=".85"/>
<rect x="38" y="44" width="30" height="26" rx="4" fill="#fff" opacity=".25" transform="rotate(-12 53 57)"/>
<path d="M8 10 L112 10 L100 128 Q100 136 90 136 L30 136 Q20 136 20 128Z" fill="url(#gl)" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
<ellipse cx="60" cy="10" rx="52" ry="7" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>
<path d="M22 20 L30 124" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/></svg>`);

// ---------- UI icons (gold) ----------
const G = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".55" stop-color="#e2ad45"/><stop offset="1" stop-color="#a8701c"/></linearGradient></defs>`;
const icon = (name, body, vb = '0 0 48 48') => fs.writeFileSync(`${ROOT}/ui/icons/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="48" height="48">${G}${body}</svg>`);
const q = textPath('slab9', '?', 24, 33, 28, { anchor: 'middle' });
icon('help', `<circle cx="24" cy="24" r="20" fill="url(#g)"/><path d="${q.d}" fill="#1a1206"/>`);
icon('sound_on', `<path d="M6 18h8l11-9v30l-11-9H6z" fill="url(#g)"/><path d="M31 16q6 8 0 16M36 11q11 13 0 26" fill="none" stroke="url(#g)" stroke-width="3.6" stroke-linecap="round"/>`);
icon('sound_off', `<path d="M6 18h8l11-9v30l-11-9H6z" fill="url(#g)"/><path d="M31 17l13 14M44 17L31 31" stroke="url(#g)" stroke-width="3.6" stroke-linecap="round"/>`);
let gear = ''; for (let i = 0; i < 8; i++) gear += `<rect x="20.5" y="2" width="7" height="10" rx="1.6" transform="rotate(${i * 45} 24 24)"/>`;
icon('settings', `<g fill="url(#g)">${gear}<circle cx="24" cy="24" r="15"/></g><circle cx="24" cy="24" r="6.5" fill="#15110a"/>`);
icon('trophy', `<path d="M14 6h20v10a10 10 0 0 1-20 0z" fill="url(#g)"/><path d="M14 9H7q0 10 9 12M34 9h7q0 10-9 12" fill="none" stroke="url(#g)" stroke-width="3"/><rect x="21" y="25" width="6" height="9" fill="url(#g)"/><path d="M14 42h20l-3-8H17z" fill="url(#g)"/><path d="M20 10v7" stroke="#fff6" stroke-width="2.4" stroke-linecap="round"/>`);
icon('deck', `<rect x="6" y="9" width="22" height="32" rx="3" fill="#1c2c57" stroke="#7fb2ff" stroke-width="2" transform="rotate(-14 17 25)"/><rect x="18" y="7" width="22" height="32" rx="3" fill="#24376c" stroke="#9cc6ff" stroke-width="2" transform="rotate(8 29 23)"/><path d="M29 15l3 6-3 6-3-6z" fill="#9cc6ff" transform="rotate(8 29 23)"/>`);
icon('discard', `<rect x="5" y="10" width="22" height="30" rx="3" fill="#122a5c" stroke="#bfe0ff" stroke-width="2.4" transform="rotate(-16 16 25)"/><rect x="19" y="8" width="22" height="30" rx="3" fill="#1d3f86" stroke="#e1f1ff" stroke-width="2.4" transform="rotate(10 30 23)"/>`);
icon('spade', `${suit('S', 24, 24, 40, { fill: '#17130a' })}`);
icon('refresh', `<path d="M38 20A15 15 0 1 0 39 28" fill="none" stroke="#ff8a7a" stroke-width="4.4" stroke-linecap="round"/><path d="M41 9v13H28z" fill="#ff8a7a"/>`);
console.log('props ok');
