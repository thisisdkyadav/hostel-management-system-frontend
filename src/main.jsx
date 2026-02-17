import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"

/* -------------------------------
   PWA install prompt handling
-------------------------------- */
window.deferredPrompt = null

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  window.deferredPrompt = e
})

/* -------------------------------
   Render app
-------------------------------- */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
