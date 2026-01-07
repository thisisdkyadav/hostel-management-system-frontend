import React, { useEffect, useRef } from "react"
import { FaTimes } from "react-icons/fa"

/**
 * Drawer Component - Slide-in panel
 * 
 * @param {boolean} isOpen - Drawer visibility
 * @param {function} onClose - Close handler
 * @param {React.ReactNode} children - Drawer content
 * @param {string} title - Drawer title
 * @param {string} placement - Slide direction: left, right, top, bottom
 * @param {string} size - Width/height: small, medium, large, xlarge, full
 * @param {boolean} closeOnOverlay - Close when clicking overlay
 * @param {boolean} closeOnEsc - Close on escape key
 * @param {boolean} showCloseButton - Show close button
 * @param {React.ReactNode} footer - Footer content
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Drawer = ({
  isOpen,
  onClose,
  children,
  title,
  placement = "right",
  size = "medium",
  closeOnOverlay = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  className = "",
  style = {},
  ...rest
}) => {
  const drawerRef = useRef(null)

  const sizes = {
    small: "320px",
    medium: "400px",
    large: "560px",
    xlarge: "720px",
    full: "100%",
  }

  const isHorizontal = placement === "left" || placement === "right"
  const sizeValue = sizes[size] || sizes.medium

  // Handle escape key
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [closeOnEsc, isOpen, onClose])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const getTransform = (entering) => {
    if (!entering) return "translate(0)"
    switch (placement) {
      case "left": return "translateX(-100%)"
      case "right": return "translateX(100%)"
      case "top": return "translateY(-100%)"
      case "bottom": return "translateY(100%)"
      default: return "translateX(100%)"
    }
  }

  // Overlay styles
  const overlayStyles = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-out",
  }

  // Drawer container styles
  const drawerStyles = {
    position: "fixed",
    [placement]: 0,
    top: isHorizontal ? 0 : undefined,
    left: !isHorizontal ? 0 : undefined,
    bottom: placement === "top" ? undefined : 0,
    right: !isHorizontal ? 0 : undefined,
    width: isHorizontal ? sizeValue : "100%",
    height: isHorizontal ? "100%" : sizeValue,
    maxWidth: isHorizontal ? "calc(100vw - 48px)" : undefined,
    maxHeight: !isHorizontal ? "calc(100vh - 48px)" : undefined,
    backgroundColor: "var(--color-bg-primary)",
    boxShadow: "var(--shadow-modal)",
    display: "flex",
    flexDirection: "column",
    outline: "none",
    zIndex: 1001,
    animation: `slideIn${placement.charAt(0).toUpperCase() + placement.slice(1)} 0.3s ease-out`,
    ...style,
  }

  // Header styles
  const headerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--spacing-4) var(--spacing-5)",
    borderBottom: "1px solid var(--color-border-primary)",
    flexShrink: 0,
  }

  // Title styles
  const titleStyles = {
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-heading)",
    margin: 0,
  }

  // Close button styles
  const closeButtonStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "var(--radius-full)",
    background: "transparent",
    border: "none",
    color: "var(--color-text-muted)",
    cursor: "pointer",
    transition: "var(--transition-colors)",
  }

  // Content styles
  const contentStyles = {
    padding: "var(--spacing-5)",
    overflowY: "auto",
    flex: 1,
  }

  // Footer styles
  const footerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "var(--spacing-3)",
    padding: "var(--spacing-4) var(--spacing-5)",
    borderTop: "1px solid var(--color-border-primary)",
    flexShrink: 0,
  }

  const handleOverlayClick = () => {
    if (closeOnOverlay) {
      onClose()
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          @keyframes slideInTop {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
          }
          @keyframes slideInBottom {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}
      </style>
      <div style={overlayStyles} onClick={handleOverlayClick} aria-hidden="true" />
      <div
        ref={drawerRef}
        className={className}
        style={drawerStyles}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        tabIndex={-1}
        {...rest}
      >
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 id="drawer-title" style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={closeButtonStyles}
                aria-label="Close drawer"
                onMouseEnter={(e) => {
                  e.target.style.background = "var(--color-bg-hover)"
                  e.target.style.color = "var(--color-text-primary)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent"
                  e.target.style.color = "var(--color-text-muted)"
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>
        )}
        <div style={contentStyles}>{children}</div>
        {footer && <div style={footerStyles}>{footer}</div>}
      </div>
    </>
  )
}

Drawer.displayName = "Drawer"

export default Drawer
