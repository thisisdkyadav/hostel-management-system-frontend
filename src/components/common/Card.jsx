import React from "react"

const Card = ({
  children,
  className = "",
  padding = "p-5 md:p-6",
  rounded = "rounded-[var(--radius-card)]",
  border = true,
  borderColor = "var(--color-border-secondary)",
  hoverBorderColor = "var(--color-border-hover)",
  shadow = "var(--shadow-card)",
  hoverShadow = "var(--shadow-card-hover)",
  transition = true,
  onMouseEnter,
  onMouseLeave,
  onClick,
  style = {},
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

  // Only apply dynamic styles that need hover state
  const dynamicStyle = {
    boxShadow: isHovered ? hoverShadow : shadow,
    borderColor: isHovered ? hoverBorderColor : borderColor,
    ...style,
  }

  // Base classes using CSS variables
  const baseClasses = `
    bg-[var(--color-bg-primary)]
    ${rounded}
    ${padding}
    ${transition ? "transition-all duration-300" : ""}
    ${border ? "border" : ""}
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `.replace(/\s+/g, ' ').trim()

  return (
    <div
      className={baseClasses}
      style={dynamicStyle}
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
Card.Header = ({ children, className = "", icon, iconBg, iconHoverBg, title, subtitle, style = {} }) => {
  return (
    <div className={`flex items-center gap-4 mb-5 ${className}`} style={style}>
      {icon && (
        <div
          className={`w-[50px] h-[50px] rounded-[var(--radius-icon)] flex items-center justify-center text-xl transition-all duration-300 ${iconBg || ''} group-hover:${iconHoverBg || ''}`}
          style={!iconBg ? { backgroundColor: 'var(--color-primary-bg)' } : {}}
        >
          {icon}
        </div>
      )}
      {(title || subtitle) && (
        <div>
          {title && <h3 className="text-xl font-bold text-[var(--color-text-secondary)]">{title}</h3>}
          {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
      )}
      {!icon && !title && !subtitle && children}
    </div>
  )
}

// Card Body Component
Card.Body = ({ children, className = "", style }) => {
  return <div className={className} style={style}>{children}</div>
}

// Card Footer Component
Card.Footer = ({ children, className = "", style }) => {
  return <div className={`mt-5 ${className}`} style={style}>{children}</div>
}

export default Card
