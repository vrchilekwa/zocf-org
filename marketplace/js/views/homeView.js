import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { productGrid, productCard } from '../components/productCard.js';
import { categoryCard } from '../components/categoryCard.js';
import { aiSearchPanel, mountAiSearchPanel } from '../components/aiSearchPanel.js';
import { inspirationCard, inspirationDialog, mountInspirationGallery } from '../components/inspirationCard.js';
import { loadingGrid, errorState, sectionHeading, demoNotice } from '../components/states.js';
import { getProducts, getCategories, getCategoryNames, getFeaturedProducts, getRecentProducts, getPopularProducts } from '../services/productService.js';
import { getInspiration } from '../services/inspirationService.js';
import { formatDate } from '../utils/format.js';

function hero() {
  return html`<section class="mp-hero relative isolate overflow-hidden text-white" aria-labelledby="heroTitle">
    <div class="mp-hero-overlay absolute inset-0 -z-10" aria-hidden="true"></div>
    <div class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div class="max-w-2xl">
        <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 ring-1 ring-white/15">ZOCF Chitenge Marketplace</p>
        <h1 id="heroTitle" class="mt-5 text-4xl font-extrabold leading-tight tracking-tight drop-shadow-lg sm:text-5xl lg:text-6xl">Discover the Beauty of Zambian Chitenge</h1>
        <p class="mt-5 text-lg leading-relaxed text-white/90 sm:text-xl">Explore colourful fabrics, traditional patterns and contemporary African designs. Discover unique materials from our community of sellers.</p>

        <form data-hero-search class="mt-8 rounded-2xl bg-white p-2 shadow-2xl shadow-black/30" role="search" aria-label="Search the marketplace">
          <div class="flex flex-col gap-2 sm:flex-row">
            <label for="heroSearch" class="sr-only">Search chitenge materials</label>
            <div class="relative flex-1">
              <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">${icons.search()}</span>
              <input id="heroSearch" name="q" type="search" autocomplete="off"
                placeholder="Describe the chitenge pattern, colour or design you are looking for..."
                class="h-12 w-full rounded-xl border-0 bg-gray-50 pl-10 pr-3 text-base text-gray-900 placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-300" />
            </div>
            <button type="submit" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 font-bold text-emerald-950 transition hover:bg-amber-300">${icons.search('h-5 w-5')} Search</button>
          </div>
        </form>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href="#/catalogue" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white hover:text-emerald-950">Browse materials ${icons.arrowRight('h-5 w-5')}</a>
          <a href="#/discover" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-amber-300 ring-1 ring-amber-300/40 transition hover:bg-amber-300/10">${icons.sparkles('h-5 w-5')} AI-powered discovery <span class="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-950">Coming soon</span></a>
        </div>
      </div>
    </div>
  </section>`;
}

function popularPatterns(products) {
  // Rank pattern styles by the combined popularity of the fabrics that use them.
  const totals = new Map();
  for (const p of products) for (const pat of p.patterns) {
    const t = totals.get(pat) || { pattern: pat, score: 0, example: p };
    t.score += p.popularity;
    if (p.popularity > t.example.popularity) t.example = p;
    totals.set(pat, t);
  }
  return [...totals.values()].sort((a, b) => b.score - a.score).slice(0, 6);
}

function body({ categories, counts, featured, recent, popular, patterns, inspiration, names }) {
  return html`
    <div class="mx-auto max-w-7xl space-y-24 px-4 py-16 sm:px-6 lg:px-8">

      <section aria-labelledby="catTitle">
        ${sectionHeading({ eyebrow: 'Shop by style', title: 'Featured categories', id: 'catTitle', text: 'From heritage chitenge to designer prints, choose a style to see matching materials.', link: { href: '#/catalogue', label: 'View all materials' } })}
        <ul class="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4" role="list">
          ${categories.map((c) => html`<li>${categoryCard(c, counts[c.id] || 0)}</li>`)}
        </ul>
      </section>

      <section aria-labelledby="featTitle">
        ${sectionHeading({ eyebrow: 'Hand-picked', title: 'Featured chitenge materials', id: 'featTitle', link: { href: '#/catalogue', label: 'Browse the catalogue' } })}
        <div class="mt-6">${demoNotice('These are sample listings created to show how the marketplace will work. They are not real products and cannot be purchased.')}</div>
        <div class="mt-8">${productGrid(featured, { categoryNames: names, cols: 'sm:grid-cols-2 lg:grid-cols-3' })}</div>
      </section>

      ${aiSearchPanel()}

      <section aria-labelledby="recentTitle">
        ${sectionHeading({ eyebrow: 'Just in', title: 'Recently added', id: 'recentTitle', link: { href: '#/catalogue?sort=newest', label: 'See all new arrivals' } })}
        <ul class="mt-8 grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 lg:grid-cols-4" role="list">
          ${recent.map((p) => html`<li class="flex flex-col">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Added ${formatDate(p.dateAdded)}</p>
            <div class="flex-1">${productGridItem(p, names)}</div>
          </li>`)}
        </ul>
      </section>

      <section aria-labelledby="popTitle" class="relative overflow-hidden rounded-3xl bg-emerald-950 px-5 py-12 text-white sm:px-10">
        <div class="pattern-chitenge absolute inset-0 opacity-60" aria-hidden="true"></div>
        <div class="relative">
          <p class="text-sm font-semibold uppercase tracking-widest text-amber-300">Community favourites</p>
          <h2 id="popTitle" class="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Popular designs</h2>
          <p class="mt-3 max-w-2xl text-white/80">The pattern styles and fabrics our community viewed most. Choose one to explore.</p>
          <ul class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" role="list">
            ${patterns.map(({ pattern, example }) => html`<li>
              <a href="#/catalogue?pattern=${encodeURIComponent(pattern)}" class="group block overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-amber-400">
                <img src="${example.images[1]}" alt="" loading="lazy" class="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                <span class="block px-3 py-2.5 text-sm font-bold capitalize">${pattern}</span>
              </a></li>`)}
          </ul>
          <h3 class="mt-12 text-xl font-bold">Most popular fabrics</h3>
          <ol class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            ${popular.map((p, i) => html`<li>
              <a href="#/product/${encodeURIComponent(p.id)}" class="group flex items-center gap-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-amber-400">
                <span class="text-3xl font-extrabold text-amber-300" aria-hidden="true">${i + 1}</span>
                <img src="${p.images[0]}" alt="" loading="lazy" class="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <span class="min-w-0"><span class="block truncate font-semibold group-hover:text-amber-200">${p.name}</span><span class="text-sm text-white/70">${names[p.category]}</span></span>
              </a></li>`)}
          </ol>
        </div>
      </section>

      <section aria-labelledby="inspTitle">
        ${sectionHeading({ eyebrow: 'Design ideas', title: 'Inspiration Gallery', id: 'inspTitle', text: 'Pattern and colour ideas to spark your next outfit. These are inspiration images, not products for sale.', link: { href: '#/inspiration', label: 'Open the gallery' } })}
        <div class="mp-masonry mt-8">${inspiration.slice(0, 4).map(inspirationCard)}</div>
        ${inspirationDialog()}
      </section>

      <section aria-labelledby="sellTitle" class="grid items-center gap-10 overflow-hidden rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-10 lg:grid-cols-2">
        <div>
          <p class="text-sm font-semibold uppercase tracking-widest text-amber-700">For sellers</p>
          <h2 id="sellTitle" class="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Are you selling Zambian chitenge?</h2>
          <p class="mt-4 text-lg text-gray-600">Join our community marketplace and showcase your materials to Zambians and African communities across the diaspora.</p>
          <ul class="mt-6 space-y-2 text-gray-700">
            ${['Reach ZOCF members and chapters in the UK, Ireland and beyond', 'Showcase your fabrics with your own seller profile', 'Simple listing tools designed for small businesses'].map((t) => html`<li class="flex gap-3"><span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-emerald-950">${icons.check('h-4 w-4')}</span>${t}</li>`)}
          </ul>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#/sellers" class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700">${icons.store('h-5 w-5')} Become a Seller</a>
            <a href="#/dashboard" class="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-emerald-800/20 px-6 py-3 font-semibold text-emerald-900 hover:bg-emerald-50">Preview the seller dashboard</a>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3" aria-hidden="true">
          ${featured.slice(0, 6).map((p, i) => html`<img src="${p.images[2]}" alt="" loading="lazy" class="aspect-[3/4] w-full rounded-2xl object-cover shadow-md ${i % 2 ? 'translate-y-6' : ''}" />`)}
        </div>
      </section>

      <section aria-labelledby="commTitle">
        ${sectionHeading({ eyebrow: 'Community enterprise', title: 'More than a marketplace', id: 'commTitle', text: 'The Chitenge Marketplace is part of ZOCF’s mission to keep our culture alive abroad and to help our members build livelihoods.' })}
        <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          ${[
            [icons.users('h-6 w-6'), 'Supporting ZOCF members', 'Members who sell fabric, tailor or design can reach the wider fellowship in every chapter.'],
            [icons.store('h-6 w-6'), 'Backing small businesses', 'Diaspora traders and home-based businesses get a trusted, community-run shop window.'],
            [icons.globe('h-6 w-6'), 'Connecting to Zambia', 'Fabrics sourced from Zambian producers help keep trade flowing between home and the diaspora.'],
            [icons.heart('h-6 w-6'), 'Passing culture on', 'Chitenge links generations: from kitchen parties to Independence Day, our children wear our story.'],
          ].map(([icon, title, text]) => html`<article class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-900 text-amber-300">${icon}</span>
            <h3 class="mt-4 text-lg font-bold text-emerald-950">${title}</h3>
            <p class="mt-2 text-gray-600">${text}</p>
          </article>`)}
        </div>
        <p class="mt-8 text-center text-gray-600">Want to get involved? <a href="../#join" class="font-semibold text-emerald-800 underline-offset-4 hover:underline">Become a ZOCF member</a> or email <a href="mailto:contact@zocf.org" class="font-semibold text-emerald-800 underline-offset-4 hover:underline">contact@zocf.org</a>.</p>
      </section>
    </div>`;
}

// Recently-added uses the same card component, without the long description.
const productGridItem = (p, names) => productCard(p, { categoryNames: names, compact: true });

export async function homeView(root, ctx) {
  ctx.setTitle('Discover Zambian Chitenge');
  render(root, html`${hero()}<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">${loadingGrid(8)}</div>`);
  wireHeroSearch(root);

  let data;
  try {
    const [products, categories, names, featured, recent, popular, inspiration] = await Promise.all([
      getProducts(), getCategories(), getCategoryNames(), getFeaturedProducts(6), getRecentProducts(4), getPopularProducts(4), getInspiration(),
    ]);
    const counts = products.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {});
    data = { categories, counts, featured, recent, popular, patterns: popularPatterns(products), inspiration, names };
  } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`${hero()}<div class="mx-auto max-w-3xl px-4 py-16">${errorState(err.message)}</div>`);
    wireHeroSearch(root);
    root.querySelector('[data-retry]').addEventListener('click', () => homeView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;
  const typed = root.querySelector('#heroSearch').value;
  render(root, html`${hero()}${body(data)}`);
  root.querySelector('#heroSearch').value = typed;
  wireHeroSearch(root);
  mountAiSearchPanel(root);
  mountInspirationGallery(root, data.inspiration);
}

function wireHeroSearch(root) {
  root.querySelector('[data-hero-search]').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = e.currentTarget.q.value.trim();
    location.hash = q ? `#/catalogue?q=${encodeURIComponent(q)}` : '#/catalogue';
  });
}
