// Marketplace entry point: routes, header behaviour and basket-wide event handling.
import { createRouter } from './router.js';
import * as basket from './services/basketService.js';
import { getProductById } from './services/productService.js';
import { showToast } from './components/toast.js';

import { homeView } from './views/homeView.js';
import { catalogueView } from './views/catalogueView.js';
import { productView } from './views/productView.js';
import { basketView } from './views/basketView.js';
import { checkoutView } from './views/checkoutView.js';
import { discoverView } from './views/discoverView.js';
import { inspirationView } from './views/inspirationView.js';
import { sellersView } from './views/sellersView.js';
import { sellerRegisterView } from './views/sellerRegisterView.js';
import { sellerProfileView } from './views/sellerProfileView.js';
import { dashboardView } from './views/dashboardView.js';
import { notFoundView } from './views/notFoundView.js';

const routes = [
  { name: 'home', path: '/', view: homeView },
  { name: 'catalogue', path: '/catalogue', view: catalogueView },
  { name: 'product', path: '/product/:id', view: productView },
  { name: 'basket', path: '/basket', view: basketView },
  { name: 'checkout', path: '/checkout', view: checkoutView },
  { name: 'discover', path: '/discover', view: discoverView },
  { name: 'inspiration', path: '/inspiration', view: inspirationView },
  { name: 'sellers', path: '/sellers', view: sellersView },
  { name: 'seller-register', path: '/sellers/register', view: sellerRegisterView },
  { name: 'seller-profile', path: '/sellers/:id', view: sellerProfileView },
  { name: 'dashboard', path: '/dashboard', view: dashboardView },
];

// ---------- header: mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
function setMenu(open) {
  mobileMenu.classList.toggle('hidden', !open);
  document.getElementById('menuIconOpen').classList.toggle('hidden', open);
  document.getElementById('menuIconClose').classList.toggle('hidden', !open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuBtn.addEventListener('click', () => setMenu(mobileMenu.classList.contains('hidden')));
mobileMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) { setMenu(false); menuBtn.focus(); } });

// ---------- header: active link + basket badge ----------
function highlightNav(routeName) {
  document.querySelectorAll('[data-route]').forEach((a) => {
    if (a.id === 'basketLink') return;
    if (a.dataset.route.split(' ').includes(routeName)) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function updateBasketBadge() {
  const n = basket.getCount();
  document.getElementById('basketCount').textContent = String(n);
  document.getElementById('basketLink').setAttribute('aria-label', `Basket, ${n} ${n === 1 ? 'item' : 'items'}`);
}
basket.subscribe(updateBasketBadge);
updateBasketBadge();

// ---------- "Add to basket" buttons anywhere in the app ----------
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-add-to-basket]');
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  try {
    const product = await getProductById(btn.dataset.addToBasket);
    const qtyInput = btn.dataset.qtyFrom ? document.getElementById(btn.dataset.qtyFrom) : null;
    const result = basket.addItem(product, qtyInput ? qtyInput.value : 1);
    showToast(result.message, { type: result.ok ? (result.limited ? 'info' : 'success') : 'error', action: result.ok ? { href: '#/basket', label: 'View basket' } : undefined });
    btn.dispatchEvent(new CustomEvent('basket:added', { bubbles: true, detail: result }));
  } catch (err) {
    console.error(err);
    showToast('Sorry, that item could not be added. Please try again.', { type: 'error' });
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- start ----------
const router = createRouter({
  routes,
  root: document.getElementById('app'),
  notFound: notFoundView,
  onChange: (name) => highlightNav(name),
});
router.start();
