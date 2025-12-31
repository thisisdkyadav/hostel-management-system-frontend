import React, { forwardRef } from "react"

/**
 * ButtonGroup Component - Group of related buttons
 * 
 * @param {React.ReactNode} children - Button children
 * @param {string} orientation - Layout: horizontal, vertical
 * @param {string} size - Size passed to children: small, medium, large
 * @param {string} variant - Variant passed to children
 * @param {boolean} attached - Buttons are attached (no gap)
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const ButtonGroup = forwardRef(({
  children,
  orientation = "horizontal",
  size,
  variant,
  attached = false,
  className = "",
  style = {},
  ...rest
}, ref) => {

  // Container styles
  const containerStyles = {
    display: "inline-flex",
    flexDirection: orientation === "vertical" ? "column" : "row",
    gap: attached ? 0 : "var(--spacing-2)",
    ...style,
  }

  // Clone children and apply shared props
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child

    const isFirst = index === 0
    const isLast = index === React.Children.count(children) - 1

    // Styles for attached buttons
    let attachedStyles = {}
    if (attached) {
      if (orientation === "horizontal") {
        attachedStyles = {
          borderRadius: isFirst
            ? "var(--radius-button-md) 0 0 var(--radius-button-md)"
            : isLast
              ? "0 var(--radius-button-md) var(--radius-button-md) 0"
              : 0,
          marginLeft: isFirst ? 0 : "-1px",
        }
      } else {
        attachedStyles = {
          borderRadius: isFirst
            ? "var(--radius-button-md) var(--radius-button-md) 0 0"
            : isLast
              ? "0 0 var(--radius-button-md) var(--radius-button-md)"
              : 0,
          marginTop: isFirst ? 0 : "-1px",
        }
      }
    }

    return React.cloneElement(child, {
      size: child.props.size || size,
      variant: child.props.variant || variant,
      style: {
        ...attachedStyles,
        ...child.props.style,
      },
    })
  })

  return (
    <div
      ref={ref}
      role="group"
      className={className}
      style={containerStyles}
      {...rest}
    >
      {enhancedChildren}
    </div>
  )
})

ButtonGroup.displayName = "ButtonGroup"

export default ButtonGroup
