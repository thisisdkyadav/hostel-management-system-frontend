import React, { forwardRef } from "react"

/**
 * Badge Component - Small label/indicator
 * 
 * @param {React.ReactNode} children - Badge content
 * @param {string} variant - Color variant: default, primary, success, warning, danger, info
 * @param {string} size - Size: small, medium, large
 * @param {boolean} dot - Show as dot indicator
 * @param {boolean} outline - Outlined style
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Badge = forwardRef(({
  children,
  variant = "default",
  size = "medium",
  dot = false,
  outline = false,
  className = "",
  style = {},
  ...rest
}, ref) => {

  const sizes = {
    small: {
      padding: dot ? 0 : "1px 6px",
      fontSize: "var(--font-size-xs)",
      height: dot ? "6px" : "auto",
      width: dot ? "6px" : "auto",
      minWidth: dot ? "6px" : "auto",
    },
    medium: {
      padding: dot ? 0 : "2px 8px",
      fontSize: "var(--font-size-xs)",
      height: dot ? "8px" : "auto",
      width: dot ? "8px" : "auto",
      minWidth: dot ? "8px" : "auto",
    },
    large: {
      padding: dot ? 0 : "4px 10px",
      fontSize: "var(--font-size-sm)",
      height: dot ? "10px" : "auto",
      width: dot ? "10px" : "auto",
      minWidth: dot ? "10px" : "auto",
    },
  }

  const variants = {
    default: {
      background: outline ? "transparent" : "var(--color-bg-tertiary)",
      color: "var(--color-text-muted)",
      border: outline ? "1px solid var(--color-border-primary)" : "none",
    },
    primary: {
      background: outline ? "transparent" : "var(--color-primary-bg)",
      color: "var(--color-primary)",
      border: outline ? "1px solid var(--color-primary)" : "none",
    },
    success: {
      background: outline ? "transparent" : "var(--color-success-bg)",
      color: "var(--color-success)",
      border: outline ? "1px solid var(--color-success)" : "none",
    },
    warning: {
      background: outline ? "transparent" : "var(--color-warning-bg)",
      color: "var(--color-warning)",
      border: outline ? "1px solid var(--color-warning)" : "none",
    },
    danger: {
      background: outline ? "transparent" : "var(--color-danger-bg)",
      color: "var(--color-danger)",
      border: outline ? "1px solid var(--color-danger)" : "none",
    },
    info: {
      background: outline ? "transparent" : "var(--color-primary-bg)",
      color: "var(--color-primary)",
      border: outline ? "1px solid var(--color-primary)" : "none",
    },
  }

  const currentSize = sizes[size] || sizes.medium
  const currentVariant = variants[variant] || variants.default

  const badgeStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: "var(--font-weight-medium)",
    borderRadius: dot ? "var(--radius-full)" : "var(--radius-badge)",
    background: currentVariant.background,
    color: currentVariant.color,
    border: currentVariant.border,
    whiteSpace: "nowrap",
    ...(dot && {
      height: currentSize.height,
      width: currentSize.width,
      minWidth: currentSize.minWidth,
    }),
    ...style,
  }

  return (
    <span ref={ref} className={className} style={badgeStyles} {...rest}>
      {!dot && children}
    </span>
  )
})

Badge.displayName = "Badge"

export default Badge
