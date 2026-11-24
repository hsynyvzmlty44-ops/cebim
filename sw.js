const shell = new URL('index.html', self.registration.scope).href;
const cacheName = 'cebim-shell-v1-' + self.registration.scope;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.add(new Request(shell, {cache: 'reload'}));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.mode !== 'navigate' || ![self.registration.scope, shell].includes(url.origin + url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(event.request);
      if (!response.ok) throw new Error('offline');
      await cache.put(shell, response.clone());
      return response;
    } catch {
      return (await cache.match(shell)) || Response.error();
    }
  })());
});
