// Small, accessible notifications (announced via an aria-live region in index.html).
import { html, render } from '../utils/html.js';
import { icons } from './icons.js';

export function showToast(message, { type = 'success', action } = {}) {
  const region = document.getElementById('toastRegion');
  if (!region) return;
  const el = document.createElement('div');
  const tone = type === 'error' ? 'bg-red-700' : type === 'info' ? 'bg-gray-900' : 'bg-emerald-900';
  el.className = `mp-toast pointer-events-auto flex w-full items-center gap-3 rounded-2xl ${tone} px-4 py-3 text-sm text-white shadow-2xl ring-1 ring-white/10 sm:w-96`;
  render(el, html`
    <span class="shrink-0 text-amber-300">${type === 'error' ? icons.alert() : icons.check()}</span>
    <p class="flex-1">${message}</p>
    ${action ? html`<a href="${action.href}" class="shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 font-bold text-emerald-950 hover:bg-amber-300">${action.label}</a>` : ''}
    <button type="button" class="shrink-0 rounded p-1 text-white/70 hover:text-white" aria-label="Dismiss notification">${icons.close('h-4 w-4')}</button>`);
  const remove = () => { el.classList.add('opacity-0'); setTimeout(() => el.remove(), 200); };
  el.querySelector('button').addEventListener('click', remove);
  el.querySelector('a')?.addEventListener('click', remove);
  region.appendChild(el);
  while (region.children.length > 3) region.firstElementChild.remove();
  setTimeout(remove, 5000);
}
