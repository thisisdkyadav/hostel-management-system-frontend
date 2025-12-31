import React, { forwardRef } from "react"

/**
 * Progress Component - Progress indicator
 * 
 * @param {number} value - Current progress value (0-100)
 * @param {number} max - Maximum value (default 100)
 * @param {string} variant - Style: default, striped, indeterminate
 * @param {string} size - Size: sm, md, lg
 * @param {string} color - Color: primary, success, warning, danger
 * @param {boolean} showLabel - Show percentage label
 * @param {string} label - Custom label
 * @param {boolean} animate - Animate striped variant
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Progress = forwardRef(({
  value = 0,
  max = 100,
  variant = "default",
  size = "md",
  color = "primary",
  showLabel = false,
  label,
  animate = true,
  className = "",
  style = {},
  ...rest
}, ref) => {

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: "4px",
    md: "8px",
    lg: "12px",
  }

  const colors = {
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
  }

  const containerStyles = {
    width: "100%",
    ...style,
  }

  const labelContainerStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "var(--spacing-1)",
  }

  const labelTextStyles = {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)",
  }

  const trackStyles = {
    width: "100%",
    height: sizes[size] || sizes.md,
    background: "var(--color-bg-tertiary)",
    borderRadius: "var(--radius-full)",
    overflow: "hidden",
  }

  const fillStyles = {
    height: "100%",
    width: variant === "indeterminate" ? "30%" : `${percentage}%`,
    background: colors[color] || colors.primary,
    borderRadius: "var(--radius-full)",
    transition: variant === "indeterminate" ? "none" : "width 0.3s ease",
    animation: variant === "indeterminate" 
      ? "indeterminate 1.5s ease-in-out infinite"
      : variant === "striped" && animate
        ? "stripe 1s linear infinite"
        : "none",
    backgroundImage: variant === "striped" 
      ? `linear-gradient(
          45deg,
          rgba(255,255,255,0.15) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255,255,255,0.15) 50%,
          rgba(255,255,255,0.15) 75%,
          transparent 75%,
          transparent
        )`
      : "none",
    backgroundSize: variant === "striped" ? "16px 16px" : "auto",
  }

  return (
    <>
      <style>
        {`
          @keyframes indeterminate {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
          @keyframes stripe {
            from { background-position: 0 0; }
            to { background-position: 16px 0; }
          }
        `}
      </style>
      <div ref={ref} className={className} style={containerStyles} {...rest}>
        {(showLabel || label) && (
          <div style={labelContainerStyles}>
            <span style={labelTextStyles}>{label || "Progress"}</span>
            {showLabel && <span style={labelTextStyles}>{Math.round(percentage)}%</span>}
          </div>
        )}
        <div
          style={trackStyles}
          role="progressbar"
          aria-valuenow={variant === "indeterminate" ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div style={fillStyles} />
        </div>
      </div>
    </>
  )
})

Progress.displayName = "Progress"

export default Progress
