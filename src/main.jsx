import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { registerSW } from "virtual:pwa-register"

// Store the install prompt event for later use
window.deferredPrompt = null

// Listen for the beforeinstallprompt event
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome 67+ from automatically showing the prompt
  e.preventDefault()
  // Store the event for later use
  window.deferredPrompt = e
})

// Register service worker using VitePWA
const updateSW = registerSW({
  onNeedRefresh() {
    // This will be handled by VersionUpdateNotification component
  },
  onOfflineReady() {
    // App is ready to work offline
  },
})

// Expose updateSW function globally for use in components
window.updateServiceWorker = updateSW

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
