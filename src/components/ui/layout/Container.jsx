import React, { forwardRef } from "react"

/**
 * Container Component - Centered content container with max-width
 * 
 * @param {React.ReactNode} children - Container content
 * @param {string} size - Max width size: small, medium, large, xlarge, xxlarge, full
 * @param {boolean} centered - Center content horizontally
 * @param {string} padding - Horizontal padding: none, small, medium, large
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Container = forwardRef(({
  children,
  size = "large",
  centered = true,
  padding = "medium",
  className = "",
  style = {},
  ...rest
}, ref) => {

  // Max-width configurations
  const sizes = {
    small: "640px",
    medium: "768px",
    large: "1024px",
    xlarge: "1280px",
    xxlarge: "1536px",
    full: "100%",
  }

  // Padding configurations
  const paddings = {
    none: 0,
    small: "var(--spacing-3)",
    medium: "var(--spacing-4)",
    large: "var(--spacing-6)",
  }

  // Container styles
  const containerStyles = {
    width: "100%",
    maxWidth: sizes[size] || sizes.large,
    marginLeft: centered ? "auto" : undefined,
    marginRight: centered ? "auto" : undefined,
    paddingLeft: paddings[padding],
    paddingRight: paddings[padding],
    ...style,
  }

  return (
    <div ref={ref} className={className} style={containerStyles} {...rest}>
      {children}
    </div>
  )
})

Container.displayName = "Container"

export default Container
