import React, { forwardRef, useState } from "react"
import PropTypes from "prop-types"

/**
 * Button Component - Matches existing design language
 * 
 * @param {React.ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {string} type - Button type: button, submit, reset
 * @param {string} variant - Style variant: primary, secondary, danger, success, outline, ghost, white
 * @param {string} size - Size variant: small, medium, large
 * @param {React.ReactNode} icon - Optional icon
 * @param {boolean} isLoading - Loading state
 * @param {boolean} disabled - Disabled state
 * @param {boolean} fullWidth - Full width button
 * @param {boolean} gradient - Use gradient background (primary only)
 * @param {boolean} rounded - Pill-shaped button
 * @param {boolean} keepTextOnMobile - If true, keeps text visible on mobile (prevents icon-only mode)
 * @param {string} animation - Animation type: none, pulse, bounce, glow, ripple
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
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
  const [isHovered, setIsHovered] = useState(false)

  // Border radius based on size and rounded prop
  const radiusClasses = {
    small: rounded ? "rounded-[var(--radius-button)]" : "rounded-[var(--radius-button-sm)]",
    medium: rounded ? "rounded-[var(--radius-button)]" : "rounded-[var(--radius-button-md)]",
    large: rounded ? "rounded-[var(--radius-button)]" : "rounded-[var(--radius-button-lg)]",
  }

  // Base classes
  const baseClasses = `
    ${radiusClasses[size]} font-medium transition-all duration-200 
    flex items-center justify-center gap-2
    disabled:cursor-not-allowed disabled:opacity-60
    relative overflow-hidden
    focus:outline-none
    focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2
    active:scale-[0.98]
  `

  // Variant classes using CSS variables
  const variantClasses = {
    primary: gradient ? `text-white disabled:opacity-50` : `bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50`,
    secondary: `
      bg-[var(--color-primary-bg)] text-[var(--color-primary)]
      hover:bg-[var(--color-primary-bg-hover)]
    `,
    danger: `
      bg-[var(--color-danger)] text-white 
      hover:bg-[var(--color-danger-hover)]
      disabled:opacity-50
    `,
    success: `
      bg-[var(--color-success)] text-white 
      hover:bg-[var(--color-success-hover)]
      disabled:opacity-50
    `,
    outline: `
      bg-[var(--color-bg-primary)] text-[var(--color-primary)]
      border-2 border-[var(--color-primary)]
      hover:bg-[var(--color-primary-bg)]
    `,
    white: `
      bg-[var(--color-bg-primary)] text-[var(--color-text-body)]
      border border-[var(--color-border-primary)]
      hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]
    `,
    ghost: `
      bg-transparent text-[var(--color-text-muted)]
      hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-primary)]
    `,
  }

  const sizeClasses = {
    small: "py-2 px-4",
    medium: "py-2.5 px-5",
    large: "py-3 px-6",
  }

  const sizeStyles = {
    small: { fontSize: "var(--font-size-xs)" },
    medium: { fontSize: "var(--font-size-base)" },
    large: { fontSize: "var(--font-size-lg)" },
  }

  const widthClasses = fullWidth ? "w-full" : ""

  // Animation classes
  const animationClasses = {
    none: "",
    pulse: "hover:animate-pulse",
    bounce: "",
    glow: "hover:shadow-glow",
    ripple: "ripple-effect",
  }

  const buttonClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${widthClasses} 
    ${animationClasses[animation] || ""} 
    ${className}
  `
    .replace(/\s+/g, " ")
    .trim()

  // Combined styles
  const combinedStyle = {
    ...sizeStyles[size],
    ...(gradient && variant === "primary"
      ? {
        background: "var(--gradient-primary)",
        boxShadow: isHovered ? "var(--shadow-button-primary-hover)" : "var(--shadow-button-primary)",
        transition: "var(--transition-all)",
      }
      : {}),
    ...style,
  }

  const handleClick = (e) => {
    // Create ripple effect if animation is ripple
    if (animation === "ripple" && !disabled && !isLoading) {
      const button = e.currentTarget
      const circle = document.createElement("span")
      const diameter = Math.max(button.clientWidth, button.clientHeight)
      const radius = diameter / 2

      circle.style.width = circle.style.height = `${diameter}px`
      circle.style.left = `${e.clientX - button.offsetLeft - radius}px`
      circle.style.top = `${e.clientY - button.offsetTop - radius}px`
      circle.classList.add("ripple")

      const ripple = button.getElementsByClassName("ripple")[0]
      if (ripple) {
        ripple.remove()
      }

      button.appendChild(circle)
    }

    if (onClick) onClick(e)
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={buttonClasses}
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
})

Button.displayName = "Button"

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "success", "outline", "white", "ghost"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
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
