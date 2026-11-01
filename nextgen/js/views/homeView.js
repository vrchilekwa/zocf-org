import { html, render, icons, btn, img, sectionHeading, loadingCards, showError, chip } from '../components/ui.js';
import { activityCard, storyCard, opportunityCard } from '../components/cards.js';
import { getLookups, getUpcomingActivities, getStories, getOpportunities, getMembers, getRegions } from '../services/dataService.js';

const OBJECTIVES = [
  [icons.users, 'Get to know one another', 'Meet young Zambians who share your story of growing up, studying or working abroad.'],
  [icons.pin, 'Discover people near you', 'Find others in your city or region, from Derby to Dublin.'],
  [icons.heart, 'Build friendships', 'Turn online connections into real, lasting friendships.'],
  [icons.sparkles, 'Share common interests', 'From tech to football to fashion, find your people.'],
  [icons.calendar, 'Organise gatherings', 'Socials, sports, hikes and cultural celebrations.'],
  [icons.briefcase, 'Share opportunities', 'Graduate roles, internships, mentoring and scholarships.'],
  [icons.globe, 'Connect across countries', 'Relationships that span the UK, Ireland and the wider diaspora.'],
  [icons.store, 'Serve the community', 'Volunteer and take part in community initiatives together.'],
  [icons.star, 'Grow as leaders', 'Develop into the next generation of community leaders.'],
];

function hero() {
  return html`<section class="ng-hero-bg relative overflow-hidden text-white" aria-labelledby="ngHeroTitle">
    <div class="ng-accent-dots absolute inset-0 opacity-50" aria-hidden="true"></div>
    <div class="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
      <div>
        <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-300 ring-1 ring-white/15">ZOCF NextGen · ages 18–30</p>
        <h1 id="ngHeroTitle" class="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">WELCOME TO ZOCF <span class="ng-gradient-text">NEXTGEN</span></h1>
        <p class="mt-3 font-display text-xl font-bold text-orange-200 sm:text-2xl">Connecting Our Next Generation.</p>
        <div class="mt-5 space-y-3 text-lg leading-relaxed text-indigo-100">
          <p>The future of our community depends on the relationships we build today.</p>
          <p>ZOCF NextGen brings together young Zambians across the diaspora, creating opportunities to build friendships, discover shared interests, participate in activities and grow together.</p>
          <p>Whether studying, working, starting a business or exploring new opportunities, this is your space to connect with others who share your experiences and aspirations.</p>
        </div>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#/community" class="${btn.primary} px-7 py-3 text-lg">${icons.users('h-5 w-5')} Meet Our Community</a>
          <a href="#/activities" class="${btn.light} px-7 py-3 text-lg">${icons.calendar('h-5 w-5')} Explore Activities</a>
        </div>
      </div>
      <div class="relative">
        <div class="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-orange-500/40 to-rose-500/30 blur-2xl" aria-hidden="true"></div>
        ${img('images/scenes/hero-community.svg', 'Illustration of a diverse group of young African adults celebrating together', 'relative aspect-[3/2] w-full rounded-[2rem] object-cover shadow-2xl ring-4 ring-white/10')}
        <div class="absolute -bottom-5 left-5 hidden rounded-2xl bg-white px-4 py-3 text-indigo-950 shadow-xl sm:block">
          <p class="text-xs font-semibold text-slate-500">Across the diaspora</p>
          <p class="font-display text-lg font-extrabold">UK · Ireland · Canada · beyond</p>
        </div>
      </div>
    </div>
  </section>`;
}

export async function homeView(root, ctx) {
  ctx.setTitle('Connecting Our Next Generation');
  render(root, html`${hero()}<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">${loadingCards(3)}</div>`);
  let d;
  try {
    const [lookups, upcoming, stories, opportunities, members, regions] = await Promise.all([getLookups(), getUpcomingActivities(3), getStories(), getOpportunities(), getMembers(), getRegions()]);
    d = { lookups, upcoming, stories, opportunities, members, regions };
  } catch (err) { if (ctx.isCurrent()) showError(root, err, () => homeView(root, ctx)); return; }
  if (!ctx.isCurrent()) return;
  const cities = new Set(d.members.map((m) => m.location)).size;

  render(root, html`${hero()}
  <div class="mx-auto max-w-7xl space-y-24 px-4 py-20 sm:px-6 lg:px-8">

    <section aria-labelledby="objTitle">
      ${sectionHeading({ eyebrow: 'Why NextGen', title: 'A community built by and for young Zambians', id: 'objTitle', text: 'More than a webpage: a place to belong, wherever life has taken you.' })}
      <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${OBJECTIVES.map(([ic, t, d2]) => html`<li class="flex gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 text-orange-600">${ic('h-6 w-6')}</span>
          <span><span class="block font-display font-bold text-indigo-950">${t}</span><span class="mt-1 block text-sm text-slate-600">${d2}</span></span></li>`)}
      </ul>
    </section>

    <section aria-labelledby="commTitle" class="overflow-hidden rounded-[2rem] bg-indigo-950 text-white">
      <div class="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-orange-300">Meet our community</p>
          <h2 id="commTitle" class="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Find your people, near and far</h2>
          <p class="mt-4 text-indigo-100">Browse member profiles, discover who lives near you and connect around shared interests. The directory is private to approved members, so you control what you share.</p>
          <dl class="mt-8 grid grid-cols-3 gap-4 text-center">
            <div class="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><dt class="text-xs text-indigo-200">Demo profiles</dt><dd class="font-display text-3xl font-extrabold text-orange-300">${d.members.length}</dd></div>
            <div class="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><dt class="text-xs text-indigo-200">Cities</dt><dd class="font-display text-3xl font-extrabold text-orange-300">${cities}</dd></div>
            <div class="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><dt class="text-xs text-indigo-200">Interests</dt><dd class="font-display text-3xl font-extrabold text-orange-300">${d.lookups.interests.length}</dd></div>
          </dl>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#/community" class="${btn.primary}">Meet Our Community</a>
            <a href="#/connections" class="${btn.light}">Find connections</a>
          </div>
        </div>
        <ul class="flex flex-wrap gap-2" aria-label="Interest areas">
          ${d.lookups.interests.map((i) => html`<li><a href="#/connections?interest=${i.id}" class="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-orange-500"><span aria-hidden="true">${i.emoji}</span>${i.name}</a></li>`)}
        </ul>
      </div>
    </section>

    <section aria-labelledby="actTitle">
      ${sectionHeading({ eyebrow: 'Coming up', title: 'Activities and gatherings', id: 'actTitle', text: 'Digital connections become real friendships when we meet. Every activity here is a sample.', link: { href: '#/activities', label: 'All activities' } })}
      <ul class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">${d.upcoming.map((a) => html`<li>${activityCard(a, d.lookups)}</li>`)}</ul>
    </section>

    <section aria-labelledby="oppTitle">
      ${sectionHeading({ eyebrow: 'Grow together', title: 'Opportunities', id: 'oppTitle', link: { href: '#/opportunities', label: 'All opportunities' } })}
      <ul class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">${d.opportunities.slice(0, 3).map((o) => html`<li>${opportunityCard(o, d.lookups)}</li>`)}</ul>
    </section>

    <section aria-labelledby="storyTitle">
      ${sectionHeading({ eyebrow: 'Celebrating us', title: 'Community stories', id: 'storyTitle', link: { href: '#/stories', label: 'Read more stories' } })}
      <ul class="mt-10 grid gap-6 md:grid-cols-3">${d.stories.slice(0, 3).map((s) => html`<li>${storyCard(s)}</li>`)}</ul>
    </section>

    <section aria-labelledby="ambTitle" class="grid items-center gap-10 rounded-[2rem] bg-gradient-to-br from-orange-50 to-rose-50 p-8 ring-1 ring-orange-100 sm:p-12 lg:grid-cols-2">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-orange-600">Lead in your area</p>
        <h2 id="ambTitle" class="mt-2 font-display text-3xl font-extrabold text-indigo-950 sm:text-4xl">NextGen Regional Ambassadors</h2>
        <p class="mt-4 text-slate-700">We are inviting young members to help organise activities and strengthen connections where they live. No ambassadors have been appointed yet. Could it be you?</p>
        <a href="#/ambassadors" class="${btn.dark} mt-6">Explore the regions</a>
      </div>
      <ul class="grid grid-cols-2 gap-3">${d.regions.map((r) => html`<li class="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-indigo-950 shadow-sm">${r.name}</li>`)}</ul>
    </section>

    <section aria-labelledby="joinTitle">
      ${sectionHeading({ eyebrow: 'How to join', title: 'Four simple steps', id: 'joinTitle' })}
      <ol class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        ${[['Request to join', 'Tell us a little about yourself and your interests.'], ['Verification', 'ZOCF confirms your membership and eligibility.'], ['Create your profile', 'Choose exactly what you share and with whom.'], ['Connect', 'Discover members, join activities and grow together.']].map(([t, d2], i) => html`<li class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <span class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-rose-500 font-display font-extrabold text-white">${i + 1}</span>
          <h3 class="mt-4 font-display text-lg font-bold text-indigo-950">${t}</h3><p class="mt-1 text-slate-600">${d2}</p></li>`)}
      </ol>
      <div class="mt-10 flex flex-col items-center justify-between gap-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100 sm:flex-row sm:text-left">
        <div>
          <h3 class="font-display text-2xl font-extrabold text-indigo-950">Ready to connect?</h3>
          <p class="mt-1 text-slate-600">Questions first? Email <a href="mailto:contact@zocf.org?subject=NextGen%20enquiry" class="font-semibold text-indigo-700 underline-offset-4 hover:underline">contact@zocf.org</a>. Read our <a href="#/guidelines" class="font-semibold text-indigo-700 underline-offset-4 hover:underline">community guidelines</a> and <a href="#/privacy" class="font-semibold text-indigo-700 underline-offset-4 hover:underline">privacy notice</a>.</p>
        </div>
        <a href="#/join" class="${btn.primary} shrink-0 px-8 py-3 text-lg">Join NextGen</a>
      </div>
      <p class="mt-6 text-center text-sm text-slate-500">${chip('Eligibility', 'slate')} NextGen is aimed at young adults aged roughly 18–30, subject to ZOCF confirming final membership eligibility.</p>
    </section>
  </div>`);
}
