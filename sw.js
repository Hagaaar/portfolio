// Incrémenter CACHE à chaque déploiement pour forcer la mise à jour sur iOS
const CACHE = 'portfolio-2026-06-12c';

self.addEventListener('install', () => {
  self.skipWaiting(); // Active immédiatement sans attendre la fermeture des onglets
});

self.addEventListener('activate', e => {
  self.clients.claim(); // Prend le contrôle des pages ouvertes immédiatement
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

// Network first : toujours essayer le réseau, cache en fallback offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
