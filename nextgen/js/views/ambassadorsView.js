import { html, render, icons, btn, loadingCards, showError, demoNotice, pageHeader, inputCls, labelCls, errorSlot, setFieldError } from '../components/ui.js';
import { regionCard } from '../components/cards.js';
import { getRegions } from '../services/dataService.js';

export async function ambassadorsView(root, ctx) {
  ctx.setTitle('Regional Ambassadors');
  render(root, loadingCards(6));
  let regions;
  try { regions = await getRegions(); } catch (err) { if (ctx.isCurrent()) showError(root, err, () => ambassadorsView(root, ctx), 'Regional Ambassadors'); return; }
  if (!ctx.isCurrent()) return;

  render(root, html`${pageHeader({ eyebrow: 'Lead where you live', title: 'NextGen Regional Ambassadors', text: 'A proposed role for young members who want to organise activities and strengthen connections in their area, supported by ZOCF.' })}
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      ${demoNotice('No ambassadors have been appointed. This page shows how the role could work; expressing interest here does not send anything.')}
      <section class="mt-10 grid gap-5 md:grid-cols-3" aria-label="What ambassadors do">
        ${[[icons.calendar, 'Organise', 'Plan socials, sports and cultural activities with support from ZOCF.'], [icons.users, 'Welcome', 'Help newcomers to your area find friends and community quickly.'], [icons.star, 'Lead', 'Represent your region and grow your leadership experience.']].map(([ic, t, d]) => html`<div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-950 text-orange-300">${ic('h-6 w-6')}</span><h2 class="mt-4 font-display text-lg font-bold text-indigo-950">${t}</h2><p class="mt-1 text-slate-600">${d}</p></div>`)}
      </section>
      <ul class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">${regions.map((r) => html`<li>${regionCard(r)}</li>`)}</ul>
    </div>

    <dialog id="ambDialog" class="w-[min(32rem,94vw)] rounded-[2rem] p-0 shadow-2xl backdrop:bg-indigo-950/70" aria-labelledby="ambTitle">
      <form id="ambForm" class="p-6 sm:p-8" novalidate>
        <div class="flex items-start justify-between gap-4">
          <h2 id="ambTitle" class="font-display text-2xl font-extrabold text-indigo-950">Interested in being an ambassador?</h2>
          <button type="button" data-close class="-mr-2 -mt-2 rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">${icons.close()}</button>
        </div>
        <p id="ambRegion" class="mt-1 font-semibold text-orange-600"></p>
        <div class="mt-5 space-y-4">
          <div><label for="amb-name" class="${labelCls}">First name</label><input id="amb-name" name="name" required maxlength="60" class="${inputCls}" autocomplete="given-name" />${errorSlot('name')}</div>
          <div><label for="amb-why" class="${labelCls}">Why would you like to help?</label><textarea id="amb-why" name="why" required minlength="10" maxlength="500" rows="3" class="${inputCls}"></textarea>${errorSlot('why')}</div>
        </div>
        <p class="mt-4 text-xs text-slate-500">Demonstration only: nothing is saved or sent. For now, email <a class="underline" href="mailto:contact@zocf.org?subject=NextGen%20ambassador%20interest">contact@zocf.org</a>.</p>
        <button type="submit" class="${btn.primary} mt-5 w-full">Express interest</button>
        <p id="ambDone" class="mt-4 hidden rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status"></p>
      </form>
    </dialog>`);

  const dialog = root.querySelector('#ambDialog');
  const form = root.querySelector('#ambForm');
  let opener;
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ambassador-interest]');
    if (!b) return;
    opener = b;
    const region = regions.find((r) => r.id === b.dataset.ambassadorInterest);
    form.reset(); root.querySelector('#ambDone').classList.add('hidden');
    ['name', 'why'].forEach((n) => setFieldError(form, n, ''));
    root.querySelector('#ambRegion').textContent = region.name;
    dialog.dataset.region = region.name;
    dialog.showModal();
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog || e.target.closest('[data-close]')) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus());
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let first = null;
    for (const n of ['name', 'why']) {
      const el = form.elements[n]; el.value = el.value.trim();
      const msg = el.validity.valueMissing ? 'This field is required.' : el.validity.tooShort ? 'Please write a little more (at least 10 characters).' : '';
      setFieldError(form, n, msg); if (msg && !first) first = el;
    }
    if (first) { first.focus(); return; }
    const done = root.querySelector('#ambDone');
    done.textContent = `Thank you, ${form.elements.name.value}! In the live platform, ZOCF would contact you about the ${dialog.dataset.region} ambassador role. Nothing has been sent in this demonstration.`;
    done.classList.remove('hidden');
  });
}
