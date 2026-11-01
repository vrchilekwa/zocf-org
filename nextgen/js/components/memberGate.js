// What a public visitor sees instead of member-only pages (directory, profiles, connections,
// dashboard). In Stage 1 a reviewer can switch to the "member preview" to see the fictional
// demonstration profiles. Real protection must come from the backend (see accessService.js).
import { html, icons, btn } from './ui.js';

export function memberGate(title) {
  return html`<section class="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24" aria-labelledby="gateTitle">
    <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-950 text-orange-300 shadow-lg">${icons.lock('h-8 w-8')}</span>
    <p class="mt-6 text-sm font-bold uppercase tracking-widest text-orange-600">Members only</p>
    <h1 id="gateTitle" class="mt-2 font-display text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl">${title}</h1>
    <p class="mx-auto mt-4 max-w-xl text-lg text-slate-600">To protect our members’ privacy, the NextGen directory will only be available to <strong>approved ZOCF NextGen members</strong> after they sign in. Public visitors cannot see profiles or contact details.</p>
    <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <a href="#/join" class="${btn.primary}">Request to join NextGen</a>
      <a href="#/" class="${btn.ghost}">Learn about NextGen</a>
    </div>
    <div class="mx-auto mt-12 max-w-xl rounded-3xl border border-orange-200 bg-orange-50 p-6 text-left text-sm text-orange-950">
      <p class="font-bold">Reviewing the Stage 1 design?</p>
      <p class="mt-1">Switch to the member preview to explore the directory using <strong>fictional demonstration profiles</strong>. This switch is only for previewing the design. It is not a login and does not protect anything; real access control will be enforced by the secure backend in Stage 2.</p>
      <button type="button" data-enter-preview class="${btn.dark} mt-4">${icons.users('h-5 w-5')} Preview as a member (fictional profiles)</button>
    </div>
  </section>`;
}
