import { useState, useEffect } from "react"
import { IoCloseOutline } from "react-icons/io5"
import { IoLogoApple, IoLogoAndroid } from "react-icons/io"
import Button from "./Button"

const PWAInstallPrompt = () => {
  // Temporarily disabled due to issues
  return null

  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Check if device is mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Check if the app is running in standalone mode (installed PWA)
  const checkIsStandalone = () => {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true || document.referrer.includes("android-app://") || window.matchMedia("(display-mode: fullscreen)").matches || window.matchMedia("(display-mode: minimal-ui)").matches
  }

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const hasDismissed = localStorage.getItem("pwa-prompt-dismissed")
    if (hasDismissed) {
      setDismissed(true)
      return // Don't show any prompts if user dismissed them
    }

    // Check if we're already running as an installed app
    const isRunningStandalone = checkIsStandalone()
    setIsStandalone(isRunningStandalone)

    // If we're already in standalone mode, don't show any prompts
    if (isRunningStandalone) {
      return
    }

    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Handle installation prompt for non-iOS devices
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)

      // Only show install prompt if we're on a mobile device and not in standalone mode
      if (isMobileDevice() && !isRunningStandalone) {
        setShowInstallPrompt(true)
      }
    }

    // For iOS devices, show the installation prompt if not already installed
    if (iOS && !isRunningStandalone && isMobileDevice()) {
      setShowInstallPrompt(true)
    }

    // Add event listener for install prompt
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check if we already captured an install prompt (happens on page load sometimes)
    if (window.deferredPrompt) {
      handleBeforeInstallPrompt(window.deferredPrompt)
      window.deferredPrompt = null
    }

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        // We're now in standalone mode
        setIsStandalone(true)
        setShowInstallPrompt(false)
      }
    }

    mediaQuery.addEventListener("change", handleDisplayModeChange)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      mediaQuery.removeEventListener("change", handleDisplayModeChange)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS doesn't support automatic installation, so just hide the prompt
      setShowInstallPrompt(false)
    } else if (deferredPrompt) {
      try {
        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice

        // We no longer need the prompt. Clear it up
        setDeferredPrompt(null)
        setShowInstallPrompt(false)

        if (outcome === "accepted") {
          // User accepted the install prompt
          localStorage.setItem("pwa-installed", "true")
        }
      } catch (error) {
        console.error("Error showing install prompt:", error)
      }
    } else {
      // Fallback for when deferredPrompt is not available
      alert('To install this app: tap the menu button in your browser and select "Add to Home Screen" or "Install App"')
    }
  }

  const dismissPrompt = () => {
    setShowInstallPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", "true")
    setDismissed(true)
  }

  // Don't show any prompts if we're already in standalone mode
  if (isStandalone || dismissed || !showInstallPrompt) {
    return null
  }

  if (showInstallPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg z-50 p-4 border border-blue-100/50 animate-slideUp">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">Install App</h3>
            <p className="text-sm text-gray-600 mb-3">{isIOS ? "Add this app to your home screen for a better experience." : "Install this app on your device for a better experience."}</p>

            {isIOS ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <IoLogoApple size={20} className="text-gray-800" />
                <span>
                  Tap <span className="inline-block px-1.5 py-0.5 bg-gray-200 rounded text-xs">Share</span> then "Add to Home Screen"
                </span>
              </div>
            ) : (
              <Button onClick={handleInstallClick} variant="primary" size="medium" icon={<IoLogoAndroid size={18} />}>
                Install App
              </Button>
            )}
          </div>
          <Button onClick={dismissPrompt} variant="ghost" size="small" icon={<IoCloseOutline size={24} />} aria-label="Dismiss" />
        </div>
      </div>
    )
  }

  return null
}

export default PWAInstallPrompt
