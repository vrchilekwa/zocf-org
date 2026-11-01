// Inline SVG icons (static, trusted markup).
import { raw } from '../utils/html.js';

const icon = (d, { cls = 'h-5 w-5', stroke = 2 } = {}) =>
  raw(`<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`);

export const icons = {
  basket: (cls) => icon('<path d="M5 8h14l-1.4 10.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', { cls }),
  search: (cls) => icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', { cls }),
  sparkles: (cls) => icon('<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>', { cls }),
  arrowRight: (cls) => icon('<path d="M5 12h14M13 6l6 6-6 6"/>', { cls }),
  arrowLeft: (cls) => icon('<path d="M19 12H5M11 18l-6-6 6-6"/>', { cls }),
  plus: (cls) => icon('<path d="M12 5v14M5 12h14"/>', { cls }),
  minus: (cls) => icon('<path d="M5 12h14"/>', { cls }),
  trash: (cls) => icon('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>', { cls }),
  truck: (cls) => icon('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>', { cls }),
  store: (cls) => icon('<path d="M4 10v10h16V10M3 6l2-3h14l2 3v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M10 20v-5h4v5"/>', { cls }),
  info: (cls) => icon('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', { cls }),
  check: (cls) => icon('<path d="M5 13l4 4L19 7"/>', { cls }),
  alert: (cls) => icon('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>', { cls }),
  filter: (cls) => icon('<path d="M4 5h16l-6 8v6l-4-2v-4z"/>', { cls }),
  close: (cls) => icon('<path d="M6 6l12 12M18 6 6 18"/>', { cls }),
  heart: (cls) => icon('<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>', { cls }),
  users: (cls) => icon('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>', { cls }),
  globe: (cls) => icon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', { cls }),
  image: (cls) => icon('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>', { cls }),
  pin: (cls) => icon('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', { cls }),
};
