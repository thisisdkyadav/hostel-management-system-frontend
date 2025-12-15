import React from "react"
import PropTypes from "prop-types"
import { colorClasses } from "../../constants/themeConfig"

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  className = "",
  icon,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  animation = "none",
  gradient = false,
  ...rest
}) => {
  const baseStyles = `
    rounded-full font-medium transition-all duration-200 
    flex items-center justify-center gap-2
    disabled:cursor-not-allowed disabled:opacity-60
    relative overflow-hidden
    focus:outline-none
    active:scale-[0.98]
  `

  // Using new theme colors #1360aa and hover #0e4eb5
  const variantStyles = {
    primary: gradient 
      ? `text-white disabled:opacity-50`
      : `bg-[#1360aa] text-white hover:bg-[#0e4eb5] disabled:bg-[#1360aa]/50`,
    secondary: `
      bg-[#e8f0fe] text-[#1360aa]
      border border-[#d2e3fc]
      hover:bg-[#d2e3fc]
    `,
    danger: `
      ${colorClasses.danger.bg} text-white 
      ${colorClasses.danger.bgHover}
      disabled:bg-red-300
    `,
    success: `
      ${colorClasses.success.bg} text-white 
      ${colorClasses.success.bgHover}
      disabled:bg-emerald-300
    `,
    outline: `
      bg-white text-[#1360aa]
      border-2 border-[#1360aa]
      hover:bg-[#e8f0fe]
    `,
    white: `
      ${colorClasses.white.bg} ${colorClasses.white.text}
      border ${colorClasses.white.border}
      ${colorClasses.white.bgHover} ${colorClasses.white.borderHover} ${colorClasses.white.textHover}
    `,
    ghost: `
      ${colorClasses.ghost.bg} ${colorClasses.ghost.text}
      ${colorClasses.ghost.bgHover} ${colorClasses.ghost.textHover}
    `,
  }

  const sizeStyles = {
    small: "py-2 px-4 text-sm",
    medium: "py-2.5 px-5 text-sm",
    large: "py-3 px-6 text-base",
  }

  const widthStyles = fullWidth ? "w-full" : ""

  // Animation styles - no movement animations
  const animationStyles = {
    none: "",
    pulse: "hover:animate-pulse",
    bounce: "",
    slideIn: "",
    glow: "hover:shadow-glow",
    ripple: "ripple-effect",
    shake: "",
  }

  const buttonStyles = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${sizeStyles[size]} 
    ${widthStyles} 
    ${animationStyles[animation] || ""} 
    ${className}
  `.replace(/\s+/g, ' ').trim()

  // Gradient styles for primary variant
  const gradientStyle = gradient && variant === "primary" ? {
    background: 'linear-gradient(135deg, #1360aa, #3b7de8)',
    boxShadow: '0 4px 15px rgba(11, 87, 208, 0.3)',
    transition: 'all 0.3s ease',
  } : {}

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

  // Handle hover state for gradient buttons
  const handleMouseEnter = (e) => {
    if (gradient && variant === "primary" && !disabled && !isLoading) {
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(11, 87, 208, 0.4)'
    }
  }

  const handleMouseLeave = (e) => {
    if (gradient && variant === "primary" && !disabled && !isLoading) {
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(11, 87, 208, 0.3)'
    }
  }

  return (
    <button 
      type={type} 
      onClick={handleClick} 
      disabled={disabled || isLoading} 
      className={buttonStyles} 
      style={gradientStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "success", "outline", "white", "ghost"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
  icon: PropTypes.node,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  animation: PropTypes.oneOf(["none", "pulse", "bounce", "slideIn", "glow", "ripple", "shake"]),
  gradient: PropTypes.bool,
}

export default Button
