import { useState, useEffect } from "react"

function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage("CHECK_ONLINE_STATUS")

      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && typeof event.data.isOnline !== "undefined") {
          setIsOnline(event.data.isOnline)
        }
      })
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  return isOnline
}

export default useNetworkStatus
