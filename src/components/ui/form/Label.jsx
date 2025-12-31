import React, { forwardRef } from "react"

/**
 * Label Component - Form field label
 * 
 * @param {string} htmlFor - Associated input id
 * @param {React.ReactNode} children - Label text
 * @param {boolean} required - Show required indicator
 * @param {boolean} disabled - Disabled styling
 * @param {string} size - Size variant: sm, md, lg
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Label = forwardRef(({
  htmlFor,
  children,
  required = false,
  disabled = false,
  size = "md",
  className = "",
  style = {},
  ...rest
}, ref) => {
  // Size mappings
  const sizes = {
    sm: {
      fontSize: "var(--font-size-xs)",
      marginBottom: "var(--spacing-1)",
    },
    md: {
      fontSize: "var(--font-size-sm)",
      marginBottom: "var(--spacing-1-5)",
    },
    lg: {
      fontSize: "var(--font-size-base)",
      marginBottom: "var(--spacing-2)",
    },
  }

  const currentSize = sizes[size] || sizes.md

  const labelStyles = {
    display: "block",
    fontSize: currentSize.fontSize,
    fontWeight: "var(--font-weight-medium)",
    color: disabled ? "var(--color-text-disabled)" : "var(--color-text-secondary)",
    marginBottom: currentSize.marginBottom,
    ...style,
  }

  const requiredStyles = {
    color: "var(--color-danger)",
    marginLeft: "var(--spacing-0-5)",
  }

  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      style={labelStyles}
      className={className}
      {...rest}
    >
      {children}
      {required && <span style={requiredStyles} aria-hidden="true">*</span>}
    </label>
  )
})

Label.displayName = "Label"

export default Label
