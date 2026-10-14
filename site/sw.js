const CACHE = 'world-news-shell-v1';
const SHELL = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/news.json')) {
    event.respondWith(fetch(event.request).then(async (res) => {
      if (res.ok) (await caches.open(CACHE)).put(new Request('./news.json'), res.clone());
      return res;
    }).catch(async () => (await caches.match(new Request('./news.json'))) || new Response('{}', {status: 503})));
  } else {
    event.respondWith(fetch(event.request).then(async res => {
      if (res.ok) (await caches.open(CACHE)).put(event.request, res.clone());
      return res;
    }).catch(() => caches.match(event.request)));
  }
});
