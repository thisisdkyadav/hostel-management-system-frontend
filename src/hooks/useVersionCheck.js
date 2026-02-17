import { useState, useEffect, useCallback } from "react"
import { registerSW } from "virtual:pwa-register"

const useVersionCheck = ({
  checkInterval = 60 * 1000, // 1 minute by default
  metaUrl = "/meta.json",
} = {}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isPWA] = useState("serviceWorker" in navigator)
  const [currentVersion, setCurrentVersion] = useState(() => localStorage.getItem("app_version"))

  // Function to handle the reload when user confirms update
  const handleUpdate = useCallback(() => {
    if (isPWA) {
      // For PWA, the update function will be provided by the registerSW
      window.location.reload()
    } else {
      // For non-PWA, just reload the page
      window.location.reload()
    }
  }, [isPWA])

  useEffect(() => {
    let intervalId

    if (isPWA) {
      // PWA update handling using vite-plugin-pwa
      try {
        const updateSW = registerSW({
          onNeedRefresh() {
            setUpdateAvailable(true)
          },
          onOfflineReady() {
            console.log("App is ready for offline use")
          },
          immediate: true,
        })

        // Store the updateSW function for later use
        window.__updateSW = updateSW
      } catch (error) {
        console.error("Failed to register service worker:", error)
      }
    } else {
      // Non-PWA version check via meta.json
      const checkVersion = async () => {
        try {
          const response = await fetch(metaUrl, {
            cache: "no-cache",
            headers: { "Cache-Control": "no-cache" },
          })

          if (!response.ok) {
            console.warn(`Failed to fetch ${metaUrl}: ${response.status}`)
            return
          }

          const data = await response.json()

          if (data.version && currentVersion && data.version !== currentVersion) {
            setUpdateAvailable(true)
          }

          if (data.version) {
            localStorage.setItem("app_version", data.version)
            setCurrentVersion(data.version)
          }
        } catch (error) {
          console.warn("Version check failed:", error)
          // Silently fail - this is a non-critical feature
        }
      }

      // Check immediately on mount
      checkVersion()

      // Set up interval for periodic checks
      intervalId = setInterval(checkVersion, checkInterval)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isPWA, checkInterval, currentVersion, metaUrl])

  return {
    updateAvailable,
    currentVersion,
    handleUpdate,
  }
}

export default useVersionCheck
