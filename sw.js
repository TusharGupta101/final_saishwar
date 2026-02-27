/**
 * Service Worker - AutoWorks Pro (PWA)
 * Caches static assets for offline use
 */
const CACHE_NAME = "autoworks-pro-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/mission.html",
  "/vision.html",
  "/services.html",
  "/products.html",
  "/machinery.html",
  "/contact.html",
  "/team.html",
  "/checklist.html",
  "/404.html",
  "/css/style.css",
  "/js/main.js",
  "/js/i18n.js",
  "/favicon.svg",
  "/manifest.json",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS.map(function (u) {
        return new Request(u, { cache: "reload" });
      })).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.mode !== "navigate" && !event.request.url.match(/\.(html|css|js|json|svg)$/)) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (res) {
        var clone = res.clone();
        try {
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
        } catch (e) {}
        return res;
      }).catch(function () {
        return caches.match(event.request) || caches.match("/index.html");
      });
    })
  );
});
