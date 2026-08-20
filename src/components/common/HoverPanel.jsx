import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "./HoverPanel.css"

const HoverPanelContext = createContext(null)

const GAP = 8
const VIEWPORT_PAD = 8

const canHoverFine = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches

const isNodeIn = (root, node) => Boolean(root && node && root.contains(node))

const isHoverPanelContent = (node) =>
  Boolean(node && typeof node.closest === "function" && node.closest(".hover-panel__content"))

const hitTest = (root, x, y) => {
  if (!root) return false
  const el = document.elementFromPoint(x, y)
  return isNodeIn(root, el)
}

/** Nested peeks portal to document.body, so a parent must treat those nodes as its own chrome. */
const isInsideHoverUi = (target, trigger) =>
  isNodeIn(trigger, target) || isHoverPanelContent(target)

const hitTestHoverUi = (trigger, panel, x, y) => {
  if (hitTest(trigger, x, y) || hitTest(panel, x, y)) return true
  return isHoverPanelContent(document.elementFromPoint(x, y))
}

const place = (trigger, panel, placement, align) => {
  const t = trigger.getBoundingClientRect()
  const p = panel.getBoundingClientRect()

  const alignX = () => {
    if (align === "start") return t.left
    if (align === "end") return t.right - p.width
    return t.left + (t.width - p.width) / 2
  }
  const alignY = () => {
    if (align === "start") return t.top
    if (align === "end") return t.bottom - p.height
    return t.top + (t.height - p.height) / 2
  }

  let top = 0
  let left = 0
  let used = placement

  if (placement === "auto") {
    const needed = p.height + GAP + VIEWPORT_PAD
    used = t.top >= needed ? "top" : "bottom"
  } else if (placement === "right" && t.right + GAP + p.width > window.innerWidth - VIEWPORT_PAD && t.left > window.innerWidth - t.right) {
    used = "left"
  } else if (placement === "left" && t.left - GAP - p.width < VIEWPORT_PAD && window.innerWidth - t.right > t.left) {
    used = "right"
  }

  switch (used) {
    case "top":
      top = t.top - p.height - GAP
      left = alignX()
      break
    case "left":
      top = alignY()
      left = t.left - p.width - GAP
      break
    case "right":
      top = alignY()
      left = t.right + GAP
      break
    default:
      top = t.bottom + GAP
      left = alignX()
  }

  left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - p.width - VIEWPORT_PAD))
  top = Math.max(VIEWPORT_PAD, Math.min(top, window.innerHeight - p.height - VIEWPORT_PAD))
  return { top, left }
}

/** Roots currently open. Opening one dismisses the others so a flick across tiles cannot stack leftovers. */
const openRoots = new Set()

export const dismissAllHoverPanels = () => {
  ;[...openRoots].forEach((close) => close())
}

/**
 * Hover-intent panel. Opens on hover or focus, stays open while the pointer
 * is over the trigger or the panel, and closes after a short delay so the
 * pointer can cross the gap. Nested panels keep their parent open; when the
 * last child closes the parent re-checks instead of staying stuck.
 *
 * On coarse pointers (touch) the first tap opens and a tap outside closes.
 * Unmounts its content when closed so unconfirmed edits die with it.
 */
const HoverPanel = ({
  children,
  content,
  placement = "auto",
  align = "center",
  portal = true,
  closeDelay = 120,
  openDelay = 120,
  onOpenChange,
  className = "",
  panelClassName = "",
}) => {
  const parent = useContext(HoverPanelContext)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const childCount = useRef(0)
  const pointerInside = useRef(false)
  const focusInside = useRef(false)
  const pointerMode = useRef(false)
  const openTimer = useRef(null)
  const closeTimer = useRef(null)
  const openRef = useRef(false)
  const parentRef = useRef(parent)
  const hoverableRef = useRef(canHoverFine())
  const activeChildClose = useRef(null)
  const onOpenChangeRef = useRef(onOpenChange)
  parentRef.current = parent
  hoverableRef.current = canHoverFine()
  onOpenChangeRef.current = onOpenChange

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }

  const blurIfInside = () => {
    const active = document.activeElement
    if (active === document.body || active === document.documentElement) return
    if (isNodeIn(triggerRef.current, active) || isNodeIn(panelRef.current, active)) {
      active.blur()
    }
  }

  // Focus on a switch/button must not pin a hover panel after the pointer has left.
  const shouldStayOpen = () => {
    if (pointerInside.current || childCount.current > 0) return true
    if (focusInside.current && !pointerMode.current) return true
    return false
  }

  const setOpenSafe = useCallback((next) => {
    if (openRef.current === next) return
    openRef.current = next
    setOpen(next)
    if (!next) setCoords(null)
    onOpenChangeRef.current?.(next)
  }, [])

  const forceClose = useCallback(() => {
    pointerInside.current = false
    focusInside.current = false
    pointerMode.current = false
    childCount.current = 0
    if (activeChildClose.current) {
      const child = activeChildClose.current
      activeChildClose.current = null
      child()
    }
    clearTimers()
    setOpenSafe(false)
  }, [setOpenSafe])

  const forceCloseRef = useRef(forceClose)
  forceCloseRef.current = forceClose

  const requestOpen = useCallback(() => {
    clearTimers()
    if (openDelay <= 0) {
      setOpenSafe(true)
      return
    }
    openTimer.current = setTimeout(() => setOpenSafe(true), openDelay)
  }, [openDelay, setOpenSafe])

  const requestClose = useCallback(() => {
    clearTimers()
    closeTimer.current = setTimeout(() => {
      if (shouldStayOpen()) return
      setOpenSafe(false)
    }, closeDelay)
  }, [closeDelay, setOpenSafe])

  const requestCloseRef = useRef(requestClose)
  requestCloseRef.current = requestClose

  const api = useMemo(
    () => ({
      hold: () => {
        childCount.current += 1
      },
      release: () => {
        childCount.current = Math.max(0, childCount.current - 1)
        if (!shouldStayOpen()) requestCloseRef.current()
      },
      claim: (closeFn) => {
        if (activeChildClose.current && activeChildClose.current !== closeFn) {
          activeChildClose.current()
        }
        activeChildClose.current = closeFn
      },
      unclaim: (closeFn) => {
        if (activeChildClose.current === closeFn) activeChildClose.current = null
      },
      close: () => forceCloseRef.current(),
      closeAll: () => {
        forceCloseRef.current()
        parentRef.current?.closeAll?.()
      },
    }),
    []
  )

  useEffect(() => {
    if (!parent || !open) return undefined
    const close = () => forceCloseRef.current()
    parent.hold()
    parent.claim?.(close)
    return () => {
      parent.unclaim?.(close)
      parent.release()
    }
  }, [open, parent])

  useEffect(() => {
    if (parent || !open) return undefined
    const entry = () => forceCloseRef.current()
    const others = [...openRoots]
    openRoots.add(entry)
    others.forEach((close) => close())
    return () => {
      openRoots.delete(entry)
    }
  }, [open, parent])

  const hoverable = hoverableRef.current

  const markPointerIn = () => {
    pointerMode.current = true
    pointerInside.current = true
    requestOpen()
  }

  const markPointerOut = () => {
    pointerInside.current = false
    if (hoverableRef.current) {
      focusInside.current = false
      blurIfInside()
    }
    requestClose()
  }

  const onTriggerClick = (event) => {
    if (hoverable) return
    event.preventDefault()
    if (openRef.current) {
      pointerInside.current = false
      setOpenSafe(false)
    } else {
      pointerInside.current = true
      setOpenSafe(true)
    }
  }

  const relatedInTree = (related) => isInsideHoverUi(related, triggerRef.current)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") forceClose()
    }
    const onPointerDown = (event) => {
      if (isInsideHoverUi(event.target, triggerRef.current)) return
      forceClose()
    }
    const syncPointer = (event) => {
      const over = hitTestHoverUi(triggerRef.current, panelRef.current, event.clientX, event.clientY)
      if (over) {
        pointerMode.current = true
        pointerInside.current = true
        if (closeTimer.current) {
          clearTimeout(closeTimer.current)
          closeTimer.current = null
        }
        return
      }
      pointerInside.current = false
      if (hoverableRef.current) {
        focusInside.current = false
      }
      if (!shouldStayOpen()) requestClose()
    }
    const onLost = () => {
      pointerInside.current = false
      focusInside.current = false
      if (!shouldStayOpen()) requestClose()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("pointermove", syncPointer, { passive: true })
    const onHidden = () => {
      if (document.hidden) onLost()
    }
    window.addEventListener("blur", onLost)
    document.addEventListener("visibilitychange", onHidden)
    document.documentElement.addEventListener("pointerleave", onLost)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("pointermove", syncPointer)
      window.removeEventListener("blur", onLost)
      document.removeEventListener("visibilitychange", onHidden)
      document.documentElement.removeEventListener("pointerleave", onLost)
    }
  }, [forceClose, open, requestClose])

  useEffect(() => {
    if (!open) return undefined
    const measure = () => {
      if (!triggerRef.current || !panelRef.current) return
      const next = place(triggerRef.current, panelRef.current, placement, align)
      setCoords((prev) => (prev && prev.top === next.top && prev.left === next.left ? prev : next))
    }
    measure()
    const frame = requestAnimationFrame(measure)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [align, open, placement])

  useEffect(() => () => clearTimers(), [])

  const panel = open ? (
    <div
      ref={panelRef}
      className={["hover-panel__content", panelClassName].filter(Boolean).join(" ")}
      data-ready={coords ? "true" : "false"}
      style={
        coords
          ? {
              top: coords.top,
              left: coords.left,
              zIndex: parent ? "calc(var(--popover-z) + 10)" : undefined,
            }
          : undefined
      }
      role="region"
      onPointerEnter={hoverable ? markPointerIn : undefined}
      onPointerLeave={hoverable ? markPointerOut : undefined}
      onFocusCapture={() => {
        focusInside.current = true
      }}
      onBlurCapture={(event) => {
        if (relatedInTree(event.relatedTarget)) return
        focusInside.current = false
        requestClose()
      }}
    >
      <HoverPanelContext.Provider value={api}>{content}</HoverPanelContext.Provider>
    </div>
  ) : null

  return (
    <div className={["hover-panel", className].filter(Boolean).join(" ")}>
      <div
        ref={triggerRef}
        className="hover-panel__trigger"
        onPointerEnter={hoverable ? markPointerIn : undefined}
        onPointerLeave={hoverable ? markPointerOut : undefined}
        onFocusCapture={() => {
          if (!hoverable) return
          focusInside.current = true
          requestOpen()
        }}
        onBlurCapture={(event) => {
          if (!hoverable) return
          if (relatedInTree(event.relatedTarget)) return
          focusInside.current = false
          markPointerOut()
        }}
        onClick={onTriggerClick}
      >
        {children}
      </div>
      {portal ? (typeof document !== "undefined" && panel ? createPortal(panel, document.body) : null) : panel}
    </div>
  )
}

/** Close this panel, or the whole nested stack (`closeAll`). */
export const useHoverPanel = () => useContext(HoverPanelContext)

export default HoverPanel
