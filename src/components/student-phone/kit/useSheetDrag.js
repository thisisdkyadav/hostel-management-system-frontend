import { useEffect, useRef } from "react"

/** Nearest ancestor (up to `stop`) that scrolls vertically, or null. */
const verticalScroller = (node, stop) => {
  for (let el = node; el && el !== stop.parentElement; el = el.parentElement) {
    if (el.scrollHeight > el.clientHeight + 1) {
      const { overflowY } = getComputedStyle(el)
      if (overflowY === "auto" || overflowY === "scroll") return el
    }
  }
  return null
}

const CLOSE_DISTANCE = 140 // px, or a third of the sheet, whichever is less
const CLOSE_SPEED = 0.55 // px per ms: a quick flick closes it from a shorter drag

/**
 * Drag a bottom sheet down to dismiss it, like a native app. The sheet follows
 * the finger; let go past a third of its height (or flick) and it slides away
 * and calls onClose, otherwise it springs back. Dragging only starts from the
 * top of any scrolled content, so normal scrolling inside the sheet still works.
 */
const useSheetDrag = (onClose, active = true) => {
  const sheetRef = useRef(null)
  const backdropRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return undefined
    let start = null // { x, y, t, scroller }
    let dragging = false
    let last = null // recent { y, t } for flick speed
    let prev = null

    const setOffset = (dy, animate) => {
      sheet.style.transition = animate ? "transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)" : "none"
      sheet.style.transform = dy ? `translateY(${dy}px)` : ""
      const backdrop = backdropRef.current
      if (backdrop) {
        backdrop.style.transition = animate ? "opacity 240ms ease" : "none"
        backdrop.style.opacity = String(Math.max(0, 1 - Math.max(dy, 0) / (sheet.offsetHeight || 1)))
      }
    }

    const onStart = (event) => {
      if (event.touches.length !== 1) return
      const touch = event.touches[0]
      start = { x: touch.clientX, y: touch.clientY, scroller: verticalScroller(event.target, sheet) }
      dragging = false
      last = prev = { y: touch.clientY, t: event.timeStamp }
    }

    const onMove = (event) => {
      if (!start) return
      const touch = event.touches[0]
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (!dragging) {
        if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return
        // Sideways (a chip row) or upward (scrolling content): not ours.
        const atTop = !start.scroller || start.scroller.scrollTop <= 0
        if (Math.abs(dx) > Math.abs(dy) || dy < 0 || !atTop) {
          start = null
          return
        }
        dragging = true
        start.y = touch.clientY // start from here so the sheet doesn't jump
      }
      event.preventDefault()
      const offset = touch.clientY - start.y
      // Pulling up past the top meets resistance instead of moving freely.
      setOffset(offset > 0 ? offset : offset * 0.15, false)
      prev = last
      last = { y: touch.clientY, t: event.timeStamp }
    }

    const onEnd = () => {
      if (!start || !dragging) {
        start = null
        return
      }
      const offset = last.y - start.y
      const speed = last.t > prev.t ? (last.y - prev.y) / (last.t - prev.t) : 0
      start = null
      dragging = false
      const height = sheet.offsetHeight
      if (offset > Math.min(CLOSE_DISTANCE, height / 3) || (speed > CLOSE_SPEED && offset > 30)) {
        setOffset(height + 24, true)
        window.setTimeout(() => onCloseRef.current?.(), 200)
      } else {
        setOffset(0, true)
      }
    }

    sheet.addEventListener("touchstart", onStart, { passive: true })
    sheet.addEventListener("touchmove", onMove, { passive: false })
    sheet.addEventListener("touchend", onEnd)
    sheet.addEventListener("touchcancel", onEnd)
    return () => {
      sheet.removeEventListener("touchstart", onStart)
      sheet.removeEventListener("touchmove", onMove)
      sheet.removeEventListener("touchend", onEnd)
      sheet.removeEventListener("touchcancel", onEnd)
    }
  }, [active])

  return { sheetRef, backdropRef }
}

export default useSheetDrag
