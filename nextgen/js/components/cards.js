// Reusable NextGen cards: members, activities, opportunities, stories, regions.
import { html, icons, img, chip, demoBadge, btn, formatDate } from './ui.js';
import * as interest from '../services/interestService.js';

// ---------- members ----------
export function memberCard(m, lookups, { reasons = [] } = {}) {
  const loc = lookups.locationById[m.location];
  return html`<article class="ng-fade-in group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div class="relative">
      ${img(m.profileImage, '', 'aspect-[4/3] w-full object-cover object-center')}
      <span class="absolute left-3 top-3">${demoBadge('Fictional profile')}</span>
      <span class="absolute bottom-3 left-3 rounded-full bg-indigo-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">${m.ageGroup}</span>
    </div>
    <div class="flex flex-1 flex-col p-5">
      <h3 class="font-display text-xl font-bold text-indigo-950"><a href="#/community/${m.id}" class="hover:text-orange-600 focus:outline-none focus-visible:underline">${m.displayName}</a></h3>
      <p class="mt-0.5 flex items-center gap-1 text-sm text-slate-500">${icons.pin('h-4 w-4')} ${loc ? `${loc.name}, ${loc.country}` : m.location}</p>
      <p class="mt-2 text-sm font-semibold text-slate-700">${m.profession || m.education}</p>
      <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">${m.introduction}</p>
      <div class="mt-3 flex flex-wrap gap-1.5">${m.interests.slice(0, 3).map((i) => chip(lookups.interestNames[i] || i))}</div>
      ${reasons.length ? html`<p class="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium text-orange-900">${reasons.join(' · ')}</p>` : ''}
      <div class="mt-auto pt-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Looking to connect</p>
        <p class="mt-1 line-clamp-2 text-sm text-slate-700">${m.connectionPreferences}</p>
        <a href="#/community/${m.id}" class="${btn.ghost} mt-4 w-full">View profile</a>
      </div>
    </div>
  </article>`;
}

// ---------- activities ----------
export function interestButton(a, { full = false } = {}) {
  const mine = interest.isInterested(a.id);
  const open = interest.canRegister(a);
  if (!mine && !open) return html`<button type="button" disabled class="${btn.ghost} w-full cursor-not-allowed opacity-60">Fully booked</button>`;
  return html`<button type="button" data-interest="${a.id}" aria-pressed="${mine}" class="${mine ? btn.dark : btn.primary} w-full">
    ${mine ? html`${icons.check('h-5 w-5')} You're interested${full ? ' · Withdraw' : ''}` : html`${icons.heart('h-5 w-5')} I'm interested`}
  </button>`;
}

export function activityCard(a, lookups) {
  const count = interest.displayCount(a);
  return html`<article class="ng-fade-in flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl" data-activity-card="${a.id}">
    <a href="#/activities/${a.id}" class="relative block" tabindex="-1" aria-hidden="true">
      ${img(a.image, '', 'aspect-[3/2] w-full object-cover')}
      <span class="absolute left-3 top-3">${demoBadge('Sample activity')}</span>
      <span class="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow">${lookups.activityNames[a.category]}</span>
    </a>
    <div class="flex flex-1 flex-col p-5">
      <h3 class="font-display text-lg font-bold leading-snug text-indigo-950"><a href="#/activities/${a.id}" class="hover:text-orange-600">${a.title}</a></h3>
      <p class="mt-2 line-clamp-2 text-sm text-slate-600">${a.description}</p>
      <dl class="mt-4 space-y-1.5 text-sm text-slate-700">
        <div class="flex items-center gap-2"><dt class="text-orange-500">${icons.calendar('h-4 w-4')}<span class="sr-only">Date</span></dt><dd>${formatDate(a.date)}</dd></div>
        <div class="flex items-center gap-2"><dt class="text-orange-500">${icons.clock('h-4 w-4')}<span class="sr-only">Time</span></dt><dd>${a.time}</dd></div>
        <div class="flex items-center gap-2"><dt class="text-orange-500">${icons.pin('h-4 w-4')}<span class="sr-only">Location</span></dt><dd>${a.location}</dd></div>
        <div class="flex items-center gap-2"><dt class="text-orange-500">${icons.users('h-4 w-4')}<span class="sr-only">Organiser</span></dt><dd>${a.organiser}</dd></div>
      </dl>
      <div class="mt-auto pt-5">
        <p class="mb-3 text-sm font-semibold text-indigo-900"><span data-count="${a.id}">${count}</span> interested · ${a.capacity} places</p>
        <span data-interest-slot="${a.id}">${interestButton(a)}</span>
      </div>
    </div>
  </article>`;
}

// ---------- opportunities ----------
export function opportunityCard(o, lookups, today = new Date().toISOString().slice(0, 10)) {
  const days = Math.round((new Date(o.closingDate) - new Date(today)) / 86400000);
  const closing = days >= 0 && days <= 30;
  return html`<article class="ng-fade-in flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
    <div class="flex items-start justify-between gap-3">
      <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-700 text-orange-300">${icons.briefcase('h-6 w-6')}</span>
      <div class="flex flex-wrap justify-end gap-1.5">${chip(lookups.opportunityNames[o.category], 'orange')}${closing ? chip('Closing soon', 'emerald') : ''}</div>
    </div>
    <h3 class="mt-4 font-display text-lg font-bold leading-snug text-indigo-950">${o.title}</h3>
    <p class="mt-1 text-sm font-semibold text-slate-500">${o.organisation}</p>
    <p class="mt-3 text-sm leading-relaxed text-slate-600">${o.description}</p>
    <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div><dt class="text-xs text-slate-400">Location</dt><dd class="font-semibold text-slate-800">${o.location}</dd></div>
      <div><dt class="text-xs text-slate-400">Closing date</dt><dd class="font-semibold text-slate-800">${formatDate(o.closingDate, true)}</dd></div>
    </dl>
    <div class="mt-auto pt-5">
      <p class="mb-3 text-xs text-slate-500">Shared by ${o.submittedBy}</p>
      ${o.externalLink
        ? html`<a href="${o.externalLink}" target="_blank" rel="noopener" class="${btn.dark} w-full">Find out more</a>`
        : html`<span class="flex min-h-[44px] w-full items-center justify-center rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-500">Sample listing: no external link</span>`}
    </div>
  </article>`;
}

// ---------- stories ----------
export function storyCard(s, { large = false } = {}) {
  return html`<article class="ng-fade-in group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    <a href="#/stories/${s.id}" class="relative block overflow-hidden" tabindex="-1" aria-hidden="true">
      ${img(s.image, '', `${large ? 'aspect-[16/9]' : 'aspect-[3/2]'} w-full object-cover transition duration-500 group-hover:scale-105`)}
      <span class="absolute left-3 top-3">${demoBadge('Fictional story')}</span>
    </a>
    <div class="flex flex-1 flex-col p-5">
      <p class="text-xs font-bold uppercase tracking-widest text-orange-600">${s.category.replace(/-/g, ' ')}</p>
      <h3 class="mt-1 font-display text-lg font-bold leading-snug text-indigo-950"><a href="#/stories/${s.id}" class="hover:text-orange-600">${s.title}</a></h3>
      <p class="mt-2 line-clamp-3 text-sm text-slate-600">${s.description}</p>
      <p class="mt-auto pt-4 text-xs text-slate-500">${s.authorDisplayName} · ${formatDate(s.datePublished, true)}</p>
    </div>
  </article>`;
}

// ---------- regions ----------
export function regionCard(r) {
  return html`<article class="ng-fade-in flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100" data-region="${r.id}">
    ${img(r.image, '', 'aspect-[2/1] w-full object-cover')}
    <div class="flex flex-1 flex-col p-6">
      <h3 class="font-display text-xl font-bold text-indigo-950">${r.name}</h3>
      <p class="mt-1 text-sm text-slate-500">${r.areas.join(' · ')}</p>
      <p class="mt-3 text-sm text-slate-600">${r.description}</p>
      <p class="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Activity ideas</p>
      <div class="mt-2 flex flex-wrap gap-1.5">${r.activityIdeas.map((a) => chip(a, 'orange'))}</div>
      <div class="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm">
        <p class="flex items-center gap-2 font-bold text-indigo-950">${icons.star('h-4 w-4 text-orange-500')} Regional ambassador</p>
        <p class="mt-1 text-indigo-900">Role open: not yet appointed. This is a proposed role for future development.</p>
      </div>
      <button type="button" data-ambassador-interest="${r.id}" class="${btn.primary} mt-5 w-full">Express interest</button>
    </div>
  </article>`;
}
