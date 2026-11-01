// Shared member search UI used by "Meet Our Community" (simple) and "Find Connections" (full).
// Filter state lives in the URL so results can be shared, refreshed and navigated back to.
import { html, render, icons, btn, inputCls, labelCls, loadingCards, emptyState, showError, demoNotice, pageHeader } from '../components/ui.js';
import { memberCard } from '../components/cards.js';
import { memberGate } from '../components/memberGate.js';
import { isMemberPreview } from '../services/accessService.js';
import { getLookups, searchMembers } from '../services/dataService.js';

const ALL_FIELDS = ['q', 'location', 'nearby', 'ageGroup', 'interest', 'educationLevel', 'careerField', 'activity'];

function selectField(name, label, options, value, any) {
  return html`<div><label for="m-${name}" class="${labelCls}">${label}</label>
    <select id="m-${name}" name="${name}" class="${inputCls} h-11 py-0">
      <option value="">${any}</option>
      ${options.map((o) => html`<option value="${o.value}" ${o.value === value ? 'selected' : ''}>${o.label}</option>`)}
    </select></div>`;
}

export function memberSearchView({ title, eyebrow, intro, full }) {
  return async function view(root, ctx) {
    ctx.setTitle(title);
    if (!isMemberPreview()) { render(root, memberGate(title)); return; }
    render(root, loadingCards(6));
    let lookups;
    try { lookups = await getLookups(); } catch (err) { if (ctx.isCurrent()) showError(root, err, () => view(root, ctx), title); return; }
    if (!ctx.isCurrent()) return;

    const s = Object.fromEntries(ALL_FIELDS.map((f) => [f, ctx.query.get(f) || '']));
    const loc = (id) => lookups.locationById[id];

    const filters = html`
      ${selectField('location', 'Location', lookups.locations.map((l) => ({ value: l.id, label: `${l.name}${l.country !== 'UK' ? `, ${l.country}` : ''}` })), s.location, 'Anywhere')}
      <label class="flex min-h-[44px] items-center gap-3 text-sm font-medium text-slate-700"><input type="checkbox" name="nearby" value="1" ${s.nearby ? 'checked' : ''} class="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-400" /> Include nearby areas</label>
      <p id="nearbyHint" class="-mt-3 text-xs text-slate-500"></p>
      ${selectField('ageGroup', 'Age group', lookups.ageGroups.map((a) => ({ value: a, label: a })), s.ageGroup, 'Any age group')}
      ${selectField('interest', 'Interest', lookups.interests.map((i) => ({ value: i.id, label: i.name })), s.interest, 'Any interest')}
      ${full ? html`
        ${selectField('educationLevel', 'Education', lookups.educationLevels.map((e) => ({ value: e, label: e })), s.educationLevel, 'Any education')}
        ${selectField('careerField', 'Career', lookups.careerFields.map((c) => ({ value: c, label: c })), s.careerField, 'Any career')}
        ${selectField('activity', 'Preferred activities', lookups.activityCategories.map((a) => ({ value: a.id, label: a.name })), s.activity, 'Any activity')}` : ''}
      <button type="button" data-clear-all class="${btn.ghost} w-full">Clear filters</button>`;

    render(root, html`${pageHeader({ eyebrow, title, text: intro })}
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        ${demoNotice('You are in the member preview. Every profile here is fictional. In the live platform this page is only shown to approved members after secure sign-in.')}
        ${full ? html`<section class="mt-8" aria-labelledby="interestTilesTitle">
          <h2 id="interestTilesTitle" class="font-display text-xl font-bold text-indigo-950">Browse by interest</h2>
          <ul class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            ${lookups.interests.map((i) => html`<li><button type="button" data-interest-tile="${i.id}" aria-pressed="${s.interest === i.id}" class="flex min-h-[88px] w-full flex-col items-start justify-between rounded-2xl p-3 text-left text-sm font-semibold ring-1 transition ${s.interest === i.id ? 'bg-indigo-950 text-white ring-indigo-950' : 'bg-white text-indigo-950 ring-slate-200 hover:ring-orange-400'}"><span class="text-2xl" aria-hidden="true">${i.emoji}</span>${i.name}</button></li>`)}
          </ul></section>` : ''}
        <form id="memberSearch" class="mt-8" role="search" aria-label="Search members">
          <label for="m-q" class="sr-only">Search members</label>
          <div class="relative max-w-2xl">
            <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">${icons.search()}</span>
            <input id="m-q" name="q" type="search" value="${s.q}" autocomplete="off" placeholder="Search names, interests, careers, hobbies…" class="h-12 w-full rounded-full border border-slate-200 bg-white pl-12 pr-4 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" />
          </div>
        </form>
        <div class="mt-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
          <aside aria-label="Filters" class="mb-6 lg:mb-0">
            <button type="button" id="filtersToggle" class="${btn.ghost} w-full lg:hidden" aria-expanded="false" aria-controls="filtersPanel">${icons.filter('h-5 w-5')} Filters</button>
            <form id="filtersPanel" class="mt-4 hidden space-y-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-36 lg:mt-0 lg:block" novalidate>${filters}</form>
          </aside>
          <section aria-labelledby="resultsTitle">
            <h2 id="resultsTitle" class="sr-only">Members</h2>
            <p id="resultCount" class="font-semibold text-slate-700" aria-live="polite"></p>
            <div id="results" class="mt-5"></div>
          </section>
        </div>
      </div>`);

    const panel = root.querySelector('#filtersPanel');
    const q = root.querySelector('#m-q');
    const hint = root.querySelector('#nearbyHint');
    root.querySelector('#filtersToggle').addEventListener('click', (e) => {
      const open = panel.classList.toggle('hidden') === false;
      e.currentTarget.setAttribute('aria-expanded', String(open));
    });

    const read = () => {
      const f = new FormData(panel);
      return { q: q.value.trim(), ...Object.fromEntries(ALL_FIELDS.filter((k) => k !== 'q').map((k) => [k, String(f.get(k) || '')])) };
    };

    let req = 0;
    async function update() {
      const c = read();
      ctx.replaceQuery(c);
      const l = loc(c.location);
      hint.textContent = c.location && l ? (l.nearby.length ? `Nearby: ${l.nearby.map((id) => loc(id).name).join(', ')}` : 'No nearby areas listed for this location.') : '';
      root.querySelectorAll('[data-interest-tile]').forEach((b) => {
        const on = b.dataset.interestTile === c.interest;
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('bg-indigo-950', on); b.classList.toggle('text-white', on); b.classList.toggle('ring-indigo-950', on);
        b.classList.toggle('bg-white', !on); b.classList.toggle('text-indigo-950', !on); b.classList.toggle('ring-slate-200', !on);
      });
      const id = ++req;
      const items = await searchMembers({ ...c, nearby: Boolean(c.nearby) });
      if (id !== req || !ctx.isCurrent()) return;
      root.querySelector('#resultCount').textContent = `${items.length} ${items.length === 1 ? 'member' : 'members'} found`;
      render(root.querySelector('#results'), items.length
        ? html`<ul class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">${items.map((m) => {
            const reasons = [];
            if (c.location && m.location !== c.location) reasons.push(`Nearby: ${loc(m.location).name}`);
            if (c.interest) reasons.push(`Shares ${lookups.interestNames[c.interest]}`);
            return html`<li>${memberCard(m, lookups, { reasons })}</li>`;
          })}</ul>`
        : emptyState({ title: 'No members match yet', message: 'Try including nearby areas, removing a filter or searching for something broader.', actionLabel: 'Clear filters', clearAttr: 'data-clear-all' }));
    }

    let t;
    q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(update, 250); });
    root.querySelector('#memberSearch').addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(t); update(); });
    panel.addEventListener('change', update);
    panel.addEventListener('submit', (e) => e.preventDefault());
    root.addEventListener('click', (e) => {
      const tile = e.target.closest('[data-interest-tile]');
      if (tile) { panel.elements.interest.value = panel.elements.interest.value === tile.dataset.interestTile ? '' : tile.dataset.interestTile; update(); }
      if (e.target.closest('[data-clear-all]')) { panel.reset(); [...panel.elements].forEach((el) => { if (el.tagName === 'SELECT') el.value = ''; if (el.type === 'checkbox') el.checked = false; }); q.value = ''; update(); }
    });
    await update();
    return () => clearTimeout(t);
  };
}
