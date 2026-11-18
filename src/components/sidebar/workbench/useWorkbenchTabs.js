import { useCallback, useEffect, useMemo, useRef, useState } from "react"

/**
 * Browser-style page tabs for the V7 Workbench.
 *
 * A tab is keyed by its nav item's path, so a page and its sub-pages
 * (/admin/hostels and /admin/hostels/123) share one tab, and the tab
 * remembers the exact URL you were last on inside it. Pinned pages live in
 * their own icon-only strip and are never closed; they also remember URLs.
 *
 * Saved per user in localStorage, so tabs survive reloads on this browser.
 */

const MAX_TABS = 12
const storageKey = (userId) => `admin_workbench_tabs:${userId || "anon"}`

const readSaved = (userId) => {
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    const saved = raw ? JSON.parse(raw) : null
    return {
      order: Array.isArray(saved?.order) ? saved.order.filter((key) => typeof key === "string") : [],
      urls: saved?.urls && typeof saved.urls === "object" ? saved.urls : {},
      lastUsed: saved?.lastUsed && typeof saved.lastUsed === "object" ? saved.lastUsed : {},
    }
  } catch {
    return { order: [], urls: {}, lastUsed: {} }
  }
}

const useWorkbenchTabs = ({ userId, pinnedKeys, keyForPath, currentUrl, pathname, navigate, homeUrl }) => {
  const [state, setState] = useState(() => readSaved(userId))
  const activeKeyRef = useRef(null)
  const pinnedSet = useMemo(() => new Set(pinnedKeys), [pinnedKeys])
  const activeKey = keyForPath(pathname)

  // Record the visit: refresh the tab's URL or open a new tab beside the current one.
  useEffect(() => {
    if (!activeKey) return
    const previousKey = activeKeyRef.current
    activeKeyRef.current = activeKey
    setState((prev) => {
      const urls = { ...prev.urls, [activeKey]: currentUrl }
      const lastUsed = { ...prev.lastUsed, [activeKey]: Date.now() }
      let order = prev.order.filter((key) => !pinnedSet.has(key))
      if (!pinnedSet.has(activeKey) && !order.includes(activeKey)) {
        const at = order.indexOf(previousKey)
        order = at >= 0 ? [...order.slice(0, at + 1), activeKey, ...order.slice(at + 1)] : [...order, activeKey]
      }
      // Too many tabs: close the least recently used one that is not open now.
      while (order.length > MAX_TABS) {
        const oldest = order
          .filter((key) => key !== activeKey)
          .sort((a, b) => (lastUsed[a] || 0) - (lastUsed[b] || 0))[0]
        order = order.filter((key) => key !== oldest)
      }
      return { order, urls, lastUsed }
    })
  }, [activeKey, currentUrl, pinnedSet])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(state))
    } catch {
      // Private mode or full storage: tabs just won't survive a reload.
    }
  }, [state, userId])

  const tabs = useMemo(() => state.order.filter((key) => !pinnedSet.has(key)), [pinnedSet, state.order])

  const urlFor = useCallback((key) => state.urls[key] || key, [state.urls])

  const open = useCallback((key) => navigate(urlFor(key)), [navigate, urlFor])

  const close = useCallback(
    (key) => {
      const index = tabs.indexOf(key)
      const rest = tabs.filter((tab) => tab !== key)
      setState((prev) => ({ ...prev, order: prev.order.filter((tab) => tab !== key) }))
      if (key !== activeKey) return
      const next = rest[index] || rest[index - 1] || pinnedKeys[0]
      navigate(next ? state.urls[next] || next : homeUrl)
    },
    [activeKey, homeUrl, navigate, pinnedKeys, state.urls, tabs]
  )

  const closeOthers = useCallback(
    (key) => {
      setState((prev) => ({ ...prev, order: prev.order.filter((tab) => tab === key || pinnedSet.has(tab)) }))
      if (key !== activeKey) navigate(state.urls[key] || key)
    },
    [activeKey, navigate, pinnedSet, state.urls]
  )

  // Drag reorder: dropping onto a tab takes its place (after it when moving right).
  const move = useCallback((key, targetKey) => {
    setState((prev) => {
      const from = prev.order.indexOf(key)
      const to = prev.order.indexOf(targetKey)
      if (from < 0 || to < 0 || from === to) return prev
      const order = [...prev.order]
      order.splice(from, 1)
      order.splice(to, 0, key)
      return { ...prev, order }
    })
  }, [])

  return { tabs, activeKey, open, close, closeOthers, move, urlFor }
}

export default useWorkbenchTabs
