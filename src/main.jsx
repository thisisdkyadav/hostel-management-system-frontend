import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { registerSW } from "virtual:pwa-register"

/* -------------------------------
   PWA install prompt handling
-------------------------------- */
window.deferredPrompt = null

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  window.deferredPrompt = e
})

/* -------------------------------
   Auto-update Service Worker
-------------------------------- */
const updateSW = registerSW({
  immediate: true,

  onNeedRefresh() {
    // Force new SW + reload automatically
    updateSW(true)
  },

  onOfflineReady() {
    console.log("App ready to work offline")
  },
})

// Optional: expose for debugging
window.updateServiceWorker = updateSW

/* -------------------------------
   Auto cache invalidation via meta.json
-------------------------------- */
async function checkAppVersion() {
  try {
    const res = await fetch("/meta.json", { cache: "no-store" })
    const meta = await res.json()

    const storedVersion = localStorage.getItem("app_version")

    if (storedVersion && storedVersion !== meta.version) {
      // New deployment detected
      localStorage.clear()

      if ("caches" in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }

      window.location.reload()
    }

    localStorage.setItem("app_version", meta.version)
  } catch {
    // fail silently
  }
}

checkAppVersion()

/* -------------------------------
   Render app
-------------------------------- */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
