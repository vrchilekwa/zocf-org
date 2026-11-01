// Tiny safe templating: values interpolated into html`` are HTML-escaped unless they are
// themselves html`` results (or wrapped in raw()). Arrays are joined. null/false/undefined render nothing.

class SafeHtml {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);

function toHtml(value) {
  if (value == null || value === false) return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(toHtml).join('');
  return escapeHtml(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += toHtml(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}

/** Mark a trusted, already-safe string (e.g. a static SVG icon) as HTML. */
export const raw = (value) => new SafeHtml(String(value));

/** Render an html`` result into an element. */
export function render(el, content) {
  el.innerHTML = toHtml(content);
}
