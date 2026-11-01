// Shared NextGen UI building blocks. Reuses the Marketplace's safe templating and icon set so the
// two apps stay consistent without duplicating code.
import { html, render, raw } from '../../../marketplace/js/utils/html.js';
import { icons as baseIcons } from '../../../marketplace/js/components/icons.js';

export { html, render, raw };

const icon = (d, cls = 'h-5 w-5') =>
  raw(`<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`);

export const icons = {
  ...baseIcons,
  calendar: (cls) => icon('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>', cls),
  clock: (cls) => icon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>', cls),
  lock: (cls) => icon('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', cls),
  shield: (cls) => icon('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>', cls),
  message: (cls) => icon('<path d="M4 5h16v11H8l-4 4z"/>', cls),
  briefcase: (cls) => icon('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>', cls),
  star: (cls) => icon('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>', cls),
  flag: (cls) => icon('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', cls),
  edit: (cls) => icon('<path d="M4 20h4L19 9l-4-4L4 16z"/>', cls),
  book: (cls) => icon('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>', cls),
};

export const btn = {
  primary: 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-2.5 font-bold text-white shadow-md transition hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50',
  dark: 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-indigo-950 px-6 py-2.5 font-bold text-white shadow-md transition hover:bg-indigo-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200',
  ghost: 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-indigo-950/15 bg-white px-6 py-2.5 font-semibold text-indigo-950 transition hover:border-indigo-400 hover:bg-indigo-50',
  light: 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-2.5 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white hover:text-indigo-950',
};

export const inputCls = 'mt-1.5 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100';
export const labelCls = 'block text-sm font-semibold text-slate-800';

const dateFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const formatDate = (iso, short = false) => (short ? shortFmt : dateFmt).format(new Date(iso + 'T00:00:00'));

/** <img> that swaps to a soft gradient if the file is missing (see app.js). */
export function img(src, alt, cls = '', attrs = '') {
  return html`<img src="${src}" alt="${alt}" loading="lazy" decoding="async" data-fallback class="${cls}" ${raw(attrs)} />`;
}

export function chip(text, tone = 'indigo') {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-900 ring-indigo-100',
    orange: 'bg-orange-50 text-orange-900 ring-orange-100',
    emerald: 'bg-emerald-50 text-emerald-900 ring-emerald-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  };
  return html`<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[tone]}">${text}</span>`;
}

export function demoBadge(text = 'Demo') {
  return html`<span class="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-950 shadow">${text}</span>`;
}

export function sectionHeading({ eyebrow, title, text, id, link, light = false }) {
  return html`<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="max-w-2xl">
      ${eyebrow ? html`<p class="text-sm font-bold uppercase tracking-widest ${light ? 'text-orange-300' : 'text-orange-600'}">${eyebrow}</p>` : ''}
      <h2 ${id ? html`id="${id}"` : ''} class="mt-2 font-display text-3xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-indigo-950'} sm:text-4xl">${title}</h2>
      ${text ? html`<p class="mt-3 text-lg ${light ? 'text-indigo-100' : 'text-slate-600'}">${text}</p>` : ''}
    </div>
    ${link ? html`<a href="${link.href}" class="inline-flex shrink-0 items-center gap-1.5 font-semibold ${light ? 'text-orange-300 hover:text-orange-200' : 'text-indigo-700 hover:text-orange-600'}">${link.label} ${icons.arrowRight('h-4 w-4')}</a>` : ''}
  </div>`;
}

export function pageHeader({ eyebrow, title, text, actions = '' }) {
  return html`<section class="ng-hero-bg relative overflow-hidden text-white">
    <div class="ng-accent-dots absolute inset-0 opacity-60" aria-hidden="true"></div>
    <div class="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      ${eyebrow ? html`<p class="text-sm font-bold uppercase tracking-widest text-orange-300">${eyebrow}</p>` : ''}
      <h1 class="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">${title}</h1>
      ${text ? html`<p class="mt-3 max-w-2xl text-lg text-indigo-100">${text}</p>` : ''}
      ${actions ? html`<div class="mt-6 flex flex-col gap-3 sm:flex-row">${actions}</div>` : ''}
    </div>
  </section>`;
}

export function demoNotice(text) {
  return html`<div class="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-950" role="note">
    ${icons.info('mt-0.5 h-5 w-5 shrink-0')}<p><strong>Demonstration.</strong> ${text}</p>
  </div>`;
}

export function loadingCards(n = 6) {
  return html`<div role="status" aria-live="polite"><span class="sr-only">Loading…</span>
    <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">${Array.from({ length: n }, () => html`<li class="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-100"><div class="ng-skeleton h-40"></div><div class="space-y-3 p-5"><div class="ng-skeleton h-4 w-1/2 rounded"></div><div class="ng-skeleton h-3 w-full rounded"></div><div class="ng-skeleton h-3 w-3/4 rounded"></div></div></li>`)}</ul></div>`;
}

export function loadingBlock(label = 'Loading…') {
  return html`<div class="flex min-h-[50vh] items-center justify-center" role="status"><span class="ng-spinner" aria-hidden="true"></span><span class="ml-3 font-medium text-slate-600">${label}</span></div>`;
}

export function emptyState({ title, message = '', actionHref, actionLabel, clearAttr }) {
  return html`<div class="rounded-3xl border-2 border-dashed border-indigo-200 bg-white/70 px-6 py-14 text-center">
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">${icons.search('h-7 w-7')}</div>
    <h2 class="mt-4 font-display text-xl font-bold text-indigo-950">${title}</h2>
    ${message ? html`<p class="mx-auto mt-2 max-w-md text-slate-600">${message}</p>` : ''}
    ${actionHref ? html`<a href="${actionHref}" class="${btn.dark} mt-6">${actionLabel}</a>` : ''}
    ${clearAttr ? html`<button type="button" ${raw(clearAttr)} class="${btn.dark} mt-6">${actionLabel}</button>` : ''}
  </div>`;
}

export function errorState(message) {
  return html`<div class="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center" role="alert">
    <h2 class="font-display text-xl font-bold text-slate-900">Something went wrong</h2>
    <p class="mx-auto mt-2 max-w-md text-slate-700">${message}</p>
    <button type="button" data-retry class="${btn.dark} mt-6">Try again</button>
  </div>`;
}

/** Render an error state with a working retry button. */
export function showError(root, err, retry, title = 'NextGen') {
  render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">${title}</h1>${errorState(err.message)}</div>`);
  root.querySelector('[data-retry]').addEventListener('click', retry);
}

export function showToast(message, { type = 'success', action } = {}) {
  const region = document.getElementById('toastRegion');
  if (!region) return;
  const el = document.createElement('div');
  el.className = `ng-toast pointer-events-auto flex w-full items-center gap-3 rounded-2xl ${type === 'error' ? 'bg-rose-700' : 'bg-indigo-950'} px-4 py-3 text-sm text-white shadow-2xl sm:w-96`;
  render(el, html`<span class="shrink-0 text-orange-300">${type === 'error' ? icons.alert() : icons.check()}</span><p class="flex-1">${message}</p>
    ${action ? html`<a href="${action.href}" class="shrink-0 rounded-full bg-orange-400 px-3 py-1.5 font-bold text-indigo-950">${action.label}</a>` : ''}
    <button type="button" class="shrink-0 p-1 text-white/70 hover:text-white" aria-label="Dismiss notification">${icons.close('h-4 w-4')}</button>`);
  const remove = () => { el.classList.add('opacity-0'); setTimeout(() => el.remove(), 200); };
  el.querySelector('button').addEventListener('click', remove);
  region.appendChild(el);
  while (region.children.length > 3) region.firstElementChild.remove();
  setTimeout(remove, 5000);
}

/** Show/hide a field error and wire aria attributes. */
export function setFieldError(form, name, message) {
  const el = form.querySelector(`[data-error-for="${name}"]`);
  if (el) { el.textContent = message; el.classList.toggle('hidden', !message); el.id = `err-${name}`; }
  const field = form.elements[name];
  const target = field && (field instanceof RadioNodeList ? field[0] : field);
  if (target?.setAttribute) {
    target.setAttribute('aria-invalid', String(Boolean(message)));
    if (message) target.setAttribute('aria-describedby', `err-${name}`); else target.removeAttribute('aria-describedby');
  }
}
export const errorSlot = (name) => html`<p class="mt-1 hidden text-sm font-medium text-rose-700" data-error-for="${name}"></p>`;
