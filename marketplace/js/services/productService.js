// Data access for products, categories and sellers. Views call these async functions and never
// touch the JSON directly, so swapping the source for the FastAPI backend only changes this file
// (and data/api.js).
import { fetchJson } from '../data/api.js';
import { queryProducts, facets } from '../data/productQuery.js';
import { CONFIG } from '../config.js';

function deriveAvailability(stock) {
  if (stock <= 0) return 'out-of-stock';
  return stock <= CONFIG.lowStockThreshold ? 'low-stock' : 'in-stock';
}

// Normalise records so the UI can rely on their shape whatever the source.
const normalise = (p) => ({
  ...p,
  price: Number(p.price),
  stockQuantity: Math.max(0, Number(p.stockQuantity) || 0),
  availability: p.availability || deriveAvailability(Number(p.stockQuantity) || 0),
  colours: p.colours || [],
  patterns: p.patterns || [],
  images: p.images && p.images.length ? p.images : ['images/categories/other.svg'],
});

let productsPromise;
export function getProducts() {
  productsPromise ||= fetchJson('products.json').then((list) => list.map(normalise)).catch((err) => {
    productsPromise = undefined;
    throw err;
  });
  return productsPromise;
}

export const getCategories = () => fetchJson('categories.json');
export const getSellers = () => fetchJson('sellers.json');

export async function getCategoryNames() {
  const cats = await getCategories();
  return Object.fromEntries(cats.map((c) => [c.id, c.name]));
}

export async function getProductById(id) {
  return (await getProducts()).find((p) => p.id === id) || null;
}

export async function getFeaturedProducts(limit = 6) {
  return (await getProducts()).filter((p) => p.featured).slice(0, limit);
}

export async function getRecentProducts(limit = 4) {
  return [...(await getProducts())].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, limit);
}

export async function getPopularProducts(limit = 4) {
  return [...(await getProducts())].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}

/** Products sharing the category, patterns or colours of the given product. */
export async function getRelatedProducts(product, limit = 4) {
  const score = (p) =>
    (p.category === product.category ? 3 : 0) +
    p.patterns.filter((x) => product.patterns.includes(x)).length * 2 +
    p.colours.filter((x) => product.colours.includes(x)).length;
  return (await getProducts())
    .filter((p) => p.id !== product.id)
    .map((p) => ({ p, s: score(p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || b.p.popularity - a.p.popularity)
    .slice(0, limit)
    .map(({ p }) => p);
}

export async function searchProducts(criteria) {
  const [products, names] = await Promise.all([getProducts(), getCategoryNames()]);
  return queryProducts(products, criteria, names);
}

export async function getFacets() {
  return facets(await getProducts());
}

export async function getSellerById(id) {
  return (await getSellers()).find((s) => s.id === id) || null;
}

export async function getProductsBySeller(sellerId) {
  return (await getProducts()).filter((p) => p.sellerId === sellerId);
}
