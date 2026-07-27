const FONTS = ['./fonts/anton-400-latin-ext.woff2', './fonts/anton-400-latin.woff2', './fonts/ibm-plex-mono-400-latin-ext.woff2', './fonts/ibm-plex-mono-400-latin.woff2', './fonts/ibm-plex-mono-500-latin-ext.woff2', './fonts/ibm-plex-mono-500-latin.woff2', './fonts/ibm-plex-sans-400-latin-ext.woff2', './fonts/ibm-plex-sans-400-latin.woff2', './fonts/ibm-plex-sans-500-latin-ext.woff2', './fonts/ibm-plex-sans-500-latin.woff2', './fonts/ibm-plex-sans-600-latin-ext.woff2', './fonts/ibm-plex-sans-600-latin.woff2'];
const CACHE = 'spider-man-v2';
const ASSETS = [
  './', './index.html', './styles.css', './data.js', './qrcode.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable.png'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS.concat(FONTS)))

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
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
