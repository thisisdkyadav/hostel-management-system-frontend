import React, { forwardRef } from "react"

/**
 * Text Component - Typography text
 * 
 * @param {React.ReactNode} children - Text content
 * @param {string} as - HTML element: p, span, div, label
 * @param {string} size - Size: xs, sm, md, lg, xl
 * @param {string} weight - Font weight: normal, medium, semibold, bold
 * @param {string} color - Color: default, muted, secondary, primary, success, warning, danger
 * @param {string} align - Text align: left, center, right, justify
 * @param {boolean} truncate - Truncate with ellipsis
 * @param {number} lineClamp - Number of lines before truncating
 * @param {boolean} italic - Italic style
 * @param {boolean} underline - Underline style
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Text = forwardRef(({
  children,
  as: Component = "p",
  size = "md",
  weight = "normal",
  color = "default",
  align,
  truncate = false,
  lineClamp,
  italic = false,
  underline = false,
  className = "",
  style = {},
  ...rest
}, ref) => {

  const sizes = {
    xs: "var(--font-size-xs)",
    sm: "var(--font-size-sm)",
    md: "var(--font-size-base)",
    lg: "var(--font-size-lg)",
    xl: "var(--font-size-xl)",
  }

  const weights = {
    normal: "var(--font-weight-normal)",
    medium: "var(--font-weight-medium)",
    semibold: "var(--font-weight-semibold)",
    bold: "var(--font-weight-bold)",
  }

  const colors = {
    default: "var(--color-text-body)",
    muted: "var(--color-text-muted)",
    secondary: "var(--color-text-secondary)",
    heading: "var(--color-text-heading)",
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
  }

  const textStyles = {
    fontSize: sizes[size] || sizes.md,
    fontWeight: weights[weight] || weights.normal,
    color: colors[color] || colors.default,
    textAlign: align,
    fontStyle: italic ? "italic" : "normal",
    textDecoration: underline ? "underline" : "none",
    margin: Component === "p" ? "0" : undefined,
    lineHeight: 1.5,
    ...(truncate && !lineClamp && {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    ...(lineClamp && {
      display: "-webkit-box",
      WebkitLineClamp: lineClamp,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    }),
    ...style,
  }

  return (
    <Component ref={ref} className={className} style={textStyles} {...rest}>
      {children}
    </Component>
  )
})

Text.displayName = "Text"

export default Text
