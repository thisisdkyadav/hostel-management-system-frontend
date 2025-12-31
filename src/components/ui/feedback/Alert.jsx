import React, { forwardRef, useState } from "react"
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa"

/**
 * Alert Component - Static notification/message display
 * 
 * @param {React.ReactNode} children - Alert content
 * @param {string} type - Alert type: info, success, warning, error
 * @param {string} title - Optional title
 * @param {boolean} dismissible - Show close button
 * @param {function} onDismiss - Dismiss handler
 * @param {React.ReactNode} icon - Custom icon (overrides default)
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Alert = forwardRef(({
  children,
  type = "info",
  title,
  dismissible = false,
  onDismiss,
  icon: customIcon,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const variants = {
    info: {
      icon: <FaInfoCircle />,
      background: "var(--color-primary-bg)",
      borderColor: "var(--color-primary)",
      iconColor: "var(--color-primary)",
      titleColor: "var(--color-primary-dark)",
    },
    success: {
      icon: <FaCheckCircle />,
      background: "var(--color-success-bg)",
      borderColor: "var(--color-success)",
      iconColor: "var(--color-success)",
      titleColor: "var(--color-success-dark)",
    },
    warning: {
      icon: <FaExclamationTriangle />,
      background: "var(--color-warning-bg)",
      borderColor: "var(--color-warning)",
      iconColor: "var(--color-warning)",
      titleColor: "var(--color-warning-dark)",
    },
    error: {
      icon: <FaExclamationCircle />,
      background: "var(--color-danger-bg)",
      borderColor: "var(--color-danger)",
      iconColor: "var(--color-danger)",
      titleColor: "var(--color-danger-dark)",
    },
  }

  const currentVariant = variants[type] || variants.info

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    if (onDismiss) {
      onDismiss()
    }
  }

  const alertStyles = {
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--spacing-3)",
    padding: "var(--spacing-4)",
    background: currentVariant.background,
    borderRadius: "var(--radius-alert)",
    borderLeft: `4px solid ${currentVariant.borderColor}`,
    ...style,
  }

  const iconStyles = {
    flexShrink: 0,
    color: currentVariant.iconColor,
    fontSize: "var(--font-size-lg)",
    marginTop: "2px",
  }

  const contentStyles = {
    flex: 1,
    minWidth: 0,
  }

  const titleStyles = {
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-semibold)",
    color: currentVariant.titleColor,
    margin: 0,
    marginBottom: children ? "var(--spacing-1)" : 0,
  }

  const messageStyles = {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-body)",
    margin: 0,
    lineHeight: "1.5",
  }

  const closeButtonStyles = {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "var(--radius-sm)",
    background: isHovered ? "rgba(0,0,0,0.1)" : "transparent",
    border: "none",
    color: currentVariant.iconColor,
    cursor: "pointer",
    transition: "var(--transition-colors)",
    opacity: isHovered ? 1 : 0.7,
  }

  return (
    <div
      ref={ref}
      className={className}
      style={alertStyles}
      role="alert"
      {...rest}
    >
      <span style={iconStyles}>
        {customIcon || currentVariant.icon}
      </span>
      <div style={contentStyles}>
        {title && <p style={titleStyles}>{title}</p>}
        {children && <div style={messageStyles}>{children}</div>}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          style={closeButtonStyles}
          aria-label="Dismiss alert"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <FaTimes size={12} />
        </button>
      )}
    </div>
  )
})

Alert.displayName = "Alert"

export default Alert
