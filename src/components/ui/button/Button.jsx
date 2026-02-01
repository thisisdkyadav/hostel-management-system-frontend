import React, { forwardRef, useCallback } from "react"
import PropTypes from "prop-types"
import { Button as CZeroButton } from "czero/react"

/**
 * Button Component - Wraps CZero Button with custom extensions
 * 
 * CZero handles: variants, sizes, loading, disabled states
 * Custom: rounded, fullWidth, animation, ripple effect
 */
const Button = forwardRef(({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  icon,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  gradient = false,
  rounded = false,
  keepTextOnMobile = false,
  animation = "none",
  className = "",
  style = {},
  ...rest
}, ref) => {

  // Map size names to CZero sizes
  const sizeMap = {
    small: "sm",
    medium: "md",
    large: "lg",
    sm: "sm",
    md: "md",
    lg: "lg",
  }

  // Determine effective variant (gradient is a variant in CZero)
  const effectiveVariant = gradient && variant === "primary" ? "gradient" : variant

  // Build custom class names for features CZero doesn't support
  const customClasses = [
    rounded && "!rounded-full",
    fullWidth && "w-full",
    animation === "pulse" && "hover:animate-pulse",
    animation === "glow" && "hover:shadow-[0_0_15px_rgba(19,96,171,0.7)]",
    animation === "ripple" && "relative overflow-hidden",
    "active:scale-[0.98]",
    className,
  ].filter(Boolean).join(" ")

  // Handle ripple effect
  const handleClick = useCallback((e) => {
    if (animation === "ripple" && !disabled && !isLoading) {
      const button = e.currentTarget
      const circle = document.createElement("span")
      const diameter = Math.max(button.clientWidth, button.clientHeight)
      const radius = diameter / 2
      const rect = button.getBoundingClientRect()

      circle.style.width = circle.style.height = `${diameter}px`
      circle.style.left = `${e.clientX - rect.left - radius}px`
      circle.style.top = `${e.clientY - rect.top - radius}px`
      circle.style.position = "absolute"
      circle.style.borderRadius = "50%"
      circle.style.transform = "scale(0)"
      circle.style.animation = "ripple-animation 600ms linear"
      circle.style.backgroundColor = "rgba(255, 255, 255, 0.7)"
      circle.style.pointerEvents = "none"
      circle.classList.add("ripple")

      const existingRipple = button.getElementsByClassName("ripple")[0]
      if (existingRipple) existingRipple.remove()

      button.appendChild(circle)
      setTimeout(() => circle.remove(), 600)
    }

    if (onClick) onClick(e)
  }, [animation, disabled, isLoading, onClick])

  return (
    <CZeroButton
      ref={ref}
      type={type}
      variant={effectiveVariant}
      size={sizeMap[size] || "md"}
      loading={isLoading}
      disabled={disabled}
      onClick={handleClick}
      className={customClasses}
      style={style}
      {...rest}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </CZeroButton>
  )
})

Button.displayName = "Button"

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "success", "outline", "white", "ghost", "gradient"]),
  size: PropTypes.oneOf(["small", "medium", "large", "sm", "md", "lg"]),
  className: PropTypes.string,
  icon: PropTypes.node,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  animation: PropTypes.oneOf(["none", "pulse", "bounce", "glow", "ripple"]),
  gradient: PropTypes.bool,
  rounded: PropTypes.bool,
  keepTextOnMobile: PropTypes.bool,
  style: PropTypes.object,
}

export default Button
