self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

// Listen for fetch events and send network status
self.addEventListener("fetch", (event) => {})

// Listen for messages from React app
self.addEventListener("message", (event) => {
  if (event.data === "CHECK_ONLINE_STATUS") {
    event.source.postMessage({ isOnline: navigator.onLine })
  }
})
