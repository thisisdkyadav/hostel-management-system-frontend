import React from "react"
import PropTypes from "prop-types"

const Button = ({ children, onClick, type = "button", variant = "primary", size = "medium", className = "", icon, isLoading = false, disabled = false, fullWidth = false, ...rest }) => {
  const baseStyles = "rounded-lg transition-all duration-300 flex items-center justify-center disabled:cursor-not-allowed"

  const variantStyles = {
    primary: "bg-[#1360AB] text-white shadow-sm hover:shadow-md hover:bg-[#0d4b86] disabled:bg-blue-300",
    secondary: "bg-[#E4F1FF] text-[#1360AB] hover:bg-[#1360AB] hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300",
    outline: "bg-white text-[#1360AB] border border-[#1360AB] hover:bg-[#E4F1FF]",
  }

  const sizeStyles = {
    small: "py-2 px-3 text-sm",
    medium: "py-3 px-4",
    large: "py-4 px-6 text-lg",
  }

  const widthStyles = fullWidth ? "w-full" : ""

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`

  return (
    <button type={type} onClick={onClick} disabled={disabled || isLoading} className={buttonStyles} {...rest}>
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
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "success", "outline"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
  icon: PropTypes.node,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
}

export default Button
