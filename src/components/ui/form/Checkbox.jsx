import React, { forwardRef } from "react"
import { Checkbox as C0Checkbox } from "czero/react"

/**
 * Checkbox — C0-backed compatibility adapter.
 *
 * Wraps czero's `Checkbox` while preserving the legacy HMS API so existing
 * call sites keep working unchanged:
 *  - event-style `onChange(e)` where consumers read `e.target.checked`
 *  - size names "small" | "medium" | "large"
 *
 * @param {string} id
 * @param {string} name
 * @param {boolean} checked
 * @param {function} onChange - receives an event-like `{ target: { checked } }`
 * @param {boolean} disabled
 * @param {"small"|"medium"|"large"|"sm"|"md"|"lg"} size
 * @param {string} label
 * @param {string} description
 */
const SIZE_MAP = { small: "sm", medium: "md", large: "lg", sm: "sm", md: "md", lg: "lg" }

const Checkbox = forwardRef(
  (
    {
      id,
      name,
      checked = false,
      onChange,
      disabled = false,
      size = "medium",
      label,
      description,
      className = "",
      style,
      ...rest
    },
    ref
  ) => {
    const handleCheckedChange = (next) => {
      if (disabled) return
      const nextChecked = next === true
      onChange?.({
        target: { checked: nextChecked, name, id, type: "checkbox" },
        currentTarget: { checked: nextChecked, name, id },
      })
    }

    return (
      <C0Checkbox
        ref={ref}
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        size={SIZE_MAP[size] || "md"}
        label={label}
        description={description}
        className={className}
        style={style}
        {...rest}
      />
    )
  }
)

Checkbox.displayName = "Checkbox"

export default Checkbox
