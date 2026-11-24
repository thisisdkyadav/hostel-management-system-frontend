import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../../contexts/AuthProvider"
import useAuthz from "../../hooks/useAuthz"
import { preloadEntries } from "./phoneQueries"

const START_AFTER_MS = 1500 // let the first page finish loading first
const REFRESH_MS = 30000

/**
 * Keeps the phone pages' data in the cache and fresh, so switching pages (tap
 * or swipe) shows real content straight away.
 *
 * Shortly after the shell opens it fetches everything the student can open,
 * once. After that only the page on screen is refreshed: every 30 s while the
 * tab is visible and online, and right away when the student comes back to the
 * tab or reconnects. Other pages show their cached data when opened and
 * refresh themselves then. Refreshes only replace data in place (React Query
 * keeps the old data until the new arrives, and a failed refresh keeps it
 * too), so nothing on screen disappears. Anything refreshed recently (e.g. by
 * the page itself) is skipped. Pages the student's role can't open are never
 * fetched.
 */
const usePhonePreload = (enabled) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { canRoute, loading: authzLoading } = useAuthz()
  const userId = user?._id
  const canRouteRef = useRef(canRoute)

  useEffect(() => {
    canRouteRef.current = canRoute
  }, [canRoute])

  useEffect(() => {
    if (!enabled || authzLoading) return undefined
    const fresh = REFRESH_MS - 1000

    const usable = () => document.visibilityState === "visible" && navigator.onLine !== false

    const prefetchAll = () => {
      for (const { routeKey, query, infinite } of preloadEntries(userId)) {
        if (!canRouteRef.current(routeKey)) continue
        if (infinite) queryClient.prefetchInfiniteQuery({ ...query, staleTime: fresh })
        else queryClient.prefetchQuery({ ...query, staleTime: fresh })
      }
    }

    // Only the page on screen (and a swipe preview) is mounted, so its queries
    // are the active ones.
    const run = () => {
      if (!usable()) return
      queryClient.refetchQueries({ type: "active", stale: true, predicate: (query) => Date.now() - query.state.dataUpdatedAt > fresh })
    }

    let timer = 0
    const begin = window.setTimeout(() => {
      if (usable()) prefetchAll()
      timer = window.setInterval(run, REFRESH_MS)
    }, START_AFTER_MS)
    const onVisible = () => document.visibilityState === "visible" && run()
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("online", run)
    return () => {
      window.clearTimeout(begin)
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("online", run)
    }
  }, [enabled, authzLoading, queryClient, userId])
}

export default usePhonePreload
