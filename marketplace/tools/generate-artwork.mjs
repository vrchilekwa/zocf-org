// Generates the marketplace's original, chitenge-inspired SVG artwork.
//
// Every image used by the demonstration marketplace (product renders, category cards,
// inspiration boards and the hero collage) is produced here, so there are no third-party
// image licensing questions. Re-run after changing a design:
//
//   node marketplace/tools/generate-artwork.mjs
//
// Output: marketplace/images/{products,categories,inspiration}/*.svg and images/hero-fabrics.svg

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'images');

// ---------- geometry helpers ----------
const f = (n) => +n.toFixed(2);
const polar = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [f(cx + r * Math.cos(a)), f(cy + r * Math.sin(a))];
};
const pts = (arr) => arr.map((p) => p.join(',')).join(' ');
const diamond = (cx, cy, rx, ry = rx) => pts([[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]]);
const star = (cx, cy, ro, ri, n = 5) => {
  const out = [];
  for (let i = 0; i < n * 2; i++) out.push(polar(cx, cy, i % 2 ? ri : ro, (i * 180) / n));
  return pts(out);
};
// Draw an element at (x, y) and at its copies in neighbouring tiles, so motifs that sit
// on tile edges or corners join up seamlessly when the pattern repeats.
const tiled = (W, H, x, y, el) => {
  let s = '';
  for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) s += el(x + dx, y + dy);
  return s;
};

// ---------- motifs: each returns one pattern tile ----------
// p = palette [background, c1, c2, c3, c4]
const MOTIFS = {
  sun(p) {
    const S = 160, c = 80;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    s += `<circle cx="${c}" cy="${c}" r="70" fill="none" stroke="${p[3]}" stroke-width="6"/>`;
    for (let i = 0; i < 12; i++) {
      const a = i * 30;
      s += `<polygon points="${pts([polar(c, c, 36, a - 8), polar(c, c, 61, a), polar(c, c, 36, a + 8)])}" fill="${p[2]}"/>`;
    }
    s += `<circle cx="${c}" cy="${c}" r="30" fill="${p[1]}"/><circle cx="${c}" cy="${c}" r="17" fill="${p[0]}"/><circle cx="${c}" cy="${c}" r="9" fill="${p[2]}"/>`;
    s += tiled(S, S, 0, 0, (x, y) => `<polygon points="${diamond(x, y, 15)}" fill="${p[4]}"/><polygon points="${diamond(x, y, 6)}" fill="${p[1]}"/>`);
    return { S, s };
  },
  circles(p) {
    const S = 120, c = 60;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    [[50, 1], [40, 2], [30, 3], [20, 1], [9, 4]].forEach(([r, i]) => { s += `<circle cx="${c}" cy="${c}" r="${r}" fill="${p[i]}"/>`; });
    s += tiled(S, S, 0, 0, (x, y) => `<circle cx="${x}" cy="${y}" r="24" fill="${p[4]}"/><circle cx="${x}" cy="${y}" r="15" fill="${p[2]}"/><circle cx="${x}" cy="${y}" r="7" fill="${p[3]}"/>`);
    return { S, s };
  },
  diamonds(p) {
    const S = 100, c = 50;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    [[46, 1], [35, 2], [24, 3], [11, 4]].forEach(([r, i]) => { s += `<polygon points="${diamond(c, c, r)}" fill="${p[i]}"/>`; });
    s += tiled(S, S, 0, 0, (x, y) => `<polygon points="${diamond(x, y, 15)}" fill="${p[3]}"/><polygon points="${diamond(x, y, 7)}" fill="${p[1]}"/>`);
    return { S, s };
  },
  floral(p) {
    const S = 140, c = 70;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    s += tiled(S, S, 70, 0, (x, y) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="16" fill="${p[4]}" transform="rotate(45 ${x} ${y})"/>`);
    s += tiled(S, S, 0, 70, (x, y) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="16" fill="${p[4]}" transform="rotate(-45 ${x} ${y})"/>`);
    for (let i = 0; i < 6; i++) s += `<ellipse cx="${c}" cy="${c - 25}" rx="13" ry="25" fill="${p[1]}" transform="rotate(${i * 60} ${c} ${c})"/>`;
    s += `<circle cx="${c}" cy="${c}" r="13" fill="${p[2]}"/><circle cx="${c}" cy="${c}" r="5" fill="${p[3]}"/>`;
    s += tiled(S, S, 0, 0, (x, y) => {
      let g = '';
      for (let i = 0; i < 5; i++) g += `<ellipse cx="${x}" cy="${y - 11}" rx="6" ry="12" fill="${p[3]}" transform="rotate(${i * 72} ${x} ${y})"/>`;
      return g + `<circle cx="${x}" cy="${y}" r="5" fill="${p[2]}"/>`;
    });
    return { S, s };
  },
  zigzag(p) {
    const S = 80;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    [[16, 1, 10], [40, 2, 7], [64, 3, 10]].forEach(([y, i, w]) => {
      s += `<polyline points="-20,${y - 8} 0,${y + 8} 20,${y - 8} 40,${y + 8} 60,${y - 8} 80,${y + 8} 100,${y - 8}" fill="none" stroke="${p[i]}" stroke-width="${w}" stroke-linejoin="miter"/>`;
    });
    [[20, 28], [60, 28], [0, 52], [40, 52], [80, 52]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="3.5" fill="${p[4]}"/>`; });
    return { S, s };
  },
  waves(p) {
    const W = 120, H = 64;
    let s = `<rect width="${W}" height="${H}" fill="${p[0]}"/>`;
    s += `<path d="M-1 18 Q30 4 60 18 T121 18" fill="none" stroke="${p[1]}" stroke-width="8"/>`;
    s += `<path d="M-1 46 Q30 60 60 46 T121 46" fill="none" stroke="${p[3]}" stroke-width="5"/>`;
    s += `<path d="M-1 46 Q30 60 60 46 T121 46" fill="none" stroke="${p[2]}" stroke-width="1.5" transform="translate(0 -6)"/>`;
    [[30, 32], [90, 32]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="3.5" fill="${p[4]}"/>`; });
    return { S: W, H, s };
  },
  rings(p) {
    const S = 120;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    s += `<circle cx="47" cy="60" r="22" fill="none" stroke="${p[1]}" stroke-width="6"/><circle cx="73" cy="60" r="22" fill="none" stroke="${p[2]}" stroke-width="6"/>`;
    s += `<polygon points="${diamond(60, 20, 6, 10)}" fill="${p[3]}"/><polygon points="${diamond(60, 100, 6, 10)}" fill="${p[3]}"/>`;
    s += tiled(S, S, 0, 0, (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="${p[4]}"/>`);
    s += tiled(S, S, 0, 60, (x, y) => `<polygon points="${diamond(x, y, 5, 8)}" fill="${p[1]}"/>`);
    return { S, s };
  },
  stars(p) {
    const S = 100;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    s += `<polygon points="${star(50, 50, 22, 9)}" fill="${p[1]}" stroke-linejoin="round"/>`;
    s += tiled(S, S, 0, 0, (x, y) => `<polygon points="${star(x, y, 12, 5)}" fill="${p[2]}"/>`);
    [[25, 75], [75, 25]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="5" fill="${p[3]}"/>`; });
    [[25, 25], [75, 75]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="3" fill="${p[4]}"/>`; });
    return { S, s };
  },
  dots(p) {
    const S = 60;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    s += `<circle cx="30" cy="30" r="11" fill="${p[1]}"/><circle cx="30" cy="30" r="4" fill="${p[4]}"/>`;
    s += tiled(S, S, 0, 0, (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="${p[2]}"/>`);
    s += tiled(S, S, 30, 0, (x, y) => `<circle cx="${x}" cy="${y}" r="3" fill="${p[3]}"/>`);
    s += tiled(S, S, 0, 30, (x, y) => `<circle cx="${x}" cy="${y}" r="3" fill="${p[3]}"/>`);
    return { S, s };
  },
  leaves(p) {
    const S = 140;
    const leaf = (x, y, r, col) =>
      `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -34 C19 -17 19 17 0 34 C-19 17 -19 -17 0 -34Z" fill="${col}"/><path d="M0 -28 V28" stroke="${p[0]}" stroke-width="2" opacity=".55"/></g>`;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    s += leaf(38, 38, -35, p[1]) + leaf(102, 38, 35, p[2]) + leaf(38, 102, 35, p[2]) + leaf(102, 102, -35, p[1]);
    s += `<circle cx="70" cy="70" r="7" fill="${p[3]}"/>`;
    s += tiled(S, S, 0, 0, (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="${p[4]}"/>`);
    return { S, s };
  },
  mudcloth(p) {
    const S = 120;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    for (let x = 0; x < S; x += 20) s += `<rect x="${x + 4}" y="12" width="12" height="5" rx="2" fill="${p[1]}"/>`;
    s += `<path d="M0 30 H120 M0 60 H120 M0 90 H120" stroke="${p[3]}" stroke-width="2" stroke-dasharray="6 4"/>`;
    [15, 45, 75, 105].forEach((x) => { s += `<path d="M${x - 6} 39 L${x + 6} 51 M${x + 6} 39 L${x - 6} 51" stroke="${p[1]}" stroke-width="3" stroke-linecap="round"/>`; });
    for (let x = 5; x < S; x += 10) s += `<circle cx="${x}" cy="75" r="2.5" fill="${p[2]}"/>`;
    s += `<polyline points="0,99 10,111 20,99 30,111 40,99 50,111 60,99 70,111 80,99 90,111 100,99 110,111 120,99" fill="none" stroke="${p[1]}" stroke-width="3"/>`;
    return { S, s };
  },
  checks(p) {
    const S = 120;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    s += `<rect width="60" height="60" fill="${p[1]}"/><rect x="60" y="60" width="60" height="60" fill="${p[1]}"/>`;
    [8, 22, 36, 50].forEach((y) => { s += `<rect x="60" y="${y}" width="60" height="6" fill="${p[2]}"/>`; });
    [8, 22, 36, 50].forEach((x) => { s += `<rect x="${x}" y="60" width="6" height="60" fill="${p[3]}"/>`; });
    s += `<polygon points="10,44 20,20 30,44" fill="${p[4]}"/><polygon points="30,44 40,20 50,44" fill="${p[0]}"/>`;
    s += `<polygon points="${diamond(90, 90, 17)}" fill="${p[4]}"/><polygon points="${diamond(90, 90, 7)}" fill="${p[2]}"/>`;
    s += `<path d="M60 0 V120 M0 60 H120" stroke="${p[3]}" stroke-width="2"/>`;
    return { S, s };
  },
  shells(p) {
    const S = 110;
    const shell = (x, y, r) => {
      let teeth = '';
      for (let k = -2; k <= 2; k++) teeth += `<path d="M-6 ${k * 6} H-1.5 M1.5 ${k * 6} H6" stroke="${p[2]}" stroke-width="1.6"/>`;
      return `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="15" ry="24" fill="${p[1]}"/><path d="M0 -18 C4 -6 -4 6 0 18" fill="none" stroke="${p[2]}" stroke-width="3"/>${teeth}</g>`;
    };
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    s += shell(30, 30, -30) + shell(80, 80, 30);
    [[80, 30], [30, 80]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="7" fill="${p[3]}"/><circle cx="${x}" cy="${y}" r="2.5" fill="${p[4]}"/>`; });
    return { S, s };
  },
  abstract(p) {
    const S = 200;
    let s = `<rect width="${S}" height="${S}" fill="${p[0]}"/>`;
    s += `<path d="M18 62 C38 8 112 18 102 72 S28 122 18 62Z" fill="${p[1]}"/>`;
    s += `<path d="M118 122 C160 88 204 130 180 172 S108 184 118 122Z" fill="${p[2]}"/>`;
    s += `<circle cx="152" cy="42" r="22" fill="${p[3]}"/><circle cx="152" cy="42" r="31" fill="none" stroke="${p[4]}" stroke-width="3"/>`;
    s += `<path d="M-2 150 C40 128 62 192 102 168" fill="none" stroke="${p[4]}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M60 92 L84 104 L64 118Z" fill="${p[3]}"/>`;
    s += tiled(S, S, 0, 0, (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="${p[4]}"/>`);
    return { S, s };
  },
};

// ---------- SVG assembly ----------
const WEAVE = `<pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 .5H6M0 3.5H6" stroke="#000" stroke-opacity=".06"/><path d="M.5 0V6M3.5 0V6" stroke="#fff" stroke-opacity=".05"/></pattern>`;
const FOLD = (id = 'fold', span = 130) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${span}" y2="0" spreadMethod="reflect"><stop offset="0" stop-color="#000" stop-opacity=".30"/><stop offset=".55" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".04"/></linearGradient>`;

function patternDef(id, motif, palette, { scale = 1, rotate = 0 } = {}) {
  const { S, H = S, s } = MOTIFS[motif](palette);
  return `<pattern id="${id}" width="${S}" height="${H}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotate}) scale(${scale})">${s}</pattern>`;
}
const svg = (w, h, title, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><title>${title}</title><defs>${WEAVE}${defs}</defs>${body}</svg>\n`;
const fill = (id, w = '100%', h = '100%') => `<rect width="${w}" height="${h}" fill="url(#${id})"/>`;
const rotatePalette = (p) => [p[1], p[0], p[3], p[4], p[2]];

// Three "photographs" per product: full fabric, close-up, and draped with its border band.
function productImages(spec) {
  const W = 800, { motif, palette, border = 'diamonds', title } = spec;
  const main = svg(W, W, `${title} – full fabric`, patternDef('p', motif, palette, { scale: 1.6 }), fill('p') + fill('weave'));
  const detail = svg(W, W, `${title} – close-up`, patternDef('p', motif, palette, { scale: 3.6, rotate: 8 }), fill('p') + fill('weave'));
  const drape = svg(
    W, W, `${title} – draped with border`,
    patternDef('p', motif, palette, { scale: 1.15, rotate: -4 }) + patternDef('b', border, rotatePalette(palette), { scale: 0.75 }) + FOLD(),
    fill('p') +
      `<rect y="590" width="${W}" height="10" fill="${palette[1]}"/><rect y="600" width="${W}" height="120" fill="url(#b)"/><rect y="720" width="${W}" height="10" fill="${palette[1]}"/>` +
      fill('weave') + fill('fold'),
  );
  return { main, detail, drape };
}

function categoryImage(spec) {
  return svg(600, 450, spec.title, patternDef('p', spec.motif, spec.palette, { scale: 1.4 }), fill('p') + fill('weave'));
}

// Inspiration boards look deliberately different from product renders: an arch-shaped
// design study on a cream board with its colour palette, so they're never mistaken for stock.
function inspirationImage(spec) {
  const W = 800, H = spec.height || 1000;
  const archBottom = H - 230;
  const body =
    `<rect width="${W}" height="${H}" fill="#f7f1e3"/>` +
    `<path d="M100 ${archBottom} V360 A300 300 0 0 1 700 360 V${archBottom} Z" fill="url(#p)"/>` +
    `<path d="M100 ${archBottom} V360 A300 300 0 0 1 700 360 V${archBottom} Z" fill="url(#weave)" stroke="#1a1a1a" stroke-opacity=".18" stroke-width="4"/>` +
    spec.palette.map((c, i) => `<circle cx="${160 + i * 120}" cy="${H - 120}" r="40" fill="${c}" stroke="#000" stroke-opacity=".12" stroke-width="3"/>`).join('');
  return svg(W, H, spec.title, patternDef('p', spec.motif, spec.palette, { scale: 1.5 }), body);
}

function heroImage(swatches) {
  const W = 1600, H = 900;
  let defs = FOLD('fold', 110) +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#022c22"/><stop offset="1" stop-color="#065f46"/></linearGradient>` +
    `<filter id="sh" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".45"/></filter>` +
    `<pattern id="lattice" width="48" height="48" patternUnits="userSpaceOnUse"><polygon points="${diamond(24, 24, 24)}" fill="none" stroke="#fbbf24" stroke-opacity=".08" stroke-width="2"/></pattern>`;
  let body = `<rect width="${W}" height="${H}" fill="url(#bg)"/>${fill('lattice')}`;
  swatches.forEach((sw, i) => {
    defs += patternDef(`h${i}`, sw.motif, sw.palette, { scale: sw.scale || 1 });
    const { x, y, w, h, r } = sw;
    body += `<g transform="translate(${x} ${y}) rotate(${r})" filter="url(#sh)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="url(#h${i})"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="url(#fold)"/></g>`;
  });
  return svg(W, H, 'Folded chitenge fabrics', defs, body);
}

// ---------- design specs ----------
const C = {
  red: '#c8102e', black: '#161616', gold: '#f2b01e', yellow: '#ffd23f', blue: '#1d4e9e', navy: '#14305f',
  green: '#198a3c', emerald: '#0f6b46', leaf: '#6abf4b', orange: '#ef7d00', copper: '#b8652a', brown: '#6b3e26',
  earth: '#3b2416', sand: '#c9a27a', white: '#fbf7ef', cream: '#f5ead0', pink: '#e75480', purple: '#7b4fa0',
  lilac: '#b497d6', teal: '#0f8b8d', deepteal: '#0a5c5e', sky: '#6fc3e8',
};

// Keyed by product id (must match data/products.json).
export const PRODUCT_DESIGNS = {
  'traditional-zambian-heritage-print': { motif: 'sun', palette: [C.black, C.red, C.gold, C.red, C.cream] },
  'blue-yellow-african-wax-print': { motif: 'circles', palette: [C.blue, C.yellow, C.navy, C.white, C.yellow], border: 'zigzag' },
  'red-black-geometric-chitenge': { motif: 'diamonds', palette: [C.black, C.red, C.black, C.cream, C.red], border: 'zigzag' },
  'floral-celebration-chitenge': { motif: 'floral', palette: [C.white, C.pink, C.gold, C.red, C.green], border: 'dots' },
  'contemporary-african-print': { motif: 'abstract', palette: [C.teal, C.orange, C.cream, C.navy, C.yellow], border: 'zigzag' },
  'colourful-heritage-collection': { motif: 'sun', palette: [C.navy, C.orange, C.yellow, C.green, C.red] },
  'copperbelt-copper-diamonds': { motif: 'diamonds', palette: [C.earth, C.copper, C.gold, C.brown, C.cream], border: 'mudcloth' },
  'kafue-river-blues': { motif: 'waves', palette: [C.navy, C.sky, C.white, C.blue, C.white], border: 'dots' },
  'mosi-oa-tunya-mist-print': { motif: 'waves', palette: [C.teal, C.white, C.gold, C.deepteal, C.gold], border: 'diamonds' },
  'golden-union-wedding-chitenge': { motif: 'rings', palette: [C.white, C.gold, C.green, C.gold, C.green], border: 'floral' },
  'little-stars-childrens-print': { motif: 'stars', palette: [C.sky, C.yellow, C.pink, C.white, C.blue], border: 'dots' },
  'playful-dots-childrens-fabric': { motif: 'dots', palette: [C.green, C.orange, C.yellow, C.white, C.black], border: 'stars' },
  'hibiscus-bloom-floral': { motif: 'floral', palette: [C.emerald, C.red, C.yellow, C.pink, C.leaf], border: 'leaves' },
  'jacaranda-lilac-floral': { motif: 'floral', palette: [C.cream, C.purple, C.yellow, C.lilac, C.green], border: 'dots' },
  'earth-tones-mudcloth-print': { motif: 'mudcloth', palette: [C.earth, C.cream, C.sand, C.black, C.cream], border: 'zigzag' },
  'woven-check-strip-cloth-print': { motif: 'checks', palette: [C.black, C.yellow, C.green, C.red, C.white], border: 'zigzag' },
  'zambezi-leaves-print': { motif: 'leaves', palette: [C.emerald, C.leaf, C.gold, C.white, C.gold], border: 'diamonds' },
  'independence-colours-chitenge': { motif: 'zigzag', palette: [C.green, C.red, C.black, C.orange, C.white], border: 'sun' },
  'cowrie-shell-designer-print': { motif: 'shells', palette: [C.navy, C.white, C.sand, C.gold, C.navy], border: 'diamonds' },
  'luangwa-zigzag-chitenge': { motif: 'zigzag', palette: [C.black, C.yellow, C.white, C.yellow, C.red], border: 'diamonds' },
};

export const CATEGORY_DESIGNS = {
  traditional: { motif: 'sun', palette: [C.black, C.orange, C.gold, C.red, C.green] },
  modern: { motif: 'abstract', palette: [C.navy, C.orange, C.cream, C.teal, C.yellow] },
  wedding: { motif: 'rings', palette: [C.cream, C.gold, C.red, C.gold, C.green] },
  floral: { motif: 'floral', palette: [C.emerald, C.pink, C.yellow, C.white, C.leaf] },
  geometric: { motif: 'diamonds', palette: [C.red, C.black, C.yellow, C.white, C.black] },
  children: { motif: 'stars', palette: [C.orange, C.yellow, C.sky, C.white, C.pink] },
  premium: { motif: 'shells', palette: [C.deepteal, C.cream, C.sand, C.gold, C.deepteal] },
  other: { motif: 'mudcloth', palette: [C.earth, C.cream, C.sand, C.black, C.cream] },
};

export const INSPIRATION_DESIGNS = {
  'copper-sunrise': { motif: 'sun', palette: [C.earth, C.copper, C.gold, C.orange, C.cream], height: 1000 },
  'bangweulu-indigo': { motif: 'waves', palette: [C.navy, C.sky, C.white, C.blue, C.gold], height: 1100 },
  'wedding-garden': { motif: 'floral', palette: [C.cream, C.pink, C.gold, C.red, C.green], height: 900 },
  'kuomboka-geometry': { motif: 'diamonds', palette: [C.red, C.white, C.black, C.gold, C.white], height: 1000 },
  'market-day-stripes': { motif: 'checks', palette: [C.green, C.orange, C.yellow, C.black, C.white], height: 1100 },
  'night-sky-stars': { motif: 'stars', palette: [C.navy, C.gold, C.white, C.sky, C.white], height: 900 },
  'baobab-leaf-study': { motif: 'leaves', palette: [C.brown, C.leaf, C.gold, C.cream, C.orange], height: 1000 },
  'cowrie-coast': { motif: 'shells', palette: [C.teal, C.cream, C.sand, C.gold, C.teal], height: 1100 },
  'earth-and-clay': { motif: 'mudcloth', palette: [C.copper, C.cream, C.earth, C.earth, C.cream], height: 900 },
  'colour-block-city': { motif: 'abstract', palette: [C.purple, C.yellow, C.pink, C.teal, C.white], height: 1000 },
};

const HERO_SWATCHES = [
  { ...PRODUCT_DESIGNS['traditional-zambian-heritage-print'], x: 1190, y: 250, w: 460, h: 320, r: -9 },
  { ...PRODUCT_DESIGNS['blue-yellow-african-wax-print'], x: 1420, y: 520, w: 420, h: 300, r: 11 },
  { ...PRODUCT_DESIGNS['floral-celebration-chitenge'], x: 1010, y: 610, w: 440, h: 300, r: 6 },
  { ...PRODUCT_DESIGNS['zambezi-leaves-print'], x: 1480, y: 140, w: 320, h: 240, r: 14 },
  { ...PRODUCT_DESIGNS['red-black-geometric-chitenge'], x: 760, y: 820, w: 380, h: 260, r: -12 },
  { ...PRODUCT_DESIGNS['independence-colours-chitenge'], x: 1300, y: 830, w: 420, h: 240, r: -4 },
  { ...PRODUCT_DESIGNS['cowrie-shell-designer-print'], x: 860, y: 150, w: 300, h: 220, r: 8 },
];

// ---------- write files ----------
const pretty = (id) => id.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

async function write(rel, content) {
  const file = join(OUT, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
}

let count = 0;
for (const [id, spec] of Object.entries(PRODUCT_DESIGNS)) {
  const imgs = productImages({ ...spec, title: pretty(id) });
  await write(`products/${id}-1.svg`, imgs.main);
  await write(`products/${id}-2.svg`, imgs.detail);
  await write(`products/${id}-3.svg`, imgs.drape);
  count += 3;
}
for (const [id, spec] of Object.entries(CATEGORY_DESIGNS)) { await write(`categories/${id}.svg`, categoryImage({ ...spec, title: pretty(id) })); count++; }
for (const [id, spec] of Object.entries(INSPIRATION_DESIGNS)) { await write(`inspiration/${id}.svg`, inspirationImage({ ...spec, title: pretty(id) })); count++; }
await write('hero-fabrics.svg', heroImage(HERO_SWATCHES)); count++;
console.log(`Generated ${count} SVG files in ${OUT}`);
