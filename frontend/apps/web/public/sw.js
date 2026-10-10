// Service Worker Layanan Inklusi Kemenag Barito Utara
const CACHE_NAME = "inklusi-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Bypass non-GET dan endpoint API agar autentikasi selalu segar dari server
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }
});
