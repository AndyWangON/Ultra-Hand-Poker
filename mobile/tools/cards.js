// Generates 52 card faces + back as SVG into assets/cards
const fs = require('fs');
const { textPath, suit, suitColor, RED, BLACK, SUIT_PATH } = require('./lib');
const OUT = process.argv[2] || '/home/claude/uhp/assets/cards';
fs.mkdirSync(OUT, { recursive: true });
const W = 300, H = 420;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['S', 'H', 'D', 'C'];
const INK = '#2a1a12';
const P = { red: '#c0182d', redD: '#8e0f1f', blue: '#21408e', blueD: '#152a63', gold: '#e2a92c', goldL: '#f7d47c', goldD: '#a8761a', black: '#1b1b1f', skin: '#f6d5b0', skinD: '#e2b38a', white: '#fbf6ea', grey: '#dcd6ca', brown: '#7a4520', blond: '#e8b64a', green: '#5d8a2a', silver: '#d7dde4' };

function defs(id) {
  return `<defs>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset=".55" stop-color="#fbf4e3"/><stop offset="1" stop-color="#efe3c8"/></linearGradient>
  <radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#6b4a1a" stop-opacity=".16"/></radialGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe39a"/><stop offset=".5" stop-color="#e0a62c"/><stop offset="1" stop-color="#a8701a"/></linearGradient>
  <linearGradient id="goldH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b07a1e"/><stop offset=".5" stop-color="#f9dd8c"/><stop offset="1" stop-color="#b07a1e"/></linearGradient>
  <linearGradient id="blade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa3ad"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#8d96a0"/></linearGradient>
  <linearGradient id="shadeR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
  <pattern id="lattice" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${P.gold}"/><path d="M6 0L12 6L6 12L0 6Z" fill="none" stroke="${P.goldD}" stroke-width="1.2"/><circle cx="6" cy="6" r="1.6" fill="${P.red}"/></pattern>
  <pattern id="latticeB" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${P.gold}"/><path d="M6 0L12 6L6 12L0 6Z" fill="none" stroke="${P.goldD}" stroke-width="1.2"/><circle cx="6" cy="6" r="1.6" fill="${P.blue}"/></pattern>
  <pattern id="stripeR" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${P.red}"/><rect width="4" height="10" fill="${P.gold}"/></pattern>
  <pattern id="stripeB" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${P.blue}"/><rect width="4" height="10" fill="${P.gold}"/></pattern>
  <pattern id="ermine" width="14" height="10" patternUnits="userSpaceOnUse"><rect width="14" height="10" fill="${P.white}"/><path d="M4 2 l1.5 4 l1.5 -4 M5.5 6 v2" stroke="#111" stroke-width="1.4" fill="none"/></pattern>
  <pattern id="frameBg" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f8ecc9"/><path d="M0 8L8 0" stroke="#ead9a6" stroke-width="1"/></pattern>
  <clipPath id="cframe"><rect x="64" y="58" width="172" height="304" rx="6"/></clipPath>
  <clipPath id="chalf"><rect x="64" y="58" width="172" height="152"/></clipPath>
</defs>`;
}
function base(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}
<rect x="2" y="2" width="296" height="416" rx="20" fill="url(#paper)"/>
<rect x="2" y="2" width="296" height="416" rx="20" fill="url(#vig)"/>
${inner}
<rect x="2" y="2" width="296" height="416" rx="20" fill="none" stroke="#c9b993" stroke-width="2.5"/>
<rect x="9" y="9" width="282" height="402" rx="14" fill="none" stroke="#e6d6ad" stroke-width="1.2"/>
</svg>`;
}
function index(rank, s) {
  const col = suitColor(s);
  const sx = rank === '10' ? 0.66 : 0.88;
  const t = textPath('slab', rank, 34, 70, 60, { anchor: 'middle', scaleX: sx, letterSpacing: rank === '10' ? -3 : 0 });
  const one = `<path d="${t.d}" fill="${col}"/>${suit(s, 34, 98, 28)}`;
  return `<g>${one}</g><g transform="rotate(180 150 210)">${one}</g>`;
}
const L = 92, M = 150, R = 208, T = 92, B = 328;
const LAYOUT = {
  2: [[M, 0], [M, 1]], 3: [[M, 0], [M, .5], [M, 1]], 4: [[L, 0], [R, 0], [L, 1], [R, 1]],
  5: [[L, 0], [R, 0], [M, .5], [L, 1], [R, 1]], 6: [[L, 0], [R, 0], [L, .5], [R, .5], [L, 1], [R, 1]],
  7: [[L, 0], [R, 0], [M, .25], [L, .5], [R, .5], [L, 1], [R, 1]],
  8: [[L, 0], [R, 0], [M, .25], [L, .5], [R, .5], [M, .75], [L, 1], [R, 1]],
  9: [[L, 0], [R, 0], [L, 1 / 3], [R, 1 / 3], [M, .5], [L, 2 / 3], [R, 2 / 3], [L, 1], [R, 1]],
  10: [[L, 0], [R, 0], [M, 1 / 6], [L, 1 / 3], [R, 1 / 3], [L, 2 / 3], [R, 2 / 3], [M, 5 / 6], [L, 1], [R, 1]],
};
function pips(n, s) {
  const h = n >= 9 ? 58 : 64;
  return LAYOUT[n].map(([x, f]) => { const y = T + (B - T) * f; return suit(s, x, y, h, { flip: f > .5 }); }).join('');
}
function ace(s) {
  if (s === 'S') {
    // ornate ace of spades
    const k = 2.1;
    const t = textPath('cinzel', 'ULTRA', 150, 336, 22, { anchor: 'middle', letterSpacing: 6 });
    const orn = (m) => `<g transform="${m}"><path d="M30 120 C30 70 70 34 120 30" fill="none" stroke="#c99a3a" stroke-width="1.6"/><path d="M40 124 C42 82 76 44 118 40" fill="none" stroke="#c99a3a" stroke-width=".8"/><circle cx="120" cy="30" r="2.6" fill="#c99a3a"/><circle cx="30" cy="120" r="2.6" fill="#c99a3a"/></g>`;
    return `
    <g transform="translate(150 196)"><g transform="scale(${k}) translate(-50 -50)">
      <path d="${SUIT_PATH.S}" fill="${BLACK}"/>
      <path d="${SUIT_PATH.S}" fill="none" stroke="#c99a3a" stroke-width="1.1" transform="translate(50 50) scale(.82) translate(-50 -48)"/>
      <path d="${SUIT_PATH.S}" fill="none" stroke="#c99a3a" stroke-width=".7" transform="translate(50 50) scale(.62) translate(-50 -46)"/>
      <path d="M50 38 L53 50 L65 53 L53 56 L50 68 L47 56 L35 53 L47 50Z" fill="#e6bb55"/>
      <circle cx="50" cy="53" r="2.2" fill="#fff3c4"/>
    </g></g>
    <path d="${t.d}" fill="${BLACK}"/>
    <path d="M96 346 H204" stroke="#b8862a" stroke-width="1.5"/><path d="M110 352 H190" stroke="#b8862a" stroke-width="1"/>`;
  }
  return `<circle cx="150" cy="210" r="86" fill="none" stroke="#d9b765" stroke-width="2" opacity=".75"/>
  <circle cx="150" cy="210" r="78" fill="none" stroke="${suitColor(s)}" stroke-width="1" opacity=".35"/>
  ${suit(s, 150, 210, 120)}`;
}

// ---------- court figures (top half, local coords 172 x 152, origin at frame 64,58) ----------
const st = `stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"`;
function face(cx, cy, rx, ry, { lips = '#b5452f', lashes = false, cheeks = false } = {}) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${P.skin}" ${st}/>
  <path d="M${cx - rx + 3} ${cy + 2} C${cx - rx + 5} ${cy + ry - 2} ${cx + rx - 5} ${cy + ry - 2} ${cx + rx - 3} ${cy + 2}" fill="${P.skinD}" opacity=".35"/>
  <path d="M${cx - 12} ${cy - 7} Q${cx - 7} ${cy - 11} ${cx - 2} ${cy - 7} M${cx + 2} ${cy - 7} Q${cx + 7} ${cy - 11} ${cx + 12} ${cy - 7}" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M${cx - 11} ${cy - 3} Q${cx - 7} ${cy - 6} ${cx - 3} ${cy - 3} Q${cx - 7} ${cy - 1} ${cx - 11} ${cy - 3}Z M${cx + 3} ${cy - 3} Q${cx + 7} ${cy - 6} ${cx + 11} ${cy - 3} Q${cx + 7} ${cy - 1} ${cx + 3} ${cy - 3}Z" fill="#fff" stroke="${INK}" stroke-width="1"/>
  <circle cx="${cx - 7}" cy="${cy - 3.4}" r="1.6" fill="#2b3f7a"/><circle cx="${cx + 7}" cy="${cy - 3.4}" r="1.6" fill="#2b3f7a"/>
  ${lashes ? `<path d="M${cx - 12} ${cy - 4} l-2 -2 M${cx + 12} ${cy - 4} l2 -2" stroke="${INK}" stroke-width="1"/>` : ''}
  <path d="M${cx} ${cy - 3} L${cx - 2.5} ${cy + 6} Q${cx} ${cy + 8} ${cx + 2.5} ${cy + 6.5}" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>
  ${cheeks ? `<circle cx="${cx - 9}" cy="${cy + 5}" r="3.5" fill="#e88" opacity=".45"/><circle cx="${cx + 9}" cy="${cy + 5}" r="3.5" fill="#e88" opacity=".45"/>` : ''}
  <path d="M${cx - 4} ${cy + 11} Q${cx} ${cy + 14} ${cx + 4} ${cy + 11} Q${cx} ${cy + 12} ${cx - 4} ${cy + 11}Z" fill="${lips}" stroke="${lips}" stroke-width="1.2"/>`;
}
function king(pri, sec, priD, s) {
  const lat = pri === P.red ? 'latticeB' : 'lattice', stripe = sec === P.red ? 'stripeR' : 'stripeB';
  return `
  <!-- sword -->
  <path d="M138 4 L146 4 L146 112 L138 112Z" fill="url(#blade)" ${st}/><path d="M138 4 L142 -6 L146 4Z" fill="url(#blade)" ${st}/>
  <path d="M142 8 V108" stroke="#9aa3ad" stroke-width="1"/>
  <!-- robe -->
  <path d="M-4 152 L-4 118 C6 100 30 92 56 88 L120 88 C146 92 170 100 178 118 L178 152Z" fill="${pri}" ${st}/>
  <path d="M-4 152 L-4 124 C6 110 22 104 40 101 L52 152Z" fill="url(#${stripe})" ${st}/>
  <path d="M178 152 L178 124 C168 110 152 104 134 101 L122 152Z" fill="url(#${stripe})" ${st}/>
  <path d="M68 96 L108 96 L112 152 L64 152Z" fill="url(#${lat})" ${st}/>
  <path d="M52 152 L60 100 M124 152 L116 100" stroke="${P.gold}" stroke-width="4"/>
  <path d="M40 110 Q58 126 52 152 M136 110 Q118 126 124 152" stroke="${priD}" stroke-width="2" fill="none" opacity=".6"/>
  <!-- ermine collar -->
  <path d="M46 92 C60 80 116 80 130 92 C124 104 52 104 46 92Z" fill="url(#ermine)" ${st}/>
  <!-- hair -->
  <path d="M68 40 C56 46 54 68 60 86 C64 80 67 72 70 64Z M108 40 C120 46 122 68 116 86 C112 80 109 72 106 64Z" fill="${P.grey}" ${st}/>
  ${face(88, 60, 17, 21)}
  <!-- beard -->
  <path d="M71 64 C70 88 78 104 88 110 C98 104 106 88 105 64 C102 76 96 80 88 80 C80 80 74 76 71 64Z" fill="${P.grey}" ${st}/>
  <path d="M80 86 Q84 96 88 104 M96 86 Q92 96 88 104 M88 82 V104" stroke="#a9a294" stroke-width="1" fill="none"/>
  <path d="M75 72 C81 67 86 70 88 72 C90 70 95 67 101 72 C95 76 91 74 88 75 C85 74 81 76 75 72Z" fill="#b8b0a2" ${st}/>
  <!-- crown -->
  <path d="M68 34 C72 22 104 22 108 34Z" fill="${priD}" ${st}/>
  <path d="M64 36 L60 10 L73 22 L80 2 L88 18 L96 2 L103 22 L116 10 L112 36Z" fill="url(#gold)" ${st}/>
  <rect x="63" y="30" width="50" height="10" rx="2" fill="url(#goldH)" ${st}/>
  <circle cx="75" cy="35" r="2.8" fill="${P.red}"/><circle cx="88" cy="35" r="3.2" fill="${P.blue}"/><circle cx="101" cy="35" r="2.8" fill="${P.red}"/>
  <circle cx="60" cy="10" r="2.6" fill="${P.goldL}" ${st}/><circle cx="80" cy="2" r="2.6" fill="${P.goldL}" ${st}/><circle cx="96" cy="2" r="2.6" fill="${P.goldL}" ${st}/><circle cx="116" cy="10" r="2.6" fill="${P.goldL}" ${st}/>
  <!-- hilt + hand -->
  <rect x="124" y="110" width="36" height="7" rx="3" fill="url(#gold)" ${st}/>
  <rect x="138" y="117" width="8" height="22" fill="${P.brown}" ${st}/>
  <ellipse cx="142" cy="128" rx="9" ry="8" fill="${P.skin}" ${st}/>
  ${suit(s, 20, 20, 24)}`;
}
function queen(pri, sec, priD, s) {
  const lat = pri === P.red ? 'latticeB' : 'lattice';
  return `
  <!-- hair behind -->
  <path d="M70 40 C56 56 54 88 56 104 L72 100 C68 86 70 74 74 62Z M106 40 C120 56 122 88 120 104 L104 100 C108 86 106 74 102 62Z" fill="${P.blond}" ${st}/>
  <!-- gown -->
  <path d="M-4 152 L-4 126 C6 108 34 100 60 98 L116 98 C142 100 170 108 180 126 L180 152Z" fill="${pri}" ${st}/>
  <path d="M-4 152 L-4 128 C8 116 22 110 38 106 L54 152Z" fill="${sec}" ${st}/><path d="M180 152 L180 128 C168 116 154 110 138 106 L122 152Z" fill="${sec}" ${st}/>
  <path d="M38 106 L54 152 M138 106 L122 152" stroke="${P.gold}" stroke-width="4"/>
  <path d="M70 96 L106 96 L102 114 L74 114Z" fill="${P.skin}" ${st}/>
  <path d="M74 114 L102 114 L110 152 L66 152Z" fill="url(#${lat})" ${st}/>
  <path d="M70 97 Q88 116 106 97" fill="none" stroke="#fff" stroke-width="3.2" stroke-dasharray="0.1 5.2" stroke-linecap="round"/>
  <circle cx="88" cy="108" r="3.4" fill="${P.red}" stroke="${P.gold}" stroke-width="1.5"/>
  <!-- neck + face -->
  <rect x="82" y="80" width="12" height="18" fill="${P.skin}" ${st}/>
  ${face(88, 64, 16, 20, { lips: '#c22b3a', lashes: true, cheeks: true })}
  <path d="M72 58 C72 40 104 40 104 58 C100 48 92 46 88 50 C84 46 76 48 72 58Z" fill="${P.blond}" ${st}/>
  <!-- crown -->
  <path d="M70 42 L67 22 L78 32 L88 14 L98 32 L109 22 L106 42Z" fill="url(#gold)" ${st}/>
  <rect x="70" y="38" width="36" height="7" rx="2" fill="url(#goldH)" ${st}/>
  <circle cx="88" cy="14" r="3" fill="${P.goldL}" ${st}/><circle cx="67" cy="22" r="2.2" fill="${P.goldL}" ${st}/><circle cx="109" cy="22" r="2.2" fill="${P.goldL}" ${st}/>
  <circle cx="79" cy="41.5" r="2" fill="${P.blue}"/><circle cx="88" cy="41.5" r="2.4" fill="${P.red}"/><circle cx="97" cy="41.5" r="2" fill="${P.blue}"/>
  <!-- flower -->
  <path d="M44 124 C44 112 42 104 40 92" stroke="${P.green}" stroke-width="3" fill="none"/>
  <path d="M42 108 C34 104 30 108 28 112 C34 114 40 112 42 108Z M42 102 C50 98 54 102 56 106 C50 108 44 106 42 102Z" fill="${P.green}" ${st}/>
  <circle cx="40" cy="88" r="10" fill="${P.red}" ${st}/><path d="M34 86 Q40 80 46 86 Q40 92 34 86Z M37 90 Q40 86 43 90" fill="none" stroke="${P.redD}" stroke-width="1.4"/>
  <ellipse cx="46" cy="126" rx="9" ry="8" fill="${P.skin}" ${st}/>
  ${suit(s, 152, 20, 24)}`;
}
function jack(pri, sec, priD, s) {
  const stripe = sec === P.red ? 'stripeR' : 'stripeB';
  return `
  <!-- halberd -->
  <rect x="26" y="0" width="7" height="152" fill="${P.brown}" ${st}/>
  <path d="M33 14 C52 14 60 26 58 40 C50 34 42 32 33 34Z" fill="url(#blade)" ${st}/>
  <path d="M26 18 L12 26 L26 30Z" fill="url(#blade)" ${st}/><path d="M29.5 0 L26 -10 L33 -10Z" fill="url(#blade)" ${st}/>
  <!-- tunic -->
  <path d="M-4 152 L-4 128 C8 112 34 104 60 100 L116 100 C142 104 168 112 180 128 L180 152Z" fill="${pri}" ${st}/>
  <path d="M70 102 L106 102 L110 152 L66 152Z" fill="url(#${stripe})" ${st}/>
  <path d="M14 136 C30 120 48 112 62 110 M162 136 C146 120 128 112 114 110" stroke="${P.gold}" stroke-width="5" fill="none"/>
  <path d="M14 136 C30 120 48 112 62 110 M162 136 C146 120 128 112 114 110" stroke="${INK}" stroke-width="1" fill="none"/>
  <!-- hair -->
  <path d="M70 48 C58 58 58 86 64 100 C70 98 72 90 72 82 C66 76 68 64 74 58Z M106 48 C118 58 118 86 112 100 C106 98 104 90 104 82 C110 76 108 64 102 58Z" fill="${P.brown}" ${st}/>
  <!-- ruff -->
  <path d="M58 98 L64 90 L70 98 L76 90 L82 98 L88 90 L94 98 L100 90 L106 98 L112 90 L118 98 L112 106 L64 106Z" fill="${P.white}" ${st}/>
  ${face(88, 68, 16, 20)}
  <path d="M79 79 C84 76 87 78 88 79 C89 78 92 76 97 79" fill="none" stroke="#5a3418" stroke-width="2.2" stroke-linecap="round"/>
  <!-- hat + feather -->
  <path d="M112 34 C130 20 150 10 166 4 C160 18 144 30 120 40Z" fill="${P.white}" ${st}/>
  <path d="M118 38 C134 26 150 14 166 4" stroke="${P.gold}" stroke-width="1.6" fill="none"/>
  <path d="M62 50 C58 30 76 18 98 20 C118 22 126 36 118 50Z" fill="${sec}" ${st}/>
  <path d="M60 46 L120 46 L118 54 L62 54Z" fill="url(#goldH)" ${st}/>
  <circle cx="74" cy="50" r="2.4" fill="${P.red}"/><circle cx="88" cy="50" r="2.4" fill="${P.blue}"/><circle cx="102" cy="50" r="2.4" fill="${P.red}"/>
  <ellipse cx="30" cy="124" rx="9" ry="8" fill="${P.skin}" ${st}/>
  ${suit(s, 152, 22, 24)}`;
}
function court(rank, s) {
  const red = s === 'H' || s === 'D';
  const pri = red ? P.red : P.blue, sec = red ? P.blue : P.red, priD = red ? P.redD : P.blueD;
  const fig = { K: king, Q: queen, J: jack }[rank](pri, sec, priD, s);
  const half = `<g clip-path="url(#chalf)"><g transform="translate(64 58)">${fig}</g></g>`;
  return `<rect x="64" y="58" width="172" height="304" rx="6" fill="url(#frameBg)"/>
  <g clip-path="url(#cframe)">${half}<g transform="rotate(180 150 210)">${half}</g></g>
  <path d="M64 210 H236" stroke="url(#goldH)" stroke-width="3"/><path d="M64 210 H236" stroke="${INK}" stroke-width=".8"/>
  <rect x="64" y="58" width="172" height="304" rx="6" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <rect x="59" y="53" width="182" height="314" rx="9" fill="none" stroke="${suitColor(s)}" stroke-width="1.6" opacity=".75"/>`;
}
function face_(rank, s) {
  let inner = index(rank, s);
  if (rank === 'A') inner = ace(s) + inner;
  else if ('JQK'.includes(rank)) inner = court(rank, s) + inner;
  else inner = pips(+rank, s) + inner;
  return base(inner);
}
for (const s of SUITS) for (const r of RANKS) fs.writeFileSync(`${OUT}/${r}${s}.svg`, face_(r, s));

// ---------- card back ----------
const ultra = textPath('cinzel', 'ULTRA', 150, 300, 30, { anchor: 'middle', letterSpacing: 7 });
const back = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420">
<defs>
 <linearGradient id="bk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a2747"/><stop offset=".5" stop-color="#0d1630"/><stop offset="1" stop-color="#070b1a"/></linearGradient>
 <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe7a6"/><stop offset=".45" stop-color="#d9a43a"/><stop offset="1" stop-color="#8a5f17"/></linearGradient>
 <pattern id="deco" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 0 L24 12 L12 24 L0 12Z" fill="none" stroke="#c99a3a" stroke-opacity=".28" stroke-width="1"/><circle cx="12" cy="12" r="1.4" fill="#c99a3a" fill-opacity=".45"/></pattern>
 <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3b5aa8" stop-opacity=".55"/><stop offset="1" stop-color="#3b5aa8" stop-opacity="0"/></radialGradient>
</defs>
<rect x="2" y="2" width="296" height="416" rx="20" fill="url(#bk)" stroke="#0a0f20" stroke-width="3"/>
<rect x="16" y="16" width="268" height="388" rx="12" fill="url(#deco)"/>
<rect x="16" y="16" width="268" height="388" rx="12" fill="none" stroke="url(#gold)" stroke-width="3"/>
<rect x="24" y="24" width="252" height="372" rx="8" fill="none" stroke="url(#gold)" stroke-width="1.2"/>
<ellipse cx="150" cy="210" rx="110" ry="140" fill="url(#glow)"/>
<path d="M150 70 L230 210 L150 350 L70 210Z" fill="#0b1228" stroke="url(#gold)" stroke-width="2.5"/>
<path d="M150 86 L220 210 L150 334 L80 210Z" fill="none" stroke="url(#gold)" stroke-width="1"/>
${suit('S', 150, 196, 92, { fill: 'url(#gold)' })}
<path d="${ultra.d}" fill="url(#gold)"/>
${[[40, 40], [260, 40], [40, 380], [260, 380]].map(([x, y]) => suit('S', x, y, 18, { fill: 'url(#gold)', flip: y > 200 })).join('')}
</svg>`;
fs.writeFileSync(`${OUT}/back.svg`, back);
console.log('cards written');
