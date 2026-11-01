// Demonstration seller registration. Validates in the browser and shows a preview; nothing is
// stored or sent. Real registration will post to the backend once it exists.
import { html, render } from '../utils/html.js';
import { icons } from '../components/icons.js';
import { getCategories } from '../services/productService.js';
import { loadingBlock, errorState } from '../components/states.js';

const input = 'mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100';
const label = 'block text-sm font-semibold text-gray-800';
const errorP = (id) => html`<p id="err-${id}" class="mt-1 hidden text-sm font-medium text-red-700" data-error-for="${id}"></p>`;

export async function sellerRegisterView(root, ctx) {
  ctx.setTitle('Seller registration (demo)');
  render(root, loadingBlock());
  let categories;
  try { categories = await getCategories(); } catch (err) {
    if (!ctx.isCurrent()) return;
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Seller registration</h1>${errorState(err.message)}</div>`);
    root.querySelector('[data-retry]').addEventListener('click', () => sellerRegisterView(root, ctx));
    return;
  }
  if (!ctx.isCurrent()) return;

  render(root, html`<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
    <a href="#/sellers" class="inline-flex min-h-[44px] items-center gap-2 font-semibold text-emerald-800 hover:text-emerald-600">${icons.arrowLeft('h-5 w-5')} Seller information</a>
    <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Register as a seller</h1>
    <p class="mt-2 text-gray-600">Tell us about your chitenge business.</p>
    <div class="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-sm text-amber-950" role="note">
      <p class="font-bold">Demonstration form</p>
      <p class="mt-1">Seller registration is not open yet. This form checks your answers and shows a preview, but <strong>nothing you enter is saved or sent</strong>. Real registration will open when the marketplace backend launches. To register interest now, email <a href="mailto:contact@zocf.org" class="font-semibold underline">contact@zocf.org</a>.</p>
    </div>

    <div id="regArea" class="mt-8">
      <form id="regForm" class="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8" novalidate>
        <div class="grid gap-5 sm:grid-cols-2">
          <div><label for="business" class="${label}">Business name</label><input id="business" name="business" required maxlength="80" class="${input}" autocomplete="organization" />${errorP('business')}</div>
          <div><label for="contact" class="${label}">Your name</label><input id="contact" name="contact" required maxlength="80" class="${input}" autocomplete="name" />${errorP('contact')}</div>
          <div><label for="email" class="${label}">Email address</label><input id="email" name="email" type="email" required class="${input}" autocomplete="email" />${errorP('email')}</div>
          <div><label for="location" class="${label}">Town / city and country</label><input id="location" name="location" required maxlength="80" placeholder="e.g. Coventry, UK" class="${input}" />${errorP('location')}</div>
        </div>
        <fieldset>
          <legend class="${label}">What do you sell? <span class="font-normal text-gray-500">(choose at least one)</span></legend>
          <div class="mt-2 grid gap-2 sm:grid-cols-2">
            ${categories.map((c) => html`<label class="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-emerald-600"><input type="checkbox" name="categories" value="${c.id}" class="h-5 w-5 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600" /> ${c.name}</label>`)}
          </div>
          ${errorP('categories')}
        </fieldset>
        <div>
          <label for="about" class="${label}">About your business</label>
          <textarea id="about" name="about" rows="4" required minlength="20" maxlength="600" class="${input}" placeholder="Where your fabrics come from, what makes them special…"></textarea>
          <p class="mt-1 text-xs text-gray-500">At least 20 characters.</p>${errorP('about')}
        </div>
        <label class="flex items-start gap-3 text-sm text-gray-700"><input type="checkbox" id="ack" name="ack" required class="mt-0.5 h-5 w-5 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600" /> I understand this is a demonstration and my details will not be saved.</label>
        ${errorP('ack')}
        <button type="submit" class="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-emerald-800 px-5 font-bold text-white shadow-md hover:bg-emerald-700">Preview my seller profile</button>
      </form>
    </div>
  </div>`);

  const form = root.querySelector('#regForm');
  const setError = (id, msg) => {
    const el = form.querySelector(`[data-error-for="${id}"]`);
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
    const field = form.elements[id];
    if (field && field.setAttribute) {
      field.setAttribute('aria-invalid', String(Boolean(msg)));
      if (msg) field.setAttribute('aria-describedby', `err-${id}`); else field.removeAttribute('aria-describedby');
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let first = null;
    for (const id of ['business', 'contact', 'email', 'location', 'about']) {
      const el = form.elements[id];
      el.value = el.value.trim();
      const msg = el.validity.valueMissing ? 'This field is required.'
        : el.validity.typeMismatch ? 'Please enter a valid email address.'
        : el.validity.tooShort ? `Please write at least ${el.minLength} characters.` : '';
      setError(id, msg);
      if (msg && !first) first = el;
    }
    const chosen = [...form.querySelectorAll('input[name="categories"]:checked')].map((c) => c.value);
    setError('categories', chosen.length ? '' : 'Please choose at least one type of fabric.');
    if (!chosen.length && !first) first = form.querySelector('input[name="categories"]');
    setError('ack', form.elements.ack.checked ? '' : 'Please confirm you understand this is a demonstration.');
    if (!form.elements.ack.checked && !first) first = form.elements.ack;
    if (first) { first.focus(); return; }

    const v = (id) => form.elements[id].value;
    const names = categories.filter((c) => chosen.includes(c.id)).map((c) => c.name);
    const area = root.querySelector('#regArea');
    render(area, html`<section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8" aria-labelledby="previewTitle">
      <p class="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-900">${icons.info('h-4 w-4')} Preview only · not submitted</p>
      <h2 id="previewTitle" tabindex="-1" class="mt-4 text-2xl font-extrabold text-emerald-950">${v('business')}</h2>
      <p class="mt-1 flex items-center gap-1 text-gray-600">${icons.pin('h-4 w-4')} ${v('location')}</p>
      <p class="mt-4 text-gray-700">${v('about')}</p>
      <div class="mt-4 flex flex-wrap gap-2">${names.map((n) => html`<span class="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900 ring-1 ring-emerald-200">${n}</span>`)}</div>
      <p class="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">This is how your profile could look. <strong>Nothing has been saved or sent.</strong> When seller registration opens, ZOCF will contact sellers to verify their details before their listings go live.</p>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href="#/dashboard" class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-800 px-5 font-semibold text-white hover:bg-emerald-700">Preview the seller dashboard</a>
        <a href="#/sellers" class="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 px-5 font-semibold text-gray-700 hover:bg-gray-50">Back to seller information</a>
      </div>
    </section>`);
    area.querySelector('#previewTitle').focus();
  });
}
