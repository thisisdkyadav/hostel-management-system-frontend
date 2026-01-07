import React, { forwardRef } from "react"

/**
 * Stack Component - Flexbox layout with gap
 * 
 * @param {React.ReactNode} children - Stack items
 * @param {string} direction - Flex direction: row, column, row-reverse, column-reverse
 * @param {string} gap - Gap size: none, xsmall, small, medium, large, xlarge
 * @param {string} align - Align items: start, center, end, stretch, baseline
 * @param {string} justify - Justify content: start, center, end, between, around, evenly
 * @param {boolean} wrap - Flex wrap
 * @param {boolean} inline - Display inline-flex
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Stack = forwardRef(({
  children,
  direction = "column",
  gap = "medium",
  align = "stretch",
  justify = "start",
  wrap = false,
  inline = false,
  className = "",
  style = {},
  ...rest
}, ref) => {

  // Gap configurations
  const gaps = {
    none: 0,
    xsmall: "var(--spacing-1)",
    small: "var(--spacing-2)",
    medium: "var(--spacing-4)",
    large: "var(--spacing-6)",
    xlarge: "var(--spacing-8)",
  }

  // Align items mapping
  const alignItems = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    baseline: "baseline",
  }

  // Justify content mapping
  const justifyContent = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
  }

  // Stack styles
  const stackStyles = {
    display: inline ? "inline-flex" : "flex",
    flexDirection: direction,
    gap: gaps[gap] || gap,
    alignItems: alignItems[align] || align,
    justifyContent: justifyContent[justify] || justify,
    flexWrap: wrap ? "wrap" : "nowrap",
    ...style,
  }

  return (
    <div ref={ref} className={className} style={stackStyles} {...rest}>
      {children}
    </div>
  )
})

Stack.displayName = "Stack"

// HStack - Horizontal Stack shorthand
export const HStack = forwardRef((props, ref) => (
  <Stack ref={ref} direction="row" {...props} />
))
HStack.displayName = "HStack"

// VStack - Vertical Stack shorthand
export const VStack = forwardRef((props, ref) => (
  <Stack ref={ref} direction="column" {...props} />
))
VStack.displayName = "VStack"

export default Stack
