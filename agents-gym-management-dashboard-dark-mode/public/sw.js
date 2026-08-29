// iGYM Admin Dashboard Service Worker
const CACHE_NAME = "igym-admin-v1";

self.addEventListener("install", (event) => {
  console.log("⚡ [ServiceWorker] Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("⚡ [ServiceWorker] Activated");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // PWA fetch handler requirement for browser installability
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
