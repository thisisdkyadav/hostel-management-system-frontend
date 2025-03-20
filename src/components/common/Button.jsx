import React from "react"

const Button = ({ children, variant = "primary", type = "button", onClick, className = "" }) => {
  const baseClasses = "font-semibold py-2 px-6 rounded-md text-center focus:outline-none transition-colors"

  const variantClasses = {
    primary: "bg-[#1360AB] text-white hover:bg-[#0d4c8b]",
    success: "bg-green-500 text-white hover:bg-green-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  }

  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  )
}

export default Button
