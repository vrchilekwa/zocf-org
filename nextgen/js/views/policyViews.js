// Community guidelines and privacy notice. Draft wording for ZOCF leadership to review; the
// privacy notice in particular should be checked against UK GDPR before launch.
import { html, render, icons, btn, pageHeader } from '../components/ui.js';

const PRINCIPLES = [
  ['Respect and inclusiveness', 'Treat every member with dignity. We welcome people of every background, tribe, language and walk of life.'],
  ['Friendship and mutual support', 'Look out for one another, encourage each other and celebrate each other’s wins.'],
  ['Cultural identity', 'Celebrate our Zambian and African heritage, and share it generously with the next generation.'],
  ['Positive participation', 'Contribute constructively. Disagree kindly and keep conversations uplifting.'],
  ['Personal safety', 'Meet new people at group activities or public places first. Tell someone where you are going, and never feel pressured to share more than you want to.'],
  ['Respect for privacy', 'Never share another member’s details, photos or messages outside NextGen without their permission.'],
  ['Responsible communication', 'No harassment, hate speech, explicit content, spam, scams or unsolicited selling.'],
  ['Community contribution', 'Give back where you can: volunteer, mentor, organise or simply make newcomers feel welcome.'],
];

export function guidelinesView(root, ctx) {
  ctx.setTitle('Community guidelines');
  render(root, html`${pageHeader({ eyebrow: 'How we treat each other', title: 'NextGen community guidelines', text: 'NextGen exists to encourage positive relationships, friendship and community participation. These principles keep it a safe and welcoming place.' })}
    <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <ol class="grid gap-5 sm:grid-cols-2">
        ${PRINCIPLES.map(([t, d], i) => html`<li class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><span class="font-display text-3xl font-extrabold text-orange-500">${String(i + 1).padStart(2, '0')}</span><h2 class="mt-2 font-display text-xl font-bold text-indigo-950">${t}</h2><p class="mt-2 text-slate-600">${d}</p></li>`)}
      </ol>
      <section class="mt-12 rounded-[2rem] bg-indigo-950 p-8 text-white sm:p-10" aria-labelledby="reportTitle">
        <h2 id="reportTitle" class="flex items-center gap-3 font-display text-2xl font-extrabold">${icons.shield('h-7 w-7 text-orange-300')} Reporting and moderation (planned)</h2>
        <ul class="mt-5 space-y-3 text-indigo-100">
          <li class="flex gap-3">${icons.flag('mt-1 h-5 w-5 shrink-0 text-orange-300')}<span><strong class="text-white">Report button</strong> on every profile, message, story and activity, reviewed confidentially.</span></li>
          <li class="flex gap-3">${icons.users('mt-1 h-5 w-5 shrink-0 text-orange-300')}<span><strong class="text-white">Trained moderators</strong> from ZOCF leadership, supported by regional ambassadors.</span></li>
          <li class="flex gap-3">${icons.lock('mt-1 h-5 w-5 shrink-0 text-orange-300')}<span><strong class="text-white">Block and hide</strong> tools so members control who can contact them.</span></li>
          <li class="flex gap-3">${icons.alert('mt-1 h-5 w-5 shrink-0 text-orange-300')}<span><strong class="text-white">Clear consequences:</strong> warnings, temporary suspension or removal for serious or repeated breaches. Safeguarding concerns are escalated to ZOCF safeguarding leads.</span></li>
        </ul>
        <p class="mt-6 text-sm text-indigo-200">Until these tools exist, please report any concern to <a href="mailto:contact@zocf.org?subject=NextGen%20concern" class="font-semibold text-white underline">contact@zocf.org</a>. In an emergency, contact the emergency services.</p>
      </section>
      <div class="mt-10 text-center"><a href="#/join" class="${btn.primary}">I’m in: request to join</a></div>
    </div>`);
}

export function privacyView(root, ctx) {
  ctx.setTitle('Privacy notice');
  const sections = [
    ['Who we are', 'ZOCF NextGen is run by the Zambia Overseas Christian Fellowship (ZOCF). This draft notice explains how NextGen will handle personal information once the platform launches.'],
    ['What we collect', 'Information you give us when you request to join (name, display name, email, general location, age confirmation, interests, introduction) and the profile details you choose to add later.'],
    ['Why we collect it', 'To verify that you are eligible for NextGen, to run the member directory and activities, and to keep the community safe.'],
    ['Who can see your information', 'Your profile is visible only to approved, signed-in NextGen members, never to the public. You decide which contact details (if any) are shared. Your email address is never shown unless you choose to share it.'],
    ['Your choices', 'Joining is voluntary. You can edit or hide your profile, change what you share, or ask us to delete your account and data at any time.'],
    ['Security', 'Member data will be held in a secure database behind authentication, with access limited by role. It will never be published in public website files.'],
    ['This preview', 'The Stage 1 preview uses fictional people only. The demonstration forms do not send or store what you type, except “I’m interested” choices, which stay in your own browser’s storage and can be cleared at any time.'],
    ['Contact', 'Questions about your data: contact@zocf.org.'],
  ];
  render(root, html`${pageHeader({ eyebrow: 'Your data, your choice', title: 'NextGen privacy notice', text: 'Draft for review by ZOCF leadership before launch.' })}
    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div class="space-y-8">${sections.map(([t, d]) => html`<section><h2 class="font-display text-xl font-bold text-indigo-950">${t}</h2><p class="mt-2 leading-relaxed text-slate-700">${d}</p></section>`)}</div>
      <div class="mt-10 flex flex-col gap-3 sm:flex-row"><a href="#/guidelines" class="${btn.ghost}">Community guidelines</a><a href="#/join" class="${btn.primary}">Request to join</a></div>
    </div>`);
}
