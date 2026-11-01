import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { inspirationCard, inspirationDialog, mountInspirationGallery } from '../components/inspirationCard.js';
import { loadingBlock, errorState, emptyState } from '../components/states.js';
import { getInspiration } from '../services/inspirationService.js';
import { capitalise } from '../utils/format.js';

export async function inspirationView(root, ctx) {
  ctx.setTitle('Inspiration Gallery');
  render(root, loadingBlock('Loading inspiration…'));
  let items;
  try {
    items = await getInspiration();
  } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Inspiration Gallery</h1>${errorState(err.message)}</div>`);
    root.querySelector('[data-retry]').addEventListener('click', () => inspirationView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;

  const patterns = [...new Set(items.flatMap((i) => i.patterns))].sort();
  const active = ctx.query.get('pattern') || '';

  render(root, html`<div class="bg-gradient-to-b from-indigo-950 to-emerald-950 text-white">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 ring-1 ring-white/15">${icons.image('h-4 w-4')} Design ideas · not for sale</p>
        <h1 class="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">Inspiration Gallery</h1>
        <p class="mt-3 max-w-2xl text-lg text-white/85">Pattern and colour ideas to inspire your next outfit, headwrap or celebration look. Select a design to explore it and find real listings with a similar style.</p>
        <p class="mt-4 max-w-3xl text-sm text-white/70">These boards are original illustrations made for this demonstration. In a later stage the gallery will show images from Pinterest or another authorised image provider, with full credit to their creators. Images are never copied without permission.</p>
      </div>
    </div>
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filter inspiration by pattern">
        <button type="button" data-pattern="" aria-pressed="${!active}" class="min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1 transition">All</button>
        ${patterns.map((p) => html`<button type="button" data-pattern="${p}" aria-pressed="${active === p}" class="min-h-[40px] rounded-full px-4 text-sm font-semibold capitalize ring-1 transition">${capitalise(p)}</button>`)}
      </div>
      <p id="inspCount" class="mt-4 text-sm text-gray-600" aria-live="polite"></p>
      <div id="gallery" class="mp-masonry mt-6"></div>
      ${inspirationDialog()}
    </div>`);

  const gallery = root.querySelector('#gallery');
  const buttons = root.querySelectorAll('[data-pattern]');
  function show(pattern) {
    const list = pattern ? items.filter((i) => i.patterns.includes(pattern)) : items;
    render(gallery, list.length ? list.map(inspirationCard) : emptyState({ title: 'No inspiration for that pattern yet' }));
    root.querySelector('#inspCount').textContent = `${list.length} design ${list.length === 1 ? 'idea' : 'ideas'}`;
    buttons.forEach((b) => {
      const on = b.dataset.pattern === pattern;
      b.setAttribute('aria-pressed', String(on));
      b.className = `min-h-[40px] rounded-full px-4 text-sm font-semibold capitalize ring-1 transition ${on ? 'bg-emerald-900 text-white ring-emerald-900' : 'bg-white text-gray-800 ring-gray-200 hover:ring-emerald-600'}`;
    });
  }
  buttons.forEach((b) => b.addEventListener('click', () => { ctx.replaceQuery({ pattern: b.dataset.pattern }); show(b.dataset.pattern); }));
  show(patterns.includes(active) ? active : '');
  mountInspirationGallery(root, items);
}
