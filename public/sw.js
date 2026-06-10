const CACHE = "mfs-v1"
const STATIC = ["/", "/ranking", "/insights", "/recommend", "/manifest.json", "/icon-192.png", "/icon-512.png"]

self.addEventListener("install", (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC).catch(() => {})))
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return
  const url = new URL(e.request.url)
  // API, admin 요청은 네트워크 우선
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/admin")) return
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
