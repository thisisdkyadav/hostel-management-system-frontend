import { useLayoutEffect, useRef, useState } from "react"
import SidebarNavItem from "./SidebarNavItem"
import { SIDEBAR_MOTION } from "./motion"

const navItemKey = (item) => item.path || item.name

const measureActive = (wrap) => {
  if (!wrap) return null
  const active = wrap.querySelector("[data-sidebar-active='true']")
  if (!active) return null
  const wrapRect = wrap.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  return {
    top: activeRect.top - wrapRect.top,
    left: activeRect.left - wrapRect.left,
    width: activeRect.width,
    height: activeRect.height,
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
  emptyMessage,
  listKey,
  activeSignal,
  onNavigate,
  onTogglePin,
}) => {
  const wrapRef = useRef(null)
  const [pill, setPill] = useState(null)
  const [animate, setAnimate] = useState(false)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return undefined

    setAnimate(false)
    setPill(measureActive(wrap))
    let nestedFrame = 0
    const frame = requestAnimationFrame(() => {
      nestedFrame = requestAnimationFrame(() => setAnimate(true))
    })
    const observer = new ResizeObserver(() => setPill(measureActive(wrap)))
    observer.observe(wrap)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(nestedFrame)
      observer.disconnect()
    }
  }, [listKey])

  useLayoutEffect(() => {
    setPill(measureActive(wrapRef.current))
  }, [activeSignal, accent, items])

  const fill = accent || "var(--color-primary)"

  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar px-4 py-3 motion-reduce:!transition-none"
      style={{
        backgroundColor: tintBg || undefined,
        transition: `background-color ${SIDEBAR_MOTION}`,
      }}
    >
      <div key={listKey} ref={wrapRef} className="relative sidebar-list-in">
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
              transition: animate
                ? `transform ${SIDEBAR_MOTION}, width ${SIDEBAR_MOTION}, height ${SIDEBAR_MOTION}, background-color ${SIDEBAR_MOTION}`
                : "none",
            }}
          />
        )}
        <ul className="relative z-10 space-y-1">
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
              onNavigate={onNavigate}
              onTogglePin={onTogglePin}
            />
          ))}
        </ul>
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
