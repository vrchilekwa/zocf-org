// "Find Your Perfect Chitenge with AI": the discovery search box. Used as a teaser on the
// home page and as the main control on the discovery page. Submitting goes to #/discover?q=...
import { html } from '../utils/html.js';
import { icons } from './icons.js';
import { EXAMPLE_PROMPTS } from '../services/aiDiscoveryService.js';

export function aiSearchPanel({ query = '', headingLevel = 2, compact = false } = {}) {
  const h = `h${headingLevel}`;
  return html`<section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-emerald-950 to-emerald-900 p-6 text-white shadow-2xl sm:p-10" aria-labelledby="aiPanelTitle">
    <div class="mp-ai-glow" aria-hidden="true"></div>
    <div class="pattern-chitenge absolute inset-0 opacity-40" aria-hidden="true"></div>
    <div class="relative grid gap-8 ${compact ? '' : 'lg:grid-cols-5 lg:items-center'}">
      <div class="${compact ? '' : 'lg:col-span-2'}">
        <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 ring-1 ring-white/15">
          ${icons.sparkles('h-4 w-4')} AI discovery · Coming soon
        </p>
        <${h} id="aiPanelTitle" class="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Find Your Perfect Chitenge with AI</${h}>
        <p class="mt-3 text-lg text-white/85">Describe a pattern, colour or style and let AI help you discover materials that match your imagination.</p>
      </div>
      <div class="${compact ? '' : 'lg:col-span-3'}">
        <form data-ai-form class="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur" role="search" aria-label="AI fabric discovery">
          <label for="aiQuery" class="sr-only">Describe the chitenge you are looking for</label>
          <textarea id="aiQuery" name="q" rows="2" maxlength="300" required
            class="block w-full resize-none rounded-xl border-0 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-amber-300"
            placeholder="e.g. A bright blue and yellow print with circles for a family celebration">${query}</textarea>
          <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs text-white/75">Demo mode: matched with simple keyword rules in your browser. No AI service is connected yet.</p>
            <button type="submit" class="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 font-bold text-emerald-950 shadow-lg transition hover:bg-amber-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200">
              ${icons.sparkles('h-5 w-5')} Try the demo
            </button>
          </div>
          <p data-ai-error class="mt-2 hidden rounded-lg bg-red-600/90 px-3 py-2 text-sm font-medium" role="alert"></p>
        </form>
        <div class="mt-4">
          <p class="text-sm font-semibold text-white/80">Try an example:</p>
          <ul class="mt-2 flex flex-wrap gap-2">
            ${EXAMPLE_PROMPTS.map((p) => html`<li><button type="button" data-ai-example="${p}" class="min-h-[40px] rounded-full bg-white/10 px-4 py-2 text-left text-sm text-white ring-1 ring-white/20 transition hover:bg-amber-400 hover:text-emerald-950">${p}</button></li>`)}
          </ul>
        </div>
      </div>
    </div>
  </section>`;
}

/** Wire up an aiSearchPanel inside root. onSearch(query) defaults to navigating to the discovery page. */
export function mountAiSearchPanel(root, { onSearch } = {}) {
  const form = root.querySelector('[data-ai-form]');
  if (!form) return;
  const input = form.querySelector('textarea');
  const error = form.querySelector('[data-ai-error]');
  const go = onSearch || ((q) => { location.hash = `#/discover?q=${encodeURIComponent(q)}`; });
  const submit = () => {
    const q = input.value.trim();
    if (q.length < 3) {
      error.textContent = 'Please describe the fabric in a few words, e.g. "red and black geometric".';
      error.classList.remove('hidden');
      input.focus();
      return;
    }
    error.classList.add('hidden');
    go(q);
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); submit(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
  root.querySelectorAll('[data-ai-example]').forEach((btn) =>
    btn.addEventListener('click', () => { input.value = btn.dataset.aiExample; submit(); }));
}
