import { html, render } from '../utils/html.js';

export function notFoundView(root, ctx) {
  ctx.setTitle('Page not found');
  render(root, html`<div class="mx-auto max-w-2xl px-4 py-24 text-center">
    <p class="text-sm font-semibold uppercase tracking-widest text-amber-700">404</p>
    <h1 class="mt-2 text-3xl font-extrabold text-emerald-950">We couldn’t find that page</h1>
    <p class="mt-3 text-gray-600">The link may be out of date. Try the marketplace home page or browse the catalogue.</p>
    <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <a href="#/" class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-800 px-5 font-semibold text-white hover:bg-emerald-700">Marketplace home</a>
      <a href="#/catalogue" class="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 px-5 font-semibold text-gray-700 hover:bg-gray-50">Browse the catalogue</a>
    </div>
  </div>`);
}
