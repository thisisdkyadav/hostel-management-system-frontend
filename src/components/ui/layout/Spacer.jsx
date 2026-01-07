import React, { forwardRef } from "react"

/**
 * Spacer Component - Flexible spacing element
 * 
 * @param {string|number} size - Fixed size (e.g., "16px", "2rem", 32)
 * @param {string} axis - Direction: horizontal, vertical, both
 * @param {boolean} flex - Use flex grow to fill space
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Spacer = forwardRef(({
  size,
  axis = "vertical",
  flex = false,
  className = "",
  style = {},
  ...rest
}, ref) => {

  // Predefined sizes
  const sizes = {
    xsmall: "var(--spacing-1)",
    small: "var(--spacing-2)",
    medium: "var(--spacing-4)",
    large: "var(--spacing-6)",
    xlarge: "var(--spacing-8)",
  }

  const resolvedSize = sizes[size] || size

  // Spacer styles
  const spacerStyles = flex
    ? {
        flex: 1,
        alignSelf: "stretch",
        justifySelf: "stretch",
        ...style,
      }
    : {
        width: axis === "horizontal" || axis === "both" ? resolvedSize : 1,
        height: axis === "vertical" || axis === "both" ? resolvedSize : 1,
        minWidth: axis === "horizontal" || axis === "both" ? resolvedSize : 1,
        minHeight: axis === "vertical" || axis === "both" ? resolvedSize : 1,
        flexShrink: 0,
        ...style,
      }

  return (
    <div
      ref={ref}
      className={className}
      style={spacerStyles}
      aria-hidden="true"
      {...rest}
    />
  )
})

Spacer.displayName = "Spacer"

export default Spacer
