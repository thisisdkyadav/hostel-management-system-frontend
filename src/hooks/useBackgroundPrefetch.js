import { useEffect } from "react"

const canPrefetch = () => {
  if (typeof navigator === "undefined") return true
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection

  if (!connection) return true
  if (connection.saveData) return false
  return !["slow-2g", "2g"].includes(connection.effectiveType)
}

const scheduleIdle = (fn) => {
  if (typeof window === "undefined") return () => {}

  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(fn, { timeout: 2000 })
    return () => {
      if ("cancelIdleCallback" in window) {
        window.cancelIdleCallback(id)
      }
    }
  }

  const id = window.setTimeout(fn, 600)
  return () => window.clearTimeout(id)
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const noop = () => {}

const runPrefetchQueue = async (loaders, isCanceled) => {
  for (let i = 0; i < loaders.length; i += 1) {
    if (isCanceled()) return
    const loader = loaders[i]
    if (typeof loader !== "function") continue
    try {
      await loader()
    } catch {
      // Ignore prefetch failures; they should never block rendering.
    }
    if (i < loaders.length - 1) {
      await pause(120)
    }
  }
}

const useBackgroundPrefetch = (loaders = [], enabled = true) => {
  useEffect(() => {
    if (!enabled || !loaders.length) return noop
    if (!canPrefetch()) return noop

    let canceled = false
    const cancel = scheduleIdle(() => {
      runPrefetchQueue(loaders, () => canceled)
    })

    return () => {
      canceled = true
      cancel()
    }
  }, [enabled, loaders])
}

export default useBackgroundPrefetch
