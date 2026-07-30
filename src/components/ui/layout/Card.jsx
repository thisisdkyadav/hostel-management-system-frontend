import React, { forwardRef } from "react"
import { Card as C0Card } from "czero/react"

/**
 * Card — C0-backed compatibility adapter (root only).
 *
 * The card surface (background, radius, border, shadow, hover lift) now comes
 * from czero's `Card`; the legacy customization props map onto czero's
 * --cz-card-* override hooks, and `padding`/`rounded` stay Tailwind classes so
 * responsive values like "p-5 md:p-6" keep working.
 *
 * The sub-components below (Header / Title / Description / Content / Body /
 * Footer) intentionally stay HMS layout primitives: czero's equivalents are a
 * vertical stack with divider borders, whereas HMS's header is a borderless
 * flex row. Mapping them would change how existing cards look.
 *
 * @param {React.ReactNode} children
 * @param {string} padding - Tailwind padding classes (default "p-5 md:p-6")
 * @param {string} rounded - Tailwind radius class
 * @param {boolean} border - show the border
 * @param {string} borderColor / hoverBorderColor - CSS colour values
 * @param {string} shadow / hoverShadow - CSS shadow values
 * @param {boolean} transition - animate the hover change
 * @param {function} onClick
 * @param {string} className
 * @param {object} style
 */
const DEFAULT_PADDING = "p-5 md:p-6"

// Tailwind v4 puts utilities in @layer utilities, and unlayered CSS always wins
// over layered CSS — so a `p-4` class can never override czero's .cz-card
// padding. Translate the scale class into czero's --cz-card-padding hook
// instead (an inline custom property beats every stylesheet).
function paddingToToken(padding) {
  if (!padding || padding === DEFAULT_PADDING) return null // responsive default lives in CSS
  const arbitrary = padding.match(/(?:^|\s)p-\[([^\]]+)\]/)
  if (arbitrary) return arbitrary[1]
  const scale = padding.match(/(?:^|\s)p-(\d+(?:\.\d+)?)(?:\s|$)/)
  if (scale) return `${parseFloat(scale[1]) * 0.25}rem`
  return null // unrecognised — leave the default and pass the class through
}

const Card = forwardRef(({
  children,
  className = "",
  padding = DEFAULT_PADDING,
  rounded = "rounded-[var(--radius-card)]",
  border = true,
  borderColor,
  hoverBorderColor,
  shadow,
  hoverShadow,
  transition = true,
  onClick,
  style = {},
  ...rest
}, ref) => {
  // Legacy colour/shadow props drive czero's override hooks, so the styling
  // still lives in CSS (no hover state in React any more).
  const paddingToken = paddingToToken(padding)
  const hooks = {
    ...(paddingToken ? { "--cz-card-padding": paddingToken } : null),
    ...(borderColor ? { "--cz-card-border-color": borderColor } : null),
    ...(hoverBorderColor ? { "--cz-card-hover-border-color": hoverBorderColor } : null),
    ...(shadow ? { "--cz-card-shadow": shadow } : null),
    ...(hoverShadow ? { "--cz-card-hover-shadow": hoverShadow } : null),
    ...(border ? null : { borderWidth: 0 }),
    ...(transition ? null : { transition: "none" }),
  }

  const classes = [rounded, onClick ? "cursor-pointer" : "", className]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

  return (
    <C0Card
      ref={ref}
      hoverable
      className={classes}
      style={{ ...hooks, ...style }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </C0Card>
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
