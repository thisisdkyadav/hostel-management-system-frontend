import React, { forwardRef } from "react"
import { Input as C0Input } from "czero/react"

const normalizeSize = (size = "medium") => {
  if (size === "small" || size === "sm") return "sm"
  if (size === "large" || size === "lg") return "lg"
  return "md"
}

/**
 * Input compatibility wrapper.
 * Preserves existing frontend props while delegating rendering/styling to C0 Input.
 */
const Input = forwardRef(({
  size = "medium",
  icon,
  id,
  name,
  error,
  ...props
}, ref) => {
  return (
    <C0Input
      ref={ref}
      id={id || name}
      size={normalizeSize(size)}
      leftIcon={icon}
      error={error}
      {...props}
    />
  )
})

Input.displayName = "Input"

export default Input
