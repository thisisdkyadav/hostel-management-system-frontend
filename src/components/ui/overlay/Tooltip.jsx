import React, { useState, useRef, useEffect, forwardRef } from "react"

/**
 * Tooltip Component - Hover/focus tooltip
 * 
 * @param {React.ReactNode} children - Trigger element
 * @param {string} content - Tooltip content
 * @param {string} placement - Position: top, bottom, left, right
 * @param {number} delay - Show delay in ms
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Tooltip = forwardRef(({
  children,
  content,
  placement = "top",
  delay = 200,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const offset = 8

    let top = 0
    let left = 0

    switch (placement) {
      case "top":
        top = triggerRect.top - tooltipRect.height - offset
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case "bottom":
        top = triggerRect.bottom + offset
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left - tooltipRect.width - offset
        break
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + offset
        break
    }

    // Keep within viewport
    const padding = 8
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))

    setPosition({ top, left })
  }

  useEffect(() => {
    if (isVisible) {
      calculatePosition()
    }
  }, [isVisible])

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const tooltipStyles = {
    position: "fixed",
    top: position.top,
    left: position.left,
    zIndex: 9999,
    padding: "var(--spacing-2) var(--spacing-3)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    color: "white",
    background: "var(--color-bg-tooltip)",
    borderRadius: "var(--radius-tooltip)",
    boxShadow: "var(--shadow-tooltip)",
    maxWidth: "250px",
    pointerEvents: "none",
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(-4px)",
    transition: "opacity 0.15s ease, transform 0.15s ease",
    ...style,
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ display: "inline-block" }}
      >
        {children}
      </span>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={className}
          style={tooltipStyles}
          role="tooltip"
          {...rest}
        >
          {content}
        </div>
      )}
    </>
  )
})

Tooltip.displayName = "Tooltip"

export default Tooltip
