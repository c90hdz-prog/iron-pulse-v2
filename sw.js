// /sw.js
const CACHE = "iron-pulse-v2-2"; // bump when you change files
const ASSETS = [
  "./",
  "./index.html",
  "./src/styles.css",
  "./src/main.js",
  "./manifest.webmanifest",

  // ✅ cache icons so install/launcher looks like an app
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // ✅ activate updated SW immediately
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      // delete old caches
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));

      // ✅ control pages right away
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;

  // ✅ For SPA-ish behavior / refreshes: serve index.html for navigation requests
  if (req.mode === "navigate") {
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match("./index.html");
        try {
          const fresh = await fetch(req);
          // optional: keep index fresh
          cache.put("./index.html", fresh.clone());
          return fresh;
        } catch {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // ✅ Cache-first for static assets; network fallback
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
