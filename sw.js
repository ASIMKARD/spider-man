const FONTS = ['./fonts/anton-400-latin-ext.woff2', './fonts/anton-400-latin.woff2', './fonts/ibm-plex-mono-400-latin-ext.woff2', './fonts/ibm-plex-mono-400-latin.woff2', './fonts/ibm-plex-mono-500-latin-ext.woff2', './fonts/ibm-plex-mono-500-latin.woff2', './fonts/ibm-plex-sans-400-latin-ext.woff2', './fonts/ibm-plex-sans-400-latin.woff2', './fonts/ibm-plex-sans-500-latin-ext.woff2', './fonts/ibm-plex-sans-500-latin.woff2', './fonts/ibm-plex-sans-600-latin-ext.woff2', './fonts/ibm-plex-sans-600-latin.woff2'];
const CACHE = 'spider-man-v27';
const ASSETS = [
  './', './index.html', './styles.css', './data.js', './qrcode.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable.png'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS.concat(FONTS)))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  const url = new URL(e.request.url);
  const shell = ['/', '/index.html', '/styles.css', '/data.js', '/qrcode.js', '/manifest.json']
    .some(p => url.pathname.endsWith(p === '/' ? '/' : p));
  if (shell) {
    // network-first: an upload reaches the phone on the next plain reload
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // fonts + icons stay cache-first
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
