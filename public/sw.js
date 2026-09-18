const CACHE = "mfs-v3"
const STATIC = [
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    const results = await Promise.allSettled(STATIC.map((asset) => cache.add(asset)))
    const failed = results.filter((result) => result.status === "rejected")
    if (failed.length && self.registration?.active) console.warn("[MFS SW] static cache misses:", failed.length)
    await self.skipWaiting()
  })())
})

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

function cacheable(request, url) {
  return request.method === "GET" && url.origin === self.location.origin &&
    !url.pathname.startsWith("/api") && !url.pathname.startsWith("/admin") &&
    !url.pathname.startsWith("/_next/data") && !url.searchParams.has("_rsc") &&
    !url.searchParams.has("__nextDefaultLocale")
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)
  if (!cacheable(event.request, url)) return

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")))
    return
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request)
    try {
      const response = await fetch(event.request)
      if (response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE)
        await cache.put(event.request, response.clone())
      }
      return response
    } catch {
      return cached || Response.error()
    }
  })())
})
