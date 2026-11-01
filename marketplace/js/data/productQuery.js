// Pure search / filter / sort logic over a list of products. No DOM, no fetching, so it can be
// unit-tested and later mirrored by (or replaced with) server-side query parameters.
import { tokenize, expandTerm, STOP_WORDS } from './vocabulary.js';

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: lowest first' },
  { value: 'price-desc', label: 'Price: highest first' },
  { value: 'newest', label: 'Newest additions' },
  { value: 'name-asc', label: 'Alphabetical (A–Z)' },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'in-stock', label: 'In stock' },
  { value: 'low-stock', label: 'Low stock' },
  { value: 'available', label: 'Any available (in or low stock)' },
  { value: 'out-of-stock', label: 'Out of stock' },
];

function searchIndex(product, categoryNames) {
  const text = tokenize([
    product.name, product.description, product.sellerName, product.composition,
    categoryNames[product.category] || '', product.category,
    ...product.colours, ...product.patterns,
  ].join(' ')).join(' ');
  return { text, words: text.split(' ') };
}

/**
 * Turn a free-text query into search terms. Each term is a list of alternatives (the word,
 * its singular form and any synonyms); a product matches a term if any alternative appears.
 * Filler words ("something", "for a") are dropped so descriptive queries still work.
 */
export function parseQuery(query) {
  return [...new Set(tokenize(query))]
    .filter((w) => !STOP_WORDS.has(w) && w.length > 1)
    .map((word) => ({ word, alternatives: expandTerm(word).map((a) => tokenize(a).join(' ')) }));
}

// Match at the start of a word, so "red" finds "red" and "reds" but not "inspired".
const termMatches = (index, term) =>
  term.alternatives.some((alt) => (alt.includes(' ') ? index.text.includes(alt) : index.words.some((w) => w.startsWith(alt))));

/**
 * @param {object[]} products
 * @param {object} criteria { q, category, colour, pattern, availability, seller, minPrice, maxPrice, sort }
 * @param {Record<string,string>} categoryNames id -> display name, so "wedding fabrics" finds the category
 * @returns {{ items: object[], ignoredTerms: string[] }}
 */
export function queryProducts(products, criteria = {}, categoryNames = {}) {
  const { q, category, colour, pattern, availability, seller, minPrice, maxPrice, sort = 'featured' } = criteria;
  const texts = new Map(products.map((p) => [p.id, searchIndex(p, categoryNames)]));

  // Terms that match nothing in the whole catalogue are reported and ignored rather than
  // zeroing the results, e.g. "lovely" in "lovely blue print".
  const terms = parseQuery(q);
  const ignoredTerms = terms.filter((t) => !products.some((p) => termMatches(texts.get(p.id), t))).map((t) => t.word);
  const activeTerms = terms.filter((t) => !ignoredTerms.includes(t.word));
  // If nothing in the query matches anything, show no results rather than everything.
  if (terms.length && !activeTerms.length) return { items: [], ignoredTerms: [] };

  const min = Number.isFinite(minPrice) ? minPrice : -Infinity;
  const max = Number.isFinite(maxPrice) ? maxPrice : Infinity;

  const items = products.filter((p) => {
    if (category && p.category !== category) return false;
    if (colour && !p.colours.includes(colour)) return false;
    if (pattern && !p.patterns.includes(pattern)) return false;
    if (seller && p.sellerId !== seller) return false;
    if (availability === 'available' ? p.availability === 'out-of-stock' : availability && p.availability !== availability) return false;
    if (p.price < min || p.price > max) return false;
    const text = texts.get(p.id);
    return activeTerms.every((t) => termMatches(text, t));
  });

  return { items: sortProducts(items, sort), ignoredTerms };
}

export function sortProducts(items, sort) {
  const list = [...items];
  const byName = (a, b) => a.name.localeCompare(b.name, 'en-GB');
  switch (sort) {
    case 'price-asc': return list.sort((a, b) => a.price - b.price || byName(a, b));
    case 'price-desc': return list.sort((a, b) => b.price - a.price || byName(a, b));
    case 'newest': return list.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded) || byName(a, b));
    case 'name-asc': return list.sort(byName);
    default: return list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.popularity - a.popularity);
  }
}

/** Distinct filter values present in the data, for building filter controls. */
export function facets(products) {
  const uniq = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b));
  const prices = products.map((p) => p.price);
  return {
    colours: uniq(products.flatMap((p) => p.colours)),
    patterns: uniq(products.flatMap((p) => p.patterns)),
    sellers: uniq(products.map((p) => p.sellerId)).map((id) => ({ id, name: products.find((p) => p.sellerId === id).sellerName })),
    minPrice: Math.floor(Math.min(...prices)),
    maxPrice: Math.ceil(Math.max(...prices)),
  };
}
