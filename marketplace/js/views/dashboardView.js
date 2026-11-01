// Seller dashboard concept. There is deliberately no sign-in: a fake login would give a false
// sense of security. Anyone can preview any demo seller's dashboard; drafts live only in memory.
import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { availabilityBadge } from '../components/productCard.js';
import { loadingBlock, errorState } from '../components/states.js';
import { getSellers, getProducts, getCategories } from '../services/productService.js';
import { formatPrice, formatDate } from '../utils/format.js';
import { CONFIG } from '../config.js';

const drafts = new Map(); // sellerId -> draft listings (cleared on page refresh)
const input = 'mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100';
const label = 'block text-sm font-semibold text-gray-800';

function stat(labelText, value, note = '') {
  return html`<div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
    <dt class="text-sm font-medium text-gray-500">${labelText}</dt>
    <dd class="mt-1 text-3xl font-extrabold text-emerald-900">${value}</dd>
    ${note ? html`<dd class="mt-1 text-xs text-gray-500">${note}</dd>` : ''}
  </div>`;
}

function listingRow(p, isDraft = false) {
  return html`<li class="grid grid-cols-[4rem_1fr] gap-4 py-4 sm:grid-cols-[4rem_1fr_6rem_6rem_8rem] sm:items-center">
    ${p.images ? html`<img src="${p.images[0]}" alt="" class="h-16 w-16 rounded-xl object-cover" />` : html`<span class="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-400">${icons.image('h-6 w-6')}</span>`}
    <div class="min-w-0">
      <p class="truncate font-semibold text-gray-900">${isDraft ? p.name : html`<a href="#/product/${p.id}" class="hover:text-emerald-800">${p.name}</a>`}</p>
      <p class="text-sm text-gray-500">${p.fabricLength} · ${isDraft ? 'Draft' : `Listed ${formatDate(p.dateAdded)}`}</p>
      <p class="mt-1 flex flex-wrap gap-x-4 text-sm sm:hidden"><span>${formatPrice(p.price)}</span><span>Stock: ${p.stockQuantity}</span></p>
    </div>
    <p class="hidden font-semibold sm:block">${formatPrice(p.price)}</p>
    <p class="hidden sm:block"><span class="font-semibold">${p.stockQuantity}</span> <span class="text-sm text-gray-500">in stock</span></p>
    <p class="col-start-2 sm:col-start-auto">${isDraft
      ? html`<span class="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-900">Draft · not published</span>`
      : availabilityBadge(p)}</p>
  </li>`;
}

export async function dashboardView(root, ctx) {
  ctx.setTitle('Seller dashboard (concept)');
  render(root, loadingBlock('Loading dashboard…'));
  let sellers, products, categories;
  try {
    [sellers, products, categories] = await Promise.all([getSellers(), getProducts(), getCategories()]);
  } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Seller dashboard</h1>${errorState(err.message)}</div>`);
    root.querySelector('[data-retry]').addEventListener('click', () => dashboardView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;
  const seller = sellers.find((s) => s.id === ctx.query.get('seller')) || sellers.find((s) => s.id === 'chandas-chitenge-house') || sellers[0];
  const listings = products.filter((p) => p.sellerId === seller.id);
  const sellerDrafts = drafts.get(seller.id) || [];
  drafts.set(seller.id, sellerDrafts);
  const topProduct = products.find((p) => p.id === seller.demoSales.topProductId);
  const lowStock = listings.filter((p) => p.availability !== 'in-stock').length;

  render(root, html`<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-widest text-amber-700">Seller dashboard · concept preview</p>
        <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Welcome, ${seller.name}</h1>
      </div>
      <div>
        <label for="previewAs" class="block text-sm font-semibold text-gray-700">Preview dashboard as</label>
        <select id="previewAs" class="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 sm:w-72">
          ${sellers.map((s) => html`<option value="${s.id}" ${s.id === seller.id ? 'selected' : ''}>${s.name}</option>`)}
        </select>
      </div>
    </div>

    <div class="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-sm text-amber-950" role="note">
      <p class="font-bold">This dashboard is a design concept using sample data.</p>
      <p class="mt-1">There is no sign-in, because real seller accounts need secure authentication on a server. That will be built with the marketplace backend. Sales figures are illustrative, and products you add here are kept only until you refresh the page. They are never published.</p>
    </div>

    <section class="mt-8" aria-labelledby="profileTitle">
      <div class="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center">
        <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold text-white" style="background:${seller.accent}" aria-hidden="true">${seller.name.charAt(0)}</span>
        <div class="min-w-0 flex-1">
          <h2 id="profileTitle" class="text-xl font-bold text-emerald-950">Seller profile</h2>
          <p class="text-gray-600">${seller.location} · Member since ${formatDate(seller.memberSince)}</p>
          <p class="mt-1 line-clamp-2 text-sm text-gray-600">${seller.bio}</p>
        </div>
        <a href="#/sellers/${seller.id}" class="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-emerald-800/20 px-4 font-semibold text-emerald-900 hover:bg-emerald-50">View public profile</a>
      </div>
    </section>

    <section class="mt-8" aria-labelledby="statsTitle">
      <h2 id="statsTitle" class="text-lg font-bold text-emerald-950">Summary</h2>
      <dl class="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
        ${stat('Listed products', listings.length, sellerDrafts.length ? `+ ${sellerDrafts.length} draft${sellerDrafts.length > 1 ? 's' : ''}` : '')}
        ${stat('Pieces in stock', listings.reduce((n, p) => n + p.stockQuantity, 0), lowStock ? `${lowStock} listing${lowStock > 1 ? 's' : ''} low or out of stock` : 'All listings well stocked')}
        ${stat('Orders this month', seller.demoSales.ordersThisMonth, `${seller.demoSales.unitsSold} pieces sold · sample figures`)}
        ${stat('Sales this month', formatPrice(seller.demoSales.revenue), topProduct ? `Top seller: ${topProduct.name}` : '')}
      </dl>
    </section>

    <div class="mt-10 grid gap-8 lg:grid-cols-5 lg:items-start">
      <section class="rounded-3xl bg-white px-5 py-2 shadow-sm ring-1 ring-black/5 sm:px-6 lg:col-span-3" aria-labelledby="listingsTitle">
        <h2 id="listingsTitle" class="pt-4 text-lg font-bold text-emerald-950">Your listings</h2>
        <div class="mt-3 hidden grid-cols-[4rem_1fr_6rem_6rem_8rem] gap-4 border-b border-gray-100 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:grid" aria-hidden="true"><span></span><span>Product</span><span>Price</span><span>Stock</span><span>Status</span></div>
        <ul id="listingRows" class="divide-y divide-gray-100">
          ${sellerDrafts.map((d) => listingRow(d, true))}
          ${listings.map((p) => listingRow(p))}
        </ul>
      </section>

      <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 lg:col-span-2" aria-labelledby="addTitle">
        <h2 id="addTitle" class="text-lg font-bold text-emerald-950">Add a product</h2>
        <p class="mt-1 text-sm text-gray-600">Try the listing form. Your product appears as a draft above and is not published.</p>
        <form id="addForm" class="mt-5 space-y-4" novalidate>
          <div><label for="pName" class="${label}">Product name</label><input id="pName" name="name" required maxlength="80" class="${input}" placeholder="e.g. Lusaka Sunset Print" /></div>
          <div><label for="pCategory" class="${label}">Category</label><select id="pCategory" name="category" required class="${input} h-11"><option value="">Choose a category</option>${categories.map((c) => html`<option value="${c.id}">${c.name}</option>`)}</select></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label for="pPrice" class="${label}">Price (£)</label><input id="pPrice" name="price" type="number" inputmode="decimal" min="1" max="500" step="0.01" required class="${input}" /></div>
            <div><label for="pStock" class="${label}">Stock</label><input id="pStock" name="stock" type="number" inputmode="numeric" min="0" max="999" step="1" required class="${input}" /></div>
          </div>
          <div><label for="pLength" class="${label}">Fabric length</label><select id="pLength" name="fabricLength" class="${input} h-11"><option>2 yards</option><option>3 yards</option><option selected>6 yards</option></select></div>
          <div><label for="pDesc" class="${label}">Description</label><textarea id="pDesc" name="description" rows="3" maxlength="400" class="${input}"></textarea></div>
          <p id="addError" class="hidden rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert"></p>
          <p id="addOk" class="hidden rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800" role="status"></p>
          <button type="submit" class="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 font-bold text-white hover:bg-emerald-700">${icons.plus('h-5 w-5')} Add draft product</button>
        </form>
      </section>
    </div>
  </div>`);

  root.querySelector('#previewAs').addEventListener('change', (e) => { location.hash = `#/dashboard?seller=${encodeURIComponent(e.target.value)}`; });

  const form = root.querySelector('#addForm');
  const err = root.querySelector('#addError');
  const ok = root.querySelector('#addOk');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const name = f.name.value.trim();
    const price = Number(f.price.value);
    const stock = Number(f.stock.value);
    const problems = [];
    if (!name) problems.push('a product name');
    if (!f.category.value) problems.push('a category');
    if (!(price >= 1 && price <= 500)) problems.push('a price between £1 and £500');
    if (f.stock.value === '' || !Number.isInteger(stock) || stock < 0 || stock > 999) problems.push('a whole-number stock level (0–999)');
    ok.classList.add('hidden');
    if (problems.length) {
      err.textContent = `Please enter ${problems.join(', ')}.`;
      err.classList.remove('hidden');
      return;
    }
    err.classList.add('hidden');
    const draft = { name, category: f.category.value, price: Math.round(price * 100) / 100, stockQuantity: stock, fabricLength: f.fabricLength.value, description: f.description.value.trim(),
      availability: stock === 0 ? 'out-of-stock' : stock <= CONFIG.lowStockThreshold ? 'low-stock' : 'in-stock' };
    sellerDrafts.unshift(draft);
    const tmp = document.createElement('ul');
    render(tmp, listingRow(draft, true));
    root.querySelector('#listingRows').prepend(tmp.firstElementChild);
    form.reset();
    ok.textContent = `“${name}” added as a draft. It is not published and will disappear when you refresh.`;
    ok.classList.remove('hidden');
  });
}
