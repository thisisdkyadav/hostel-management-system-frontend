import { useEffect, useRef } from "react"

// Phones with gesture navigation keep their own edge strip, so touches there never
// reach the page; with 3-button navigation they do, and thumbs often start a swipe
// near the edge. Only the outermost few px are left alone.
const EDGE = 8 // px
const LOCK = 10 // px of movement before we decide sideways vs. scrolling
const SWITCH_SPEED = 0.45 // px per ms
const SPEED_WINDOW = 100 // ms of recent movement used for flick speed
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)"

/** True if the touch began in a field or an opted-out area: never a page swipe. */
const inField = (node, stop) => {
  for (let el = node; el && el !== stop; el = el.parentElement) {
    if (el.matches?.("input, textarea, select, [data-no-swipe]")) return true
  }
  return false
}

/** Things under the touch that scroll sideways (chip rows, the day strip, tables), innermost first. */
const sideScrollers = (node, stop) => {
  const list = []
  for (let el = node; el && el !== stop; el = el.parentElement) {
    if (el.scrollWidth > el.clientWidth + 2) {
      const { overflowX } = getComputedStyle(el)
      if (overflowX === "auto" || overflowX === "scroll") list.push(el)
    }
  }
  return list
}

/**
 * Can one of them still scroll for a finger moving by dx? A row already at its
 * end (or one that overflows by a pixel or two) shouldn't swallow the page swipe:
 * that used to make swipes fail on whole pages at some screen widths.
 */
const canScrollSideways = (list, dx) =>
  list.some((el) => {
    const max = el.scrollWidth - el.clientWidth
    const left = Math.abs(el.scrollLeft) // RTL rows report negative values
    return dx < 0 ? left < max - 2 : left > 2
  })

/** Speed (px per ms) over the last SPEED_WINDOW ms; samples are {v, t}. */
const recentSpeed = (samples) => {
  const last = samples[samples.length - 1]
  let first = last
  for (let i = samples.length - 1; i >= 0 && last.t - samples[i].t <= SPEED_WINDOW; i -= 1) first = samples[i]
  return last.t > first.t ? (last.v - first.v) / (last.t - first.t) : 0
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
      if (inField(event.target, main)) return
      window.clearTimeout(timer)
      if (peekPath) setPeek(null) // a spring-back was still running
      start = { x: touch.clientX, y: touch.clientY, id: touch.identifier, scrollers: sideScrollers(event.target, main) }
      mode = null
      samples = [{ v: touch.clientX, t: event.timeStamp }]
    }

    const onMove = (event) => {
      if (!start) return
      const touch = tracked(event)
      if (!touch) return
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (!mode) {
        if (Math.abs(dx) < LOCK && Math.abs(dy) < LOCK) {
          samples.push({ v: touch.clientX, t: event.timeStamp })
          return
        }
        // Thumbs swipe in an arc, so anything flatter than 45° counts as sideways
        // (it used to need ~40°, and many real swipes were taken for scrolling).
        if (Math.abs(dx) <= Math.abs(dy)) {
          start = null // vertical: let the page scroll
          return
        }
        if (canScrollSideways(start.scrollers, dx)) {
          start = null // a chip row / strip that can still move: let it scroll
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
      samples.push({ v: touch.clientX, t: event.timeStamp })
      if (samples.length > 40) samples.shift()
      schedule()
    }

    const onEnd = (event) => {
      const lastTouch = start && tracked(event)
      if (!lastTouch) return
      if (mode !== "x") {
        start = null
        return
      }
      start = null
      mode = null
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      main.style.willChange = ""
      samples.push({ v: lastTouch.clientX, t: event.timeStamp })
      const speed = recentSpeed(samples)
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
