import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { productCard } from '../components/productCard.js';
import { aiSearchPanel, mountAiSearchPanel } from '../components/aiSearchPanel.js';
import { loadingGrid, emptyState, errorState } from '../components/states.js';
import { discover, activeProvider } from '../services/aiDiscoveryService.js';
import { getCategoryNames } from '../services/productService.js';
import { capitalise } from '../utils/format.js';

function interpretation({ colours, patterns, categories, keywords }, names) {
  const groups = [
    ['Colours', colours.map(capitalise)],
    ['Patterns', patterns.map(capitalise)],
    ['Categories', categories.map((c) => names[c] || c)],
    ['Other words', keywords],
  ].filter(([, v]) => v.length);
  if (!groups.length) return html`<p class="text-gray-600">No colours, patterns or styles were recognised in your description.</p>`;
  return html`<dl class="flex flex-wrap gap-x-6 gap-y-3">${groups.map(([k, v]) => html`<div><dt class="text-xs font-semibold uppercase tracking-wider text-gray-500">${k}</dt><dd class="mt-1 flex flex-wrap gap-1.5">${v.map((x) => html`<span class="rounded-full bg-indigo-50 px-2.5 py-1 text-sm font-medium text-indigo-900 ring-1 ring-indigo-200">${x}</span>`)}</dd></div>`)}</dl>`;
}

export async function discoverView(root, ctx) {
  ctx.setTitle('AI Discovery (demo)');
  const query = ctx.query.get('q') || '';
  const provider = activeProvider();
  render(root, html`<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="sr-only">AI Discovery demonstration</h1>
    ${aiSearchPanel({ query, headingLevel: 2 })}
    <div class="mt-6 grid gap-4 rounded-2xl bg-white p-5 text-sm text-gray-700 shadow-sm ring-1 ring-black/5 md:grid-cols-3">
      <p class="flex gap-2"><span class="text-amber-700">${icons.info('h-5 w-5')}</span><span><strong>What this is:</strong> a preview of AI-powered discovery. Matching currently uses <em>${provider.label.toLowerCase()}</em>.</span></p>
      <p class="flex gap-2"><span class="text-amber-700">${icons.sparkles('h-5 w-5')}</span><span><strong>Coming in Stage 2:</strong> natural-language understanding powered by Claude, through ZOCF’s secure server.</span></p>
      <p class="flex gap-2"><span class="text-amber-700">${icons.image('h-5 w-5')}</span><span><strong>Later:</strong> upload an inspiration photo and find fabrics with a similar look.</span></p>
    </div>
    <section id="discoverResults" class="mt-10" aria-live="polite" aria-busy="false"></section>
  </div>`);

  const out = root.querySelector('#discoverResults');
  async function run(q) {
    if (!q) {
      render(out, emptyState({ title: 'Describe your ideal chitenge', message: 'Type a description above or pick an example to see the demonstration in action.' }));
      return;
    }
    out.setAttribute('aria-busy', 'true');
    render(out, loadingGrid(4));
    try {
      const [result, names] = await Promise.all([discover(q), getCategoryNames()]);
      if (!ctx.isCurrent()) return;
      render(out, html`
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-widest text-indigo-700">Demonstration results</p>
            <h2 class="mt-1 text-2xl font-extrabold text-emerald-950">${result.results.length ? `${result.results.length} suggested ${result.results.length === 1 ? 'material' : 'materials'}` : 'No close matches'}</h2>
            <p class="mt-1 text-gray-600">For: “${q}”</p>
          </div>
          <span class="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 sm:self-auto">${icons.info('h-4 w-4')} Not AI: keyword demo</span>
        </div>
        <div class="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h3 class="text-sm font-bold text-gray-900">What the demo understood</h3>
          <div class="mt-3">${interpretation(result.interpretation, names)}</div>
        </div>
        <div class="mt-8">${result.results.length
          ? html`<ul class="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">${result.results.map((r) => html`<li class="flex flex-col">
              <p class="mb-2 flex flex-wrap gap-1">${r.reasons.map((why) => html`<span class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-900">${why}</span>`)}</p>
              <div class="flex-1">${productCard(r.product, { categoryNames: names, compact: true })}</div></li>`)}</ul>`
          : emptyState({ title: 'Nothing matched that description', message: 'Try naming a colour (e.g. blue, gold), a pattern (floral, geometric, zigzag) or an occasion (wedding, children).', actionHref: '#/catalogue', actionLabel: 'Browse all materials' })}</div>`);
    } catch (err) {
      if (!ctx.isCurrent()) return;
      render(out, errorState(err.message, { retry: false }));
    } finally {
      out.setAttribute('aria-busy', 'false');
    }
  }

  mountAiSearchPanel(root, {
    onSearch: (q) => { ctx.replaceQuery({ q }); run(q); },
  });
  await run(query);
}
