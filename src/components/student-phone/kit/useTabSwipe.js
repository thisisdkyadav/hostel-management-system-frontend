import { useEffect, useRef } from "react"

const EDGE = 24 // px from the screen edge: left for the system back gesture
const LOCK = 10 // px of movement before we decide sideways vs. scrolling
const SWITCH_SPEED = 0.5 // px per ms

/** True if the touch began inside something that scrolls sideways (chip rows, the day strip, tables). */
const inSideScroller = (node, stop) => {
  for (let el = node; el && el !== stop; el = el.parentElement) {
    if (el.matches?.("input, textarea, select, [data-no-swipe]")) return true
    if (el.scrollWidth > el.clientWidth + 1) {
      const { overflowX } = getComputedStyle(el)
      if (overflowX === "auto" || overflowX === "scroll") return true
    }
  }
  return false
}

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

/**
 * Swipe the page left/right to move between the bottom-bar tabs. The page
 * follows the finger; past a quarter of the screen (or a flick) it slides out
 * and the neighbouring tab slides in. At the first/last tab it only stretches.
 */
const useTabSwipe = ({ paths, currentIndex, onSwitch, active = true }) => {
  const mainRef = useRef(null)
  const state = useRef({ paths, currentIndex, onSwitch })

  useEffect(() => {
    state.current = { paths, currentIndex, onSwitch }
  }, [paths, currentIndex, onSwitch])

  useEffect(() => {
    const main = mainRef.current
    if (!main) return undefined
    let start = null
    let mode = null // null | "x" | "y"
    let last = null
    let prev = null

    const place = (dx, animate, ms = 220) => {
      main.style.transition = animate ? `transform ${ms}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${ms}ms ease` : "none"
      main.style.transform = dx ? `translateX(${dx}px)` : ""
      main.style.opacity = dx ? String(Math.max(0.35, 1 - Math.abs(dx) / (main.clientWidth * 1.4))) : ""
    }

    const neighbour = (dx) => {
      const { paths: list, currentIndex: index } = state.current
      if (index < 0) return null
      return list[dx < 0 ? index + 1 : index - 1] || null
    }

    const onStart = (event) => {
      start = null
      if (event.touches.length !== 1 || state.current.currentIndex < 0) return
      const touch = event.touches[0]
      if (touch.clientX < EDGE || touch.clientX > window.innerWidth - EDGE) return
      if (inSideScroller(event.target, main)) return
      start = { x: touch.clientX, y: touch.clientY }
      mode = null
      last = prev = { x: touch.clientX, t: event.timeStamp }
    }

    const onMove = (event) => {
      if (!start) return
      const touch = event.touches[0]
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (!mode) {
        if (Math.abs(dx) < LOCK && Math.abs(dy) < LOCK) return
        mode = Math.abs(dx) > Math.abs(dy) * 1.3 ? "x" : "y"
        if (mode === "y") {
          start = null
          return
        }
        start.x = touch.clientX - Math.sign(dx) * LOCK // keep the page under the finger
      }
      event.preventDefault()
      const move = touch.clientX - start.x
      place(neighbour(move) ? move * 0.6 : move * 0.18, false)
      prev = last
      last = { x: touch.clientX, t: event.timeStamp }
    }

    const onEnd = () => {
      if (!start || mode !== "x") {
        start = null
        return
      }
      const move = last.x - start.x
      const speed = last.t > prev.t ? (last.x - prev.x) / (last.t - prev.t) : 0
      start = null
      const target = neighbour(move)
      const width = main.clientWidth
      const far = Math.abs(move) > width * 0.25
      const flick = Math.abs(speed) > SWITCH_SPEED && Math.abs(move) > 40 && Math.sign(speed) === Math.sign(move)
      if (!target || !(far || flick)) {
        place(0, true)
        return
      }
      const dir = Math.sign(move)
      if (reducedMotion()) {
        place(0, false)
        state.current.onSwitch(target)
        main.scrollTop = 0
        return
      }
      place(dir * width * 0.5, true, 150)
      window.setTimeout(() => {
        state.current.onSwitch(target)
        main.scrollTop = 0
        place(-dir * width * 0.3, false)
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => place(0, true, 240)))
      }, 150)
    }

    main.addEventListener("touchstart", onStart, { passive: true })
    main.addEventListener("touchmove", onMove, { passive: false })
    main.addEventListener("touchend", onEnd)
    main.addEventListener("touchcancel", onEnd)
    return () => {
      main.removeEventListener("touchstart", onStart)
      main.removeEventListener("touchmove", onMove)
      main.removeEventListener("touchend", onEnd)
      main.removeEventListener("touchcancel", onEnd)
    }
  }, [active])

  return mainRef
}

export default useTabSwipe
