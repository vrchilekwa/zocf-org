// Member dashboard (demonstration). Shows what an approved member could see after signing in,
// using a fictional profile. "Edit My Profile" changes are kept in memory only.
import { html, render, icons, btn, img, chip, loadingBlock, showError, demoNotice, formatDate, inputCls, labelCls } from '../components/ui.js';
import { memberCard, activityCard, opportunityCard } from '../components/cards.js';
import { memberGate } from '../components/memberGate.js';
import { isMemberPreview } from '../services/accessService.js';
import { getMemberById, getLookups, getSuggestions, getActivities, getOpportunities, getAnnouncements } from '../services/dataService.js';
import * as interest from '../services/interestService.js';
import { CONFIG } from '../config.js';

let edits = {}; // in-memory profile edits for this visit only

function completion(m) {
  const checks = [
    ['Display name', Boolean(m.displayName)],
    ['Introduction', (m.introduction || '').length >= 40],
    ['At least three interests', m.interests.length >= 3],
    ['Preferred activities', m.preferredActivities.length > 0],
    ['Looking to connect', Boolean(m.connectionPreferences)],
    ['Contact preferences', Boolean(m.contactPreferences)],
    ['Your own profile photo', !m.profileImage.includes('/avatars/')],
  ];
  return { pct: Math.round((checks.filter(([, ok]) => ok).length / checks.length) * 100), checks };
}

export async function dashboardView(root, ctx) {
  ctx.setTitle('My NextGen');
  if (!isMemberPreview()) { render(root, memberGate('Your NextGen dashboard')); return; }
  render(root, loadingBlock('Loading your dashboard…'));
  let me, lookups, suggestions, activities, opportunities, announcements;
  try {
    [me, lookups, activities, opportunities, announcements] = await Promise.all([getMemberById(CONFIG.demoSignedInMemberId), getLookups(), getActivities(), getOpportunities(), getAnnouncements()]);
    suggestions = await getSuggestions(me, 3);
  } catch (err) { if (ctx.isCurrent()) showError(root, err, () => dashboardView(root, ctx), 'My NextGen'); return; }
  if (!ctx.isCurrent()) return;
  me = { ...me, ...edits };

  const today = new Date().toISOString().slice(0, 10);
  const mine = new Set(interest.getInterestedIds());
  const upcoming = activities.filter((a) => a.date >= today).sort((a, b) => Number(mine.has(b.id)) - Number(mine.has(a.id)) || a.date.localeCompare(b.date)).slice(0, 3);
  const newest = [...opportunities].sort((a, b) => a.closingDate.localeCompare(b.closingDate)).slice(0, 3);
  const { pct, checks } = completion(me);
  const loc = lookups.locationById[me.location];

  render(root, html`<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    ${demoNotice(`You are previewing the member dashboard as a fictional member (${me.displayName}). There is no real sign-in yet.`)}
    <section class="mt-6 overflow-hidden rounded-[2rem] bg-indigo-950 text-white" aria-labelledby="welcome">
      <div class="ng-hero-bg relative p-8 sm:p-10">
        <div class="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-5">
            ${img(me.profileImage, '', 'h-20 w-20 rounded-3xl object-cover object-top ring-4 ring-white/20')}
            <div><p class="text-orange-300">Welcome back</p><h1 id="welcome" class="font-display text-3xl font-extrabold sm:text-4xl">Hi, ${me.firstName}! 👋</h1>
              <p class="mt-1 text-indigo-100">${loc.name} · ${me.profession || me.education}</p></div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" data-edit class="${btn.primary}">${icons.edit('h-5 w-5')} Edit My Profile</button>
            <a href="#/connections" class="${btn.light}">Discover Members</a>
            <a href="#/activities" class="${btn.light}">Explore Activities</a>
            <a href="#/opportunities" class="${btn.light}">View Opportunities</a>
          </div>
        </div>
      </div>
    </section>

    <div class="mt-8 grid gap-8 lg:grid-cols-3">
      <div class="space-y-8 lg:col-span-2">
        <section id="editPanel" class="hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100" aria-labelledby="editTitle">
          <h2 id="editTitle" class="font-display text-xl font-bold text-indigo-950">Edit my profile (demo)</h2>
          <form id="editForm" class="mt-4 space-y-4" novalidate>
            <div><label for="e-intro" class="${labelCls}">Introduction</label><textarea id="e-intro" name="introduction" rows="3" maxlength="500" class="${inputCls}">${me.introduction}</textarea></div>
            <div><label for="e-connect" class="${labelCls}">Looking to connect</label><input id="e-connect" name="connectionPreferences" maxlength="200" value="${me.connectionPreferences}" class="${inputCls}" /></div>
            <p class="text-xs text-slate-500">Changes last until you refresh the page. In the live platform they would be saved to your secure account.</p>
            <div class="flex gap-3"><button type="submit" class="${btn.dark}">Save changes</button><button type="button" data-cancel class="${btn.ghost}">Cancel</button></div>
          </form>
        </section>

        <section aria-labelledby="sugTitle">
          <div class="flex items-end justify-between"><h2 id="sugTitle" class="font-display text-2xl font-extrabold text-indigo-950">Suggested connections</h2><a href="#/connections?location=${me.location}&nearby=1" class="font-semibold text-indigo-700 hover:text-orange-600">More near you →</a></div>
          <ul class="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">${suggestions.map((s) => html`<li>${memberCard(s.member, lookups, { reasons: [s.nearby ? 'Near you' : '', s.shared.length ? `${s.shared.length} shared interest${s.shared.length > 1 ? 's' : ''}` : ''].filter(Boolean) })}</li>`)}</ul>
        </section>

        <section aria-labelledby="upTitle">
          <div class="flex items-end justify-between"><h2 id="upTitle" class="font-display text-2xl font-extrabold text-indigo-950">Upcoming activities</h2><a href="#/activities?mine=1" class="font-semibold text-indigo-700 hover:text-orange-600">My activities →</a></div>
          <ul class="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">${upcoming.map((a) => html`<li>${activityCard(a, lookups)}</li>`)}</ul>
        </section>

        <section aria-labelledby="newOppTitle">
          <h2 id="newOppTitle" class="font-display text-2xl font-extrabold text-indigo-950">New opportunities</h2>
          <ul class="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">${newest.map((o) => html`<li>${opportunityCard(o, lookups)}</li>`)}</ul>
        </section>
      </div>

      <aside class="space-y-6">
        <section class="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100" aria-labelledby="complTitle">
          <h2 id="complTitle" class="font-display text-lg font-bold text-indigo-950">Profile completion</h2>
          <p class="mt-2 font-display text-4xl font-extrabold text-orange-500">${pct}%</p>
          <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Profile completion"><div class="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500" style="width:${pct}%"></div></div>
          <ul class="mt-4 space-y-2 text-sm">${checks.map(([t, ok]) => html`<li class="flex items-center gap-2 ${ok ? 'text-slate-700' : 'text-slate-400'}">${ok ? icons.check('h-4 w-4 text-emerald-600') : icons.plus('h-4 w-4')} ${t}</li>`)}</ul>
        </section>
        <section class="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100" aria-labelledby="myProfileTitle">
          <h2 id="myProfileTitle" class="font-display text-lg font-bold text-indigo-950">My profile</h2>
          <p id="myIntro" class="mt-2 text-sm text-slate-700">${me.introduction}</p>
          <div class="mt-3 flex flex-wrap gap-1.5">${me.interests.map((i) => chip(lookups.interestNames[i]))}</div>
          <a href="#/community/${me.id}" class="${btn.ghost} mt-4 w-full">View my profile</a>
        </section>
        <section class="rounded-[2rem] bg-gradient-to-br from-orange-50 to-rose-50 p-6 ring-1 ring-orange-100" aria-labelledby="annTitle">
          <h2 id="annTitle" class="font-display text-lg font-bold text-indigo-950">Community announcements</h2>
          <ul class="mt-4 space-y-4">${announcements.map((a) => html`<li><p class="text-xs font-semibold text-orange-700">${formatDate(a.date, true)}</p><p class="font-semibold text-indigo-950">${a.title}</p><p class="text-sm text-slate-600">${a.body}</p></li>`)}</ul>
        </section>
      </aside>
    </div>
  </div>`);

  const panel = root.querySelector('#editPanel');
  root.querySelector('[data-edit]').addEventListener('click', () => { panel.classList.remove('hidden'); panel.querySelector('textarea').focus(); });
  panel.querySelector('[data-cancel]').addEventListener('click', () => panel.classList.add('hidden'));
  root.querySelector('#editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget.elements;
    edits = { introduction: f.introduction.value.trim() || me.introduction, connectionPreferences: f.connectionPreferences.value.trim() || me.connectionPreferences };
    dashboardView(root, ctx);
  });
}
