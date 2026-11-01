// Opportunities: approved listings plus a demonstration "share an opportunity" form showing the
// future moderation flow (member submits -> status "pending" -> admin approves -> published).
import { html, render, icons, btn, loadingCards, showError, emptyState, demoNotice, pageHeader, inputCls, labelCls, errorSlot, setFieldError } from '../components/ui.js';
import { opportunityCard } from '../components/cards.js';
import { getOpportunities, getLookups } from '../services/dataService.js';

export async function opportunitiesView(root, ctx) {
  ctx.setTitle('Opportunities');
  render(root, loadingCards(6));
  let items, lookups;
  try { [items, lookups] = await Promise.all([getOpportunities(), getLookups()]); }
  catch (err) { if (ctx.isCurrent()) showError(root, err, () => opportunitiesView(root, ctx), 'Opportunities'); return; }
  if (!ctx.isCurrent()) return;
  const state = { category: ctx.query.get('category') || '', q: ctx.query.get('q') || '' };

  render(root, html`${pageHeader({ eyebrow: 'Opportunities', title: 'Open doors for each other', text: 'Graduate roles, internships, apprenticeships, mentoring, scholarships and more, shared by our community.' })}
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      ${demoNotice('These listings and organisations are fictional examples. Always check real opportunities with the organisation directly.')}
      <div class="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button type="button" data-ocat="" class="ng-ocat min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1">All</button>
          ${lookups.opportunityCategories.map((c) => html`<button type="button" data-ocat="${c.id}" class="ng-ocat min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1">${c.name}</button>`)}
        </div>
        <div class="relative lg:w-80"><label for="o-q" class="sr-only">Search opportunities</label>
          <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">${icons.search()}</span>
          <input id="o-q" type="search" value="${state.q}" placeholder="Search opportunities…" class="h-11 w-full rounded-full border border-slate-200 bg-white pl-12 pr-4 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100" /></div>
      </div>
      <p id="oCount" class="mt-6 font-semibold text-slate-700" aria-live="polite"></p>
      <div id="oResults" class="mt-5"></div>

      <section class="mt-16 grid gap-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-10 lg:grid-cols-2" aria-labelledby="shareTitle">
        <div>
          <h2 id="shareTitle" class="font-display text-2xl font-extrabold text-indigo-950">Share an opportunity</h2>
          <p class="mt-2 text-slate-600">Know about a role, scholarship or programme that could help someone? In the live platform, approved members will submit opportunities here. Each one is checked by a ZOCF administrator before it is published.</p>
          <ol class="mt-6 space-y-3 text-sm">
            ${['You submit the opportunity', 'Status: pending review', 'An administrator checks it is genuine and suitable', 'Published for all members'].map((s, i) => html`<li class="flex items-center gap-3"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-sm font-bold text-white">${i + 1}</span>${s}</li>`)}
          </ol>
        </div>
        <form id="shareForm" class="space-y-4" novalidate>
          <div><label for="s-title" class="${labelCls}">Opportunity title</label><input id="s-title" name="title" required maxlength="100" class="${inputCls}" />${errorSlot('title')}</div>
          <div><label for="s-org" class="${labelCls}">Organisation</label><input id="s-org" name="organisation" required maxlength="100" class="${inputCls}" />${errorSlot('organisation')}</div>
          <div><label for="s-cat" class="${labelCls}">Category</label><select id="s-cat" name="category" required class="${inputCls} h-11 py-0"><option value="">Choose…</option>${lookups.opportunityCategories.map((c) => html`<option value="${c.id}">${c.name}</option>`)}</select>${errorSlot('category')}</div>
          <div><label for="s-link" class="${labelCls}">Link (optional)</label><input id="s-link" name="link" type="url" placeholder="https://" class="${inputCls}" />${errorSlot('link')}</div>
          <button type="submit" class="${btn.primary} w-full">Preview submission</button>
          <p id="shareResult" class="hidden rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status"></p>
        </form>
      </section>
    </div>`);

  const out = root.querySelector('#oResults');
  const q = root.querySelector('#o-q');
  function update() {
    state.q = q.value.trim();
    ctx.replaceQuery({ category: state.category, q: state.q });
    root.querySelectorAll('.ng-ocat').forEach((b) => {
      const on = b.dataset.ocat === state.category;
      b.setAttribute('aria-pressed', String(on));
      b.className = `ng-ocat min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1 transition ${on ? 'bg-indigo-950 text-white ring-indigo-950' : 'bg-white text-indigo-950 ring-slate-200 hover:ring-orange-400'}`;
    });
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = items
      .filter((o) => !state.category || o.category === state.category)
      .filter((o) => terms.every((t) => `${o.title} ${o.description} ${o.organisation} ${o.location} ${lookups.opportunityNames[o.category]}`.toLowerCase().includes(t)))
      .sort((a, b) => a.closingDate.localeCompare(b.closingDate));
    root.querySelector('#oCount').textContent = `${list.length} ${list.length === 1 ? 'opportunity' : 'opportunities'}`;
    render(out, list.length ? html`<ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">${list.map((o) => html`<li>${opportunityCard(o, lookups)}</li>`)}</ul>`
      : emptyState({ title: 'No opportunities match', actionLabel: 'Show all', clearAttr: 'data-oreset' }));
  }
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ocat]');
    if (b) { state.category = b.dataset.ocat; update(); }
    if (e.target.closest('[data-oreset]')) { state.category = ''; q.value = ''; update(); }
  });
  let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(update, 200); });

  const form = root.querySelector('#shareForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let first = null;
    for (const name of ['title', 'organisation', 'category', 'link']) {
      const el = form.elements[name];
      el.value = el.value.trim();
      const msg = el.validity.valueMissing ? 'This field is required.' : el.validity.typeMismatch ? 'Please enter a full web address starting with https://' : '';
      setFieldError(form, name, msg);
      if (msg && !first) first = el;
    }
    if (first) { first.focus(); return; }
    const res = root.querySelector('#shareResult');
    res.textContent = `Preview only: “${form.elements.title.value}” would be submitted with status “pending review” for an administrator to approve. Nothing has been sent.`;
    res.classList.remove('hidden');
    form.reset();
  });
  update();
  return () => clearTimeout(t);
}
