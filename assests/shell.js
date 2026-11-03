/* MyWallet shell — integration layer (external to the original pages).
 *
 * The two original HTML files are served byte-for-byte unchanged from /pages.
 * This script only:
 *   1. registers the service worker,
 *   2. switches between the two pages (iframes, same origin),
 *   3. connects the two nav buttons that were demo-only in the originals:
 *        movo.html            "Finance" bottom-nav button  -> finance-profile.html
 *        finance-profile.html "Home"    bottom-nav button  -> movo.html
 *      Every other click/interaction is left to the original code.
 *   4. maps Android back / history to the page switch.
 */
(function () {
  'use strict';

  var movo = document.getElementById('f-movo');
  var fin = document.getElementById('f-fin');
  var current = 'movo';

  function ensureFinLoaded() {
    if (!fin.getAttribute('src')) fin.setAttribute('src', fin.getAttribute('data-src'));
  }

  function show(which, fromPop) {
    if (which === current) return;
    ensureFinLoaded();
    var toFin = which === 'fin';
    fin.hidden = !toFin;
    movo.hidden = toFin;
    current = which;
    try { (toFin ? fin : movo).contentWindow.focus(); } catch (e) {}
    if (!fromPop) {
      try { history.pushState({ p: which }, '', toFin ? '#finance' : location.pathname + location.search); } catch (e) {}
    }
  }

  /* Capture-phase listener on each page's document: only the two nav buttons are intercepted. */
  function hook(frame, selector, target) {
    function attach() {
      var doc;
      try { doc = frame.contentDocument; } catch (e) { return; }
      if (!doc || doc.__mwHooked) return;
      doc.__mwHooked = true;
      doc.addEventListener('click', function (e) {
        var t = e.target && e.target.closest ? e.target.closest(selector) : null;
        if (!t) return;
        e.stopPropagation();
        e.preventDefault();
        show(target);
      }, true);
    }
    frame.addEventListener('load', attach);
    attach();
  }

  hook(movo, '[data-toast="Finance"]', 'fin'); // movo.html bottom nav: Finance
  hook(fin, '#nh', 'movo');                    // finance-profile.html bottom nav: Home

  window.addEventListener('popstate', function () {
    show(location.hash === '#finance' ? 'fin' : 'movo', true);
  });

  /* Preload the second page once the first has finished loading. */
  movo.addEventListener('load', function () {
    setTimeout(ensureFinLoaded, 500);
  });

  /* Opening the app at /#finance lands directly on Finance & Profile. */
  if (location.hash === '#finance') { current = 'movo'; show('fin', true); }

  /* Service worker (offline app shell). Needs HTTPS or localhost. */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        if (window.console) console.warn('[sw] registration failed:', err);
      });
    });
  }
})();
