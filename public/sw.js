/*
 * The Estate Edit service worker. Hand-written (no Serwist/next-pwa) because
 * the site deploys to Cloudflare via OpenNext and only needs three rules:
 *
 *   pages        network first, fall back to the last copy seen on this device
 *   build files  cache first (hashed, immutable)
 *   photos/fonts stale-while-revalidate, capped so the cache can't grow forever
 *
 * Signed-in and checkout pages are never stored. POSTs are never touched.
 * Bump VERSION to drop every old cache on the next visit.
 */
const VERSION = "v1";
const PAGES = `ee-pages-${VERSION}`;
const STATIC = `ee-static-${VERSION}`;
const MEDIA = `ee-media-${VERSION}`;
const PRIVATE = /^\/(account|auth|sell\/post|sell\/edit|checkout|api)(\/|$)/;
const SHELL = ["/", "/logo-mark.svg", "/logo-mark.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function networkFirst(request, isPage) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok && res.type === "basic") {
      cache.put(request, res.clone());
      trim(PAGES, 60);
    }
    return res;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    if (isPage) {
      const home = await cache.match("/");
      if (home) return home;
    }
    throw err;
  }
}

async function cacheFirst(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit && cacheName === STATIC) return hit; // hashed file names never change
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok) {
        cache.put(request, res.clone());
        if (max) trim(cacheName, max);
      }
      return res;
    })
    .catch(() => hit);
  return hit || refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (PRIVATE.test(url.pathname)) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC, 200));
    return;
  }
  if (url.pathname.startsWith("/_next/image") || /\.(png|jpe?g|webp|avif|svg|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, MEDIA, 120));
    return;
  }
  // Full page loads and the RSC payloads Next fetches on client navigation.
  if (request.mode === "navigate" || request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) {
    event.respondWith(networkFirst(request, request.mode === "navigate"));
  }
});
