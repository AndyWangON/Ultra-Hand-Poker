// Shared helpers for the Ultra Hand Poker asset pipeline
const opentype = require('opentype.js');
const fs = require('fs');
const FS = '/home/claude/fontsrc/';
const fonts = {};
function font(name) {
  const map = {
    slab: 'fontsource-roboto-slab-5.3.0/package/files/roboto-slab-latin-700-normal.woff',
    slab9: 'fontsource-roboto-slab-5.3.0/package/files/roboto-slab-latin-900-normal.woff',
    alfa: 'fontsource-alfa-slab-one-5.3.0/package/files/alfa-slab-one-latin-400-normal.woff',
    mont: 'fontsource-montserrat-5.3.0/package/files/montserrat-latin-800-normal.woff',
    mont7: 'fontsource-montserrat-5.3.0/package/files/montserrat-latin-700-normal.woff',
    oswald: 'fontsource-oswald-5.3.0/package/files/oswald-latin-600-normal.woff',
    cinzel: 'fontsource-cinzel-5.3.0/package/files/cinzel-latin-700-normal.woff',
  };
  if (!fonts[name]) { const b = fs.readFileSync(FS + map[name]); fonts[name] = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); }
  return fonts[name];
}
// text -> svg path data. anchor: 'start'|'middle'|'end'. returns {d,width}
function textPath(fontName, text, x, y, size, { anchor = 'start', letterSpacing = 0, scaleX = 1 } = {}) {
  const f = font(fontName);
  const glyphs = [...text].map(ch => f.charToGlyph(ch));
  let adv = 0; const parts = [];
  const scale = size / f.unitsPerEm;
  glyphs.forEach((g, i) => { parts.push({ g, x: adv }); adv += g.advanceWidth * scale * scaleX + (i < glyphs.length - 1 ? letterSpacing : 0); });
  const width = adv;
  const ox = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  let d = '';
  for (const p of parts) {
    const path = p.g.getPath(0, 0, size);
    path.commands.forEach(c => {
      const tx = v => (ox + p.x + v * scaleX).toFixed(2), ty = v => (y + v).toFixed(2);
      if (c.type === 'M') d += `M${tx(c.x)} ${ty(c.y)}`;
      else if (c.type === 'L') d += `L${tx(c.x)} ${ty(c.y)}`;
      else if (c.type === 'Q') d += `Q${tx(c.x1)} ${ty(c.y1)} ${tx(c.x)} ${ty(c.y)}`;
      else if (c.type === 'C') d += `C${tx(c.x1)} ${ty(c.y1)} ${tx(c.x2)} ${ty(c.y2)} ${tx(c.x)} ${ty(c.y)}`;
      else if (c.type === 'Z') d += 'Z';
    });
  }
  return { d, width };
}
// glyph bounding box helper
function textBox(fontName, text, size, opts = {}) { const t = textPath(fontName, text, 0, 0, size, opts); const f = font(fontName); const bb = { y1: 0, y2: 0 }; return { width: t.width, top: bb.y1, bottom: bb.y2 }; }

// Suit shapes defined in a 100x100 box
const SUIT_PATH = {
  H: 'M50 92 C47 86 38 77 27 67 C12 53 3 43 3 29 C3 15 14 5 27 5 C37 5 45 11 50 21 C55 11 63 5 73 5 C86 5 97 15 97 29 C97 43 88 53 73 67 C62 77 53 86 50 92 Z',
  D: 'M50 2 C59 20 72 37 90 50 C72 63 59 80 50 98 C41 80 28 63 10 50 C28 37 41 20 50 2 Z',
  S: 'M50 3 C55 14 66 24 78 34 C91 45 98 53 98 66 C98 79 88 87 76 87 C67 87 60 83 55 76 C56 85 60 92 68 97 L32 97 C40 92 44 85 45 76 C40 83 33 87 24 87 C12 87 2 79 2 66 C2 53 9 45 22 34 C34 24 45 14 50 3 Z',
  C: 'M50 4 C62 4 71 13 71 25 C71 32 68 37 64 41 C67 40 70 39 74 39 C87 39 97 49 97 62 C97 75 87 85 74 85 C65 85 58 80 54 73 C55 83 59 91 67 97 L33 97 C41 91 45 83 46 73 C42 80 35 85 26 85 C13 85 3 75 3 62 C3 49 13 39 26 39 C30 39 33 40 36 41 C32 37 29 32 29 25 C29 13 38 4 50 4 Z',
};
const SUIT_RED = { H: true, D: true, S: false, C: false };
const RED = '#c4122f', BLACK = '#15161a';
function suitColor(s) { return SUIT_RED[s] ? RED : BLACK; }
// place suit centered at cx,cy with size (height) h; flip rotates 180
function suit(s, cx, cy, h, { fill, flip = false, extra = '' } = {}) {
  const k = h / 100;
  return `<path d="${SUIT_PATH[s]}" fill="${fill || suitColor(s)}" ${extra} transform="translate(${(cx).toFixed(2)} ${(cy).toFixed(2)}) ${flip ? 'rotate(180)' : ''} scale(${k}) translate(-50 -50)"/>`;
}
module.exports = { font, textPath, textBox, SUIT_PATH, suit, suitColor, RED, BLACK, SUIT_RED };
