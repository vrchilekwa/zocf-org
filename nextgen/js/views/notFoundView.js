import { html, render, btn } from '../components/ui.js';

export function notFoundView(root, ctx) {
  ctx.setTitle('Page not found');
  render(root, html`<div class="mx-auto max-w-2xl px-4 py-24 text-center">
    <p class="text-sm font-bold uppercase tracking-widest text-orange-600">404</p>
    <h1 class="mt-2 font-display text-3xl font-extrabold text-indigo-950">We couldn’t find that page</h1>
    <p class="mt-3 text-slate-600">The link may be out of date.</p>
    <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><a href="#/" class="${btn.primary}">NextGen home</a><a href="#/activities" class="${btn.ghost}">Explore activities</a></div>
  </div>`);
}
