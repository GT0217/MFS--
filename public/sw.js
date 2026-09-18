const CACHE = "mfs-v2"
const STATIC = [
  "/",
  "/ranking",
  "/insights",
  "/news",
  "/recommend",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
]

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
  // 문서 이동은 네트워크 우선, 오프라인이면 캐시된 경로로 대체
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request).then((cached) => cached || caches.match("/")))
    )
    return
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
