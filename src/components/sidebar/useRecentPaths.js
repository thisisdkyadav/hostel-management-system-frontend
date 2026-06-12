import { useCallback, useState } from "react"

const RECENT_PATHS_STORAGE_KEY = "admin_sidebar_recent_paths_v1"
const MAX_RECENT_PATHS = 8

const readStoredRecentPaths = () => {
  if (typeof window === "undefined") return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_PATHS_STORAGE_KEY) || "[]")
    return Array.isArray(parsed) ? parsed.filter((path) => typeof path === "string") : []
  } catch {
    return []
  }
}

/**
 * Tracks recently visited sidebar paths (most recent first) in localStorage.
 * The Workspace (V3) layout surfaces these under "Recent".
 */
const useRecentPaths = () => {
  const [recentPaths, setRecentPaths] = useState(readStoredRecentPaths)

  const recordVisit = useCallback((path) => {
    if (!path) return
    setRecentPaths((previous) => {
      if (previous[0] === path) return previous
      const next = [path, ...previous.filter((storedPath) => storedPath !== path)].slice(0, MAX_RECENT_PATHS)
      try {
        window.localStorage.setItem(RECENT_PATHS_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Quota/privacy-mode failures only cost us recents persistence
      }
      return next
    })
  }, [])

  return { recentPaths, recordVisit }
}

export default useRecentPaths
