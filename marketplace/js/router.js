// Minimal hash router: #/path/segments?query. Hash routing needs no server configuration, so
// every route works on GitHub Pages under /zocf-org/marketplace/ and survives a page refresh.

export function createRouter({ routes, root, notFound, onChange }) {
  const compiled = routes.map((r) => ({
    ...r,
    regex: new RegExp('^' + r.path.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$'),
  }));
  let navToken = 0;
  let cleanup = null;
  let firstRender = true;

  const parse = () => {
    const hash = location.hash.replace(/^#/, '') || '/';
    const [path, qs = ''] = hash.split('?');
    return { path: path || '/', query: new URLSearchParams(qs) };
  };

  async function resolve() {
    // Plain in-page anchors such as the skip link (#main) are not routes.
    if (location.hash && !location.hash.startsWith('#/')) return;
    const token = ++navToken;
    const { path, query } = parse();
    let match = null;
    for (const r of compiled) {
      const m = r.regex.exec(path);
      if (m) { match = { route: r, params: Object.fromEntries(Object.entries(m.groups || {}).map(([k, v]) => [k, decodeURIComponent(v)])) }; break; }
    }
    const route = match?.route || { name: 'not-found', view: notFound };
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;

    const ctx = {
      path, query, params: match?.params || {},
      isCurrent: () => token === navToken,
      setTitle: (t) => { if (token === navToken) document.title = `${t} | ZOCF Chitenge Marketplace`; },
      // Update the query string without re-rendering (filters, search box).
      replaceQuery(params) {
        const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
        history.replaceState(null, '', `#${path}${qs ? `?${qs}` : ''}`);
      },
    };
    onChange?.(route.name, ctx);
    if (!firstRender) window.scrollTo({ top: 0 });
    // A fresh container per page, so listeners a view attaches are discarded with it.
    const viewRoot = document.createElement('div');
    root.replaceChildren(viewRoot);
    try {
      cleanup = await route.view(viewRoot, ctx);
    } catch (err) {
      console.error(err);
      if (token === navToken) viewRoot.innerHTML ='<div class="mx-auto max-w-3xl px-4 py-24 text-center"><h1 class="text-2xl font-bold" tabindex="-1">Sorry, this page could not be displayed.</h1><p class="mt-2 text-gray-600">Please refresh the page or go back to the marketplace home.</p><a class="mt-6 inline-block font-semibold text-emerald-800 underline" href="#/">Marketplace home</a></div>';
    }
    // Move focus to the new page heading for keyboard and screen-reader users.
    if (!firstRender && token === navToken) {
      const heading = viewRoot.querySelector('h1');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    }
    firstRender = false;
  }

  window.addEventListener('hashchange', resolve);
  return { start: resolve, refresh: resolve };
}
