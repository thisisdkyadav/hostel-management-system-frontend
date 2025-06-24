import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthProvider"

const usePwaMobile = () => {
  const { isStandalone: authStandalone } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [isPwaMobile, setIsPwaMobile] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  // Set up standalone detection
  useEffect(() => {
    // Check if the app is in standalone mode (PWA installed)
    const checkStandalone = () => {
      // Use multiple methods to detect standalone mode
      const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true || authStandalone || document.referrer.includes("android-app://") || window.localStorage.getItem("pwaInstalled") === "true"

      setIsStandalone(standalone)

      // For debugging/testing purposes, allow forcing PWA mode with URL param
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has("pwa")) {
        setIsStandalone(true)
        window.localStorage.setItem("pwaInstalled", "true")
      }
    }

    checkStandalone()

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    const handleDisplayModeChange = (e) => {
      setIsStandalone(e.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleDisplayModeChange)
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(handleDisplayModeChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleDisplayModeChange)
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleDisplayModeChange)
      }
    }
  }, [authStandalone]) // Only depend on authStandalone

  // Set up mobile detection in a separate effect
  useEffect(() => {
    // Check if the device is mobile based on screen width
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsPwaMobile(isStandalone && mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [isStandalone]) // Only depend on isStandalone

  return { isPwaMobile, isMobile, isStandalone }
}

export default usePwaMobile
