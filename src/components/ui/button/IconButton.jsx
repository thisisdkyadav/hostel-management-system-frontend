import React, { forwardRef, useState } from "react"

/**
 * IconButton Component - Icon-only button
 * 
 * @param {React.ReactNode} icon - Button icon (required)
 * @param {function} onClick - Click handler
 * @param {string} type - Button type: button, submit, reset
 * @param {string} variant - Style variant: primary, secondary, danger, ghost, outline
 * @param {string} size - Size variant: small, medium, large
 * @param {boolean} isLoading - Loading state
 * @param {boolean} disabled - Disabled state
 * @param {string} ariaLabel - Accessibility label (required for icon-only buttons)
 * @param {boolean} rounded - Circular button (default true)
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const IconButton = forwardRef(({
  icon,
  onClick,
  type = "button",
  variant = "ghost",
  size = "medium",
  isLoading = false,
  disabled = false,
  ariaLabel,
  rounded = true,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const isDisabled = disabled || isLoading

  // Size configurations
  const sizes = {
    small: {
      size: "28px",
      iconSize: "14px",
      borderRadius: rounded ? "var(--radius-full)" : "var(--radius-sm)",
    },
    medium: {
      size: "36px",
      iconSize: "16px",
      borderRadius: rounded ? "var(--radius-full)" : "var(--radius-md)",
    },
    large: {
      size: "44px",
      iconSize: "20px",
      borderRadius: rounded ? "var(--radius-full)" : "var(--radius-lg)",
    },
  }

  const currentSize = sizes[size] || sizes.medium

  // Variant configurations
  const variants = {
    primary: {
      background: isActive ? "var(--color-primary-active)" : isHovered ? "var(--color-primary-hover)" : "var(--color-primary)",
      color: "white",
      border: "none",
    },
    secondary: {
      background: isHovered ? "var(--color-primary-bg-hover)" : "var(--color-primary-bg)",
      color: "var(--color-primary)",
      border: "none",
    },
    danger: {
      background: isActive ? "var(--color-danger-active)" : isHovered ? "var(--color-danger-hover)" : "var(--color-danger)",
      color: "white",
      border: "none",
    },
    ghost: {
      background: isHovered ? "var(--color-bg-hover)" : "transparent",
      color: isHovered ? "var(--color-primary)" : "var(--color-text-muted)",
      border: "none",
    },
    outline: {
      background: isHovered ? "var(--color-primary-bg)" : "transparent",
      color: "var(--color-primary)",
      border: "1px solid var(--color-primary)",
    },
  }

  const currentVariant = variants[variant] || variants.ghost

  // Button styles
  const buttonStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: currentSize.size,
    height: currentSize.size,
    padding: 0,
    borderRadius: currentSize.borderRadius,
    background: currentVariant.background,
    color: currentVariant.color,
    border: currentVariant.border,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: "var(--transition-all)",
    outline: "none",
    flexShrink: 0,
    ...style,
  }

  // Icon wrapper styles
  const iconWrapperStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: currentSize.iconSize,
  }

  // Spinner styles
  const spinnerStyles = {
    width: currentSize.iconSize,
    height: currentSize.iconSize,
    border: "2px solid currentColor",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  }

  const handleClick = (e) => {
    if (!isDisabled && onClick) {
      onClick(e)
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={isDisabled}
        className={className}
        style={buttonStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        aria-label={ariaLabel}
        {...rest}
      >
        {isLoading ? (
          <div style={spinnerStyles} />
        ) : (
          <span style={iconWrapperStyles}>{icon}</span>
        )}
      </button>
    </>
  )
})

IconButton.displayName = "IconButton"

export default IconButton
