// The single place that knows where NextGen data comes from (static JSON now, FastAPI later).
import { CONFIG } from '../config.js';

const cache = new Map();

export function fetchJson(resource) {
  if (!cache.has(resource)) {
    const request = fetch(CONFIG.dataBaseUrl + resource, { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load ${resource} (HTTP ${res.status}).`);
        return res.json();
      })
      .catch((err) => {
        cache.delete(resource);
        throw new Error(err.message.startsWith('Could not load') ? err.message : 'Could not load NextGen data. Check your connection and try again.');
      });
    cache.set(resource, request);
  }
  return cache.get(resource);
}
