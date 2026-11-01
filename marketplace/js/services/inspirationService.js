// Inspiration Gallery data. Inspiration images are design ideas, NOT marketplace products.
//
// Stage 1 provider: original ZOCF demonstration artwork stored in this repository.
// Provider contract: getItems() resolves to
//   [{ id, title, description, image, colours[], patterns[], searchHint,
//      source: { provider, label, url|null, attribution } }]
// Stage 2 plan: a backend-backed provider using the official Pinterest API (or another
// authorised image provider), with attribution and links back to the original pin. Images must
// not be scraped or re-hosted without permission.
import { CONFIG } from '../config.js';
import { fetchJson } from '../data/api.js';

const localDemoProvider = {
  id: 'local-demo',
  async getItems() {
    const items = await fetchJson('inspiration.json');
    return items.map((item) => ({
      ...item,
      source: { provider: 'local-demo', label: 'ZOCF demonstration artwork', url: null, attribution: 'Original illustration created for the ZOCF marketplace demo' },
    }));
  },
};

const PROVIDERS = { [localDemoProvider.id]: localDemoProvider };

export function getInspiration() {
  return (PROVIDERS[CONFIG.inspirationProvider] || localDemoProvider).getItems();
}
