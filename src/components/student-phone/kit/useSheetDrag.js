import { useEffect, useRef } from "react"

/** Nearest ancestor (up to and including `stop`) that scrolls vertically, or null. */
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
const CLOSE_SPEED = 0.5 // px per ms: a quick flick closes it from a shorter drag
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)"

/**
 * Drag a bottom sheet down to dismiss it, like a native app. The sheet tracks
 * the finger 1:1; let go past a third of its height (or flick) and it slides
 * away and calls onClose, otherwise it springs back. Dragging starts only from
 * the top of any scrolled content, so scrolling inside the sheet still works.
 *
 * Smoothness: the drag is claimed on the very first move (before the browser
 * commits the gesture to scrolling), frames are batched with rAF, the sheet's
 * height is read once, and the opening animation is cancelled (a running CSS
 * animation would override the inline transform and make it feel stuck).
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
    let start = null // { x, y, scroller }
    let dragging = false
    let height = 0
    let offset = 0
    let frame = 0
    let samples = [] // recent { y, t } for flick speed
    let timer = 0
    const tracked = (event) => Array.from(event.changedTouches || []).find((t) => t.identifier === start?.id) || null

    const paint = (animate) => {
      const backdrop = backdropRef.current
      sheet.style.transition = animate ? `transform 260ms ${EASE}` : "none"
      sheet.style.transform = offset ? `translate3d(0, ${offset}px, 0)` : ""
      if (backdrop) {
        backdrop.style.transition = animate ? "opacity 260ms ease" : "none"
        backdrop.style.opacity = String(Math.max(0, 1 - Math.max(offset, 0) / (height || 1)))
      }
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        paint(false)
      })
    }

    const onStart = (event) => {
      if (start && event.touches.length > 1) return // a second finger: keep tracking the first
      start = null
      if (event.touches.length !== 1) return
      const touch = event.touches[0]
      start = { x: touch.clientX, y: touch.clientY, id: touch.identifier, scroller: verticalScroller(event.target, sheet) }
      dragging = false
      samples = [{ y: touch.clientY, t: event.timeStamp }]
    }

    const onMove = (event) => {
      if (!start) return
      const touch = tracked(event)
      if (!touch) return
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (!dragging) {
        if (dx === 0 && dy === 0) return
        const atTop = !start.scroller || start.scroller.scrollTop <= 0
        // Sideways (a chip row) or upward / mid-content (scrolling): not ours.
        if (dy <= 0 || Math.abs(dx) > dy || !atTop) {
          start = null
          return
        }
        dragging = true
        height = sheet.offsetHeight
        start.y = touch.clientY - dy
        sheet.style.animation = "none"
        sheet.style.willChange = "transform"
        if (backdropRef.current) backdropRef.current.style.animation = "none"
      }
      if (event.cancelable) event.preventDefault()
      const raw = touch.clientY - start.y
      offset = raw > 0 ? raw : raw * 0.15 // pulling up past the top resists
      samples.push({ y: touch.clientY, t: event.timeStamp })
      if (samples.length > 5) samples.shift()
      schedule()
    }

    const onEnd = (event) => {
      if (!start || !tracked(event)) return
      if (!dragging) {
        start = null
        return
      }
      start = null
      dragging = false
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      sheet.style.willChange = ""
      const first = samples[0]
      const last = samples[samples.length - 1]
      const speed = last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0
      if (offset > Math.min(CLOSE_DISTANCE, height / 3) || (speed > CLOSE_SPEED && offset > 24)) {
        offset = height + 24
        paint(true)
        timer = window.setTimeout(() => onCloseRef.current?.(), 220)
      } else {
        offset = 0
        paint(true)
      }
    }

    sheet.addEventListener("touchstart", onStart, { passive: true })
    sheet.addEventListener("touchmove", onMove, { passive: false })
    sheet.addEventListener("touchend", onEnd)
    sheet.addEventListener("touchcancel", onEnd)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      sheet.removeEventListener("touchstart", onStart)
      sheet.removeEventListener("touchmove", onMove)
      sheet.removeEventListener("touchend", onEnd)
      sheet.removeEventListener("touchcancel", onEnd)
    }
  }, [active])

  return { sheetRef, backdropRef }
}

export default useSheetDrag
