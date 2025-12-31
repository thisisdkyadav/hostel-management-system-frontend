import React, { forwardRef, useState } from "react"

/**
 * Card Component - Matches existing design language
 * 
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional class names
 * @param {string} padding - Padding class (default: "p-5 md:p-6")
 * @param {string} rounded - Border radius class
 * @param {boolean} border - Show border
 * @param {string} borderColor - Border color CSS variable
 * @param {string} hoverBorderColor - Hover border color CSS variable
 * @param {string} shadow - Box shadow CSS variable
 * @param {string} hoverShadow - Hover box shadow CSS variable
 * @param {boolean} transition - Enable transition
 * @param {function} onClick - Click handler
 * @param {object} style - Additional inline styles
 */
const Card = forwardRef(({
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
  ...rest
}, ref) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = (e) => {
    setIsHovered(true)
    if (onMouseEnter) onMouseEnter(e)
  }

  const handleMouseLeave = (e) => {
    setIsHovered(false)
    if (onMouseLeave) onMouseLeave(e)
  }

  // Dynamic styles for hover state
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
  `
    .replace(/\s+/g, " ")
    .trim()

  return (
    <div
      ref={ref}
      className={baseClasses}
      style={dynamicStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
})

Card.displayName = "Card"

// Card Header Component
export const CardHeader = forwardRef(({
  children,
  className = "",
  icon,
  iconBg,
  iconHoverBg,
  title,
  subtitle,
  style = {},
  ...rest
}, ref) => {
  return (
    <div ref={ref} className={`flex items-center gap-4 mb-5 ${className}`} style={style} {...rest}>
      {icon && (
        <div
          className={`w-[50px] h-[50px] rounded-[var(--radius-icon)] flex items-center justify-center text-xl transition-all duration-300 ${iconBg || ""} group-hover:${iconHoverBg || ""}`}
          style={!iconBg ? { backgroundColor: "var(--color-primary-bg)" } : {}}
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
})

CardHeader.displayName = "CardHeader"

// Card Title Sub-component
export const CardTitle = forwardRef(({
  children,
  as: Component = "h3",
  className = "",
  style = {},
  ...rest
}, ref) => {
  return (
    <Component
      ref={ref}
      className={`text-xl font-bold text-[var(--color-text-secondary)] ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  )
})

CardTitle.displayName = "CardTitle"

// Card Description Sub-component
export const CardDescription = forwardRef(({
  children,
  className = "",
  style = {},
  ...rest
}, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-[var(--color-text-muted)] mt-1 ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </p>
  )
})

CardDescription.displayName = "CardDescription"

// Card Content/Body Sub-component
export const CardContent = forwardRef(({
  children,
  className = "",
  style = {},
  ...rest
}, ref) => {
  return (
    <div ref={ref} className={className} style={style} {...rest}>
      {children}
    </div>
  )
})

CardContent.displayName = "CardContent"

// Card Body alias
export const CardBody = CardContent
CardBody.displayName = "CardBody"

// Card Footer Sub-component
export const CardFooter = forwardRef(({
  children,
  className = "",
  style = {},
  ...rest
}, ref) => {
  return (
    <div ref={ref} className={`mt-5 ${className}`} style={style} {...rest}>
      {children}
    </div>
  )
})

CardFooter.displayName = "CardFooter"

// Attach sub-components to Card for compound component pattern
Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
