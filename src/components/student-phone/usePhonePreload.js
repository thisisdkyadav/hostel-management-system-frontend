import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { complaintsListQuery, preloadQueries } from "./phoneQueries"

const START_AFTER_MS = 1500 // let the first page finish loading first
const REFRESH_MS = 5000

/**
 * Keeps every bottom-bar page's data in the cache and fresh, so switching
 * pages (tap or swipe) shows real content straight away.
 *
 * Shortly after the shell opens it fetches all of it, then refreshes every
 * 5 s while the tab is visible and online. Refreshes only replace data in
 * place (React Query keeps the old data until the new arrives, and a failed
 * refresh keeps it too), so nothing the student is looking at or typing into
 * disappears. Anything refreshed in the last few seconds (e.g. by the page
 * itself) is skipped.
 */
const usePhonePreload = (enabled) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return undefined
    const fresh = REFRESH_MS - 500

    const run = () => {
      if (document.visibilityState !== "visible" || navigator.onLine === false) return
      for (const query of preloadQueries()) queryClient.prefetchQuery({ ...query, staleTime: fresh })
      queryClient.prefetchInfiniteQuery({ ...complaintsListQuery("all"), staleTime: fresh })
      // Whatever else is on screen (a filtered list, another page) refreshes too.
      queryClient.refetchQueries({ type: "active", stale: true, predicate: (query) => Date.now() - query.state.dataUpdatedAt > fresh })
    }

    let timer = 0
    const begin = window.setTimeout(() => {
      run()
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
  }, [enabled, queryClient])
}

export default usePhonePreload
