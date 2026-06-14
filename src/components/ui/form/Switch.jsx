import React, { forwardRef } from "react"
import { Switch as C0Switch } from "czero/react"

/**
 * Switch — C0-backed compatibility adapter.
 *
 * Wraps czero's `Switch` while preserving the legacy HMS API so existing
 * call sites keep working unchanged:
 *  - event-style `onChange(e)` where consumers read `e.target.checked`
 *  - size names "small" | "medium" | "large"
 *
 * Prefer importing `Switch` from `@/components/ui`; this adapter delegates
 * styling/behavior to the shared C0 component.
 *
 * @param {string} id
 * @param {string} name
 * @param {boolean} checked
 * @param {function} onChange - receives an event-like `{ target: { checked } }`
 * @param {boolean} disabled
 * @param {"small"|"medium"|"large"|"sm"|"md"|"lg"} size
 * @param {string} label
 * @param {string} description
 * @param {"left"|"right"} labelPosition
 */
const SIZE_MAP = { small: "sm", medium: "md", large: "lg", sm: "sm", md: "md", lg: "lg" }

const Switch = forwardRef(
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
      labelPosition = "right",
      className = "",
      style,
      ...rest
    },
    ref
  ) => {
    const handleCheckedChange = (nextChecked) => {
      if (disabled) return
      onChange?.({
        target: { checked: nextChecked, name, id, type: "checkbox" },
        currentTarget: { checked: nextChecked, name, id },
      })
    }

    return (
      <C0Switch
        ref={ref}
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        size={SIZE_MAP[size] || "md"}
        label={label}
        description={description}
        labelPosition={labelPosition}
        className={className}
        style={style}
        {...rest}
      />
    )
  }
)

Switch.displayName = "Switch"

export default Switch
