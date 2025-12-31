import React, { forwardRef, useState } from "react"
import { FaTimes } from "react-icons/fa"

/**
 * Tag Component - Removable label/tag
 * 
 * @param {React.ReactNode} children - Tag content
 * @param {string} color - Color: default, primary, success, warning, danger, or custom hex
 * @param {string} size - Size: small, medium, large
 * @param {boolean} removable - Show remove button
 * @param {function} onRemove - Remove handler
 * @param {React.ReactNode} icon - Icon before text
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Tag = forwardRef(({
  children,
  color = "default",
  size = "medium",
  removable = false,
  onRemove,
  icon,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)

  const sizes = {
    small: {
      padding: "2px 6px",
      fontSize: "var(--font-size-xs)",
      gap: "var(--spacing-1)",
      iconSize: "10px",
    },
    medium: {
      padding: "4px 8px",
      fontSize: "var(--font-size-xs)",
      gap: "var(--spacing-1-5)",
      iconSize: "12px",
    },
    large: {
      padding: "6px 10px",
      fontSize: "var(--font-size-sm)",
      gap: "var(--spacing-2)",
      iconSize: "14px",
    },
  }

  const presetColors = {
    default: {
      background: "var(--color-bg-tertiary)",
      color: "var(--color-text-secondary)",
      borderColor: "var(--color-border-primary)",
    },
    primary: {
      background: "var(--color-primary-bg)",
      color: "var(--color-primary)",
      borderColor: "var(--color-primary)",
    },
    success: {
      background: "var(--color-success-bg)",
      color: "var(--color-success)",
      borderColor: "var(--color-success)",
    },
    warning: {
      background: "var(--color-warning-bg)",
      color: "var(--color-warning)",
      borderColor: "var(--color-warning)",
    },
    danger: {
      background: "var(--color-danger-bg)",
      color: "var(--color-danger)",
      borderColor: "var(--color-danger)",
    },
  }

  const currentSize = sizes[size] || sizes.medium
  const currentColor = presetColors[color] || {
    background: `${color}20`,
    color: color,
    borderColor: color,
  }

  const tagStyles = {
    display: "inline-flex",
    alignItems: "center",
    gap: currentSize.gap,
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: "var(--font-weight-medium)",
    borderRadius: "var(--radius-tag)",
    background: currentColor.background,
    color: currentColor.color,
    border: `1px solid ${currentColor.borderColor}`,
    whiteSpace: "nowrap",
    ...style,
  }

  const iconStyles = {
    display: "flex",
    alignItems: "center",
    fontSize: currentSize.iconSize,
  }

  const removeButtonStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    height: "16px",
    marginLeft: "var(--spacing-1)",
    marginRight: "-2px",
    borderRadius: "var(--radius-sm)",
    background: isHovered ? "rgba(0,0,0,0.1)" : "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    opacity: isHovered ? 1 : 0.7,
    transition: "var(--transition-colors)",
    padding: 0,
  }

  return (
    <span ref={ref} className={className} style={tagStyles} {...rest}>
      {icon && <span style={iconStyles}>{icon}</span>}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          style={removeButtonStyles}
          aria-label="Remove tag"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <FaTimes size={10} />
        </button>
      )}
    </span>
  )
})

Tag.displayName = "Tag"

export default Tag
