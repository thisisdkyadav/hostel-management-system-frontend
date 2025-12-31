import React, { forwardRef } from "react"

/**
 * Divider Component - Visual separator line
 * 
 * @param {string} orientation - Divider direction: horizontal, vertical
 * @param {string} variant - Style variant: solid, dashed, dotted
 * @param {string} color - Color: default, muted, primary
 * @param {string} spacing - Margin around divider: none, sm, md, lg
 * @param {React.ReactNode} children - Optional label in center
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Divider = forwardRef(({
  orientation = "horizontal",
  variant = "solid",
  color = "default",
  spacing = "md",
  children,
  className = "",
  style = {},
  ...rest
}, ref) => {

  const isHorizontal = orientation === "horizontal"

  // Spacing configurations
  const spacings = {
    none: 0,
    sm: "var(--spacing-2)",
    md: "var(--spacing-4)",
    lg: "var(--spacing-6)",
  }

  // Color configurations
  const colors = {
    default: "var(--color-border-primary)",
    muted: "var(--color-border-muted)",
    primary: "var(--color-primary)",
  }

  // Border style
  const borderStyle = `1px ${variant} ${colors[color] || colors.default}`

  // Container styles (for labeled divider)
  const containerStyles = {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-3)",
    marginTop: isHorizontal ? spacings[spacing] : 0,
    marginBottom: isHorizontal ? spacings[spacing] : 0,
    marginLeft: !isHorizontal ? spacings[spacing] : 0,
    marginRight: !isHorizontal ? spacings[spacing] : 0,
    ...style,
  }

  // Line styles
  const lineStyles = {
    flex: 1,
    height: isHorizontal ? 0 : "auto",
    width: isHorizontal ? "100%" : 0,
    borderTop: isHorizontal ? borderStyle : "none",
    borderLeft: !isHorizontal ? borderStyle : "none",
    alignSelf: !isHorizontal ? "stretch" : undefined,
  }

  // Label styles
  const labelStyles = {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)",
    flexShrink: 0,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  }

  // Simple divider without label
  if (!children) {
    const simpleStyles = {
      ...lineStyles,
      marginTop: isHorizontal ? spacings[spacing] : 0,
      marginBottom: isHorizontal ? spacings[spacing] : 0,
      marginLeft: !isHorizontal ? spacings[spacing] : 0,
      marginRight: !isHorizontal ? spacings[spacing] : 0,
      ...style,
    }

    return (
      <hr
        ref={ref}
        className={className}
        style={simpleStyles}
        role="separator"
        aria-orientation={orientation}
        {...rest}
      />
    )
  }

  // Labeled divider
  return (
    <div
      ref={ref}
      className={className}
      style={containerStyles}
      role="separator"
      aria-orientation={orientation}
      {...rest}
    >
      <div style={lineStyles} />
      <span style={labelStyles}>{children}</span>
      <div style={lineStyles} />
    </div>
  )
})

Divider.displayName = "Divider"

export default Divider
