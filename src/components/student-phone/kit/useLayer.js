import { useEffect, useRef } from "react"

/**
 * One open sheet / dialog in the phone app, stacked with any others:
 *
 *  - Back (Android's button or gesture, the browser's back) closes the top
 *    layer instead of leaving the page. Opening pushes a same-URL history entry
 *    tagged with the layer's depth; going back past it closes the layer.
 *  - Escape closes the top layer only.
 *  - Focus moves into the layer, Tab stays inside it, and focus goes back to
 *    what was focused before once it closes.
 *
 * `ref` is the dialog element (give it tabIndex={-1}).
 */

const stack = [] // [{ close, popped }]
let listening = false
let backTo = null

const depthNow = () => window.history.state?.smsLayer || 0

const onPopState = () => {
  const depth = depthNow()
  while (stack.length > depth) {
    const top = stack.pop()
    top.popped = true
    top.close()
  }
}

// Several layers can close in one render; step back once, to the lowest of them.
const backToDepth = (target) => {
  if (backTo !== null) {
    backTo = Math.min(backTo, target)
    return
  }
  backTo = target
  queueMicrotask(() => {
    // Never step below a layer that is (still or again) open.
    const steps = depthNow() - Math.max(backTo, stack.length)
    backTo = null
    if (steps > 0) window.history.go(-steps)
  })
}

/** True while any phone layer is open (e.g. so the install prompt waits). */
export const isLayerOpen = () => stack.length > 0

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const useLayer = (onClose, ref, active = true) => {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!active) return undefined
    const entry = { close: () => closeRef.current?.(), popped: false }
    stack.push(entry)
    const depth = stack.length
    // An entry for this depth may still be on top, waiting to be stepped back
    // (a layer that closed and reopened in the same tick): reuse it.
    if (depthNow() !== depth) window.history.pushState({ ...window.history.state, smsLayer: depth }, "")
    if (!listening) {
      window.addEventListener("popstate", onPopState)
      listening = true
    }

    const before = document.activeElement
    const node = ref?.current
    if (node && !node.contains(document.activeElement)) node.focus({ preventScroll: true })

    const onKey = (event) => {
      if (stack[stack.length - 1] !== entry) return
      if (event.key === "Escape") {
        event.stopPropagation()
        entry.close()
        return
      }
      if (event.key !== "Tab" || !node) return
      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (!items.length) {
        event.preventDefault()
        node.focus({ preventScroll: true })
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const inside = node.contains(document.activeElement)
      if (event.shiftKey && (document.activeElement === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)

    return () => {
      document.removeEventListener("keydown", onKey)
      const index = stack.indexOf(entry)
      if (index >= 0) stack.splice(index, 1)
      // Closed by a button / drag (not by Back): drop our history entry, unless
      // the app already navigated on top of it.
      if (!entry.popped && depthNow() >= depth) backToDepth(depth - 1)
      if (before && before.isConnected && typeof before.focus === "function") before.focus({ preventScroll: true })
    }
  }, [active, ref])
}

export default useLayer
