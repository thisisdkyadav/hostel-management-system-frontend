import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"

// Store the install prompt event for later use
window.deferredPrompt = null

// Listen for the beforeinstallprompt event
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome 67+ from automatically showing the prompt
  e.preventDefault()
  // Store the event for later use
  window.deferredPrompt = e
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
