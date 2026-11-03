/* MyWallet service worker — offline app shell only.
 *
 * Caches: the static shell (HTML pages, shell.js, manifest, icons) and the
 * Google Fonts files used by finance-profile.html.
 *
 * Never caches / never intercepts: anything else cross-origin — notably the
 * Supabase REST + Realtime calls made by movo.html (balance data), non-GET
 * requests, or any API response. Those go straight to the network.
 */
var VERSION = 'mywallet-v1';
var SHELL_CACHE = VERSION + '-shell';
var FONT_CACHE = VERSION + '-fonts';

var SHELL = [
  './',
  'index.html',
  'pages/movo.html',
  'pages/finance-profile.html',
  'assets/shell.js',
  'manifest.webmanifest',
  'icons/icon-48.png',
  'icons/icon-72.png',
  'icons/icon-96.png',
  'icons/icon-144.png',
  'icons/icon-192.png',
  'icons/icon-384.png',
  'icons/icon-512.png',
  'icons/maskable-192.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png'
];

var FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== SHELL_CACHE && k !== FONT_CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  /* Fonts: stale-while-revalidate. */
  if (FONT_HOSTS.indexOf(url.hostname) !== -1) {
    event.respondWith(
      caches.open(FONT_CACHE).then(function (cache) {
        return cache.match(req).then(function (hit) {
          var net = fetch(req).then(function (res) {
            if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
            return res;
          }).catch(function () { return hit; });
          return hit || net;
        });
      })
    );
    return;
  }

  /* Anything not same-origin (e.g. *.supabase.co) is left to the network, uncached. */
  if (url.origin !== self.location.origin) return;

  /* Same-origin static files: network-first (so updates show up), cache fallback offline. */
  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && res.type === 'basic') {
        var copy = res.clone();
        caches.open(SHELL_CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('index.html');
        return Response.error();
      });
    })
  );
});
