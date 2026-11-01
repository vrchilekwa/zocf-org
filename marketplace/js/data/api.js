// The single place that knows where marketplace data comes from.
// Stage 1: static JSON files shipped with the site. Later: the FastAPI backend.
import { CONFIG } from '../config.js';

const cache = new Map();

export class DataError extends Error {}

export function fetchJson(resource) {
  if (!cache.has(resource)) {
    const request = fetch(CONFIG.dataBaseUrl + resource, { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new DataError(`Could not load ${resource} (HTTP ${res.status}).`);
        return res.json();
      })
      .catch((err) => {
        cache.delete(resource); // allow a retry after a failure
        throw err instanceof DataError ? err : new DataError(`Could not load ${resource}. Check your connection and try again.`);
      });
    cache.set(resource, request);
  }
  return cache.get(resource);
}
