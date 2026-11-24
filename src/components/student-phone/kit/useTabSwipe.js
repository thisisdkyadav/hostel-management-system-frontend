import { useEffect, useRef } from "react"

const EDGE = 24 // px from the screen edge: left free for the system back gesture
const LOCK = 8 // px of movement before we decide sideways vs. scrolling
const SWITCH_SPEED = 0.45 // px per ms
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)"

/** True if the touch began inside something that scrolls sideways (chip rows, the day strip, tables) or a field. */
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
 * Swipe the page left/right to move between the bottom-bar tabs, carousel
 * style: the neighbouring page (rendered by the shell into `peekRef` when
 * `onPeek(path)` is called) slides in alongside the current one. Past a
 * quarter of the screen, or on a flick, it completes and `onSwitch(path)`
 * navigates; otherwise both spring back. At the first/last tab it only stretches.
 */
const useTabSwipe = ({ paths, currentIndex, onSwitch, onPeek, peekRef, active = true }) => {
  const mainRef = useRef(null)
  const state = useRef({ paths, currentIndex, onSwitch, onPeek })

  useEffect(() => {
    state.current = { paths, currentIndex, onSwitch, onPeek }
  }, [paths, currentIndex, onSwitch, onPeek])

  useEffect(() => {
    const main = mainRef.current
    if (!main) return undefined
    let start = null
    let mode = null // null | "x"
    let move = 0
    let width = 0
    let peekPath = null
    let frame = 0
    let samples = []
    let timer = 0 // spring-back, cleared if anything new starts
    let finishing = null // the page switch at the end of a completed swipe
    const later = (fn, ms) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(fn, ms)
    }
    // The finger we're tracking (a second finger mustn't move the page).
    const tracked = (event) => Array.from(event.changedTouches || []).find((t) => t.identifier === start?.id) || null

    const neighbour = (dx) => {
      const { paths: list, currentIndex: index } = state.current
      if (index < 0 || dx === 0) return null
      return list[dx < 0 ? index + 1 : index - 1] || null
    }

    const paint = (dx, ms = 0) => {
      const transition = ms ? `transform ${ms}ms ${EASE}` : "none"
      main.style.transition = transition
      main.style.transform = dx ? `translate3d(${dx}px, 0, 0)` : ""
      const peek = peekRef?.current
      if (peek) {
        peek.style.transition = transition
        peek.style.transform = `translate3d(${dx + (dx < 0 ? width : -width)}px, 0, 0)`
      }
    }

    const setPeek = (path) => {
      if (path === peekPath) return
      peekPath = path
      state.current.onPeek?.(path)
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        paint(move)
      })
    }

    const onStart = (event) => {
      if (start && event.touches.length > 1) return // a second finger: keep tracking the first
      start = null
      if (event.touches.length !== 1 || state.current.currentIndex < 0) return
      const touch = event.touches[0]
      if (touch.clientX < EDGE || touch.clientX > window.innerWidth - EDGE) return
      // A touch while a completed swipe is still sliding: switch now instead of
      // cancelling it (cancelling left the page parked off screen).
      if (finishing) return finishing()
      if (inSideScroller(event.target, main)) return
      window.clearTimeout(timer)
      if (peekPath) setPeek(null) // a spring-back was still running
      start = { x: touch.clientX, y: touch.clientY, id: touch.identifier }
      mode = null
      samples = [{ x: touch.clientX, t: event.timeStamp }]
    }

    const onMove = (event) => {
      if (!start) return
      const touch = tracked(event)
      if (!touch) return
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (!mode) {
        if (Math.abs(dx) < LOCK && Math.abs(dy) < LOCK) return
        if (Math.abs(dx) <= Math.abs(dy) * 1.2) {
          start = null // vertical: let the page scroll
          return
        }
        mode = "x"
        width = main.clientWidth
        start.x = touch.clientX - Math.sign(dx) * 2 // keep the page under the finger
        main.style.willChange = "transform"
      }
      if (event.cancelable) event.preventDefault()
      const raw = touch.clientX - start.x
      const target = neighbour(raw)
      setPeek(target)
      move = target ? raw : raw * 0.18
      samples.push({ x: touch.clientX, t: event.timeStamp })
      if (samples.length > 5) samples.shift()
      schedule()
    }

    const onEnd = (event) => {
      if (!start || !tracked(event)) return
      if (mode !== "x") {
        start = null
        return
      }
      start = null
      mode = null
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      main.style.willChange = ""
      const first = samples[0]
      const last = samples[samples.length - 1]
      const speed = last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0
      const target = neighbour(move)
      const far = Math.abs(move) > width * 0.25
      const flick = Math.abs(speed) > SWITCH_SPEED && Math.abs(move) > 30 && Math.sign(speed) === Math.sign(move)
      if (!target || !(far || flick)) {
        paint(0, 260)
        later(() => setPeek(null), 260)
        move = 0
        return
      }
      const dir = Math.sign(move)
      move = 0
      const finish = () => {
        window.clearTimeout(timer)
        finishing = null
        peekPath = null
        state.current.onSwitch(target) // the shell resets transforms once the new page is in
      }
      if (reducedMotion()) return finish()
      paint(dir * width, 220)
      finishing = finish
      later(finish, 220)
    }

    // Sideways drags are ours: without this some Android browsers take them for
    // their own back/forward gesture and the swipe never starts. Rows that scroll
    // sideways still scroll and pinch zoom still works (checked in Chrome). Not on
    // iPhones, where WebKit may apply it to those rows too.
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    if (!ios) main.style.touchAction = "pan-y pinch-zoom"
    main.addEventListener("touchstart", onStart, { passive: true })
    main.addEventListener("touchmove", onMove, { passive: false })
    main.addEventListener("touchend", onEnd)
    main.addEventListener("touchcancel", onEnd)
    return () => {
      finishing = null
      main.style.touchAction = ""
      if (frame) window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      main.removeEventListener("touchstart", onStart)
      main.removeEventListener("touchmove", onMove)
      main.removeEventListener("touchend", onEnd)
      main.removeEventListener("touchcancel", onEnd)
    }
  }, [active, peekRef])

  return mainRef
}

export default useTabSwipe
