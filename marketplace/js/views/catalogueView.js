import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { productGrid } from '../components/productCard.js';
import { loadingGrid, emptyState, errorState } from '../components/states.js';
import { getFacets, getCategories, searchProducts } from '../services/productService.js';
import { SORT_OPTIONS, AVAILABILITY_OPTIONS } from '../data/productQuery.js';
import { capitalise, formatPrice } from '../utils/format.js';

export const LAST_CATALOGUE_KEY = 'zocf.marketplace.lastCatalogue';
const FIELDS = ['q', 'category', 'colour', 'pattern', 'availability', 'seller', 'min', 'max', 'sort'];

const selectCls = 'mt-1.5 block h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100';
const labelCls = 'block text-sm font-semibold text-gray-800';

function select(name, label, options, value, anyLabel) {
  return html`<div>
    <label for="f-${name}" class="${labelCls}">${label}</label>
    <select id="f-${name}" name="${name}" class="${selectCls}">
      ${anyLabel ? html`<option value="">${anyLabel}</option>` : ''}
      ${options.map((o) => html`<option value="${o.value}" ${o.value === value ? 'selected' : ''}>${o.label}</option>`)}
    </select>
  </div>`;
}

function filtersPanel(state, facets, categories) {
  return html`<form id="filtersForm" class="space-y-5" novalidate aria-label="Filter products">
    ${select('category', 'Category', categories.map((c) => ({ value: c.id, label: c.name })), state.category, 'All categories')}
    ${select('colour', 'Colour', facets.colours.map((c) => ({ value: c, label: capitalise(c) })), state.colour, 'Any colour')}
    ${select('pattern', 'Pattern', facets.patterns.map((p) => ({ value: p, label: capitalise(p) })), state.pattern, 'Any pattern')}
    <fieldset>
      <legend class="${labelCls}">Price range (£)</legend>
      <div class="mt-1.5 grid grid-cols-2 gap-3">
        <div>
          <label for="f-min" class="text-xs text-gray-500">Minimum</label>
          <input id="f-min" name="min" type="number" inputmode="decimal" min="0" step="0.5" placeholder="${facets.minPrice}" value="${state.min}" class="${selectCls} mt-0.5" />
        </div>
        <div>
          <label for="f-max" class="text-xs text-gray-500">Maximum</label>
          <input id="f-max" name="max" type="number" inputmode="decimal" min="0" step="0.5" placeholder="${facets.maxPrice}" value="${state.max}" class="${selectCls} mt-0.5" />
        </div>
      </div>
      <p id="priceError" class="mt-2 hidden text-sm font-medium text-red-700" role="alert"></p>
      <p class="mt-1.5 text-xs text-gray-500">Listings range from ${formatPrice(facets.minPrice)} to ${formatPrice(facets.maxPrice)}.</p>
    </fieldset>
    ${select('availability', 'Availability', AVAILABILITY_OPTIONS, state.availability, 'Any availability')}
    ${select('seller', 'Seller', facets.sellers.map((s) => ({ value: s.id, label: s.name })), state.seller, 'All sellers')}
    <button type="button" data-clear-all class="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-emerald-700 hover:text-emerald-800">Clear all filters</button>
  </form>`;
}

function layout(state, facets, categories) {
  return html`<div class="bg-emerald-950 text-white">
      <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="pattern-chitenge absolute inset-0 opacity-60" aria-hidden="true"></div>
        <div class="relative">
          <nav aria-label="Breadcrumb" class="text-sm text-white/70"><a href="#/" class="hover:text-amber-300">Marketplace</a> <span aria-hidden="true">/</span> <span aria-current="page">Catalogue</span></nav>
          <h1 class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Chitenge catalogue</h1>
          <p class="mt-2 max-w-2xl text-white/80">Search and filter every demonstration listing by colour, pattern, price and seller.</p>
          <form id="searchForm" class="mt-6 max-w-2xl" role="search" aria-label="Search the catalogue">
            <label for="f-q" class="sr-only">Search by name, description, colour, pattern or category</label>
            <div class="relative">
              <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">${icons.search()}</span>
              <input id="f-q" name="q" type="search" value="${state.q}" autocomplete="off" placeholder="Search by name, colour, pattern or category…"
                class="h-12 w-full rounded-xl border-0 bg-white pl-10 pr-3 text-base text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300" />
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="lg:grid lg:grid-cols-[17rem_1fr] lg:gap-10">
        <aside aria-label="Filters" class="mb-6 lg:mb-0">
          <button type="button" id="filtersToggle" class="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-emerald-900 shadow-sm ring-1 ring-black/10 lg:hidden" aria-expanded="false" aria-controls="filtersPanel">
            ${icons.filter('h-5 w-5')} Filters <span id="filterCountBadge" class="hidden rounded-full bg-amber-400 px-2 text-xs font-extrabold text-emerald-950"></span>
          </button>
          <div id="filtersPanel" class="mt-4 hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-36 lg:mt-0 lg:block">
            <h2 class="mb-4 hidden text-lg font-bold text-emerald-950 lg:block">Filter</h2>
            ${filtersPanel(state, facets, categories)}
          </div>
        </aside>

        <section aria-labelledby="resultsHeading">
          <h2 id="resultsHeading" class="sr-only">Results</h2>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p id="resultCount" class="font-semibold text-gray-800" aria-live="polite" aria-atomic="true"></p>
            <div class="flex items-center gap-2">
              <label for="f-sort" class="shrink-0 text-sm font-semibold text-gray-700">Sort by</label>
              <select id="f-sort" name="sort" form="filtersForm" class="${selectCls} mt-0 sm:w-60">
                ${SORT_OPTIONS.map((o) => html`<option value="${o.value}" ${o.value === state.sort ? 'selected' : ''}>${o.label}</option>`)}
              </select>
            </div>
          </div>
          <ul id="activeFilters" class="mt-4 flex flex-wrap gap-2" aria-label="Active filters"></ul>
          <p id="ignoredTerms" class="mt-3 hidden text-sm text-gray-600"></p>
          <div id="results" class="mt-6">${loadingGrid(6)}</div>
        </section>
      </div>
    </div>`;
}

const parseNum = (v) => (v === '' || v == null ? NaN : Number(v));

export async function catalogueView(root, ctx) {
  ctx.setTitle('Catalogue');
  render(root, html`<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">${loadingGrid(8)}</div>`);

  let facets, categories;
  try {
    [facets, categories] = await Promise.all([getFacets(), getCategories()]);
  } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Catalogue</h1>${errorState(err.message)}</div>`);
    root.querySelector('[data-retry]').addEventListener('click', () => catalogueView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;

  const state = Object.fromEntries(FIELDS.map((f) => [f, ctx.query.get(f) || '']));
  if (!SORT_OPTIONS.some((o) => o.value === state.sort)) state.sort = 'featured';
  const category = categories.find((c) => c.id === state.category);
  if (category) ctx.setTitle(category.name);

  render(root, layout(state, facets, categories));
  const form = root.querySelector('#filtersForm');
  const q = root.querySelector('#f-q');
  const resultsEl = root.querySelector('#results');
  const countEl = root.querySelector('#resultCount');
  const chipsEl = root.querySelector('#activeFilters');
  const priceError = root.querySelector('#priceError');
  const ignoredEl = root.querySelector('#ignoredTerms');
  const labels = {
    category: (v) => categories.find((c) => c.id === v)?.name || v,
    colour: capitalise, pattern: capitalise,
    availability: (v) => AVAILABILITY_OPTIONS.find((o) => o.value === v)?.label || v,
    seller: (v) => facets.sellers.find((s) => s.id === v)?.name || v,
  };

  // Mobile filter drawer
  const toggle = root.querySelector('#filtersToggle');
  const panel = root.querySelector('#filtersPanel');
  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('hidden') === false;
    toggle.setAttribute('aria-expanded', String(open));
  });

  const readForm = () => {
    const data = new FormData(form);
    return { q: q.value.trim(), ...Object.fromEntries(['category', 'colour', 'pattern', 'availability', 'seller', 'min', 'max', 'sort'].map((k) => [k, String(data.get(k) || '').trim()])) };
  };

  let requestId = 0;
  async function update() {
    const s = readForm();
    const min = parseNum(s.min), max = parseNum(s.max);
    let priceOk = true;
    if ((s.min && !(min >= 0)) || (s.max && !(max >= 0))) { priceError.textContent = 'Please enter prices of £0 or more.'; priceOk = false; }
    else if (min > max) { priceError.textContent = 'The minimum price is higher than the maximum, so the price filter is not applied.'; priceOk = false; }
    priceError.classList.toggle('hidden', priceOk);

    ctx.replaceQuery({ ...s, sort: s.sort === 'featured' ? '' : s.sort });
    try { sessionStorage.setItem(LAST_CATALOGUE_KEY, location.hash); } catch { /* ignore */ }

    // Active filter chips
    const active = ['category', 'colour', 'pattern', 'availability', 'seller'].filter((k) => s[k]).map((k) => ({ key: k, label: labels[k](s[k]) }));
    if (priceOk && (s.min || s.max)) active.push({ key: 'price', label: `${s.min ? formatPrice(min) : 'Any'} – ${s.max ? formatPrice(max) : 'Any'}` });
    if (s.q) active.unshift({ key: 'q', label: `“${s.q}”` });
    render(chipsEl, active.map((a) => html`<li><button type="button" data-clear="${a.key}" class="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-emerald-900 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700" aria-label="Remove filter: ${a.label}">${a.label} ${icons.close('h-3.5 w-3.5')}</button></li>`));
    const badge = root.querySelector('#filterCountBadge');
    const nFilters = active.filter((a) => a.key !== 'q').length;
    badge.textContent = String(nFilters);
    badge.classList.toggle('hidden', nFilters === 0);

    const id = ++requestId;
    const criteria = {
      q: s.q, category: s.category, colour: s.colour, pattern: s.pattern, availability: s.availability, seller: s.seller, sort: s.sort,
      minPrice: priceOk ? min : NaN, maxPrice: priceOk ? max : NaN,
    };
    try {
      const { items, ignoredTerms } = await searchProducts(criteria);
      if (id !== requestId || !ctx.isCurrent()) return;
      countEl.textContent = `${items.length} ${items.length === 1 ? 'material' : 'materials'} found`;
      ignoredEl.classList.toggle('hidden', !ignoredTerms.length);
      ignoredEl.textContent = ignoredTerms.length ? `No listings mention ${ignoredTerms.map((t) => `“${t}”`).join(', ')}, so ${ignoredTerms.length === 1 ? 'that word was' : 'those words were'} ignored.` : '';
      render(resultsEl, items.length
        ? productGrid(items, { categoryNames: Object.fromEntries(categories.map((c) => [c.id, c.name])), cols: 'sm:grid-cols-2 xl:grid-cols-3' })
        : emptyState({ title: 'No materials match your search', message: 'Try removing a filter, widening the price range or searching for a different colour or pattern.', actionLabel: 'Clear all filters', onActionAttr: html`data-clear-all` }));
    } catch (err) {
      if (id !== requestId) return;
      countEl.textContent = '';
      render(resultsEl, errorState(err.message));
    }
  }

  const clearField = (key) => {
    if (key === 'q') q.value = '';
    else if (key === 'price') { form.elements.min.value = ''; form.elements.max.value = ''; }
    else form.elements[key].value = '';
  };

  let debounce;
  const debounced = () => { clearTimeout(debounce); debounce = setTimeout(update, 250); };
  q.addEventListener('input', debounced);
  root.querySelector('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(debounce); update(); });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('change', (e) => { if (e.target.type !== 'number') update(); });
  root.querySelector('#f-sort').addEventListener('change', update);
  form.elements.min.addEventListener('input', debounced);
  form.elements.max.addEventListener('input', debounced);
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-clear]');
    if (chip) { clearField(chip.dataset.clear); update(); return; }
    if (e.target.closest('[data-clear-all]')) {
      ['q', 'category', 'colour', 'pattern', 'availability', 'seller', 'price'].forEach(clearField);
      update();
    }
    if (e.target.closest('[data-retry]')) update();
  });

  await update();
  return () => clearTimeout(debounce);
}
