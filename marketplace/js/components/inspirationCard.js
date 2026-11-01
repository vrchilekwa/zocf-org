import { html, render } from '../utils/html.js';
import { icons } from './icons.js';

/** Inspiration card. Visually distinct from product cards and always labelled "not for sale". */
export function inspirationCard(item) {
  return html`<article class="mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-[#f7f1e3] shadow-sm ring-1 ring-amber-900/10">
    <button type="button" data-inspiration="${item.id}" class="group block w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400" aria-label="Explore inspiration: ${item.title}">
      <span class="relative block overflow-hidden">
        <img src="${item.image}" alt="" loading="lazy" decoding="async" class="w-full transition duration-500 group-hover:scale-[1.03]" />
        <span class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-indigo-950/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">${icons.image('h-3.5 w-3.5')} Inspiration · not for sale</span>
      </span>
      <span class="block p-4">
        <span class="block font-bold text-gray-900 group-hover:text-emerald-800">${item.title}</span>
        <span class="mt-1 block line-clamp-2 text-sm text-gray-600">${item.description}</span>
        <span class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">Explore ${icons.arrowRight('h-4 w-4')}</span>
      </span>
    </button>
  </article>`;
}

export function inspirationDialog() {
  return html`<dialog id="inspirationDialog" class="w-[min(56rem,94vw)] overflow-hidden rounded-3xl p-0 shadow-2xl backdrop:bg-black/70" aria-labelledby="inspDialogTitle">
    <div data-dialog-body></div>
  </dialog>`;
}

export function inspirationDetail(item) {
  return html`<div class="grid max-h-[90vh] overflow-y-auto md:grid-cols-2">
    <div class="bg-[#f7f1e3]"><img src="${item.image}" alt="Design study: ${item.title}" class="h-full w-full object-cover" /></div>
    <div class="flex flex-col p-6 sm:p-8">
      <div class="flex items-start justify-between gap-4">
        <p class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-900">${icons.image('h-3.5 w-3.5')} Inspiration · not for sale</p>
        <button type="button" data-close-dialog class="-mr-2 -mt-2 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Close">${icons.close()}</button>
      </div>
      <h2 id="inspDialogTitle" class="mt-4 text-2xl font-extrabold text-emerald-950">${item.title}</h2>
      <p class="mt-3 text-gray-700">${item.description}</p>
      <dl class="mt-5 space-y-3 text-sm">
        <div><dt class="font-semibold text-gray-500">Colours</dt><dd class="mt-1 flex flex-wrap gap-1.5">${item.colours.map((c) => html`<span class="rounded-full bg-gray-100 px-2.5 py-1 font-medium capitalize text-gray-800">${c}</span>`)}</dd></div>
        <div><dt class="font-semibold text-gray-500">Pattern ideas</dt><dd class="mt-1 flex flex-wrap gap-1.5">${item.patterns.map((p) => html`<span class="rounded-full bg-gray-100 px-2.5 py-1 font-medium capitalize text-gray-800">${p}</span>`)}</dd></div>
        <div><dt class="font-semibold text-gray-500">Source</dt><dd class="mt-1 text-gray-700">${item.source.label}. ${item.source.attribution}.</dd></div>
      </dl>
      <div class="mt-auto pt-6">
        <p class="text-sm text-gray-600">This is a design idea, not a product. Find real listings with a similar look:</p>
        <div class="mt-3 flex flex-col gap-2 sm:flex-row">
          <a href="#/catalogue?q=${encodeURIComponent(item.searchHint)}" data-close-dialog class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700">${icons.search('h-4 w-4')} Search catalogue</a>
          <a href="#/discover?q=${encodeURIComponent(item.description)}" data-close-dialog class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 font-bold text-emerald-950 hover:bg-amber-300">${icons.sparkles('h-4 w-4')} Discover similar</a>
        </div>
      </div>
    </div>
  </div>`;
}

/** Open the detail dialog when an inspiration card inside root is clicked. Root must contain inspirationDialog(). */
export function mountInspirationGallery(root, items) {
  const dialog = root.querySelector('#inspirationDialog');
  if (!dialog) return;
  const body = dialog.querySelector('[data-dialog-body]');
  let opener = null;
  root.addEventListener('click', (e) => {
    const card = e.target.closest('[data-inspiration]');
    if (!card) return;
    const item = items.find((i) => i.id === card.dataset.inspiration);
    if (!item) return;
    opener = card;
    render(body, inspirationDetail(item));
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close-dialog]')) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
}
