import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { productGrid, availabilityBadge, addToBasketButton } from '../components/productCard.js';
import { loadingBlock, errorState, emptyState, demoNotice } from '../components/states.js';
import { getProductById, getRelatedProducts, getSellerById, getCategoryNames } from '../services/productService.js';
import * as basket from '../services/basketService.js';
import { formatPrice, formatDimensions, formatDate, capitalise } from '../utils/format.js';
import { LAST_CATALOGUE_KEY } from './catalogueView.js';

const IMAGE_LABELS = ['Full fabric', 'Close-up of the print', 'Draped, showing the border'];

function backHref() {
  try { return sessionStorage.getItem(LAST_CATALOGUE_KEY) || '#/catalogue'; } catch { return '#/catalogue'; }
}

function stockMessage(product, inBasket) {
  if (product.stockQuantity === 0) return 'This fabric is currently out of stock.';
  const left = product.stockQuantity - inBasket;
  if (left <= 0) return `All ${product.stockQuantity} available are in your basket.`;
  return `${product.stockQuantity} available${inBasket ? ` · ${inBasket} in your basket` : ''}.`;
}

function purchaseBox(product, inBasket) {
  const left = Math.max(0, product.stockQuantity - inBasket);
  const disabled = left === 0;
  return html`<div id="purchaseBox" class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <p class="text-3xl font-extrabold text-emerald-900">${formatPrice(product.price)}</p>
      <p class="text-sm text-gray-500">per ${product.fabricLength.includes('pieces') ? 'set' : 'piece'} · ${product.fabricLength}</p>
    </div>
    <p id="stockMsg" class="mt-2 text-sm font-medium ${disabled ? 'text-gray-600' : 'text-emerald-800'}" aria-live="polite">${stockMessage(product, inBasket)}</p>
    <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div>
        <label for="qty" class="block text-sm font-semibold text-gray-800">Quantity</label>
        <div class="mt-1.5 inline-flex items-center rounded-xl ring-1 ring-gray-300">
          <button type="button" data-step="-1" class="flex h-11 w-11 items-center justify-center rounded-l-xl text-gray-700 hover:bg-gray-100 disabled:opacity-40" aria-label="Decrease quantity" ${disabled ? 'disabled' : ''}>${icons.minus('h-4 w-4')}</button>
          <input id="qty" type="number" inputmode="numeric" min="1" max="${left || 1}" value="1" ${disabled ? 'disabled' : ''}
            class="mp-qty h-11 w-14 border-x border-gray-300 text-center font-semibold text-gray-900 focus:outline-none" aria-describedby="stockMsg" />
          <button type="button" data-step="1" class="flex h-11 w-11 items-center justify-center rounded-r-xl text-gray-700 hover:bg-gray-100 disabled:opacity-40" aria-label="Increase quantity" ${disabled ? 'disabled' : ''}>${icons.plus('h-4 w-4')}</button>
        </div>
      </div>
      ${disabled && product.stockQuantity > 0
        ? html`<a href="#/basket" class="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-emerald-800 px-4 font-bold text-white hover:bg-emerald-700">View basket</a>`
        : html`<span class="flex-1 [&>button]:w-full">${addToBasketButton(product, { cls: 'min-h-[48px] text-base' })}</span>`}
    </div>
    <p id="qtyError" class="mt-2 hidden text-sm font-medium text-red-700" role="alert"></p>
  </div>`;
}

function page(product, seller, related, names, inBasket) {
  const spec = [
    ['Fabric length', product.fabricLength],
    ['Dimensions', formatDimensions(product.dimensions)],
    ['Material', product.composition],
    ['Colours', product.colours.map(capitalise).join(', ')],
    ['Pattern', product.patterns.map(capitalise).join(', ')],
    ['Category', names[product.category]],
    ['Available quantity', String(product.stockQuantity)],
    ['Listed', formatDate(product.dateAdded)],
  ];
  return html`<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <a href="${backHref()}" class="inline-flex min-h-[44px] items-center gap-2 font-semibold text-emerald-800 hover:text-emerald-600">${icons.arrowLeft('h-5 w-5')} Back to catalogue</a>
      <nav aria-label="Breadcrumb" class="text-sm text-gray-500"><a href="#/" class="hover:text-emerald-800">Marketplace</a> / <a href="#/catalogue?category=${product.category}" class="hover:text-emerald-800">${names[product.category]}</a> / <span aria-current="page" class="text-gray-800">${product.name}</span></nav>
    </div>

    <div class="mt-6 grid gap-10 lg:grid-cols-2">
      <section aria-label="Product photographs">
        <div class="relative overflow-hidden rounded-3xl bg-emerald-950 shadow-lg">
          <img id="mainImage" src="${product.images[0]}" alt="${product.name}: ${IMAGE_LABELS[0].toLowerCase()} (illustrative render)" class="aspect-square w-full object-cover" width="800" height="800" />
          <span class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-900 shadow">Demo listing</span>
        </div>
        <ul class="mt-4 grid grid-cols-3 gap-3" role="list">
          ${product.images.map((src, i) => html`<li>
            <button type="button" data-thumb="${i}" aria-pressed="${i === 0}" aria-label="Show photo ${i + 1}: ${IMAGE_LABELS[i] || ''}"
              class="block w-full overflow-hidden rounded-2xl ring-2 transition ${i === 0 ? 'ring-amber-400' : 'ring-transparent hover:ring-emerald-300'}">
              <img src="${src}" alt="" loading="lazy" class="aspect-square w-full object-cover" />
            </button>
            <p class="mt-1 text-center text-xs text-gray-500">${IMAGE_LABELS[i] || ''}</p>
          </li>`)}
        </ul>
        <p class="mt-3 text-xs text-gray-500">Images are illustrative pattern renders created for this demonstration, not photographs of stock.</p>
      </section>

      <section aria-labelledby="productTitle">
        <div class="flex flex-wrap items-center gap-2">
          <a href="#/catalogue?category=${product.category}" class="text-sm font-semibold uppercase tracking-wider text-amber-700 hover:underline">${names[product.category]}</a>
          ${availabilityBadge(product)}
        </div>
        <h1 id="productTitle" class="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">${product.name}</h1>
        <p class="mt-2 text-sm text-gray-600">Sold by <a href="#/sellers/${product.sellerId}" class="font-semibold text-emerald-800 hover:underline">${product.sellerName}</a></p>
        <p class="mt-4 text-lg leading-relaxed text-gray-700">${product.description}</p>

        <div class="mt-6">${purchaseBox(product, inBasket)}</div>
        <div class="mt-4">${demoNotice('This is a sample listing. Adding it to your basket shows how shopping will work; nothing can be bought yet.')}</div>

        <h2 class="mt-8 text-lg font-bold text-emerald-950">Fabric details</h2>
        <dl class="mt-3 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white text-sm shadow-sm ring-1 ring-black/5">
          ${spec.map(([k, v]) => html`<div class="grid grid-cols-5 gap-3 px-4 py-3"><dt class="col-span-2 font-medium text-gray-500">${k}</dt><dd class="col-span-3 font-semibold text-gray-900">${v}</dd></div>`)}
        </dl>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 class="flex items-center gap-2 font-bold text-emerald-950">${icons.store('h-5 w-5 text-amber-700')} Seller</h2>
            <p class="mt-2 font-semibold text-gray-900">${seller?.name || product.sellerName}</p>
            ${seller ? html`<p class="text-sm text-gray-600">${seller.location}</p><p class="mt-2 line-clamp-3 text-sm text-gray-600">${seller.bio}</p>` : ''}
            <a href="#/sellers/${product.sellerId}" class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline">View seller profile ${icons.arrowRight('h-4 w-4')}</a>
          </div>
          <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 class="flex items-center gap-2 font-bold text-emerald-950">${icons.truck('h-5 w-5 text-amber-700')} Delivery</h2>
            <p class="mt-2 text-sm text-gray-700">${seller?.deliveryInfo || 'Delivery details will be confirmed by the seller.'}</p>
            <p class="mt-2 text-sm text-gray-500">Sample information: delivery costs and returns will be set by each seller when real listings go live.</p>
          </div>
        </div>
      </section>
    </div>

    <section class="mt-20" aria-labelledby="relatedTitle">
      <h2 id="relatedTitle" class="text-2xl font-extrabold text-emerald-950 sm:text-3xl">You may also like</h2>
      <span class="mp-band mt-3 block h-2 w-24 rounded-full" aria-hidden="true"></span>
      <div class="mt-8">${related.length ? productGrid(related, { categoryNames: names, compact: true }) : html`<p class="text-gray-600">No related materials yet.</p>`}</div>
    </section>
  </div>`;
}

export async function productView(root, ctx) {
  ctx.setTitle('Product');
  render(root, loadingBlock('Loading product…'));
  let product, seller, related, names;
  try {
    product = await getProductById(ctx.params.id);
    if (product) [seller, related, names] = await Promise.all([getSellerById(product.sellerId), getRelatedProducts(product, 4), getCategoryNames()]);
  } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Product</h1>${errorState(err.message)}</div>`);
    root.querySelector('[data-retry]').addEventListener('click', () => productView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;
  if (!product) {
    ctx.setTitle('Product not found');
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Product not found</h1>${emptyState({ title: 'We couldn’t find that product', message: 'It may have been removed, or the link may be incorrect.', actionHref: '#/catalogue', actionLabel: 'Browse the catalogue' })}</div>`);
    return;
  }
  ctx.setTitle(product.name);
  render(root, page(product, seller, related, names, basket.getQuantity(product.id)));

  // Gallery
  const main = root.querySelector('#mainImage');
  root.querySelectorAll('[data-thumb]').forEach((btn) => btn.addEventListener('click', () => {
    const i = Number(btn.dataset.thumb);
    main.src = product.images[i];
    main.alt = `${product.name}: ${(IMAGE_LABELS[i] || 'photo').toLowerCase()} (illustrative render)`;
    root.querySelectorAll('[data-thumb]').forEach((b) => {
      const on = b === btn;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('ring-amber-400', on);
      b.classList.toggle('ring-transparent', !on);
    });
  }));

  wirePurchaseBox(root, product);
}

function wirePurchaseBox(root, product) {
  const box = root.querySelector('#purchaseBox');
  const qty = box.querySelector('#qty');
  const err = box.querySelector('#qtyError');
  const addBtn = box.querySelector('[data-add-to-basket]');
  if (addBtn) addBtn.dataset.qtyFrom = 'qty';
  const maxAllowed = () => Math.max(0, product.stockQuantity - basket.getQuantity(product.id));

  const validate = () => {
    const max = maxAllowed();
    const n = Number(qty.value);
    let msg = '';
    if (!Number.isInteger(n) || n < 1) msg = 'Please enter a whole number of 1 or more.';
    else if (n > max) msg = `Only ${max} more available.`;
    err.textContent = msg;
    err.classList.toggle('hidden', !msg);
    if (addBtn) addBtn.disabled = Boolean(msg);
    return !msg;
  };
  box.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
    const next = Math.min(maxAllowed(), Math.max(1, (Number(qty.value) || 0) + Number(b.dataset.step)));
    qty.value = String(next);
    validate();
  }));
  qty.addEventListener('input', validate);

  // After a successful add, rebuild the box so stock and limits reflect the basket.
  box.addEventListener('basket:added', (e) => {
    if (!e.detail.ok) return;
    const fresh = document.createElement('div');
    render(fresh, purchaseBox(product, basket.getQuantity(product.id)));
    box.replaceWith(fresh.firstElementChild);
    wirePurchaseBox(root, product);
  });
}
