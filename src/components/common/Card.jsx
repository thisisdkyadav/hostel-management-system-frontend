import React from "react"

const Card = ({ 
  children, 
  className = "", 
  padding = "p-5 md:p-6",
  rounded = "rounded-[20px]",
  border = true,
  borderColor = "#d4e4fd",
  hoverBorderColor = "#a8c9fc",
  shadow = "0 1px 3px rgba(0, 0, 0, 0.05)",
  hoverShadow = "0 4px 12px rgba(0, 0, 0, 0.1)",
  transition = true,
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseEnter = (e) => {
    setIsHovered(true)
    if (onMouseEnter) onMouseEnter(e)
  }

  const handleMouseLeave = (e) => {
    setIsHovered(false)
    if (onMouseLeave) onMouseLeave(e)
  }

  return (
    <div
      className={`
        bg-white 
        ${rounded} 
        ${padding} 
        ${transition ? "transition-all duration-300" : ""} 
        ${border ? "border" : ""} 
        ${className}
      `}
      style={{
        boxShadow: isHovered ? hoverShadow : shadow,
        borderColor: isHovered ? hoverBorderColor : borderColor,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

// Card Header Component
Card.Header = ({ children, className = "", icon, iconBg, iconHoverBg, title, subtitle }) => {
  return (
    <div className={`flex items-center gap-4 mb-5 ${className}`}>
      {icon && (
        <div className={`w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl transition-all duration-300 ${iconBg} group-hover:${iconHoverBg}`}>
          {icon}
        </div>
      )}
      {(title || subtitle) && (
        <div>
          {title && <h3 className="text-xl font-bold text-[#1e293b]">{title}</h3>}
          {subtitle && <p className="text-sm text-[#64748b]">{subtitle}</p>}
        </div>
      )}
      {!icon && !title && !subtitle && children}
    </div>
  )
}

// Card Body Component
Card.Body = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>
}

// Card Footer Component
Card.Footer = ({ children, className = "" }) => {
  return <div className={`mt-5 ${className}`}>{children}</div>
}

export default Card
