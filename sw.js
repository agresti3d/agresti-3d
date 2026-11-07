const CACHE = "agresti-3d-v17";
const SHELL = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/css/styles.css?v=37",
  "/css/theme.css",
  "/js/main.js?v=13",
  "/js/catalog.js?v=41",
  "/js/seasons.js?v=3",
  "/js/campaigns.js?v=1",
  "/js/gift-finder.js?v=4",
  "/js/reviews.js?v=1",
  "/js/stock.js?v=1",
  "/js/analytics.js?v=1",
  "/assets/pwa/icon-192.png",
  "/assets/pwa/icon-512.png",
  "/assets/logo/agresti-a.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/__/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html").then((r) => r || caches.match("/index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const red = fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || red;
    })
  );
});
