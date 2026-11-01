// Central settings for the marketplace frontend.
// Stage 1 runs entirely in the browser from the JSON files in /data. When the FastAPI +
// PostgreSQL backend arrives, point dataBaseUrl at the API (e.g. 'https://api.zocf.org/v1/')
// and keep the same response shapes; no view code needs to change.
export const CONFIG = Object.freeze({
  dataBaseUrl: 'data/',          // relative, so it works under /zocf-org/marketplace/ on GitHub Pages
  currency: 'GBP',
  locale: 'en-GB',
  basketStorageKey: 'zocf.marketplace.basket.v1',
  lowStockThreshold: 3,
  // Discovery providers. Only the in-browser demo providers exist in Stage 1.
  // Stage 2 will add a server-side provider (the Claude API must be called from a backend so
  // no API key is ever shipped to the browser).
  aiProvider: 'demo-keyword',
  inspirationProvider: 'local-demo',
});
