import React, { forwardRef } from "react"

/**
 * Skeleton Component - Loading placeholder
 * 
 * @param {string} variant - Shape: text, circular, rectangular, rounded
 * @param {string|number} width - Width (default auto)
 * @param {string|number} height - Height (default based on variant)
 * @param {boolean} animation - Enable pulse animation
 * @param {number} lines - Number of text lines (for text variant)
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Skeleton = forwardRef(({
  variant = "text",
  width,
  height,
  animation = true,
  lines = 1,
  className = "",
  style = {},
  ...rest
}, ref) => {

  const defaultHeights = {
    text: "1em",
    circular: "40px",
    rectangular: "100px",
    rounded: "100px",
  }

  const defaultWidths = {
    text: "100%",
    circular: "40px",
    rectangular: "100%",
    rounded: "100%",
  }

  const borderRadii = {
    text: "var(--radius-sm)",
    circular: "var(--radius-full)",
    rectangular: 0,
    rounded: "var(--radius-md)",
  }

  const skeletonStyles = {
    display: "block",
    width: width || defaultWidths[variant],
    height: height || defaultHeights[variant],
    borderRadius: borderRadii[variant],
    background: "linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 75%)",
    backgroundSize: "200% 100%",
    animation: animation ? "shimmer 1.5s ease-in-out infinite" : "none",
    ...style,
  }

  // Render multiple lines for text variant
  if (variant === "text" && lines > 1) {
    const containerStyles = {
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-2)",
    }

    return (
      <>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
        <div ref={ref} className={className} style={containerStyles} {...rest}>
          {Array.from({ length: lines }).map((_, index) => (
            <span
              key={index}
              style={{
                ...skeletonStyles,
                // Last line shorter for natural appearance
                width: index === lines - 1 ? "75%" : "100%",
              }}
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      <span
        ref={ref}
        className={className}
        style={skeletonStyles}
        {...rest}
      />
    </>
  )
})

Skeleton.displayName = "Skeleton"

// SkeletonText - Shorthand for text skeleton
export const SkeletonText = forwardRef((props, ref) => (
  <Skeleton ref={ref} variant="text" {...props} />
))
SkeletonText.displayName = "SkeletonText"

// SkeletonCircle - Shorthand for circular skeleton
export const SkeletonCircle = forwardRef(({ size = "40px", ...props }, ref) => (
  <Skeleton ref={ref} variant="circular" width={size} height={size} {...props} />
))
SkeletonCircle.displayName = "SkeletonCircle"

// SkeletonCard - Card-shaped skeleton
export const SkeletonCard = forwardRef(({ width = "100%", height = "200px", ...props }, ref) => (
  <Skeleton ref={ref} variant="rounded" width={width} height={height} style={{ borderRadius: "var(--radius-card)" }} {...props} />
))
SkeletonCard.displayName = "SkeletonCard"

export default Skeleton
