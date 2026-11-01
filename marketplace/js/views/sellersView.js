import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { loadingBlock, errorState, demoNotice, sectionHeading } from '../components/states.js';
import { getSellers, getProducts } from '../services/productService.js';
import { formatDate } from '../utils/format.js';

export function sellerCard(seller, count) {
  return html`<a href="#/sellers/${seller.id}" class="group flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg">
    <span class="flex items-center gap-3">
      <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold text-white" style="background:${seller.accent}" aria-hidden="true">${seller.name.charAt(0)}</span>
      <span class="min-w-0"><span class="block truncate font-bold text-gray-900 group-hover:text-emerald-800">${seller.name}</span><span class="flex items-center gap-1 text-sm text-gray-500">${icons.pin('h-4 w-4')} ${seller.location}</span></span>
    </span>
    <span class="mt-3 line-clamp-3 text-sm text-gray-600">${seller.bio}</span>
    <span class="mt-auto pt-4 text-sm font-semibold text-emerald-800">${count} ${count === 1 ? 'listing' : 'listings'} · Member since ${formatDate(seller.memberSince)}</span>
  </a>`;
}

export async function sellersView(root, ctx) {
  ctx.setTitle('Sell with us');
  render(root, loadingBlock());
  let sellers, products;
  try {
    [sellers, products] = await Promise.all([getSellers(), getProducts()]);
  } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Sell with us</h1>${errorState(err.message)}</div>`);
    root.querySelector('[data-retry]').addEventListener('click', () => sellersView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;
  const counts = products.reduce((acc, p) => ({ ...acc, [p.sellerId]: (acc[p.sellerId] || 0) + 1 }), {});
  const steps = [
    ['Register your interest', 'Tell us about your business and the fabrics you sell.'],
    ['Meet the ZOCF team', 'We confirm who you are and help you get set up, so buyers can trust every seller.'],
    ['List your fabrics', 'Add photos, prices, lengths and stock levels from your seller dashboard.'],
    ['Reach the diaspora', 'Your materials are shown to ZOCF members and chapters around the world.'],
  ];

  render(root, html`<section class="relative overflow-hidden bg-emerald-950 text-white">
      <div class="pattern-chitenge absolute inset-0 opacity-60" aria-hidden="true"></div>
      <div class="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p class="text-sm font-semibold uppercase tracking-widest text-amber-300">For sellers</p>
          <h1 class="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Are you selling Zambian chitenge?</h1>
          <p class="mt-4 text-lg text-white/85">Join our community marketplace and showcase your materials to Zambians and African communities across the diaspora.</p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#/sellers/register" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-emerald-950 shadow-lg hover:bg-amber-300">${icons.store('h-5 w-5')} Become a Seller</a>
            <a href="#/dashboard" class="inline-flex min-h-[48px] items-center justify-center rounded-xl px-6 font-semibold text-white ring-1 ring-white/30 hover:bg-white/10">Preview the seller dashboard</a>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3" aria-hidden="true">
          ${products.slice(0, 6).map((p, i) => html`<img src="${p.images[2]}" alt="" class="aspect-[3/4] w-full rounded-2xl object-cover shadow-xl ${i % 2 ? 'translate-y-6' : ''}" />`)}
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6 lg:px-8">
      ${demoNotice('Seller registration, sign-in and product management will open when the marketplace backend is introduced. The forms and dashboard here are previews and do not save anything.')}

      <section aria-labelledby="howTitle">
        ${sectionHeading({ eyebrow: 'How it works', title: 'From your shelf to the diaspora', id: 'howTitle' })}
        <ol class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          ${steps.map(([t, d], i) => html`<li class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-extrabold text-emerald-950">${i + 1}</span>
            <h3 class="mt-4 text-lg font-bold text-emerald-950">${t}</h3><p class="mt-2 text-gray-600">${d}</p></li>`)}
        </ol>
      </section>

      <section aria-labelledby="whatTitle" class="grid gap-8 lg:grid-cols-2">
        <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <h2 id="whatTitle" class="text-2xl font-extrabold text-emerald-950">What you can sell</h2>
          <ul class="mt-4 space-y-2 text-gray-700">${['Zambian chitenge in any length', 'African wax prints and designer fabrics', 'Wedding and celebration fabric sets', 'Other African textiles and prints'].map((t) => html`<li class="flex gap-3">${icons.check('h-5 w-5 shrink-0 text-emerald-700')}${t}</li>`)}</ul>
        </div>
        <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <h2 class="text-2xl font-extrabold text-emerald-950">What we are still deciding</h2>
          <p class="mt-4 text-gray-700">Seller fees, payments, delivery options and returns will be agreed with the ZOCF leadership and our community sellers before launch. Register your interest to help shape them.</p>
        </div>
      </section>

      <section aria-labelledby="sellersTitle">
        ${sectionHeading({ eyebrow: 'Example sellers', title: 'Our demonstration sellers', id: 'sellersTitle', text: 'These businesses are fictional, created to show how seller profiles will look.' })}
        <ul class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">${sellers.map((s) => html`<li>${sellerCard(s, counts[s.id] || 0)}</li>`)}</ul>
      </section>
    </div>`);
}
