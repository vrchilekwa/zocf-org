// Loading, empty and error states shared by all views.
import { html } from '../utils/html.js';
import { icons } from './icons.js';

export function loadingGrid(count = 4) {
  return html`<div role="status" aria-live="polite">
    <span class="sr-only">Loading…</span>
    <ul class="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      ${Array.from({ length: count }, () => html`<li class="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        <div class="mp-skeleton aspect-square"></div>
        <div class="space-y-3 p-5"><div class="mp-skeleton h-3 w-1/3 rounded"></div><div class="mp-skeleton h-5 w-3/4 rounded"></div><div class="mp-skeleton h-3 w-full rounded"></div><div class="mp-skeleton h-10 w-full rounded-xl"></div></div>
      </li>`)}
    </ul>
  </div>`;
}

export function loadingBlock(label = 'Loading…') {
  return html`<div class="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
    <span class="mp-spinner" aria-hidden="true"></span><span class="ml-3 font-medium text-gray-600">${label}</span>
  </div>`;
}

export function emptyState({ title, message, actionHref, actionLabel, onActionAttr = '' }) {
  return html`<div class="rounded-3xl border-2 border-dashed border-emerald-900/15 bg-white/70 px-6 py-14 text-center">
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">${icons.search('h-7 w-7')}</div>
    <h2 class="mt-4 text-xl font-bold text-gray-900">${title}</h2>
    ${message ? html`<p class="mx-auto mt-2 max-w-md text-gray-600">${message}</p>` : ''}
    ${actionLabel ? (actionHref
      ? html`<a href="${actionHref}" class="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-emerald-800 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700">${actionLabel}</a>`
      : html`<button type="button" ${onActionAttr} class="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-emerald-800 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700">${actionLabel}</button>`) : ''}
  </div>`;
}

export function errorState(message, { retry = true } = {}) {
  return html`<div class="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center" role="alert">
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700">${icons.alert('h-7 w-7')}</div>
    <h2 class="mt-4 text-xl font-bold text-gray-900">Something went wrong</h2>
    <p class="mx-auto mt-2 max-w-md text-gray-700">${message}</p>
    ${retry ? html`<button type="button" data-retry class="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-emerald-800 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700">Try again</button>` : ''}
  </div>`;
}

/** A clear "this is a demonstration" notice. */
export function demoNotice(text, { tone = 'amber' } = {}) {
  const styles = tone === 'amber' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900';
  return html`<div class="flex items-start gap-3 rounded-2xl border ${styles} px-4 py-3 text-sm" role="note">
    ${icons.info('mt-0.5 h-5 w-5 shrink-0')}<p><strong class="font-bold">Demonstration only.</strong> ${text}</p>
  </div>`;
}

export function sectionHeading({ eyebrow, title, text, id, link }) {
  return html`<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="max-w-2xl">
      ${eyebrow ? html`<p class="text-sm font-semibold uppercase tracking-widest text-amber-700">${eyebrow}</p>` : ''}
      <h2 ${id ? html`id="${id}"` : ''} class="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">${title}</h2>
      <span class="mp-band mt-3 block h-2 w-24 rounded-full" aria-hidden="true"></span>
      ${text ? html`<p class="mt-4 text-lg text-gray-600">${text}</p>` : ''}
    </div>
    ${link ? html`<a href="${link.href}" class="inline-flex shrink-0 items-center gap-1.5 font-semibold text-emerald-800 hover:text-emerald-600">${link.label} ${icons.arrowRight('h-4 w-4')}</a>` : ''}
  </div>`;
}
