import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthProvider"
import { appUsageApi } from "@/service"
import { isStandalone, platform } from "@/components/student-phone/install/pwaInstall"

// Count a page only once the user has stayed on it this long (skips redirects).
const SETTLE_MS = 1000

/**
 * Reports each page a logged-in user opens (every role), for the admin App
 * Usage page. Same path twice in a row counts once; query changes don't count.
 * Fire-and-forget.
 */
const PageVisitTracker = () => {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const lastRef = useRef({ userId: null, path: null })
  const userId = user?._id

  useEffect(() => {
    if (!userId) return undefined
    const last = lastRef.current
    if (last.userId === userId && last.path === pathname) return undefined
    const timer = window.setTimeout(() => {
      lastRef.current = { userId, path: pathname }
      const os = platform()
      appUsageApi.visit({ path: pathname, platform: os === "other" ? "desktop" : os, mode: isStandalone() ? "app" : "browser" }).catch(() => {})
    }, SETTLE_MS)
    return () => window.clearTimeout(timer)
  }, [userId, pathname])

  return null
}

export default PageVisitTracker
