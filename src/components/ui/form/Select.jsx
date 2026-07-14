import React, { forwardRef } from "react"
import { Select as C0Select } from "czero/react"

/**
 * Select — C0-backed compatibility adapter.
 *
 * Wraps czero's Radix-based `Select` while preserving the legacy HMS API so
 * existing call sites keep working unchanged:
 *  - native event-style `onChange(e)` where consumers read `e.target.value`
 *    (the synthetic event also carries `name` and `id`)
 *  - `options` as `[{value,label}]` OR `["a","b"]`
 *  - left `icon`, `error` (styling only), `size` (small/medium/large)
 *
 * Values are coerced to strings: Radix Select is string-only, so numeric option
 * values / a numeric `value` prop (limit, rating, page-size) round-trip safely
 * — consumers doing `Number(e.target.value)` keep working.
 *
 * `required`, `className`, `style` are not forwarded — czero's Select root
 * doesn't accept them, and native form semantics differ from a `<select>`.
 *
 * Prefer importing `Select` from `@/components/ui`.
 *
 * @param {string} name
 * @param {string|number} value
 * @param {function} onChange - native change event (read `e.target.value`)
 * @param {Array<{value,label}>|Array<string>} options
 * @param {string} placeholder
 * @param {React.ReactNode} icon - optional left icon
 * @param {boolean|string} error - error state (styling only)
 * @param {boolean} disabled
 * @param {"small"|"medium"|"large"|"sm"|"md"|"lg"} size
 * @param {string} id - defaults to name
 */
const SIZE_MAP = { small: "sm", medium: "md", large: "lg", sm: "sm", md: "md", lg: "lg" }

const normalizeOptions = (options) =>
  (options || []).map((o) =>
    typeof o === "string" || typeof o === "number"
      ? { value: String(o), label: String(o) }
      : { ...o, value: String(o.value) }
  )

const Select = forwardRef((props) => {
  const {
    name,
    value,
    onChange,
    options = [],
    placeholder,
    icon,
    error,
    disabled = false,
    size = "medium",
    id,
  } = props

  const handleValueChange = (v) => onChange?.({ target: { value: v, name, id } })

  return (
    <C0Select
      value={value == null ? undefined : String(value)}
      onValueChange={handleValueChange}
      options={normalizeOptions(options)}
      placeholder={placeholder}
      icon={icon}
      error={Boolean(error) || undefined}
      disabled={disabled}
      size={SIZE_MAP[size] || "md"}
    />
  )
})

Select.displayName = "Select"

export default Select
