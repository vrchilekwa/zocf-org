import { CONFIG } from '../config.js';

const money = new Intl.NumberFormat(CONFIG.locale, { style: 'currency', currency: CONFIG.currency });
const dateFmt = new Intl.DateTimeFormat(CONFIG.locale, { day: 'numeric', month: 'short', year: 'numeric' });

export const formatPrice = (amount) => money.format(amount);
export const formatDate = (iso) => dateFmt.format(new Date(iso + 'T00:00:00'));
export const capitalise = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const AVAILABILITY_LABELS = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
};

export function formatDimensions({ lengthCm, widthCm, note }) {
  return `${lengthCm} cm × ${widthCm} cm${note ? ` (${note.toLowerCase()})` : ''}`;
}
