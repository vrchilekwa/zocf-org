import { html, render, icons, btn, img, chip, loadingCards, loadingBlock, showError, emptyState, demoNotice, pageHeader, formatDate, inputCls, labelCls } from '../components/ui.js';
import { activityCard, interestButton } from '../components/cards.js';
import { getActivities, getActivityById, getLookups, getRegions } from '../services/dataService.js';
import * as interest from '../services/interestService.js';

export async function activitiesView(root, ctx) {
  ctx.setTitle('Activities & Gatherings');
  render(root, loadingCards(6));
  let activities, lookups, regions;
  try { [activities, lookups, regions] = await Promise.all([getActivities(), getLookups(), getRegions()]); }
  catch (err) { if (ctx.isCurrent()) showError(root, err, () => activitiesView(root, ctx), 'Activities'); return; }
  if (!ctx.isCurrent()) return;

  const state = { category: ctx.query.get('category') || '', region: ctx.query.get('region') || '', mine: ctx.query.get('mine') === '1' };
  const today = new Date().toISOString().slice(0, 10);

  render(root, html`${pageHeader({ eyebrow: 'Activities & gatherings', title: 'Meet up, move, celebrate', text: 'Online connections become real friendships when we spend time together. Find something near you, or suggest your own.' })}
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      ${demoNotice('All activities below are samples. “I’m interested” is saved only in this browser so you can try it out; no organiser is notified.')}
      <div class="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by activity type">
        <button type="button" data-cat="" class="ng-cat min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1">All</button>
        ${lookups.activityCategories.map((c) => html`<button type="button" data-cat="${c.id}" class="ng-cat min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1">${c.name}</button>`)}
      </div>
      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div class="sm:w-72"><label for="a-region" class="${labelCls}">Region</label>
          <select id="a-region" class="${inputCls} h-11 py-0"><option value="">All regions and online</option>${regions.map((r) => html`<option value="${r.id}" ${r.id === state.region ? 'selected' : ''}>${r.name}</option>`)}<option value="online" ${state.region === 'online' ? 'selected' : ''}>Online</option></select></div>
        <label class="flex min-h-[44px] items-center gap-3 text-sm font-semibold text-slate-700"><input id="a-mine" type="checkbox" ${state.mine ? 'checked' : ''} class="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-400" /> Only activities I’m interested in</label>
      </div>
      <p id="aCount" class="mt-6 font-semibold text-slate-700" aria-live="polite"></p>
      <div id="aResults" class="mt-5"></div>

      <section class="mt-16 rounded-[2rem] bg-indigo-950 p-8 text-white sm:p-10" aria-labelledby="suggestTitle">
        <h2 id="suggestTitle" class="font-display text-2xl font-extrabold">Have an idea for an activity?</h2>
        <p class="mt-2 max-w-2xl text-indigo-100">Soon members will be able to propose activities for their region, reviewed by regional ambassadors and ZOCF. For now, share your idea with us by email.</p>
        <a href="mailto:contact@zocf.org?subject=NextGen%20activity%20idea" class="${btn.primary} mt-6">Suggest an activity</a>
      </section>
    </div>`);

  const out = root.querySelector('#aResults');
  function update() {
    ctx.replaceQuery({ category: state.category, region: state.region, mine: state.mine ? '1' : '' });
    root.querySelectorAll('.ng-cat').forEach((b) => {
      const on = b.dataset.cat === state.category;
      b.setAttribute('aria-pressed', String(on));
      b.className = `ng-cat min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1 transition ${on ? 'bg-indigo-950 text-white ring-indigo-950' : 'bg-white text-indigo-950 ring-slate-200 hover:ring-orange-400'}`;
    });
    const mine = new Set(interest.getInterestedIds());
    const list = activities
      .filter((a) => (!state.category || a.category === state.category || (state.category === 'sports' && ['football', 'basketball', 'cycling', 'hiking', 'sports'].includes(a.category))))
      .filter((a) => !state.region || a.region === state.region)
      .filter((a) => !state.mine || mine.has(a.id))
      .sort((a, b) => Number(a.date < today) - Number(b.date < today) || a.date.localeCompare(b.date));
    root.querySelector('#aCount').textContent = `${list.length} ${list.length === 1 ? 'activity' : 'activities'}`;
    render(out, list.length
      ? html`<ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">${list.map((a) => html`<li>${activityCard(a, lookups)}</li>`)}</ul>`
      : emptyState({ title: state.mine ? 'You haven’t marked any activities yet' : 'No activities match', message: 'Try another category or region.', actionLabel: 'Show all activities', clearAttr: 'data-reset' }));
  }
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (b) { state.category = b.dataset.cat; update(); }
    if (e.target.closest('[data-reset]')) { state.category = ''; state.region = ''; state.mine = false; root.querySelector('#a-region').value = ''; root.querySelector('#a-mine').checked = false; update(); }
  });
  root.querySelector('#a-region').addEventListener('change', (e) => { state.region = e.target.value; update(); });
  root.querySelector('#a-mine').addEventListener('change', (e) => { state.mine = e.target.checked; update(); });
  // Keep "only mine" lists in sync when interest is withdrawn
  const unsub = interest.subscribe(() => { if (state.mine) update(); });
  update();
  return unsub;
}

export async function activityView(root, ctx) {
  ctx.setTitle('Activity');
  render(root, loadingBlock('Loading activity…'));
  let a, lookups;
  try { [a, lookups] = await Promise.all([getActivityById(ctx.params.id), getLookups()]); }
  catch (err) { if (ctx.isCurrent()) showError(root, err, () => activityView(root, ctx)); return; }
  if (!ctx.isCurrent()) return;
  if (!a) { render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Activity not found</h1>${emptyState({ title: 'We couldn’t find that activity', actionHref: '#/activities', actionLabel: 'All activities' })}</div>`); return; }
  ctx.setTitle(a.title);
  const pct = Math.min(100, Math.round((interest.displayCount(a) / a.capacity) * 100));

  render(root, html`<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <a href="#/activities" class="inline-flex min-h-[44px] items-center gap-2 font-semibold text-indigo-700 hover:text-orange-600">${icons.arrowLeft('h-5 w-5')} All activities</a>
    <div class="mt-4 grid gap-10 lg:grid-cols-5">
      <div class="lg:col-span-3">
        <div class="relative overflow-hidden rounded-[2rem] shadow-lg">${img(a.image, `Illustration for ${a.title}`, 'aspect-[3/2] w-full object-cover')}</div>
        <p class="mt-6 flex flex-wrap gap-2">${chip(lookups.activityNames[a.category], 'orange')}${chip('Sample activity', 'slate')}</p>
        <h1 class="mt-3 font-display text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl">${a.title}</h1>
        <p class="mt-4 text-lg leading-relaxed text-slate-700">${a.description}</p>
        <div class="mt-6">${demoNotice('This activity is an example. Real activities will be published by ZOCF and regional ambassadors.')}</div>
      </div>
      <aside class="lg:col-span-2">
        <div class="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-36">
          <dl class="space-y-4 text-slate-700">
            <div class="flex gap-3"><dt class="text-orange-500">${icons.calendar()}<span class="sr-only">Date</span></dt><dd class="font-semibold">${formatDate(a.date)}</dd></div>
            <div class="flex gap-3"><dt class="text-orange-500">${icons.clock()}<span class="sr-only">Time</span></dt><dd class="font-semibold">${a.time}</dd></div>
            <div class="flex gap-3"><dt class="text-orange-500">${icons.pin()}<span class="sr-only">Location</span></dt><dd class="font-semibold">${a.location}<span class="block text-xs font-normal text-slate-500">Exact venue shared with registered members only</span></dd></div>
            <div class="flex gap-3"><dt class="text-orange-500">${icons.users()}<span class="sr-only">Organiser</span></dt><dd class="font-semibold">${a.organiser}</dd></div>
          </dl>
          <div class="mt-6">
            <p class="text-sm font-semibold text-indigo-950"><span data-count="${a.id}">${interest.displayCount(a)}</span> interested · ${a.capacity} places</p>
            <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="presentation"><div class="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500" style="width:${pct}%"></div></div>
          </div>
          <div class="mt-6" data-interest-slot="${a.id}" data-full="true">${interestButton(a, { full: true })}</div>
          <p class="mt-3 text-xs text-slate-500">Saved only in this browser for the demonstration. In the live platform, signed-in members will register and receive joining details.</p>
        </div>
      </aside>
    </div>
  </div>`);
}
