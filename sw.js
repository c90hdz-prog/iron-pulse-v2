const CACHE = "iron-pulse-v2-1";

const ASSETS = [
  "./",
  "./index.html",
  "./src/styles.css",
  "./src/main.js",
  "./manifest.webmanifest",
  // add icons too if you want them offline:
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    // Try each asset individually so one bad path doesn't kill install
    await Promise.all(
      ASSETS.map(async (url) => {
        try {
          const req = new Request(url, { cache: "reload" });
          const res = await fetch(req);
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          await cache.put(req, res);
        } catch (err) {
          console.warn("[SW] Cache add failed:", url, err);
        }
      })
    );

    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  // Cache-first for same-origin requests, network fallback
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) return cached;

    try {
      const res = await fetch(e.request);
      return res;
    } catch {
      // optional: fallback to app shell for navigations
      if (e.request.mode === "navigate") {
        return caches.match("./index.html");
      }
      throw new Error("Network error and no cache");
    }
  })());
});