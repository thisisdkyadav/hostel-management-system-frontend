import React, { forwardRef } from "react"
import { Textarea as C0Textarea } from "czero/react"

/**
 * Textarea — C0-backed compatibility adapter.
 *
 * Wraps czero's `Textarea` while preserving the legacy HMS API so existing
 * call sites keep working unchanged:
 *  - native event-style `onChange(e)` (consumers read `e.target.value`)
 *  - optional left `icon` overlay
 *  - `resize` control ("none" | "vertical" | "horizontal" | "both")
 *  - `error` (boolean | string) drives the red-border state only; call sites
 *    render their own message text, so the string is never shown twice
 *
 * Prefer importing `Textarea` from `@/components/ui`.
 *
 * @param {string} name
 * @param {string} value - controlled value
 * @param {function} onChange - native change event (read `e.target.value`)
 * @param {string} placeholder
 * @param {React.ReactNode} icon - optional left icon
 * @param {boolean|string} error - error state (styling only)
 * @param {boolean} disabled
 * @param {boolean} readOnly
 * @param {boolean} required
 * @param {number} rows - default 4
 * @param {"none"|"vertical"|"horizontal"|"both"} resize - default "vertical"
 * @param {number} maxLength
 * @param {"small"|"medium"|"large"|"sm"|"md"|"lg"} size
 * @param {string} id - defaults to `name`
 * @param {string} className
 * @param {object} style
 */
const SIZE_MAP = { small: "sm", medium: "md", large: "lg", sm: "sm", md: "md", lg: "lg" }
const RESIZE_OPTIONS = { none: "none", vertical: "vertical", horizontal: "horizontal", both: "both" }

const Textarea = forwardRef(
  (
    {
      name,
      value,
      onChange,
      placeholder,
      icon,
      error,
      disabled = false,
      readOnly = false,
      required = false,
      rows = 4,
      resize = "vertical",
      maxLength,
      // legacy prop with no live usage — swallowed so it can't leak onto the DOM
      // eslint-disable-next-line no-unused-vars
      showCount,
      size = "medium",
      id,
      className = "",
      style = {},
      ...rest
    },
    ref
  ) => {
    const hasError = Boolean(error)
    const hasIcon = Boolean(icon)

    const textareaStyle = {
      resize: disabled || readOnly ? "none" : RESIZE_OPTIONS[resize] || "vertical",
      ...(hasIcon ? { paddingLeft: "var(--spacing-10)" } : null),
      ...style,
    }

    const field = (
      <C0Textarea
        ref={ref}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        rows={rows}
        maxLength={maxLength}
        size={SIZE_MAP[size] || "md"}
        // boolean → red border via .cz-textarea-error, but no duplicate message text
        error={hasError || undefined}
        aria-invalid={hasError || undefined}
        className={className}
        style={textareaStyle}
        {...rest}
      />
    )

    if (!hasIcon) return field

    return (
      <div style={{ position: "relative", width: "100%" }}>
        <span
          style={{
            position: "absolute",
            left: "var(--spacing-3)",
            top: "var(--spacing-3)",
            color: hasError ? "var(--color-danger)" : "var(--color-text-placeholder)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--icon-md)",
            zIndex: 1,
          }}
        >
          {icon}
        </span>
        {field}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export default Textarea
