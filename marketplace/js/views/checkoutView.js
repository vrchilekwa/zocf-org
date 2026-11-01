// Demonstration checkout. Collects NO payment details and never reports a successful payment.
import { html, render } from '../utils/html.js';
import { loadingBlock, errorState, emptyState } from '../components/states.js';
import { getProducts } from '../services/productService.js';
import * as basket from '../services/basketService.js';
import { summaryCard } from './basketView.js';
import { formatPrice } from '../utils/format.js';
import { icons } from '../components/icons.js';

const input = 'mt-1.5 block h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100';

function field(id, label, attrs, hint = '') {
  return html`<div>
    <label for="${id}" class="block text-sm font-semibold text-gray-800">${label}</label>
    <input id="${id}" name="${id}" class="${input}" ${attrs} />
    ${hint ? html`<p class="mt-1 text-xs text-gray-500">${hint}</p>` : ''}
    <p class="mt-1 hidden text-sm font-medium text-red-700" data-error-for="${id}"></p>
  </div>`;
}

export async function checkoutView(root, ctx) {
  ctx.setTitle('Demo checkout');
  render(root, loadingBlock('Preparing checkout…'));
  let state;
  try {
    state = basket.reconcile(await getProducts());
  } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Checkout</h1>${errorState(err.message)}</div>`);
    root.querySelector('[data-retry]').addEventListener('click', () => checkoutView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;

  if (!state.lines.length) {
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Checkout</h1>${emptyState({ title: 'Your basket is empty', message: 'Add some materials before trying the demo checkout.', actionHref: '#/catalogue', actionLabel: 'Browse materials' })}</div>`);
    return;
  }

  render(root, html`<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <a href="#/basket" class="inline-flex min-h-[44px] items-center gap-2 font-semibold text-emerald-800 hover:text-emerald-600">${icons.arrowLeft('h-5 w-5')} Back to basket</a>
    <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Checkout <span class="align-middle text-base font-bold uppercase tracking-widest text-amber-700">Demonstration</span></h1>
    <div class="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-amber-950" role="note">
      <p class="font-bold">This checkout is a demonstration.</p>
      <p class="mt-1 text-sm">It shows the steps a real checkout will have. No order is placed, nothing is sent to sellers, no payment is taken and no card details are requested. Online payments will be added in a later stage with a secure payment provider.</p>
    </div>

    <div class="mt-8 grid gap-8 lg:grid-cols-3 lg:items-start">
      <div class="space-y-6 lg:col-span-2" id="checkoutMain">
        <form id="checkoutForm" class="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8" novalidate>
          <fieldset class="space-y-4">
            <legend class="text-lg font-bold text-emerald-950">1. Contact details</legend>
            <div class="grid gap-4 sm:grid-cols-2">
              ${field('fullName', 'Full name', html`type="text" autocomplete="name" required`)}
              ${field('email', 'Email address', html`type="email" autocomplete="email" required`)}
            </div>
          </fieldset>
          <fieldset class="space-y-4">
            <legend class="text-lg font-bold text-emerald-950">2. Delivery address</legend>
            ${field('address', 'Address', html`type="text" autocomplete="street-address" required`)}
            <div class="grid gap-4 sm:grid-cols-2">
              ${field('city', 'Town or city', html`type="text" autocomplete="address-level2" required`)}
              ${field('postcode', 'Postcode', html`type="text" autocomplete="postal-code" required`)}
            </div>
          </fieldset>
          <fieldset>
            <legend class="text-lg font-bold text-emerald-950">3. Payment</legend>
            <div class="mt-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 ring-1 ring-gray-200">
              Payment is <strong>not available</strong> in this demonstration. A secure payment provider will be connected when the marketplace launches. Please do not enter any card details anywhere on this site.
            </div>
          </fieldset>
          <p class="text-xs text-gray-500">Your details stay in this browser tab and are not saved or sent anywhere.</p>
          <button type="submit" class="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-emerald-800 px-5 font-bold text-white shadow-md hover:bg-emerald-700">Review demo order</button>
        </form>
      </div>
      <aside class="space-y-4 lg:sticky lg:top-36">
        <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 class="text-lg font-bold text-emerald-950">In your basket</h2>
          <ul class="mt-4 space-y-3">${state.lines.map((l) => html`<li class="flex items-center gap-3"><img src="${l.product.images[0]}" alt="" class="h-12 w-12 rounded-lg object-cover" /><span class="min-w-0 flex-1 text-sm"><span class="block truncate font-semibold">${l.product.name}</span><span class="text-gray-500">Qty ${l.quantity}</span></span><span class="text-sm font-semibold">${formatPrice(l.lineTotal)}</span></li>`)}</ul>
        </div>
        ${summaryCard(state, { cta: false })}
      </aside>
    </div>
  </div>`);

  const form = root.querySelector('#checkoutForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll('input').forEach((el) => {
      const err = form.querySelector(`[data-error-for="${el.id}"]`);
      el.value = el.value.trim();
      const msg = el.validity.valueMissing ? 'This field is required.' : el.validity.typeMismatch ? 'Please enter a valid email address.' : '';
      err.textContent = msg;
      err.classList.toggle('hidden', !msg);
      el.setAttribute('aria-invalid', String(Boolean(msg)));
      if (msg) el.setAttribute('aria-describedby', err.id = `err-${el.id}`); else el.removeAttribute('aria-describedby');
      if (msg && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    const ref = 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const main = root.querySelector('#checkoutMain');
    render(main, html`<section class="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5 sm:p-10" aria-labelledby="demoDoneTitle">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">${icons.info('h-8 w-8')}</div>
      <h2 id="demoDoneTitle" tabindex="-1" class="mt-5 text-2xl font-extrabold text-emerald-950">Demo checkout complete. No order was placed.</h2>
      <p class="mx-auto mt-3 max-w-lg text-gray-700">Thank you for trying the checkout. In the live marketplace this is where you would pay securely and receive an order confirmation. Here, <strong>nothing has been ordered, sent or charged</strong>.</p>
      <p class="mt-4 text-sm text-gray-500">Demonstration reference (not an order number): <span class="font-mono font-semibold text-gray-800">${ref}</span></p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" data-clear-basket class="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 px-5 font-semibold text-gray-700 hover:bg-gray-50">Empty my basket</button>
        <a href="#/catalogue" class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-800 px-5 font-semibold text-white hover:bg-emerald-700">Continue browsing</a>
      </div>
    </section>`);
    main.querySelector('#demoDoneTitle').focus();
    main.querySelector('[data-clear-basket]').addEventListener('click', (ev) => {
      basket.clear();
      ev.currentTarget.textContent = 'Basket emptied';
      ev.currentTarget.disabled = true;
    });
  });
}
