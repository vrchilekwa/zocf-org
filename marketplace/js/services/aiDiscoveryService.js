// "AI" discovery: describe a chitenge in your own words and get matching products.
//
// Stage 1 ships ONLY a demonstration provider that runs in the browser using keyword and
// synonym rules. No AI model or external service is called. The UI says so.
//
// Provider contract (what a Stage 2 provider must return from discover(query, products)):
//   {
//     provider: { id, label, isDemo },
//     interpretation: { colours: string[], patterns: string[], categories: string[], keywords: string[] },
//     results: [{ product, score, reasons: string[] }],   // best match first
//   }
// Stage 2 plan: add a provider that POSTs the query to the ZOCF backend, which calls the Claude
// API server-side (keeping the API key off the client) and returns this same shape.
import { CONFIG } from '../config.js';
import { COLOUR_SYNONYMS, PATTERN_SYNONYMS, CATEGORY_SYNONYMS, STOP_WORDS, tokenize } from '../data/vocabulary.js';
import { getProducts, getCategoryNames } from './productService.js';

export const EXAMPLE_PROMPTS = [
  'Traditional blue and yellow Zambian chitenge',
  'Red and black geometric patterns',
  'Floral fabrics suitable for weddings',
  'Modern African fashion prints',
];

function lookup(words, map) {
  const found = new Set();
  for (const w of words) {
    for (const [canonical, syns] of Object.entries(map)) {
      if (syns.includes(w) || (w.length > 3 && syns.includes(w.replace(/s$/, '')))) found.add(canonical);
    }
  }
  return [...found];
}

const demoKeywordProvider = {
  id: 'demo-keyword',
  label: 'Demonstration matcher (keyword rules, runs in your browser)',
  isDemo: true,

  async discover(query, products, categoryNames) {
    const words = tokenize(query);
    const interpretation = {
      colours: lookup(words, COLOUR_SYNONYMS),
      patterns: lookup(words, PATTERN_SYNONYMS),
      categories: lookup(words, CATEGORY_SYNONYMS),
    };
    const known = new Set(Object.values({ ...COLOUR_SYNONYMS, ...PATTERN_SYNONYMS, ...CATEGORY_SYNONYMS }).flat());
    interpretation.keywords = words.filter((w) => !STOP_WORDS.has(w) && !known.has(w) && w.length > 2);

    const results = products
      .map((product) => {
        const reasons = [];
        let score = 0;
        const colourHits = interpretation.colours.filter((c) => product.colours.includes(c));
        if (colourHits.length) { score += colourHits.length * 3; reasons.push(`Colour: ${colourHits.join(', ')}`); }
        const patternHits = interpretation.patterns.filter((p) => product.patterns.includes(p) || (p === 'geometric' && product.category === 'geometric'));
        if (patternHits.length) { score += patternHits.length * 3; reasons.push(`Pattern: ${patternHits.join(', ')}`); }
        if (interpretation.categories.includes(product.category)) { score += 4; reasons.push(`Category: ${categoryNames[product.category]}`); }
        const text = `${product.name} ${product.description}`.toLowerCase();
        const kwHits = interpretation.keywords.filter((k) => text.includes(k));
        if (kwHits.length) { score += kwHits.length; reasons.push(`Mentions: ${kwHits.join(', ')}`); }
        // Asking for two colours together should favour fabrics that have both.
        if (interpretation.colours.length > 1 && colourHits.length === interpretation.colours.length) score += 2;
        if (product.availability === 'out-of-stock') score -= 0.5;
        return { product, score, reasons };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || b.product.popularity - a.product.popularity)
      .slice(0, 8);

    return { provider: { id: this.id, label: this.label, isDemo: true }, interpretation, results };
  },
};

const PROVIDERS = { [demoKeywordProvider.id]: demoKeywordProvider };

export async function discover(query) {
  const text = String(query || '').trim();
  if (text.length < 3) throw new Error('Please describe the fabric you are looking for in a few words.');
  if (text.length > 300) throw new Error('Please keep your description under 300 characters.');
  const provider = PROVIDERS[CONFIG.aiProvider] || demoKeywordProvider;
  const [products, names] = await Promise.all([getProducts(), getCategoryNames()]);
  return provider.discover(text, products, names);
}

export const activeProvider = () => {
  const p = PROVIDERS[CONFIG.aiProvider] || demoKeywordProvider;
  return { id: p.id, label: p.label, isDemo: p.isDemo };
};
