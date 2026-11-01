import { html } from '../utils/html.js';

export function categoryCard(category, count) {
  return html`<a href="#/catalogue?category=${encodeURIComponent(category.id)}"
      class="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-emerald-950 p-4 text-white shadow-md ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 sm:p-5">
    <img src="${category.image}" alt="" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
    <span class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/0" aria-hidden="true"></span>
    <span class="relative">
      <span class="block text-base font-bold leading-tight sm:text-lg">${category.name}</span>
      <span class="mt-1 hidden text-sm text-white/80 sm:line-clamp-2 sm:block">${category.description}</span>
      <span class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-300">${count} ${count === 1 ? 'listing' : 'listings'} <span aria-hidden="true">→</span></span>
    </span>
  </a>`;
}
