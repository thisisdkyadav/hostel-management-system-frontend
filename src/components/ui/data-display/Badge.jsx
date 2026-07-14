import React, { forwardRef } from "react"
import { Badge as C0Badge } from "czero/react"

/**
 * Badge — C0-backed compatibility adapter.
 *
 * Wraps czero's `Badge` while preserving the legacy HMS API so existing call
 * sites keep working unchanged:
 *  - variants default | primary | success | warning | danger | info | outline
 *    (`info` maps to `primary` — they were identical in the legacy component;
 *    unknown variants fall back to `default`, matching the old behavior)
 *  - size names small | medium | large (czero has sm | md, so large → md)
 *  - `dot` indicator (reproduced as a small circle; czero has no dot mode)
 *
 * Uses czero's `soft` (tinted) badge variants to preserve the legacy tinted
 * look — quiet fills with colored text, rather than czero's default solid fills.
 *
 * @param {React.ReactNode} children
 * @param {"default"|"primary"|"success"|"warning"|"danger"|"info"|"outline"} variant
 * @param {"small"|"medium"|"large"|"sm"|"md"|"lg"} size
 * @param {boolean} dot - render as a small circular indicator (no text)
 * @param {boolean} outline - outlined style
 * @param {string} className
 * @param {object} style
 */
const SIZE_MAP = { small: "sm", medium: "md", large: "md", sm: "sm", md: "md", lg: "md" }
// czero has no `info` variant; it was byte-identical to `primary` in the legacy component.
const VARIANT_MAP = { default: "default", primary: "primary", success: "success", warning: "warning", danger: "danger", info: "primary", outline: "outline" }
const DOT_SIZE = { small: 6, medium: 8, large: 10 }

const Badge = forwardRef(
  ({ children, variant = "default", size = "medium", dot = false, outline = false, className = "", style = {}, ...rest }, ref) => {
    const czVariant = outline ? "outline" : VARIANT_MAP[variant] || "default"
    const czSize = SIZE_MAP[size] || "md"

    // Dot indicator: czero has no dot mode — render a small circle using the
    // variant's badge colors, with no text (matches the legacy behavior).
    if (dot) {
      const d = DOT_SIZE[size] || 8
      return (
        <span
          ref={ref}
          className={`cz-badge cz-badge-soft-${VARIANT_MAP[variant] || "default"} ${className}`.trim()}
          style={{ width: d, height: d, minWidth: d, padding: 0, borderRadius: "var(--cz-radius-full)", ...style }}
          {...rest}
        />
      )
    }

    return (
      <C0Badge ref={ref} variant={czVariant} soft size={czSize} className={className} style={style} {...rest}>
        {children}
      </C0Badge>
    )
  }
)

Badge.displayName = "Badge"

export default Badge
