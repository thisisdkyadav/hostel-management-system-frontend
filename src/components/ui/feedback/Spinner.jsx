import React, { forwardRef } from "react"
import { Spinner as C0Spinner } from "czero/react"

/**
 * Spinner — C0-backed compatibility adapter.
 *
 * Wraps czero's `Spinner` while preserving the legacy HMS API so existing call
 * sites keep working unchanged:
 *  - sizes xsmall | small | medium | large | xlarge
 *  - colors primary | secondary | white | inherit
 *  - thickness thin | medium | thick
 *  - `label` for the accessible name
 *
 * czero's sm/md/lg are 16/24/32px, matching the legacy small/medium/large
 * exactly; xsmall/xlarge fall back to an explicit size. This also drops the
 * per-instance `<style>` tag the old component injected on every render.
 *
 * Prefer importing `Spinner` from `@/components/ui`.
 *
 * @param {"xsmall"|"small"|"medium"|"large"|"xlarge"|"sm"|"md"|"lg"} size
 * @param {"primary"|"secondary"|"white"|"inherit"} color
 * @param {"thin"|"medium"|"thick"} thickness
 * @param {string} label - accessible name (default "Loading")
 * @param {string} className
 * @param {object} style
 */
const SIZE_MAP = { small: "sm", medium: "md", large: "lg", sm: "sm", md: "md", lg: "lg" }
// czero has no xs/xl step; drive those from an explicit box size instead.
const EXPLICIT_SIZE = { xsmall: "12px", xlarge: "48px" }
const COLOR = {
  primary: null, // czero's `primary` variant already uses the brand colour
  secondary: "var(--color-text-muted)",
  white: "#fff",
  inherit: "currentColor",
}
const STROKE = { thin: 2, medium: 3, thick: 4 }

const Spinner = forwardRef(
  ({ size = "medium", color = "primary", thickness = "medium", label = "Loading", className = "", style = {}, ...rest }, ref) => {
    const explicit = EXPLICIT_SIZE[size]
    const czColor = COLOR[color] !== undefined ? COLOR[color] : null
    const stroke = STROKE[thickness] || STROKE.medium

    return (
      <C0Spinner
        ref={ref}
        size={SIZE_MAP[size] || "md"}
        variant="primary"
        aria-label={label}
        className={className}
        style={{
          ...(explicit ? { width: explicit, height: explicit } : null),
          ...(czColor ? { color: czColor } : null),
          ...(stroke !== STROKE.medium ? { "--cz-spinner-stroke": stroke } : null),
          ...style,
        }}
        {...rest}
      />
    )
  }
)

Spinner.displayName = "Spinner"

export default Spinner
