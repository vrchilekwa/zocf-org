import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { productGrid } from '../components/productCard.js';
import { loadingBlock, errorState, emptyState, demoNotice } from '../components/states.js';
import { getSellerById, getProductsBySeller, getCategoryNames } from '../services/productService.js';
import { formatDate } from '../utils/format.js';

export async function sellerProfileView(root, ctx) {
  ctx.setTitle('Seller');
  render(root, loadingBlock('Loading seller…'));
  let seller, products, names;
  try {
    [seller, products, names] = await Promise.all([getSellerById(ctx.params.id), getProductsBySeller(ctx.params.id), getCategoryNames()]);
  } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Seller</h1>${errorState(err.message)}</div>`);
    root.querySelector('[data-retry]').addEventListener('click', () => sellerProfileView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;
  if (!seller) {
    ctx.setTitle('Seller not found');
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Seller not found</h1>${emptyState({ title: 'We couldn’t find that seller', actionHref: '#/sellers', actionLabel: 'See all sellers' })}</div>`);
    return;
  }
  ctx.setTitle(seller.name);
  const stock = products.reduce((n, p) => n + p.stockQuantity, 0);

  render(root, html`<section class="relative overflow-hidden bg-emerald-950 text-white">
      <div class="absolute inset-x-0 top-0 h-2" style="background:${seller.accent}" aria-hidden="true"></div>
      <div class="pattern-chitenge absolute inset-0 opacity-60" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" class="text-sm text-white/70"><a href="#/sellers" class="hover:text-amber-300">Sellers</a> / <span aria-current="page">${seller.name}</span></nav>
        <div class="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
          <span class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-extrabold text-white shadow-xl ring-4 ring-white/20" style="background:${seller.accent}" aria-hidden="true">${seller.name.charAt(0)}</span>
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">${seller.name}</h1>
            <p class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/80"><span class="inline-flex items-center gap-1">${icons.pin('h-4 w-4')} ${seller.location}</span><span>Member since ${formatDate(seller.memberSince)}</span></p>
          </div>
        </div>
      </div>
    </section>
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      ${demoNotice('This is a fictional seller created for the demonstration.')}
      <div class="mt-8 grid gap-6 lg:grid-cols-3">
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 lg:col-span-2">
          <h2 class="text-lg font-bold text-emerald-950">About</h2>
          <p class="mt-2 text-gray-700">${seller.bio}</p>
          <h3 class="mt-5 text-sm font-semibold uppercase tracking-wider text-gray-500">Specialities</h3>
          <ul class="mt-2 flex flex-wrap gap-2">${seller.specialities.map((s) => html`<li class="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900 ring-1 ring-emerald-200">${s}</li>`)}</ul>
        </div>
        <div class="space-y-4">
          <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 class="flex items-center gap-2 text-lg font-bold text-emerald-950">${icons.truck('h-5 w-5 text-amber-700')} Delivery</h2>
            <p class="mt-2 text-sm text-gray-700">${seller.deliveryInfo}</p>
          </div>
          <dl class="grid grid-cols-2 gap-4">
            <div class="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5"><dt class="text-xs text-gray-500">Listings</dt><dd class="text-2xl font-extrabold text-emerald-900">${products.length}</dd></div>
            <div class="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5"><dt class="text-xs text-gray-500">Pieces in stock</dt><dd class="text-2xl font-extrabold text-emerald-900">${stock}</dd></div>
          </dl>
        </div>
      </div>
      <section class="mt-14" aria-labelledby="listingsTitle">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <h2 id="listingsTitle" class="text-2xl font-extrabold text-emerald-950 sm:text-3xl">Listings from ${seller.name}</h2>
          <a href="#/catalogue?seller=${seller.id}" class="font-semibold text-emerald-800 hover:underline">Filter in catalogue →</a>
        </div>
        <div class="mt-6">${products.length ? productGrid(products, { categoryNames: names }) : emptyState({ title: 'No listings yet' })}</div>
      </section>
    </div>`);
}
