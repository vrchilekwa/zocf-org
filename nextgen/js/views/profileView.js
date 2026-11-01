import { html, render, icons, btn, img, chip, loadingBlock, showError, emptyState, demoNotice, showToast, formatDate } from '../components/ui.js';
import { memberCard } from '../components/cards.js';
import { memberGate } from '../components/memberGate.js';
import { isMemberPreview } from '../services/accessService.js';
import { getMemberById, getLookups, getSuggestions } from '../services/dataService.js';

function contactOptions(m) {
  const p = m.contactPreferences;
  const rows = [
    [icons.message, 'NextGen messages', p.inAppMessages, 'Send a message (available after launch)'],
    [icons.info, 'Email address', p.shareEmail, 'Shared with approved members'],
    [icons.globe, 'Social media / LinkedIn', p.socialHandle, 'Shared with approved members'],
    [icons.lock, 'Phone number', p.sharePhone, 'Shared with approved members'],
  ];
  return html`<ul class="space-y-2">${rows.map(([ic, label, on, note]) => html`<li class="flex items-center gap-3 rounded-2xl px-3 py-2.5 ${on ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-500'}">
    ${ic('h-5 w-5 shrink-0')}<span class="flex-1 text-sm"><span class="font-semibold">${label}</span><span class="block text-xs">${on ? note : 'Not shared by this member'}</span></span>
    <span class="text-xs font-bold uppercase tracking-wide">${on ? 'Shared' : 'Private'}</span></li>`)}</ul>`;
}

export async function profileView(root, ctx) {
  ctx.setTitle('Member profile');
  if (!isMemberPreview()) { render(root, memberGate('Member profiles')); return; }
  render(root, loadingBlock('Loading profile…'));
  let m, lookups, suggestions;
  try {
    [m, lookups] = await Promise.all([getMemberById(ctx.params.id), getLookups()]);
    if (m) suggestions = await getSuggestions(m, 3);
  } catch (err) { if (ctx.isCurrent()) showError(root, err, () => profileView(root, ctx)); return; }
  if (!ctx.isCurrent()) return;
  if (!m) {
    render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Profile not found</h1>${emptyState({ title: 'We couldn’t find that member', actionHref: '#/community', actionLabel: 'Back to the community' })}</div>`);
    return;
  }
  ctx.setTitle(m.displayName);
  const loc = lookups.locationById[m.location];

  render(root, html`<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <a href="#/community" class="inline-flex min-h-[44px] items-center gap-2 font-semibold text-indigo-700 hover:text-orange-600">${icons.arrowLeft('h-5 w-5')} Back to the community</a>
    <div class="mt-4">${demoNotice('This is a fictional profile created for the Stage 1 preview. It does not describe a real person.')}</div>

    <section class="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100" aria-labelledby="profileName">
      <div class="h-28 bg-gradient-to-r from-indigo-950 via-indigo-800 to-orange-500 sm:h-36"></div>
      <div class="px-6 pb-8 sm:px-10">
        <div class="-mt-16 flex flex-col gap-5 sm:-mt-20 sm:flex-row sm:items-end">
          ${img(m.profileImage, `Illustrated avatar for ${m.displayName}`, 'h-32 w-32 rounded-3xl object-cover object-top ring-4 ring-white shadow-lg sm:h-40 sm:w-40')}
          <div class="flex-1">
            <h1 id="profileName" class="font-display text-3xl font-extrabold text-indigo-950 sm:text-4xl">${m.displayName}</h1>
            <p class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600"><span class="inline-flex items-center gap-1">${icons.pin('h-4 w-4')} ${loc.name}, ${loc.country}</span><span>Age group ${m.ageGroup}</span><span>Member since ${formatDate(m.memberSince, true)}</span></p>
          </div>
          <button type="button" data-connect class="${btn.primary}">${icons.message('h-5 w-5')} Connect</button>
        </div>

        <div class="mt-10 grid gap-10 lg:grid-cols-3">
          <div class="space-y-8 lg:col-span-2">
            <section><h2 class="font-display text-xl font-bold text-indigo-950">About me</h2><p class="mt-2 text-lg leading-relaxed text-slate-700">${m.introduction}</p></section>
            <section><h2 class="font-display text-xl font-bold text-indigo-950">Interests</h2>
              <div class="mt-3 flex flex-wrap gap-2">${m.interests.map((i) => html`<a href="#/connections?interest=${i}" class="hover:opacity-80">${chip(lookups.interestNames[i])}</a>`)}</div>
              <p class="mt-3 text-sm text-slate-600"><span class="font-semibold">Hobbies:</span> ${m.hobbies.join(', ')}</p></section>
            <section><h2 class="font-display text-xl font-bold text-indigo-950">Preferred activities</h2>
              <div class="mt-3 flex flex-wrap gap-2">${m.preferredActivities.map((a) => html`<a href="#/activities?category=${a}" class="hover:opacity-80">${chip(lookups.activityNames[a], 'orange')}</a>`)}</div></section>
            <section class="rounded-3xl bg-gradient-to-br from-orange-50 to-rose-50 p-6 ring-1 ring-orange-100"><h2 class="font-display text-xl font-bold text-indigo-950">Looking to connect</h2>
              <p class="mt-2 text-slate-700">${m.connectionPreferences}</p>
              <div class="mt-3 flex flex-wrap gap-2">${m.lookingFor.map((x) => chip(x, 'emerald'))}</div></section>
          </div>
          <aside class="space-y-6">
            <section class="rounded-3xl bg-slate-50 p-5"><h2 class="font-display text-lg font-bold text-indigo-950">Education and career</h2>
              <dl class="mt-3 space-y-2 text-sm"><div><dt class="text-slate-500">Education</dt><dd class="font-semibold text-slate-800">${m.education}</dd></div>
              ${m.profession ? html`<div><dt class="text-slate-500">Profession</dt><dd class="font-semibold text-slate-800">${m.profession}</dd></div>` : ''}
              <div><dt class="text-slate-500">Field</dt><dd class="font-semibold text-slate-800">${m.careerField}</dd></div></dl></section>
            <section class="rounded-3xl bg-white p-5 ring-1 ring-slate-100"><h2 class="font-display text-lg font-bold text-indigo-950">Contact preferences</h2>
              <p class="mt-1 text-xs text-slate-500">Sample options. Members choose what to share. No real contact details are stored in this preview.</p>
              <div class="mt-3">${contactOptions(m)}</div>
              <p class="mt-3 text-xs text-slate-500">${m.contactPreferences.note}</p></section>
            <a href="#/guidelines" class="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-rose-700">${icons.flag('h-4 w-4')} Report a concern about this profile</a>
          </aside>
        </div>
      </div>
    </section>

    ${suggestions?.length ? html`<section class="mt-16" aria-labelledby="similarTitle">
      <h2 id="similarTitle" class="font-display text-2xl font-extrabold text-indigo-950">You might also connect with</h2>
      <ul class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${suggestions.map((s) => html`<li>${memberCard(s.member, lookups, { reasons: [s.nearby ? 'Nearby' : '', s.shared.length ? `${s.shared.length} shared interest${s.shared.length > 1 ? 's' : ''}` : ''].filter(Boolean) })}</li>`)}</ul>
    </section>` : ''}
  </div>`);

  root.querySelector('[data-connect]').addEventListener('click', () =>
    showToast(`Messaging will be available once secure member accounts launch. ${m.firstName} would be notified in the app; no contact details are shared automatically.`, { type: 'success' }));
}
