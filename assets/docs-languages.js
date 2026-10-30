// Language preference stays in this browser. No cookies or telemetry requests.
(() => {
  'use strict';
  const key = 'baroham.site.language';
  const supported = ['ko', 'en', 'ja', 'zh-Hans'];
  const links = [...document.querySelectorAll('.language-switch a[hreflang]')];
  if (!links.length) return;
  const valid = value => supported.includes(value) ? value : null;
  const normalize = value => {
    const base = String(value || '').toLowerCase().split(/[-_]/)[0];
    return base === 'zh' ? 'zh-Hans' : valid(base);
  };
  const read = () => { try { return valid(localStorage.getItem(key)); } catch (_) { return null; } };
  const save = value => { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } };
  // Resolve from the script's location, including on nested GitHub Pages 404 URLs.
  const root = document.currentScript ? new URL('../', document.currentScript.src) : new URL('./', location.href);
  const target = (link, manual) => {
    const name = new URL(link.getAttribute('href'), location.href).pathname.split('/').pop();
    const url = new URL(name, root);
    url.search = location.search;
    url.hash = location.hash;
    if (manual) url.searchParams.set('lang', link.getAttribute('hreflang'));
    return url;
  };
  const incoming = new URL(location.href);
  const explicit = valid(incoming.searchParams.get('lang'));
  if (explicit && save(explicit)) {
    incoming.searchParams.delete('lang');
    try { history.replaceState(history.state, '', incoming.href); } catch (_) {}
  }
  const browserLanguages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  const preferred = explicit || read() || browserLanguages.map(normalize).find(Boolean) || 'en';
  const destination = links.find(link => link.getAttribute('hreflang') === preferred);
  if (destination && preferred !== document.documentElement.lang) {
    const url = target(destination, false);
    if (url.href !== location.href) { location.replace(url.href); return; }
  }
  const updateLinks = () => {
    for (const link of links) link.setAttribute('href', target(link, true).href);
  };
  updateLinks();
  addEventListener('hashchange', updateLinks);
  for (const link of links) {
    link.addEventListener('click', () => save(link.getAttribute('hreflang')));
    link.addEventListener('auxclick', event => { if (event.button === 1) save(link.getAttribute('hreflang')); });
  }
})();
