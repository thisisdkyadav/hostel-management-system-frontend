import React from "react"
import PropTypes from "prop-types"

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
  animation = "none", // New animation prop
  ...rest
}) => {
  const baseStyles = "rounded-lg transition-all duration-300 flex items-center justify-center disabled:cursor-not-allowed relative overflow-hidden"

  const variantStyles = {
    primary: "bg-[#1360AB] text-white shadow-sm hover:shadow-md hover:bg-[#0d4b86] disabled:bg-blue-300",
    secondary: "bg-[#E4F1FF] text-[#1360AB] hover:bg-[#1360AB] hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300",
    outline: "bg-white text-[#1360AB] border border-[#1360AB] hover:bg-[#E4F1FF]",
    white: "bg-white text-gray-800 shadow-sm hover:bg-[#E4F1FF] hover:text-[#1360AB]",
  }

  const sizeStyles = {
    small: "py-2 px-3 text-sm",
    medium: "py-3 px-4",
    large: "py-4 px-6 text-lg",
  }

  const widthStyles = fullWidth ? "w-full" : ""

  // Animation styles
  const animationStyles = {
    none: "",
    pulse: "hover:animate-pulse",
    bounce: "hover:animate-bounce",
    slideIn: "transform hover:-translate-y-1",
    glow: "hover:shadow-glow",
    ripple: "ripple-effect",
    shake: "active:animate-shake",
  }

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${animationStyles[animation] || ""} ${className}`

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
    <button type={type} onClick={handleClick} disabled={disabled || isLoading} className={buttonStyles} {...rest}>
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
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
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "success", "outline", "white"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
  icon: PropTypes.node,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  animation: PropTypes.oneOf(["none", "pulse", "bounce", "slideIn", "glow", "ripple", "shake"]),
}

export default Button
