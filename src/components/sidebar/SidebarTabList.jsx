import { useLayoutEffect, useRef, useState } from "react"
import SidebarNavItem from "./SidebarNavItem"
import { SIDEBAR_MOTION } from "./motion"

const navItemKey = (item) => item.path || item.name

const readTokenPx = (element, token, fallback) => {
  if (!element || typeof window === "undefined") return fallback
  const raw = window.getComputedStyle(element).getPropertyValue(token).trim()
  const value = parseFloat(raw)
  if (!Number.isFinite(value)) return fallback
  return raw.endsWith("rem") ? value * 16 : value
}

const joinPath = ({ buttonWidth, edgeWidth, totalWidth, height, radius }) => {
  const E = Math.max(edgeWidth, buttonWidth)
  const W = Math.max(totalWidth, E)
  const R = radius
  const y0 = R
  const y1 = R + height
  // The quarter-circle finishes at E with a vertical tangent. W is only solid
  // overdraw beyond that tangent to hide raster seams.
  const Bs = E - R
  return [
    `M 0 ${y0 + R}`,
    `A ${R} ${R} 0 0 1 ${R} ${y0}`,
    `L ${Bs} ${y0}`,
    `A ${R} ${R} 0 0 0 ${E} ${y0 - R}`,
    `L ${W} ${y0 - R}`,
    `L ${W} ${y1 + R}`,
    `L ${E} ${y1 + R}`,
    `A ${R} ${R} 0 0 0 ${Bs} ${y1}`,
    `L ${R} ${y1}`,
    `A ${R} ${R} 0 0 1 0 ${y1 - R}`,
    "Z",
  ].join(" ")
}

const samePill = (a, b) => {
  if (a === b) return true
  if (!a || !b) return !a && !b
  return (
    a.top === b.top
    && a.left === b.left
    && a.height === b.height
    && a.width === b.width
    && a.edgeWidth === b.edgeWidth
    && a.totalWidth === b.totalWidth
    && a.bleed === b.bleed
    && a.path === b.path
    && a.radius === b.radius
  )
}

const measureActive = (wrap) => {
  if (!wrap) return null
  const active = wrap.querySelector("[data-sidebar-active='true']")
  if (!active) return null
  const wrapRect = wrap.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  const radius = readTokenPx(wrap, "--radius-xl", 12)
  const edgeOverlap = 0.5
  const bleed = readTokenPx(wrap, "--spacing-px", 1) * 2
  const top = activeRect.top - wrapRect.top
  const left = activeRect.left - wrapRect.left
  const height = activeRect.height
  const width = activeRect.width
  // Put the vertical tangent half a CSS pixel past the measured panel edge. At
  // fractional browser zoom levels the panel edge can land between device
  // pixels, so finishing exactly on it can make the curve look slightly short.
  const edgeWidth = Math.max(width, wrapRect.right - activeRect.left + edgeOverlap)
  if (width <= 0 || height <= 0 || edgeWidth <= 0) return null
  // Carry solid fill two CSS pixels farther right than the tangent to prevent
  // a one-pixel flash of the dark panel during movement.
  const totalWidth = edgeWidth + bleed
  return {
    top,
    left,
    height,
    width,
    buttonWidth: width,
    edgeWidth,
    totalWidth,
    bleed,
    radius,
    path: joinPath({ buttonWidth: width, edgeWidth, totalWidth, height, radius }),
  }
}

const SidebarTabList = ({
  items,
  isItemActive,
  showPinControl,
  isPinned,
  pinLocked,
  labelFor,
  accent,
  tintBg,
  lightFill = false,
  emptyMessage,
  listKey,
  activeSignal,
  onNavigate,
  onTogglePin,
}) => {
  const wrapRef = useRef(null)
  const [pill, setPill] = useState(null)
  const [animate, setAnimate] = useState(false)

  const writePill = (next) => {
    setPill((prev) => (samePill(prev, next) ? prev : next))
  }

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return undefined

    setAnimate(false)
    const scroller = lightFill
      ? wrap.querySelector("[data-sidebar-list-scroller]")
      : wrap.parentElement
    const measure = () => writePill(measureActive(wrap))
    measure()
    let nestedFrame = 0
    const frame = requestAnimationFrame(() => {
      nestedFrame = requestAnimationFrame(() => setAnimate(true))
    })
    const observer = new ResizeObserver(measure)
    observer.observe(wrap)
    scroller?.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(nestedFrame)
      observer.disconnect()
      scroller?.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
    }
  }, [listKey, lightFill])

  useLayoutEffect(() => {
    writePill(measureActive(wrapRef.current))
  }, [activeSignal, accent, lightFill])

  const fill = lightFill ? "var(--v5-selected-fill)" : (accent || "var(--color-primary)")
  const svgHeight = pill ? pill.height + 2 * pill.radius : 0
  const motion = animate
    ? `transform ${SIDEBAR_MOTION}, width ${SIDEBAR_MOTION}, height ${SIDEBAR_MOTION}, background-color ${SIDEBAR_MOTION}`
    : "none"

  const list = (
    <ul
      data-sidebar-list-scroller={lightFill ? "true" : undefined}
      className={`relative z-10 space-y-1 ${lightFill ? "h-full min-h-0 m-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar px-4 py-3" : ""}`}
    >
      {items.map((item) => (
        <SidebarNavItem
          key={navItemKey(item)}
          item={item}
          isActive={isItemActive(item)}
          showPinControl={showPinControl && !!item.path}
          isPinned={isPinned(item)}
          pinLocked={pinLocked(item)}
          label={labelFor(item)}
          accent={accent}
          sharedFill
          lightFill={lightFill}
          onNavigate={onNavigate}
          onTogglePin={onTogglePin}
        />
      ))}
      {lightFill && showPinControl && items.length === 0 && emptyMessage && (
        <li className="mt-3 px-4 py-3 rounded-xl text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-light)]">
          {emptyMessage}
        </li>
      )}
    </ul>
  )

  if (lightFill) {
    return (
      <div
        key={listKey}
        ref={wrapRef}
        className="relative flex-1 min-h-0 w-full m-0 p-0 sidebar-list-in"
      >
        {pill && (
          <svg
            aria-hidden
            viewBox={`0 0 ${pill.totalWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            shapeRendering="geometricPrecision"
            className="absolute z-0 pointer-events-none motion-reduce:!transition-none"
            style={{
              top: 0,
              left: pill.left,
              width: pill.totalWidth,
              height: svgHeight,
              overflow: "visible",
              transform: `translateY(${pill.top - pill.radius}px)`,
              transition: animate ? `transform ${SIDEBAR_MOTION}, height ${SIDEBAR_MOTION}` : "none",
            }}
          >
            <path
              d={pill.path}
              fill={fill}
              className="motion-reduce:!transition-none"
              style={{ transition: animate ? `fill ${SIDEBAR_MOTION}` : "none" }}
            />
          </svg>
        )}
        {list}
      </div>
    )
  }

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar px-4 py-3 motion-reduce:!transition-none"
      style={{
        backgroundColor: tintBg || undefined,
        transition: `background-color ${SIDEBAR_MOTION}`,
      }}
    >
      <div key={listKey} ref={wrapRef} className="relative w-full sidebar-list-in">
        {pill && (
          <div
            aria-hidden
            className="absolute z-0 rounded-xl pointer-events-none motion-reduce:!transition-none"
            style={{
              top: 0,
              left: pill.left,
              width: pill.width,
              height: pill.height,
              transform: `translateY(${pill.top}px)`,
              backgroundColor: fill,
              boxShadow: `0 var(--spacing-1) var(--spacing-2) color-mix(in srgb, ${fill} 22%, transparent)`,
              transition: motion,
            }}
          />
        )}
        {list}
      </div>
      {showPinControl && items.length === 0 && emptyMessage && (
        <div className="mt-3 px-4 py-3 rounded-xl text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-light)]">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}

export default SidebarTabList
