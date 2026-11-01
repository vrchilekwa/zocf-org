# ZOCF — Zambia Overseas Christian Fellowship

Landing page for the Zambia Overseas Christian Fellowship: *Your Home Away From Home.*

## Files
- `index.html` — the complete site (single file, Tailwind CSS via CDN). The hero photo, logo and pillar icons are embedded, so this file works on its own.
- `images/hero.jpg` — hero photo (optional; use `url('images/hero.jpg')` in the hero section for faster loading).
- `images/zocf-logo.png` — logo with transparent background, for reuse elsewhere.

## Still to fill in
Search `index.html` for `YOUR_` to find the remaining placeholders: Zoom link and meeting details, Donate link. The membership form needs a form service (see the comment above the `<form>`).

## Publishing
Settings → Pages → Deploy from a branch → `main` / `(root)`.

---

## ZOCF Chitenge Marketplace (Stage 1, demonstration)

*Celebrating Zambian Culture Through Fashion, Textiles and Enterprise.*

A frontend-only marketplace in `marketplace/`, linked from the main site's navigation and footer. It has no build step, framework or dependencies: plain HTML, ES modules and Tailwind via CDN, the same setup as the main page. All listings, sellers and figures are **fictional demonstration data**. Nothing can be bought and no payments are taken.

### Running locally
ES modules and `fetch()` don't work from `file://`, so serve the repository's **parent** folder. That way the URL matches GitHub Pages (`/zocf-org/`):

```bash
cd ..                      # the folder that contains zocf-org/
python -m http.server 8000
# open http://localhost:8000/zocf-org/marketplace/
```

### Deploying
No build is needed. Once this branch is merged to `main`, GitHub Pages serves the marketplace at `https://vrchilekwa.github.io/zocf-org/marketplace/`. All paths are relative and routing uses the URL hash (`#/catalogue`, `#/product/<id>` …), so every page works under `/zocf-org/` and survives a refresh without a 404 workaround.

### Pages (hash routes)
| Route | Page |
|---|---|
| `#/` | Marketplace home: hero search, categories, featured, recently added, popular designs, AI teaser, inspiration, become a seller, community enterprise |
| `#/catalogue` | Catalogue with search, filters (category, colour, pattern, price, availability, seller) and sorting. State is kept in the URL, e.g. `#/catalogue?category=floral&sort=price-asc` |
| `#/product/<id>` | Product details, gallery, stock-limited quantity, seller, delivery and related products |
| `#/basket` | Basket (saved in `localStorage`), with quantities validated against stock |
| `#/checkout` | Demonstration checkout. Collects no payment details and places no order |
| `#/discover?q=…` | AI discovery placeholder (keyword demo; no AI is connected) |
| `#/inspiration` | Inspiration Gallery (design ideas, clearly marked as not for sale) |
| `#/sellers`, `#/sellers/register`, `#/sellers/<id>` | Seller information, demo registration, seller profiles |
| `#/dashboard?seller=<id>` | Seller dashboard concept (no sign-in; drafts are not saved) |

### Code layout
```
marketplace/
  index.html              app shell: header, demo notice, footer
  css/marketplace.css     styles beyond Tailwind utilities
  data/*.json             demo data: products (20), categories (8), sellers (5), inspiration (10)
  images/                 original SVG artwork (generated, see tools/)
  js/app.js               routes, header, global "add to basket" handling
  js/router.js            hash router
  js/config.js            data URL, currency, provider settings
  js/data/                api.js (fetching), productQuery.js (pure search/filter/sort), vocabulary.js
  js/services/            product, basket, AI discovery and inspiration services
  js/components/          product card, category card, AI search panel, inspiration card, states, toast, icons
  js/views/               one module per page
  tools/generate-artwork.mjs   regenerates every SVG: node marketplace/tools/generate-artwork.mjs
```

### Notes for Stage 2
- **Backend:** views only talk to `js/services/*`. Point `CONFIG.dataBaseUrl` at the FastAPI service and return the same JSON shapes (see `data/products.json`). Search and filter logic in `js/data/productQuery.js` maps directly onto query parameters.
- **Claude API:** add a provider to `js/services/aiDiscoveryService.js` that calls the ZOCF backend, which calls Claude server-side. Never put an API key in this repository or in browser code. The provider contract is documented at the top of that file.
- **Pinterest:** add a provider to `js/services/inspirationService.js` that uses the official Pinterest API through the backend, with attribution. Do not scrape or re-host images.
- **Images:** product images are illustrative pattern renders. Replace the `images` URLs with real product photos when sellers upload them.
