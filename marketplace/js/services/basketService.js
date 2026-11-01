// Shopping basket kept in localStorage. Stores only { productId, quantity }; prices and stock are
// always read from the current product data, so stale prices are never shown.
import { CONFIG } from '../config.js';

const KEY = CONFIG.basketStorageKey;
const listeners = new Set();
let memoryFallback = []; // used if localStorage is unavailable (e.g. some private-browsing modes)

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.productId === 'string' && Number.isInteger(i.quantity) && i.quantity > 0)
      .map(({ productId, quantity }) => ({ productId, quantity }));
  } catch {
    return [...memoryFallback];
  }
}

function write(items) {
  memoryFallback = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage full or blocked: keep the in-memory copy for this visit */
  }
  listeners.forEach((fn) => fn(items));
}

export const getItems = () => read();
export const getQuantity = (productId) => read().find((i) => i.productId === productId)?.quantity || 0;
export const getCount = () => read().reduce((n, i) => n + i.quantity, 0);

/** Subscribe to basket changes (including changes made in other tabs). Returns an unsubscribe function. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
window.addEventListener('storage', (e) => { if (e.key === KEY) listeners.forEach((fn) => fn(read())); });

/**
 * Add a product. Validates against the product's stock, counting what is already in the basket.
 * @returns {{ ok: boolean, message: string, quantity: number }}
 */
export function addItem(product, quantity = 1) {
  const qty = Math.floor(Number(quantity));
  if (!product) return { ok: false, message: 'This product could not be found.', quantity: 0 };
  if (!(qty > 0)) return { ok: false, message: 'Please choose a quantity of at least 1.', quantity: 0 };
  if (product.stockQuantity <= 0) return { ok: false, message: `${product.name} is out of stock.`, quantity: 0 };

  const items = read();
  const existing = items.find((i) => i.productId === product.id);
  const current = existing?.quantity || 0;
  const remaining = product.stockQuantity - current;
  if (remaining <= 0) {
    return { ok: false, message: `You already have all ${product.stockQuantity} available of ${product.name} in your basket.`, quantity: current };
  }
  const added = Math.min(qty, remaining);
  if (existing) existing.quantity += added; else items.push({ productId: product.id, quantity: added });
  write(items);
  const message = added < qty
    ? `Only ${remaining} more available, so ${added} added. You now have ${current + added} of ${product.name}.`
    : `${product.name} added to your basket.`;
  return { ok: true, message, quantity: current + added, limited: added < qty };
}

/** Set an exact quantity (clamped to stock). A quantity of 0 removes the item. */
export function setQuantity(product, quantity) {
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  const capped = Math.min(qty, product.stockQuantity);
  const items = read().filter((i) => i.productId !== product.id || capped > 0);
  const item = items.find((i) => i.productId === product.id);
  if (item) item.quantity = capped;
  write(items);
  return { ok: capped === qty, quantity: capped, message: capped < qty ? `Only ${product.stockQuantity} of ${product.name} available.` : '' };
}

export function removeItem(productId) {
  write(read().filter((i) => i.productId !== productId));
}

export function clear() {
  write([]);
}

/**
 * Join basket items with current product data. Drops products that no longer exist and clamps
 * quantities to current stock, reporting what changed.
 */
export function reconcile(products) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const notices = [];
  const lines = [];
  for (const item of read()) {
    const product = byId.get(item.productId);
    if (!product) { notices.push('An item in your basket is no longer listed and was removed.'); continue; }
    let quantity = item.quantity;
    if (product.stockQuantity <= 0) { notices.push(`${product.name} is now out of stock and was removed.`); continue; }
    if (quantity > product.stockQuantity) {
      quantity = product.stockQuantity;
      notices.push(`Only ${quantity} of ${product.name} available, so your quantity was reduced.`);
    }
    lines.push({ product, quantity, lineTotal: Math.round(product.price * quantity * 100) / 100 });
  }
  const normalised = lines.map((l) => ({ productId: l.product.id, quantity: l.quantity }));
  if (JSON.stringify(normalised) !== JSON.stringify(read())) write(normalised);
  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
  return { lines, subtotal, count: lines.reduce((n, l) => n + l.quantity, 0), notices };
}
