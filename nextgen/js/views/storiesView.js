import { html, render, icons, btn, img, chip, loadingCards, loadingBlock, showError, emptyState, demoNotice, pageHeader, formatDate } from '../components/ui.js';
import { storyCard } from '../components/cards.js';
import { getStories, getStoryById } from '../services/dataService.js';

const label = (c) => c.replace(/-/g, ' ').replace(/^./, (m) => m.toUpperCase());

export async function storiesView(root, ctx) {
  ctx.setTitle('Community Stories');
  render(root, loadingCards(6));
  let stories;
  try { stories = await getStories(); } catch (err) { if (ctx.isCurrent()) showError(root, err, () => storiesView(root, ctx), 'Community Stories'); return; }
  if (!ctx.isCurrent()) return;
  const cats = [...new Set(stories.map((s) => s.category))];
  let active = ctx.query.get('category') || '';

  render(root, html`${pageHeader({ eyebrow: 'Community stories', title: 'Celebrating our journeys', text: 'Graduations, first jobs, new businesses, service and culture: the moments that make us proud.' })}
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      ${demoNotice('These stories and their authors are fictional, written to show how member stories will appear.')}
      <div class="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter stories">
        <button type="button" data-scat="" class="ng-scat min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1">All stories</button>
        ${cats.map((c) => html`<button type="button" data-scat="${c}" class="ng-scat min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1">${label(c)}</button>`)}
      </div>
      <div id="sResults" class="mt-8"></div>
      <section class="mt-16 flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-gradient-to-br from-orange-50 to-rose-50 p-8 ring-1 ring-orange-100 sm:flex-row sm:items-center sm:p-10" aria-labelledby="shareStory">
        <div><h2 id="shareStory" class="font-display text-2xl font-extrabold text-indigo-950">Have a story to share?</h2>
          <p class="mt-2 max-w-xl text-slate-700">Members will soon be able to submit stories directly. Every story is reviewed before publishing, and you choose how your name appears.</p></div>
        <a href="mailto:contact@zocf.org?subject=NextGen%20story" class="${btn.primary} shrink-0">Share your story</a>
      </section>
    </div>`);

  function update() {
    ctx.replaceQuery({ category: active });
    root.querySelectorAll('.ng-scat').forEach((b) => {
      const on = b.dataset.scat === active;
      b.setAttribute('aria-pressed', String(on));
      b.className = `ng-scat min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1 transition ${on ? 'bg-indigo-950 text-white ring-indigo-950' : 'bg-white text-indigo-950 ring-slate-200 hover:ring-orange-400'}`;
    });
    const list = stories.filter((s) => !active || s.category === active).sort((a, b) => b.datePublished.localeCompare(a.datePublished));
    render(root.querySelector('#sResults'), list.length ? html`<ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">${list.map((s) => html`<li>${storyCard(s)}</li>`)}</ul>` : emptyState({ title: 'No stories yet' }));
  }
  root.addEventListener('click', (e) => { const b = e.target.closest('[data-scat]'); if (b) { active = b.dataset.scat; update(); } });
  update();
}

export async function storyView(root, ctx) {
  ctx.setTitle('Story');
  render(root, loadingBlock('Loading story…'));
  let story, all;
  try { [story, all] = await Promise.all([getStoryById(ctx.params.id), getStories()]); }
  catch (err) { if (ctx.isCurrent()) showError(root, err, () => storyView(root, ctx)); return; }
  if (!ctx.isCurrent()) return;
  if (!story) { render(root, html`<div class="mx-auto max-w-3xl px-4 py-16"><h1 class="sr-only">Story not found</h1>${emptyState({ title: 'We couldn’t find that story', actionHref: '#/stories', actionLabel: 'All stories' })}</div>`); return; }
  ctx.setTitle(story.title);
  const more = all.filter((s) => s.id !== story.id).slice(0, 3);

  render(root, html`<article class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <a href="#/stories" class="inline-flex min-h-[44px] items-center gap-2 font-semibold text-indigo-700 hover:text-orange-600">${icons.arrowLeft('h-5 w-5')} All stories</a>
      <p class="mt-4 flex flex-wrap gap-2">${chip(label(story.category), 'orange')}${chip('Fictional story', 'slate')}</p>
      <h1 class="mt-3 font-display text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-5xl">${story.title}</h1>
      <p class="mt-3 text-slate-500">By ${story.authorDisplayName} · ${formatDate(story.datePublished)}</p>
      <div class="mt-8 overflow-hidden rounded-[2rem] shadow-lg">${img(story.image, `Illustration for the story: ${story.title}`, 'aspect-[16/9] w-full object-cover')}</div>
      <p class="mt-8 text-xl font-medium leading-relaxed text-indigo-950">${story.description}</p>
      <div class="mt-6 space-y-5 text-lg leading-relaxed text-slate-700">${story.body.map((p) => html`<p>${p}</p>`)}</div>
      <div class="mt-10">${demoNotice('This story is fictional and was written for the Stage 1 preview.')}</div>
    </article>
    <section class="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="moreStories">
      <h2 id="moreStories" class="font-display text-2xl font-extrabold text-indigo-950">More stories</h2>
      <ul class="mt-6 grid gap-6 md:grid-cols-3">${more.map((s) => html`<li>${storyCard(s)}</li>`)}</ul>
    </section>`);
}
