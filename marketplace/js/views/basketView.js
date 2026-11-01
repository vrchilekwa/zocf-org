import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { loadingBlock, errorState, emptyState, demoNotice } from '../components/states.js';
import { getProducts } from '../services/productService.js';
import * as basket from '../services/basketService.js';
import { formatPrice } from '../utils/format.js';

function line({ product, quantity, lineTotal }) {
  const atMax = quantity >= product.stockQuantity;
  return html`<li class="flex gap-4 py-5" data-line="${product.id}">
    <a href="#/product/${product.id}" class="shrink-0"><img src="${product.images[0]}" alt="" class="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28" /></a>
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
        <div class="min-w-0">
          <h3 class="font-bold text-gray-900"><a href="#/product/${product.id}" class="hover:text-emerald-800">${product.name}</a></h3>
          <p class="text-sm text-gray-500">${product.fabricLength} · ${product.sellerName}</p>
          <p class="mt-1 text-sm text-gray-700">${formatPrice(product.price)} each</p>
        </div>
        <p class="text-lg font-extrabold text-emerald-900 sm:text-right" aria-label="Line subtotal">${formatPrice(lineTotal)}</p>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <div class="inline-flex items-center rounded-xl ring-1 ring-gray-300" role="group" aria-label="Quantity of ${product.name}">
          <button type="button" data-dec="${product.id}" class="flex h-11 w-11 items-center justify-center rounded-l-xl hover:bg-gray-100" aria-label="Decrease quantity of ${product.name}">${icons.minus('h-4 w-4')}</button>
          <input type="number" inputmode="numeric" min="1" max="${product.stockQuantity}" value="${quantity}" data-qty="${product.id}"
            class="mp-qty h-11 w-14 border-x border-gray-300 text-center font-semibold focus:outline-none" aria-label="Quantity of ${product.name}" />
          <button type="button" data-inc="${product.id}" ${atMax ? html`disabled aria-disabled="true"` : ''} class="flex h-11 w-11 items-center justify-center rounded-r-xl hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Increase quantity of ${product.name}">${icons.plus('h-4 w-4')}</button>
        </div>
        <button type="button" data-remove="${product.id}" class="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-red-700 hover:bg-red-50">${icons.trash('h-4 w-4')} Remove</button>
        <p class="w-full text-xs ${atMax ? 'font-semibold text-amber-800' : 'text-gray-500'}">${atMax ? `Maximum available (${product.stockQuantity}) is in your basket.` : `${product.stockQuantity} available`}</p>
      </div>
    </div>
  </li>`;
}

export function summaryCard({ subtotal, count }, { cta = true } = {}) {
  return html`<div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
    <h2 class="text-lg font-bold text-emerald-950">Order summary</h2>
    <dl class="mt-4 space-y-3 text-sm">
      <div class="flex justify-between"><dt class="text-gray-600">Items</dt><dd class="font-semibold">${count}</dd></div>
      <div class="flex justify-between"><dt class="text-gray-600">Subtotal</dt><dd class="font-semibold">${formatPrice(subtotal)}</dd></div>
      <div class="flex justify-between"><dt class="text-gray-600">Delivery</dt><dd class="text-gray-500">Set by sellers (not calculated in demo)</dd></div>
      <div class="flex justify-between border-t border-gray-100 pt-3 text-base"><dt class="font-bold">Total</dt><dd class="font-extrabold text-emerald-900" id="basketTotal">${formatPrice(subtotal)}</dd></div>
    </dl>
    ${cta ? html`<a href="#/checkout" class="mt-6 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-amber-400 px-5 font-bold text-emerald-950 shadow-md hover:bg-amber-300">Proceed to demo checkout</a>
    <a href="#/catalogue" class="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-emerald-800/20 px-5 font-semibold text-emerald-900 hover:bg-emerald-50">Continue shopping</a>` : ''}
    <p class="mt-4 text-xs text-gray-500">Demonstration only: no order will be placed and no payment will be taken.</p>
  </div>`;
}

export async function basketView(root, ctx) {
  ctx.setTitle('Your basket');
  render(root, loadingBlock('Loading your basket…'));
  let products;
  try {
    products = await getProducts();
  } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Your basket</h1>${errorState(err.message)}</div>`);
    root.querySelector('[data-retry]').addEventListener('click', () => basketView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;
  const byId = new Map(products.map((p) => [p.id, p]));
  let notices = basket.reconcile(products).notices;

  function draw(message = '') {
    const state = basket.reconcile(products);
    notices = [...notices, ...state.notices];
    render(root, html`<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Your basket</h1>
      <span class="mp-band mt-3 block h-2 w-24 rounded-full" aria-hidden="true"></span>
      <p class="sr-only" aria-live="polite" id="basketLive">${message}</p>
      ${notices.length ? html`<ul class="mt-6 space-y-2" role="status">${notices.map((n) => html`<li class="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-900 ring-1 ring-amber-200">${n}</li>`)}</ul>` : ''}
      ${state.lines.length === 0
        ? html`<div class="mt-8">${emptyState({ title: 'Your basket is empty', message: 'Browse the catalogue and add some chitenge to see how the basket works.', actionHref: '#/catalogue', actionLabel: 'Browse materials' })}</div>`
        : html`<div class="mt-8 grid gap-8 lg:grid-cols-3 lg:items-start">
            <section class="rounded-3xl bg-white px-5 shadow-sm ring-1 ring-black/5 sm:px-6 lg:col-span-2" aria-labelledby="basketItemsTitle">
              <h2 id="basketItemsTitle" class="sr-only">Items in your basket</h2>
              <ul class="divide-y divide-gray-100">${state.lines.map(line)}</ul>
            </section>
            <aside class="lg:sticky lg:top-36">${summaryCard(state)}<div class="mt-4">${demoNotice('Prices and stock levels are sample data.')}</div></aside>
          </div>`}
    </div>`);
    notices = [];
  }
  draw();

  // After a redraw, put keyboard focus back on the nearest sensible control.
  const focusAfter = (...selectors) => requestAnimationFrame(() => {
    for (const sel of selectors) { const el = root.querySelector(sel); if (el) { el.focus(); return; } }
  });

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-inc],[data-dec],[data-remove]');
    if (!t) return;
    if (t.dataset.remove) {
      const p = byId.get(t.dataset.remove);
      basket.removeItem(p.id);
      draw(`${p.name} removed from your basket.`);
      focusAfter('[data-remove]', 'a[href="#/catalogue"]');
      return;
    }
    const id = t.dataset.inc || t.dataset.dec;
    const p = byId.get(id);
    const current = basket.getQuantity(id);
    const next = current + (t.dataset.inc ? 1 : -1);
    if (next > p.stockQuantity) { notices.push(`Only ${p.stockQuantity} of ${p.name} available.`); draw(); return; }
    basket.setQuantity(p, next);
    draw(next === 0 ? `${p.name} removed from your basket.` : `${p.name} quantity ${next}.`);
    if (next === 0) focusAfter('[data-remove]', 'a[href="#/catalogue"]');
    else focusAfter(`[data-${t.dataset.inc ? 'inc' : 'dec'}="${id}"]:not([disabled])`, `[data-qty="${id}"]`);
  });

  root.addEventListener('change', (e) => {
    const input = e.target.closest('[data-qty]');
    if (!input) return;
    const p = byId.get(input.dataset.qty);
    const n = Number(input.value);
    if (!Number.isInteger(n) || n < 0) { notices.push('Please enter a whole number for the quantity.'); draw(); return; }
    const result = basket.setQuantity(p, n);
    if (!result.ok) notices.push(result.message);
    draw(n === 0 ? `${p.name} removed from your basket.` : `${p.name} quantity ${result.quantity}.`);
  });
}
