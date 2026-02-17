import { useState, useEffect, useCallback, useRef } from "react"
import { registerSW } from "virtual:pwa-register"

const useVersionCheck = ({
  checkInterval = 30 * 1000, // 30 seconds by default
  metaUrl = "/meta.json",
} = {}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(() => localStorage.getItem("app_version"))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isFirstVersionCheck = useRef(true)

  const performHardRefresh = useCallback(async () => {
    try {
      if (typeof window.__updateSW === "function") {
        await window.__updateSW(true)
      }
    } catch (error) {
      console.warn("Service worker update failed:", error)
    }

    try {
      localStorage.clear()

      if ("caches" in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
    } catch (error) {
      console.warn("Cache cleanup failed:", error)
    }

    window.location.reload()
  }, [])

  const handleUpdate = useCallback(async () => {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    await performHardRefresh()
  }, [isRefreshing, performHardRefresh])

  useEffect(() => {
    let intervalId = null

    if ("serviceWorker" in navigator) {
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

        window.__updateSW = updateSW
      } catch (error) {
        console.error("Failed to register service worker:", error)
      }
    }

    const checkVersion = async () => {
      try {
        const response = await fetch(metaUrl, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        })

        if (!response.ok) {
          console.warn(`Failed to fetch ${metaUrl}: ${response.status}`)
          return
        }

        const data = await response.json()
        if (!data.version) {
          isFirstVersionCheck.current = false
          return
        }

        const isInitialCheck = isFirstVersionCheck.current
        isFirstVersionCheck.current = false
        const storedVersion = localStorage.getItem("app_version")
        if (storedVersion && storedVersion !== data.version) {
          if (isInitialCheck) {
            await performHardRefresh()
            return
          }

          setUpdateAvailable(true)
          return
        }

        localStorage.setItem("app_version", data.version)
        setCurrentVersion(data.version)
      } catch (error) {
        console.warn("Version check failed:", error)
      }
    }

    checkVersion()
    intervalId = setInterval(checkVersion, checkInterval)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [checkInterval, metaUrl, performHardRefresh])

  return {
    updateAvailable,
    currentVersion,
    handleUpdate,
    isRefreshing,
  }
}

export default useVersionCheck
