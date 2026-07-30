import React, { forwardRef } from "react"
import { Label as C0Label } from "czero/react"

/**
 * Label — C0-backed compatibility adapter.
 *
 * Wraps czero's `Label` while preserving the legacy HMS API so existing call
 * sites keep working unchanged:
 *  - sizes sm | md | lg
 *  - `required` asterisk, `disabled` dimming, `htmlFor`
 *
 * czero's Label is deliberately margin-free (its field wrappers space labels
 * with flex gap). HMS labels sit directly above their control and rely on a
 * bottom margin, so the legacy `display: block` + per-size margin is applied
 * here rather than pushed into the library.
 *
 * Prefer importing `Label` from `@/components/ui`.
 *
 * @param {string} htmlFor - associated control id
 * @param {React.ReactNode} children
 * @param {boolean} required - show the required asterisk
 * @param {boolean} disabled
 * @param {"sm"|"md"|"lg"} size
 * @param {string} className
 * @param {object} style
 */
const SIZE_MAP = { sm: "sm", md: "md", lg: "lg", small: "sm", medium: "md", large: "lg" }
const MARGIN = { sm: "var(--spacing-1)", md: "var(--spacing-1-5)", lg: "var(--spacing-2)" }

const Label = forwardRef(
  ({ htmlFor, children, required = false, disabled = false, size = "md", className = "", style = {}, ...rest }, ref) => {
    const czSize = SIZE_MAP[size] || "md"

    return (
      <C0Label
        ref={ref}
        htmlFor={htmlFor}
        required={required}
        disabled={disabled}
        size={czSize}
        className={className}
        style={{ display: "block", marginBottom: MARGIN[czSize], ...style }}
        {...rest}
      >
        {children}
      </C0Label>
    )
  }
)

Label.displayName = "Label"

export default Label
