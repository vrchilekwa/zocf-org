// Membership request (demonstration). Validates in the browser and explains the future
// verification flow. Nothing is stored or sent; real applications will go to the backend
// (POST /membership-requests) and be verified by ZOCF before an account is created.
import { html, render, icons, btn, loadingBlock, showError, pageHeader, inputCls, labelCls, errorSlot, setFieldError } from '../components/ui.js';
import { getLookups } from '../services/dataService.js';

export async function joinView(root, ctx) {
  ctx.setTitle('Join NextGen');
  render(root, loadingBlock());
  let lookups;
  try { lookups = await getLookups(); } catch (err) { if (ctx.isCurrent()) showError(root, err, () => joinView(root, ctx), 'Join NextGen'); return; }
  if (!ctx.isCurrent()) return;

  render(root, html`${pageHeader({ eyebrow: 'Join NextGen', title: 'Request to join', text: 'Tell us a little about yourself. ZOCF will verify every request before anyone can see the member directory.' })}
    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
      <aside class="space-y-6 lg:order-2">
        <div class="rounded-[2rem] border-2 border-orange-300 bg-orange-50 p-6 text-sm text-orange-950" role="note">
          <p class="font-bold">This is a demonstration form</p>
          <p class="mt-1">No account is created and nothing you enter is saved or sent. Membership verification and secure sign-in will be built in the backend phase.</p>
        </div>
        <div class="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 class="font-display text-lg font-bold text-indigo-950">What happens next (when live)</h2>
          <ol class="mt-4 space-y-4 text-sm text-slate-700">
            ${[['Request received', 'You get an email confirming we have your request.'], ['Verification', 'ZOCF checks your connection to the fellowship and age eligibility.'], ['Approval', 'You receive a secure link to create your account.'], ['Your profile, your choice', 'Decide what to share; everything else stays private.']].map(([t, d], i) => html`<li class="flex gap-3"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-white">${i + 1}</span><span><strong class="block text-indigo-950">${t}</strong>${d}</span></li>`)}
          </ol>
        </div>
      </aside>

      <div id="joinArea" class="lg:col-span-2">
        <form id="joinForm" class="space-y-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8" novalidate>
          <div class="grid gap-5 sm:grid-cols-2">
            <div><label for="j-first" class="${labelCls}">First name</label><input id="j-first" name="firstName" required maxlength="50" autocomplete="given-name" class="${inputCls}" />${errorSlot('firstName')}</div>
            <div><label for="j-display" class="${labelCls}">Preferred display name</label><input id="j-display" name="displayName" required maxlength="40" placeholder="e.g. Chipo M." class="${inputCls}" />
              <p class="mt-1 text-xs text-slate-500">How other members will see you. A first name and surname initial works well.</p>${errorSlot('displayName')}</div>
            <div><label for="j-email" class="${labelCls}">Email address</label><input id="j-email" name="email" type="email" required autocomplete="email" class="${inputCls}" />
              <p class="mt-1 text-xs text-slate-500">Used by ZOCF to contact you. Never shown to other members unless you choose to share it.</p>${errorSlot('email')}</div>
            <div><label for="j-loc" class="${labelCls}">General location</label>
              <select id="j-loc" name="location" required class="${inputCls} h-11 py-0"><option value="">Choose your nearest city</option>${lookups.locations.map((l) => html`<option value="${l.id}">${l.name}${l.country !== 'UK' ? `, ${l.country}` : ''}</option>`)}<option value="other">Somewhere else</option></select>${errorSlot('location')}</div>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <label class="flex items-start gap-3 text-sm text-slate-800"><input type="checkbox" name="age" required class="mt-0.5 h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-400" /> <span>I confirm I am aged between 18 and 30. <span class="block text-xs text-slate-500">Final eligibility will be confirmed by ZOCF.</span></span></label>
            ${errorSlot('age')}
          </div>
          <div><label for="j-intro" class="${labelCls}">Short introduction</label><textarea id="j-intro" name="introduction" required minlength="20" maxlength="500" rows="3" class="${inputCls}" placeholder="A little about you: studies, work, what you enjoy…"></textarea><p class="mt-1 text-xs text-slate-500">20–500 characters.</p>${errorSlot('introduction')}</div>
          <fieldset><legend class="${labelCls}">Interests <span class="font-normal text-slate-500">(choose at least one)</span></legend>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">${lookups.interests.map((i) => html`<label class="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm hover:border-orange-400"><input type="checkbox" name="interests" value="${i.id}" class="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-400" /><span aria-hidden="true">${i.emoji}</span> ${i.name}</label>`)}</div>
            ${errorSlot('interests')}</fieldset>
          <div><label for="j-reason" class="${labelCls}">Why would you like to join NextGen?</label><textarea id="j-reason" name="reason" required minlength="10" maxlength="500" rows="3" class="${inputCls}"></textarea>${errorSlot('reason')}</div>
          <div class="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-800">
            <label class="flex items-start gap-3"><input type="checkbox" name="guidelines" required class="mt-0.5 h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-400" /> <span>I agree to follow the <a href="#/guidelines" target="_blank" class="font-semibold text-indigo-700 underline">community guidelines</a>.</span></label>
            ${errorSlot('guidelines')}
            <label class="flex items-start gap-3"><input type="checkbox" name="privacy" required class="mt-0.5 h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-400" /> <span>I have read the <a href="#/privacy" target="_blank" class="font-semibold text-indigo-700 underline">privacy notice</a> and consent to ZOCF processing my request.</span></label>
            ${errorSlot('privacy')}
          </div>
          <p id="joinSummary" class="hidden rounded-2xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert"></p>
          <button type="submit" class="${btn.primary} w-full py-3 text-lg">Send membership request (demo)</button>
        </form>
      </div>
    </div>`);

  const form = root.querySelector('#joinForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = [];
    const check = (name, msg) => { setFieldError(form, name, msg); if (msg) errors.push(name); };
    for (const name of ['firstName', 'displayName', 'email', 'location', 'introduction', 'reason']) {
      const el = form.elements[name];
      if (el.tagName !== 'SELECT') el.value = el.value.trim();
      check(name, el.validity.valueMissing ? 'This field is required.'
        : el.validity.typeMismatch ? 'Please enter a valid email address.'
        : el.validity.tooShort ? `Please write at least ${el.minLength} characters.` : '');
    }
    check('age', form.elements.age.checked ? '' : 'Please confirm you meet the age guidance.');
    check('interests', form.querySelectorAll('input[name="interests"]:checked').length ? '' : 'Please choose at least one interest.');
    check('guidelines', form.elements.guidelines.checked ? '' : 'You need to agree to the community guidelines.');
    check('privacy', form.elements.privacy.checked ? '' : 'You need to consent to the privacy notice.');
    const summary = root.querySelector('#joinSummary');
    if (errors.length) {
      summary.textContent = `Please fix ${errors.length} ${errors.length === 1 ? 'item' : 'items'} above.`;
      summary.classList.remove('hidden');
      const first = form.elements[errors[0]];
      (first instanceof RadioNodeList ? first[0] : first).focus();
      return;
    }
    summary.classList.add('hidden');
    const name = form.elements.displayName.value;
    const area = root.querySelector('#joinArea');
    render(area, html`<section class="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-100 sm:p-12" aria-labelledby="joinDone">
      <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">${icons.check('h-8 w-8')}</span>
      <h2 id="joinDone" tabindex="-1" class="mt-5 font-display text-3xl font-extrabold text-indigo-950">Thanks, ${name}! (demonstration)</h2>
      <p class="mx-auto mt-3 max-w-lg text-slate-700">Your request looks complete. In the live platform it would now be sent to ZOCF for verification. <strong>In this preview nothing has been sent, saved or created.</strong></p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><a href="#/activities" class="${btn.primary}">Explore activities</a><a href="#/" class="${btn.ghost}">Back to NextGen home</a></div>
    </section>`);
    area.querySelector('#joinDone').focus();
  });
}
