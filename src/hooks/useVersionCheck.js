import { useState, useEffect, useCallback } from "react"
import { registerSW } from "virtual:pwa-register"
import { compareVersions, getUpdateType, storeLastSeenVersion, getLastSeenVersion } from "../utils/versionUtils"

const useVersionCheck = ({
  checkInterval = 60 * 1000, // 1 minute by default
  metaUrl = "/meta.json",
  autoUpdateOnLoad = true, // New option for automatic updates on load
} = {}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateType, setUpdateType] = useState(null) // "major", "minor", "patch"
  const [isPWA] = useState("serviceWorker" in navigator)
  const currentVersion = import.meta.env.VITE_APP_VERSION || "unknown"
  const [updateSWFunction, setUpdateSWFunction] = useState(null)
  const [lastChecked, setLastChecked] = useState(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Store current version in localStorage on mount
  useEffect(() => {
    if (currentVersion !== "unknown") {
      const lastSeen = getLastSeenVersion()

      // If this is a new version and we have a previous version stored
      if (lastSeen && compareVersions(currentVersion, lastSeen) > 0) {
        console.log(`App updated from ${lastSeen} to ${currentVersion}`)
      }

      // Update the stored version
      storeLastSeenVersion(currentVersion)
    }
  }, [currentVersion])

  // Function to handle the reload when user confirms update
  const handleUpdate = useCallback(() => {
    if (isPWA && updateSWFunction) {
      // For PWA, use the update function provided by registerSW
      console.log("Updating service worker...")
      updateSWFunction(true)
    } else {
      // For non-PWA, reload the page with cache busting
      console.log("Reloading page with cache busting...")
      const cacheBuster = `?cache=${Date.now()}`
      window.location.href = window.location.pathname + cacheBuster
    }
  }, [isPWA, updateSWFunction])

  useEffect(() => {
    let intervalId

    if (isPWA) {
      // PWA update handling using vite-plugin-pwa
      try {
        console.log("Registering service worker for PWA...")
        const updateSW = registerSW({
          onNeedRefresh() {
            console.log("New service worker available, update needed")

            // If auto-update is enabled and this is the initial load, update immediately
            if (autoUpdateOnLoad && !initialLoadComplete) {
              console.log("Auto-updating on initial load...")
              updateSW(true) // Update immediately
              setInitialLoadComplete(true)
            } else {
              // Otherwise show the notification
              setUpdateAvailable(true)
              setUpdateType("pwa")
            }
          },
          onOfflineReady() {
            console.log("App is ready for offline use")
          },
          immediate: true,
        })

        // Store the updateSW function for later use
        setUpdateSWFunction(() => updateSW)
        window.__updateSW = updateSW
      } catch (error) {
        console.error("Failed to register service worker:", error)
      }
    } else {
      // Non-PWA version check via meta.json
      const checkVersion = async () => {
        try {
          setLastChecked(new Date())
          const response = await fetch(`${metaUrl}?_=${Date.now()}`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
          })

          if (!response.ok) {
            console.warn(`Failed to fetch ${metaUrl}: ${response.status}`)
            return
          }

          const data = await response.json()

          if (data.version && data.version !== currentVersion) {
            const versionDiff = compareVersions(data.version, currentVersion)

            if (versionDiff > 0) {
              console.log(`New version detected: ${data.version} (current: ${currentVersion})`)
              const updateTypeValue = getUpdateType(currentVersion, data.version)
              setUpdateType(updateTypeValue)

              // If auto-update is enabled and this is the initial load, update immediately
              if ((autoUpdateOnLoad && !initialLoadComplete) || data.forceUpdate) {
                console.log("Auto-updating on initial load or force update required...")
                setInitialLoadComplete(true)
                handleUpdate()
              } else {
                // Otherwise show the notification
                setUpdateAvailable(true)
              }
            }
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
  }, [metaUrl, checkInterval, currentVersion, handleUpdate, isPWA, autoUpdateOnLoad, initialLoadComplete])

  return {
    updateAvailable,
    currentVersion,
    updateType,
    lastChecked,
    handleUpdate,
  }
}

export default useVersionCheck
