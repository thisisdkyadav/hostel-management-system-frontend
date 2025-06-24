// This service worker is used for offline functionality and online status detection
// It will be replaced by the VitePWA generated service worker in production

const CACHE_NAME = "hms-cache-v1"

// Install event - cache basic assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing.")
  self.skipWaiting()

  // Cache basic assets for offline use
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/offline.html", // You should create this file for offline fallback
      ])
    })
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Network with cache fallback strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(async () => {
        // Try to serve from cache if network fails
        const cachedResponse = await caches.match(event.request)
        if (cachedResponse) {
          return cachedResponse
        }

        // If HTML request fails and not in cache, show offline page
        if (event.request.headers.get("Accept").includes("text/html")) {
          return caches.match("/offline.html")
        }

        return new Response("Network error occurred", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        })
      })
  )
})

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  // Handle online status check
  if (event.data === "CHECK_ONLINE_STATUS") {
    event.source.postMessage({
      type: "ONLINE_STATUS_RESULT",
      isOnline: navigator.onLine,
    })
  }

  // Handle skip waiting instruction
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Listen for online/offline events
self.addEventListener("online", () => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "ONLINE_STATUS_CHANGE",
        isOnline: true,
      })
    })
  })
})

self.addEventListener("offline", () => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "ONLINE_STATUS_CHANGE",
        isOnline: false,
      })
    })
  })
})
