import React, { forwardRef } from "react"

/**
 * Heading Component - Typography heading
 * 
 * @param {React.ReactNode} children - Heading content
 * @param {string} as - HTML element: h1, h2, h3, h4, h5, h6
 * @param {string} size - Size override: xs, sm, md, lg, xl, 2xl, 3xl, 4xl
 * @param {string} weight - Font weight: normal, medium, semibold, bold
 * @param {string} color - Color: default, muted, primary, success, warning, danger
 * @param {string} align - Text align: left, center, right
 * @param {boolean} truncate - Truncate with ellipsis
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Heading = forwardRef(({
  children,
  as: Component = "h2",
  size,
  weight = "semibold",
  color = "default",
  align,
  truncate = false,
  className = "",
  style = {},
  ...rest
}, ref) => {

  // Default sizes based on heading level
  const defaultSizes = {
    h1: "3xl",
    h2: "2xl",
    h3: "xl",
    h4: "lg",
    h5: "md",
    h6: "sm",
  }

  const sizes = {
    xs: "var(--font-size-xs)",
    sm: "var(--font-size-sm)",
    md: "var(--font-size-base)",
    lg: "var(--font-size-lg)",
    xl: "var(--font-size-xl)",
    "2xl": "var(--font-size-2xl)",
    "3xl": "var(--font-size-3xl)",
    "4xl": "var(--font-size-4xl)",
  }

  const weights = {
    normal: "var(--font-weight-normal)",
    medium: "var(--font-weight-medium)",
    semibold: "var(--font-weight-semibold)",
    bold: "var(--font-weight-bold)",
  }

  const colors = {
    default: "var(--color-text-heading)",
    muted: "var(--color-text-muted)",
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
  }

  const resolvedSize = size || defaultSizes[Component] || "lg"

  const headingStyles = {
    fontSize: sizes[resolvedSize] || sizes.lg,
    fontWeight: weights[weight] || weights.semibold,
    color: colors[color] || colors.default,
    textAlign: align,
    margin: 0,
    lineHeight: 1.3,
    ...(truncate && {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    ...style,
  }

  return (
    <Component ref={ref} className={className} style={headingStyles} {...rest}>
      {children}
    </Component>
  )
})

Heading.displayName = "Heading"

export default Heading
