// Generates NextGen's original illustrations: group scenes (hero, activities, stories) and
// illustrated profile avatars. Everything is drawn here, so there are no licensing questions and
// no real person's likeness is attached to the fictional demonstration profiles.
//
//   node nextgen/tools/generate-illustrations.mjs
//
// To use real photographs later, put licensed or consented photos in nextgen/images/photos/ and
// point the "image" / "profileImage" fields in nextgen/data/*.json at them.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'images');

// Small deterministic random generator so output is stable between runs.
function rng(seed) {
  let s = [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

const SKIN = ['#4a2c1d', '#5c3a24', '#6b4226', '#7d4a2a', '#8d5524', '#a0673f', '#3d2416'];
const HAIR = ['#141414', '#1f1611', '#2b1d14'];
const CLOTHES = ['#f97316', '#0f766e', '#7c3aed', '#e11d48', '#0ea5e9', '#facc15', '#16a34a', '#f472b6', '#1e3a8a', '#ffffff', '#fb923c', '#14b8a6'];
const BOTTOMS = ['#1e293b', '#334155', '#1e3a8a', '#3f3f46', '#78350f', '#0f172a'];
const WRAPS = ['#f59e0b', '#dc2626', '#16a34a', '#7c3aed', '#ea580c'];

// ---------- a person (standing), origin at feet centre ----------
function hair(style, color, hx, hy, wrapColor) {
  switch (style) {
    case 'afro': return `<circle cx="${hx}" cy="${hy - 6}" r="27" fill="${color}"/>`;
    case 'puffs': return `<circle cx="${hx - 17}" cy="${hy - 18}" r="11" fill="${color}"/><circle cx="${hx + 17}" cy="${hy - 18}" r="11" fill="${color}"/><path d="M${hx - 19} ${hy - 3} a19 19 0 0 1 38 0 z" fill="${color}"/>`;
    case 'braids': return `<path d="M${hx - 21} ${hy + 30} V${hy - 4} a21 21 0 0 1 42 0 V${hy + 30} h-8 V${hy} h-26 V${hy + 30} z" fill="${color}"/>`;
    case 'wrap': return `<path d="M${hx - 22} ${hy - 2} C${hx - 26} ${hy - 34} ${hx + 26} ${hy - 34} ${hx + 22} ${hy - 2} z" fill="${wrapColor}"/><circle cx="${hx + 8}" cy="${hy - 26}" r="9" fill="${wrapColor}"/><path d="M${hx - 20} ${hy - 6} H${hx + 20}" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`;
    case 'locs': return `<path d="M${hx - 20} ${hy + 18} V${hy - 4} a20 20 0 0 1 40 0 V${hy + 18}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"/><path d="M${hx - 20} ${hy - 4} a20 20 0 0 1 40 0 z" fill="${color}"/>`;
    case 'cap': return `<path d="M${hx - 20} ${hy - 4} a20 20 0 0 1 40 0 z" fill="${wrapColor}"/><rect x="${hx - 2}" y="${hy - 8}" width="30" height="6" rx="3" fill="${wrapColor}"/>`;
    default: return `<path d="M${hx - 19} ${hy - 2} a19 19 0 0 1 38 0 z" fill="${color}"/>`; // short
  }
}

function person(r, { x, y, s = 1, armUp = false, extra = '' }) {
  const skin = pick(r, SKIN), top = pick(r, CLOTHES), bottom = pick(r, BOTTOMS);
  const style = pick(r, ['afro', 'short', 'puffs', 'braids', 'wrap', 'locs', 'short', 'cap']);
  const dress = r() < 0.3;
  const hx = 0, hy = -150;
  let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
  g += `<ellipse cx="0" cy="4" rx="34" ry="7" fill="#000" opacity=".12"/>`;
  if (dress) g += `<path d="M-26 -104 L-34 -30 H34 L26 -104 Z" fill="${top}"/>`;
  else g += `<rect x="-16" y="-52" width="14" height="54" rx="7" fill="${bottom}"/><rect x="2" y="-52" width="14" height="54" rx="7" fill="${bottom}"/>`;
  if (dress) g += `<rect x="-13" y="-34" width="10" height="36" rx="5" fill="${skin}"/><rect x="3" y="-34" width="10" height="36" rx="5" fill="${skin}"/>`;
  g += `<rect x="-26" y="-112" width="52" height="${dress ? 60 : 66}" rx="22" fill="${top}"/>`;
  // arms
  g += `<rect x="-38" y="-106" width="13" height="56" rx="6.5" fill="${top}" transform="rotate(8 -32 -106)"/>`;
  g += armUp
    ? `<rect x="25" y="-160" width="13" height="56" rx="6.5" fill="${top}" transform="rotate(20 32 -106)"/><circle cx="50" cy="-159" r="7.5" fill="${skin}"/>`
    : `<rect x="25" y="-106" width="13" height="56" rx="6.5" fill="${top}" transform="rotate(-8 32 -106)"/>`;
  g += `<rect x="-6" y="-128" width="12" height="18" rx="5" fill="${skin}"/>`;
  // Afros sit behind the face; other styles are drawn over the head.
  const hairSvg = hair(style, pick(r, HAIR), hx, hy, pick(r, WRAPS));
  if (style === 'afro') g += hairSvg;
  g += `<circle cx="${hx}" cy="${hy}" r="20" fill="${skin}"/>`;
  if (style !== 'afro') g += hairSvg;
  g += `<circle cx="-7" cy="${hy + 2}" r="2" fill="#1a1a1a"/><circle cx="7" cy="${hy + 2}" r="2" fill="#1a1a1a"/><path d="M-6 ${hy + 9} q6 5 12 0" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>`;
  g += extra + '</g>';
  return g;
}

// ---------- props ----------
const P = {
  sun: (x, y, r = 60, c = '#fbbf24') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r + 26}" fill="${c}" opacity=".18"/>`,
  hills: (W, H, c1, c2) => `<path d="M0 ${H - 230} Q${W * 0.2} ${H - 380} ${W * 0.45} ${H - 250} T${W} ${H - 300} V${H} H0Z" fill="${c1}"/><path d="M0 ${H - 160} Q${W * 0.3} ${H - 260} ${W * 0.6} ${H - 170} T${W} ${H - 190} V${H} H0Z" fill="${c2}"/>`,
  mountains: (W, H) => `<path d="M0 ${H - 200} L${W * 0.22} ${H - 470} L${W * 0.42} ${H - 260} L${W * 0.6} ${H - 520} L${W * 0.85} ${H - 280} L${W} ${H - 380} V${H} H0Z" fill="#475569" opacity=".55"/><path d="M${W * 0.6 - 40} ${H - 470} L${W * 0.6} ${H - 520} L${W * 0.6 + 45} ${H - 465} L${W * 0.6 + 10} ${H - 480}Z" fill="#fff" opacity=".8"/>`,
  bunting: (W, y, colors) => {
    let s = `<path d="M0 ${y} Q${W / 2} ${y + 70} ${W} ${y}" fill="none" stroke="#334155" stroke-width="3"/>`;
    for (let i = 1; i < 14; i++) { const x = (W / 14) * i; const yy = y + 70 * (1 - ((2 * i) / 14 - 1) ** 2) * 0.98; s += `<path d="M${x - 18} ${yy} L${x + 18} ${yy} L${x} ${yy + 34}Z" fill="${colors[i % colors.length]}"/>`; }
    return s;
  },
  lights: (W, y) => { let s = `<path d="M0 ${y} Q${W / 2} ${y + 60} ${W} ${y}" fill="none" stroke="#1f2937" stroke-width="2"/>`; for (let i = 1; i < 20; i++) { const x = (W / 20) * i; const yy = y + 60 * (1 - ((2 * i) / 20 - 1) ** 2); s += `<circle cx="${x}" cy="${yy + 8}" r="7" fill="#fde68a"/><circle cx="${x}" cy="${yy + 8}" r="16" fill="#fde68a" opacity=".25"/>`; } return s; },
  bubble: (x, y, c = '#ffffff', w = 120) => `<g transform="translate(${x} ${y})"><rect width="${w}" height="64" rx="24" fill="${c}"/><path d="M26 62 L20 86 L48 62Z" fill="${c}"/><circle cx="${w / 2 - 22}" cy="32" r="6" fill="#94a3b8"/><circle cx="${w / 2}" cy="32" r="6" fill="#94a3b8"/><circle cx="${w / 2 + 22}" cy="32" r="6" fill="#94a3b8"/></g>`,
  ball: (x, y, r = 26) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#111" stroke-width="3"/><polygon points="${x},${y - 10} ${x + 10},${y - 3} ${x + 6},${y + 9} ${x - 6},${y + 9} ${x - 10},${y - 3}" fill="#111"/>`,
  basketball: (x, y, r = 24) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f97316"/><path d="M${x - r} ${y} H${x + r} M${x} ${y - r} V${y + r}" stroke="#7c2d12" stroke-width="2.5"/><path d="M${x - r * 0.7} ${y - r * 0.7} Q${x} ${y} ${x - r * 0.7} ${y + r * 0.7} M${x + r * 0.7} ${y - r * 0.7} Q${x} ${y} ${x + r * 0.7} ${y + r * 0.7}" fill="none" stroke="#7c2d12" stroke-width="2.5"/>`,
  hoop: (x, y) => `<rect x="${x - 6}" y="${y}" width="12" height="380" fill="#64748b"/><rect x="${x - 70}" y="${y - 90}" width="140" height="96" rx="6" fill="#fff" stroke="#64748b" stroke-width="5"/><rect x="${x - 26}" y="${y - 50}" width="52" height="40" fill="none" stroke="#ef4444" stroke-width="4"/><ellipse cx="${x}" cy="${y + 6}" rx="34" ry="8" fill="none" stroke="#ef4444" stroke-width="5"/><path d="M${x - 30} ${y + 8} L${x - 18} ${y + 48} M${x} ${y + 12} V${y + 50} M${x + 30} ${y + 8} L${x + 18} ${y + 48}" stroke="#fff" stroke-width="3"/>`,
  goal: (x, y) => `<rect x="${x}" y="${y}" width="260" height="140" fill="none" stroke="#fff" stroke-width="8"/><path d="M${x} ${y} l30 30 h200 l30 -30 M${x + 30} ${y + 30} v110 M${x + 230} ${y + 30} v110" stroke="#fff" stroke-width="3" opacity=".6"/>`,
  bike: (x, y, c = '#0ea5e9') => `<g transform="translate(${x} ${y})" fill="none" stroke-width="6"><circle cx="0" cy="0" r="38" stroke="#1f2937"/><circle cx="110" cy="0" r="38" stroke="#1f2937"/><path d="M0 0 L40 -50 H95 L110 0 M40 -50 L55 0 L95 -50 M0 0 H55" stroke="${c}" stroke-linejoin="round"/><path d="M30 -62 H52 M95 -50 L90 -72 H110" stroke="#1f2937"/></g>`,
  laptop: (x, y, c = '#334155') => `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="120" height="78" rx="8" fill="${c}"/><rect x="8" y="8" width="104" height="62" rx="3" fill="#bae6fd"/><path d="M-14 78 H134 L124 92 H-4Z" fill="#94a3b8"/></g>`,
  books: (x, y) => `<g transform="translate(${x} ${y})"><rect width="110" height="22" rx="4" fill="#e11d48"/><rect x="8" y="-22" width="100" height="22" rx="4" fill="#0ea5e9"/><rect x="-4" y="-44" width="104" height="22" rx="4" fill="#facc15"/><rect x="10" y="-66" width="90" height="22" rx="4" fill="#16a34a"/></g>`,
  table: (x, y, w = 360) => `<rect x="${x}" y="${y}" width="${w}" height="18" rx="9" fill="#92400e"/><rect x="${x + 20}" y="${y + 18}" width="12" height="90" fill="#78350f"/><rect x="${x + w - 32}" y="${y + 18}" width="12" height="90" fill="#78350f"/>`,
  cups: (x, y) => `<rect x="${x}" y="${y - 30}" width="22" height="30" rx="4" fill="#f8fafc"/><rect x="${x + 50}" y="${y - 34}" width="22" height="34" rx="4" fill="#fde68a"/><rect x="${x + 100}" y="${y - 28}" width="22" height="28" rx="4" fill="#f8fafc"/>`,
  drum: (x, y) => `<g transform="translate(${x} ${y})"><path d="M-40 -110 H40 L28 -20 L36 0 H-36 L-28 -20Z" fill="#92400e"/><ellipse cx="0" cy="-110" rx="40" ry="12" fill="#fde68a"/><path d="M-36 -90 L36 -40 M36 -90 L-36 -40" stroke="#451a03" stroke-width="3"/></g>`,
  flag: (x, y) => `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="6" height="200" fill="#475569"/><rect x="6" y="0" width="130" height="86" fill="#198a3c"/><rect x="82" y="34" width="18" height="52" fill="#de2010"/><rect x="100" y="34" width="18" height="52" fill="#111"/><rect x="118" y="34" width="18" height="52" fill="#ef7d00"/><path d="M98 12 q12 -8 24 0 q-12 4 -24 0z" fill="#ef7d00"/></g>`,
  cap: (x, y) => `<g transform="translate(${x} ${y})"><polygon points="-30,0 0,-14 30,0 0,14" fill="#111827"/><rect x="-14" y="2" width="28" height="12" rx="3" fill="#111827"/><path d="M24 2 v18" stroke="#facc15" stroke-width="3"/><circle cx="24" cy="22" r="4" fill="#facc15"/></g>`,
  confetti: (r, W, H, n = 60) => { let s = ''; for (let i = 0; i < n; i++) s += `<rect x="${f(r() * W)}" y="${f(r() * H * 0.6)}" width="10" height="5" rx="2" fill="${pick(r, CLOTHES)}" transform="rotate(${f(r() * 180)} ${f(r() * W)} ${f(r() * H * 0.6)})" opacity=".9"/>`; return s; },
  boxes: (x, y) => `<g transform="translate(${x} ${y})"><rect x="0" y="-70" width="90" height="70" rx="6" fill="#d97706"/><rect x="70" y="-130" width="80" height="60" rx="6" fill="#f59e0b"/><path d="M35 -45 c0 -12 18 -12 18 0 c0 -12 18 -12 18 0 c0 14 -18 22 -18 26 c0 -4 -18 -12 -18 -26z" fill="#e11d48"/></g>`,
  tree: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-8" y="-90" width="16" height="90" fill="#78350f"/><circle cx="0" cy="-120" r="55" fill="#16a34a"/><circle cx="-35" cy="-95" r="36" fill="#15803d"/><circle cx="38" cy="-98" r="34" fill="#22c55e"/></g>`,
  chart: (x, y) => `<g transform="translate(${x} ${y})"><rect width="240" height="160" rx="14" fill="#fff"/><rect x="30" y="100" width="30" height="40" rx="4" fill="#fdba74"/><rect x="80" y="76" width="30" height="64" rx="4" fill="#fb923c"/><rect x="130" y="50" width="30" height="90" rx="4" fill="#f97316"/><rect x="180" y="24" width="30" height="116" rx="4" fill="#ea580c"/><path d="M40 90 L95 66 L145 40 L195 16" fill="none" stroke="#0f766e" stroke-width="5" stroke-linecap="round"/></g>`,
  plane: (x, y) => `<g transform="translate(${x} ${y}) rotate(-12)"><path d="M0 0 H150 q22 0 22 12 q0 12 -22 12 H0 l-20 -24z" fill="#fff"/><path d="M60 0 L100 -50 H118 L96 0z M60 24 L100 70 H118 L96 24z" fill="#e2e8f0"/></g><path d="M${x - 300} ${y + 80} q120 -40 280 -60" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="10 12" opacity=".7"/>`,
  suitcase: (x, y, c = '#e11d48') => `<g transform="translate(${x} ${y})"><rect x="0" y="-90" width="70" height="90" rx="10" fill="${c}"/><rect x="22" y="-108" width="26" height="18" rx="6" fill="none" stroke="#334155" stroke-width="5"/><path d="M18 -90 V0 M52 -90 V0" stroke="#000" stroke-opacity=".2" stroke-width="4"/></g>`,
  skyline: (W, H, c = '#1e293b') => { let s = ''; const r = rng('sky' + W); let x = 0; while (x < W) { const w = 50 + r() * 90, h = 120 + r() * 260; s += `<rect x="${f(x)}" y="${f(H - 150 - h)}" width="${f(w)}" height="${f(h + 150)}" fill="${c}" opacity="${f(0.25 + r() * 0.25)}"/>`; x += w + 6; } return s; },
  badge: (x, y) => `<rect x="${x}" y="${y}" width="26" height="18" rx="3" fill="#fff" stroke="#0f766e" stroke-width="2"/>`,
};
const f = (n) => +n.toFixed(1);

// ---------- scenes ----------
const W = 1200, H = 800;
function scene(id, { bg, decor, people, front = '' }) {
  const r = rng(id);
  let s = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#bg)"/>${decor(r)}`;
  s += people.map((p) => person(r, p)).join('');
  s += front;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><title>${id.replace(/-/g, ' ')} (illustration)</title>${s}</svg>\n`;
}
const row = (xs, y, s = 1.6, upIdx = []) => xs.map((x, i) => ({ x, y, s, armUp: upIdx.includes(i) }));

const SCENES = {
  'hero-community': { bg: ['#fde68a', '#fb923c'], decor: () => P.sun(950, 210, 110, '#fff7ed') + P.hills(W, H, '#f97316', '#ea580c') + P.bunting(W, 40, ['#16a34a', '#dc2626', '#111', '#f97316', '#facc15']), people: row([170, 330, 490, 650, 810, 970, 1110], 760, 1.75, [1, 4, 6]) },
  'social-gathering': { bg: ['#312e81', '#7c3aed'], decor: () => P.lights(W, 30) + P.bubble(160, 150, '#fff') + P.bubble(880, 120, '#fde68a', 140), people: row([200, 380, 560, 760, 950], 760, 1.7, [2]), front: P.table(380, 620, 420) + P.cups(470, 620) },
  'networking': { bg: ['#e0f2fe', '#bae6fd'], decor: () => P.skyline(W, H, '#0f172a') + P.bubble(230, 140, '#fff') + P.bubble(800, 170, '#fff', 140), people: row([220, 430, 640, 860, 1040], 770, 1.75, [1]) },
  'football': { bg: ['#38bdf8', '#bbf7d0'], decor: () => `<rect y="${H - 260}" width="${W}" height="260" fill="#16a34a"/><path d="M0 ${H - 140} H${W}" stroke="#fff" stroke-opacity=".5" stroke-width="5"/>` + P.goal(860, H - 400), people: row([180, 380, 600, 780], 760, 1.7, [0, 2]), front: P.ball(500, 740) },
  'basketball': { bg: ['#fed7aa', '#fdba74'], decor: () => `<rect y="${H - 220}" width="${W}" height="220" fill="#c2410c"/><path d="M0 ${H - 120} H${W}" stroke="#fff" stroke-opacity=".5" stroke-width="5"/>` + P.hoop(980, 260), people: row([160, 360, 560, 750], 770, 1.7, [3]), front: P.basketball(860, 330) },
  'hiking': { bg: ['#bae6fd', '#e0f2fe'], decor: () => P.sun(220, 160, 70) + P.mountains(W, H) + P.hills(W, H, '#22c55e', '#16a34a') + P.tree(1080, 640, 1.2) + P.tree(100, 600, 0.9), people: row([330, 500, 670, 840], 770, 1.6, [3]) },
  'cycling': { bg: ['#fef9c3', '#bbf7d0'], decor: () => P.sun(1000, 150, 80) + P.hills(W, H, '#86efac', '#4ade80') + `<rect y="${H - 90}" width="${W}" height="90" fill="#64748b"/>`, people: row([180, 520, 860], 770, 1.6, [1]), front: P.bike(250, 735, '#f97316') + P.bike(590, 735, '#7c3aed') + P.bike(930, 735, '#0ea5e9') },
  'culture': { bg: ['#fef3c7', '#fcd34d'], decor: () => P.bunting(W, 40, ['#16a34a', '#dc2626', '#111', '#f97316']) + P.flag(960, 260), people: row([170, 360, 550, 740], 770, 1.75, [0, 2]), front: P.drum(880, 770) },
  'volunteering': { bg: ['#dcfce7', '#a7f3d0'], decor: () => P.tree(1040, 700, 1.4) + P.tree(120, 650, 1) + P.bubble(560, 120, '#fff'), people: row([260, 450, 640, 830], 770, 1.7, [1]), front: P.boxes(880, 770) },
  'skills': { bg: ['#ede9fe', '#ddd6fe'], decor: () => `<rect x="130" y="110" width="520" height="300" rx="16" fill="#1e293b"/><path d="M180 180 H520 M180 230 H460 M180 280 H560 M180 330 H400" stroke="#a5f3fc" stroke-width="10" stroke-linecap="round"/>`, people: row([300, 520, 760, 980], 780, 1.65, [0]), front: P.table(640, 640, 460) + P.laptop(700, 562) + P.laptop(900, 562, '#7c3aed') },
  'study': { bg: ['#ffedd5', '#fecaca'], decor: () => `<rect x="80" y="80" width="300" height="420" rx="12" fill="#fff" opacity=".7"/>` + P.books(140, 470) + P.bubble(840, 140, '#fff'), people: row([420, 620, 820, 1020], 770, 1.65, [2]), front: P.table(500, 640, 520) + P.laptop(560, 562) + P.books(820, 640) },
  'graduation': { bg: ['#1e3a8a', '#3b82f6'], decor: (r) => P.confetti(r, W, H, 80), people: row([200, 400, 600, 800, 1000], 770, 1.75, [0, 2, 4]).map((p) => ({ ...p, extra: P.cap(0, -178) })) },
  'business': { bg: ['#ccfbf1', '#99f6e4'], decor: () => P.chart(760, 140) + P.skyline(W, H, '#134e4a'), people: row([250, 470, 690], 780, 1.75, [1]), front: P.table(560, 650, 400) + P.laptop(640, 572, '#0f766e') },
  'travel': { bg: ['#38bdf8', '#7dd3fc'], decor: () => P.sun(200, 150, 70, '#fde68a') + P.plane(820, 160) + P.hills(W, H, '#0ea5e9', '#0284c7'), people: row([300, 520, 740, 960], 770, 1.7, [2]), front: P.suitcase(380, 770) + P.suitcase(820, 770, '#f59e0b') },
  'mentoring': { bg: ['#fae8ff', '#f5d0fe'], decor: () => P.bubble(300, 150, '#fff', 140) + P.bubble(700, 120, '#fde68a', 140), people: row([430, 770], 780, 1.9, [0]), front: P.table(470, 650, 260) + P.cups(540, 650) },
};

// ---------- avatars ----------
const AV_BG = [['#fed7aa', '#fb923c'], ['#bae6fd', '#38bdf8'], ['#ddd6fe', '#a78bfa'], ['#bbf7d0', '#4ade80'], ['#fecdd3', '#fb7185'], ['#fef08a', '#facc15'], ['#99f6e4', '#2dd4bf']];
function avatar(id) {
  const r = rng(id);
  const [a, b] = pick(r, AV_BG);
  const body = person(r, { x: 200, y: 560, s: 2.3 });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><title>Illustrated avatar</title><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="330" cy="70" r="90" fill="#fff" opacity=".18"/>${body}</svg>\n`;
}

async function write(rel, content) {
  const file = join(OUT, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
}

let n = 0;
for (const [id, spec] of Object.entries(SCENES)) { await write(`scenes/${id}.svg`, scene(id, spec)); n++; }
const MEMBER_IDS = ['chipo-m', 'mwamba-k', 'natasha-b', 'chilufya-s', 'kondwani-p', 'thandiwe-n', 'mutale-c', 'bupe-l', 'lubinda-m', 'nchimunya-h', 'mapalo-z', 'taonga-j', 'kabwe-r', 'misozi-t'];
for (const id of MEMBER_IDS) { await write(`avatars/${id}.svg`, avatar(id)); n++; }
console.log(`Generated ${n} SVG files in ${OUT}`);
