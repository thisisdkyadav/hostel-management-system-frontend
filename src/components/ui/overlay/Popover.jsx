import React, { useState, useRef, useEffect, forwardRef } from "react"

/**
 * Popover Component - Click-triggered overlay
 * 
 * @param {React.ReactNode} children - Trigger element
 * @param {React.ReactNode} content - Popover content
 * @param {string} placement - Position: top, bottom, left, right
 * @param {string} trigger - Trigger type: click, hover
 * @param {boolean} isOpen - Controlled open state
 * @param {function} onOpenChange - Open state change handler
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Popover = forwardRef(({
  children,
  content,
  placement = "bottom",
  trigger = "click",
  isOpen: controlledOpen,
  onOpenChange,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const setOpen = (value) => {
    if (isControlled) {
      onOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }

  const calculatePosition = () => {
    if (!triggerRef.current || !popoverRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const popoverRect = popoverRef.current.getBoundingClientRect()
    const offset = 8

    let top = 0
    let left = 0

    switch (placement) {
      case "top":
        top = triggerRect.top - popoverRect.height - offset
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
        break
      case "bottom":
        top = triggerRect.bottom + offset
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
        break
      case "left":
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
        left = triggerRect.left - popoverRect.width - offset
        break
      case "right":
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
        left = triggerRect.right + offset
        break
    }

    // Keep within viewport
    const padding = 8
    left = Math.max(padding, Math.min(left, window.innerWidth - popoverRect.width - padding))
    top = Math.max(padding, Math.min(top, window.innerHeight - popoverRect.height - padding))

    setPosition({ top, left })
  }

  useEffect(() => {
    if (isOpen) {
      // Delay to allow content to render
      setTimeout(calculatePosition, 0)
      
      // Recalculate on scroll/resize
      window.addEventListener("scroll", calculatePosition, true)
      window.addEventListener("resize", calculatePosition)
      
      return () => {
        window.removeEventListener("scroll", calculatePosition, true)
        window.removeEventListener("resize", calculatePosition)
      }
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen || trigger !== "click") return

    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, trigger])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  const handleTriggerClick = () => {
    if (trigger === "click") {
      setOpen(!isOpen)
    }
  }

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setOpen(false)
    }
  }

  const popoverStyles = {
    position: "fixed",
    top: position.top,
    left: position.left,
    zIndex: 1000,
    padding: "var(--spacing-3)",
    background: "var(--color-bg-primary)",
    borderRadius: "var(--radius-popover)",
    boxShadow: "var(--shadow-popover)",
    border: "1px solid var(--color-border-primary)",
    minWidth: "200px",
    maxWidth: "320px",
    animation: "popoverIn 0.15s ease-out",
    ...style,
  }

  return (
    <>
      <style>
        {`
          @keyframes popoverIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
      <span
        ref={triggerRef}
        onClick={handleTriggerClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: "inline-block", cursor: "pointer" }}
      >
        {children}
      </span>
      {isOpen && (
        <div
          ref={popoverRef}
          className={className}
          style={popoverStyles}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...rest}
        >
          {content}
        </div>
      )}
    </>
  )
})

Popover.displayName = "Popover"

export default Popover
