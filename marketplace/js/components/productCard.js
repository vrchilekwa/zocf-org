import { html } from '../utils/html.js';
import { formatPrice, AVAILABILITY_LABELS } from '../utils/format.js';
import { icons } from './icons.js';

const AVAILABILITY_STYLES = {
  'in-stock': 'bg-emerald-100 text-emerald-800',
  'low-stock': 'bg-amber-100 text-amber-800',
  'out-of-stock': 'bg-gray-200 text-gray-700',
};

export function availabilityBadge(product, extra = '') {
  return html`<span class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${AVAILABILITY_STYLES[product.availability]} ${extra}">${AVAILABILITY_LABELS[product.availability]}</span>`;
}

export function addToBasketButton(product, { cls = '', label = 'Add to basket' } = {}) {
  const soldOut = product.availability === 'out-of-stock';
  return html`<button type="button" data-add-to-basket="${product.id}" ${soldOut ? html`disabled aria-disabled="true"` : ''}
    class="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${soldOut ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'bg-amber-400 text-emerald-950 shadow-sm hover:bg-amber-300'} ${cls}"
    aria-label="${soldOut ? `${product.name} is out of stock` : `Add ${product.name} to basket`}">
    ${icons.basket('h-4 w-4')}<span>${soldOut ? 'Sold out' : label}</span>
  </button>`;
}

/**
 * Reusable product card.
 * @param {object} product
 * @param {{ categoryNames?: Record<string,string>, compact?: boolean, headingLevel?: number }} opts
 */
export function productCard(product, { categoryNames = {}, compact = false, headingLevel = 3 } = {}) {
  const href = `#/product/${encodeURIComponent(product.id)}`;
  const h = `h${headingLevel}`;
  return html`
    <article class="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <a href="${href}" class="relative block aspect-square overflow-hidden bg-emerald-950" tabindex="-1" aria-hidden="true">
        <img src="${product.images[0]}" alt="" loading="lazy" decoding="async" width="800" height="800"
             class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span class="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-900 shadow">Demo listing</span>
        ${availabilityBadge(product, 'absolute right-3 top-3 shadow')}
      </a>
      <div class="flex flex-1 flex-col p-4 sm:p-5">
        <p class="text-xs font-semibold uppercase tracking-wider text-amber-700">${categoryNames[product.category] || product.category}</p>
        <${h} class="mt-1 text-base font-bold leading-snug text-gray-900 sm:text-lg">
          <a href="${href}" class="hover:text-emerald-800 focus:outline-none focus-visible:underline">${product.name}</a>
        </${h}>
        ${compact ? '' : html`<p class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">${product.description}</p>`}
        <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <div><dt class="text-gray-500">Length</dt><dd class="font-semibold text-gray-800">${product.fabricLength}</dd></div>
          <div><dt class="text-gray-500">Seller</dt><dd class="truncate font-semibold text-gray-800"><a href="#/sellers/${encodeURIComponent(product.sellerId)}" class="hover:text-emerald-700 hover:underline">${product.sellerName}</a></dd></div>
        </dl>
        <div class="mt-auto pt-4">
          <p class="text-xl font-extrabold text-emerald-900">${formatPrice(product.price)}</p>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <a href="${href}" class="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-800/20 px-3 py-2.5 text-sm font-semibold text-emerald-900 transition hover:border-emerald-700 hover:bg-emerald-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">View details</a>
            ${addToBasketButton(product, { label: 'Add' })}
          </div>
        </div>
      </div>
    </article>`;
}

export function productGrid(products, opts = {}) {
  const cols = opts.cols || 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return html`<ul class="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 ${cols}" role="list">
    ${products.map((p) => html`<li>${productCard(p, opts)}</li>`)}
  </ul>`;
}
