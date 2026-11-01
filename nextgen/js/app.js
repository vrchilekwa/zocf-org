// NextGen entry point: routes, header behaviour, demo access switch and shared event handling.
import { createRouter } from '../../marketplace/js/router.js';
import { html, render, showToast } from './components/ui.js';
import * as access from './services/accessService.js';
import * as interest from './services/interestService.js';
import { getActivityById } from './services/dataService.js';
import { interestButton } from './components/cards.js';

import { homeView } from './views/homeView.js';
import { communityView } from './views/communityView.js';
import { profileView } from './views/profileView.js';
import { connectionsView } from './views/connectionsView.js';
import { activitiesView, activityView } from './views/activitiesView.js';
import { opportunitiesView } from './views/opportunitiesView.js';
import { storiesView, storyView } from './views/storiesView.js';
import { ambassadorsView } from './views/ambassadorsView.js';
import { joinView } from './views/joinView.js';
import { guidelinesView, privacyView } from './views/policyViews.js';
import { dashboardView } from './views/dashboardView.js';
import { notFoundView } from './views/notFoundView.js';

const routes = [
  { name: 'home', path: '/', view: homeView },
  { name: 'community', path: '/community', view: communityView },
  { name: 'profile', path: '/community/:id', view: profileView },
  { name: 'connections', path: '/connections', view: connectionsView },
  { name: 'activities', path: '/activities', view: activitiesView },
  { name: 'activity', path: '/activities/:id', view: activityView },
  { name: 'opportunities', path: '/opportunities', view: opportunitiesView },
  { name: 'stories', path: '/stories', view: storiesView },
  { name: 'story', path: '/stories/:id', view: storyView },
  { name: 'ambassadors', path: '/ambassadors', view: ambassadorsView },
  { name: 'join', path: '/join', view: joinView },
  { name: 'guidelines', path: '/guidelines', view: guidelinesView },
  { name: 'privacy', path: '/privacy', view: privacyView },
  { name: 'dashboard', path: '/dashboard', view: dashboardView },
];

// ---------- mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('mobileMenu');
function setMenu(open) {
  menu.classList.toggle('hidden', !open);
  document.getElementById('menuIconOpen').classList.toggle('hidden', open);
  document.getElementById('menuIconClose').classList.toggle('hidden', !open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuBtn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.classList.contains('hidden')) { setMenu(false); menuBtn.focus(); } });

function highlightNav(name) {
  document.querySelectorAll('header [data-route]').forEach((a) => {
    if (a.dataset.route.split(' ').includes(name)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

// ---------- demo access switch ----------
function renderAccessSwitch() {
  const preview = access.isMemberPreview();
  render(document.getElementById('accessSwitch'), html`
    <span class="font-semibold">Viewing as:</span>
    <button type="button" data-toggle-access aria-pressed="${preview}" class="inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 transition ${preview ? 'bg-indigo-950 text-white ring-indigo-950' : 'bg-white text-indigo-950 ring-orange-300 hover:bg-orange-100'}">
      ${preview ? 'Member preview (fictional profiles)' : 'Public visitor'} <span aria-hidden="true">⇄</span><span class="sr-only">Switch view</span>
    </button>`);
}
renderAccessSwitch();
access.onModeChange(() => { renderAccessSwitch(); router.refresh(); });

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-toggle-access]')) {
    access.setMode(access.isMemberPreview() ? access.MODES.PUBLIC : access.MODES.MEMBER_PREVIEW);
    showToast(access.isMemberPreview() ? 'Member preview on: showing fictional demonstration profiles.' : 'Now viewing as a public visitor.');
  }
  if (e.target.closest('[data-enter-preview]')) access.setMode(access.MODES.MEMBER_PREVIEW);
});

// ---------- "I'm interested" buttons anywhere ----------
document.addEventListener('click', async (e) => {
  const btnEl = e.target.closest('[data-interest]');
  if (!btnEl || btnEl.disabled) return;
  btnEl.disabled = true;
  try {
    const activity = await getActivityById(btnEl.dataset.interest);
    const result = interest.toggleInterest(activity);
    showToast(result.message, { type: result.ok ? 'success' : 'error', action: result.interested ? { href: '#/dashboard', label: 'My NextGen' } : undefined });
    // Refresh every button and count for this activity on the page
    const full = btnEl.closest('[data-interest-slot]')?.dataset.full === 'true';
    document.querySelectorAll(`[data-interest-slot="${activity.id}"]`).forEach((slot) => render(slot, interestButton(activity, { full: slot.dataset.full === 'true' })));
    document.querySelectorAll(`[data-count="${activity.id}"]`).forEach((c) => { c.textContent = String(interest.displayCount(activity)); });
    const again = document.querySelector(`[data-interest-slot="${activity.id}"]${full ? '[data-full="true"]' : ''} button`);
    again?.focus();
  } catch (err) {
    console.error(err);
    showToast('Sorry, that did not work. Please try again.', { type: 'error' });
  } finally {
    btnEl.disabled = false;
  }
});

// ---------- graceful image fallback ----------
document.addEventListener('error', (e) => {
  const el = e.target;
  if (el instanceof HTMLImageElement && el.hasAttribute('data-fallback') && !el.dataset.failed) {
    el.dataset.failed = 'true';
    el.removeAttribute('src');
    el.classList.add('ng-img-fallback');
    if (!el.alt) el.setAttribute('aria-hidden', 'true');
  }
}, true);

document.getElementById('year').textContent = new Date().getFullYear();

const router = createRouter({
  routes,
  root: document.getElementById('app'),
  notFound: notFoundView,
  onChange: highlightNav,
  titleSuffix: 'ZOCF NextGen',
});
router.start();
