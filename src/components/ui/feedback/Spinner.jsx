import React, { forwardRef } from "react"

/**
 * Spinner Component - Loading indicator
 * 
 * @param {string} size - Size: xsmall, small, medium, large, xlarge
 * @param {string} color - Color: primary, secondary, white, inherit
 * @param {string} thickness - Border thickness: thin, medium, thick
 * @param {string} label - Accessibility label
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Spinner = forwardRef(({
  size = "medium",
  color = "primary",
  thickness = "medium",
  label = "Loading",
  className = "",
  style = {},
  ...rest
}, ref) => {

  const sizes = {
    xsmall: "12px",
    small: "16px",
    medium: "24px",
    large: "32px",
    xlarge: "48px",
  }

  const colors = {
    primary: "var(--color-primary)",
    secondary: "var(--color-text-muted)",
    white: "white",
    inherit: "currentColor",
  }

  const thicknesses = {
    thin: "2px",
    medium: "3px",
    thick: "4px",
  }

  const spinnerSize = sizes[size] || sizes.medium
  const spinnerColor = colors[color] || colors.primary
  const borderWidth = thicknesses[thickness] || thicknesses.medium

  const spinnerStyles = {
    display: "inline-block",
    width: spinnerSize,
    height: spinnerSize,
    border: `${borderWidth} solid transparent`,
    borderTopColor: spinnerColor,
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    ...style,
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
      <div
        ref={ref}
        className={className}
        style={spinnerStyles}
        role="status"
        aria-label={label}
        {...rest}
      >
        <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 }}>
          {label}
        </span>
      </div>
    </>
  )
})

Spinner.displayName = "Spinner"

export default Spinner
