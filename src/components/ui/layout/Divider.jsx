import React, { forwardRef } from "react"
import { Separator as C0Separator } from "czero/react"

/**
 * Divider — C0-backed compatibility adapter.
 *
 * Wraps czero's `Separator` while preserving the legacy HMS API so existing
 * call sites keep working unchanged:
 *  - `orientation` horizontal | vertical
 *  - `variant` solid | dashed | dotted
 *  - `color` default | muted | primary
 *  - `spacing` none | sm | md | lg (margin around the line)
 *  - optional `children` rendered as a centred label
 *
 * Prefer importing `Divider` from `@/components/ui`.
 *
 * @param {"horizontal"|"vertical"} orientation
 * @param {"solid"|"dashed"|"dotted"} variant
 * @param {"default"|"muted"|"primary"} color
 * @param {"none"|"sm"|"md"|"lg"} spacing
 * @param {React.ReactNode} children - optional centred label
 * @param {string} className
 * @param {object} style
 */
const SPACING = { none: "0", sm: "var(--spacing-2)", md: "var(--spacing-4)", lg: "var(--spacing-6)" }
const COLOR = {
  default: "var(--color-border-primary)",
  muted: "var(--color-border-light)",
  primary: "var(--color-primary-muted)",
}

const Divider = forwardRef(
  ({ orientation = "horizontal", variant = "solid", color = "default", spacing = "md", children, className = "", style = {}, ...rest }, ref) => {
    const isHorizontal = orientation === "horizontal"
    const gap = SPACING[spacing] ?? SPACING.md
    const line = COLOR[color] || COLOR.default

    // Solid rides czero's 1px filled separator; dashed/dotted need a real
    // border, so collapse the box and draw the border instead.
    const lineStyle =
      variant === "solid"
        ? { background: line }
        : {
            background: "transparent",
            ...(isHorizontal
              ? { height: 0, borderTop: `1px ${variant} ${line}` }
              : { width: 0, borderLeft: `1px ${variant} ${line}` }),
          }

    const margin = isHorizontal
      ? { marginTop: gap, marginBottom: gap }
      : { marginLeft: gap, marginRight: gap }

    if (children) {
      return (
        <div
          ref={ref}
          className={className}
          style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", ...margin, ...style }}
          {...rest}
        >
          <C0Separator style={{ flex: 1, ...lineStyle }} />
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
              flexShrink: 0,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {children}
          </span>
          <C0Separator style={{ flex: 1, ...lineStyle }} />
        </div>
      )
    }

    return (
      <C0Separator
        ref={ref}
        orientation={orientation}
        className={className}
        style={{ ...margin, ...lineStyle, ...style }}
        {...rest}
      />
    )
  }
)

Divider.displayName = "Divider"

export default Divider
