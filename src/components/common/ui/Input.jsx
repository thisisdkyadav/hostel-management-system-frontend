import React, { useState, forwardRef } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

/**
 * Input Component - Unified input for all text-based input types
 *
 * @param {string} type - Input type: text, email, password, number, date, time, datetime-local, tel, search
 * @param {string} name - Input name attribute
 * @param {string} value - Controlled input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {React.ReactNode} icon - Optional left icon
 * @param {boolean|string} error - Error state (boolean or error message string)
 * @param {boolean} disabled - Disabled state
 * @param {boolean} readOnly - ReadOnly state
 * @param {boolean} required - Required field
 * @param {string|number} min - Min value for number/date types
 * @param {string|number} max - Max value for number/date types
 * @param {number} step - Step value for number type
 * @param {string} id - Optional id (defaults to name)
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Input = forwardRef(({ type = "text", name, value, onChange, placeholder, icon, error, disabled = false, readOnly = false, required = false, min, max, step, id, className = "", style = {}, ...rest }, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === "password"
  const hasError = Boolean(error)
  const hasIcon = Boolean(icon)

  // Determine the actual input type (for password toggle)
  const inputType = isPassword && showPassword ? "text" : type

  // Build container styles
  const containerStyles = {
    position: "relative",
    width: "100%",
  }

  // Build input styles using theme variables
  const inputStyles = {
    width: "100%",
    padding: "var(--input-padding)",
    paddingLeft: hasIcon ? "var(--spacing-10)" : "var(--input-padding)",
    paddingRight: isPassword ? "var(--spacing-10)" : "var(--input-padding)",
    border: `var(--border-1) solid ${hasError ? "var(--color-danger-border)" : isFocused ? "var(--input-border-focus)" : "var(--input-border)"}`,
    borderRadius: "var(--input-radius)",
    backgroundColor: disabled || readOnly ? "var(--color-bg-disabled)" : hasError ? "var(--color-danger-bg-light)" : "var(--input-bg)",
    color: disabled ? "var(--color-text-disabled)" : readOnly ? "var(--color-text-muted)" : "var(--color-text-body)",
    fontSize: "var(--font-size-base)",
    outline: "none",
    transition: "var(--transition-all)",
    boxShadow: isFocused && !hasError ? "var(--input-focus-ring)" : hasError && isFocused ? "var(--shadow-focus-danger)" : "none",
    cursor: disabled ? "not-allowed" : readOnly ? "default" : "text",
    ...style,
  }

  // Icon styles
  const iconStyles = {
    position: "absolute",
    left: "var(--spacing-3)",
    top: "50%",
    transform: "translateY(-50%)",
    color: hasError ? "var(--color-danger)" : isFocused ? "var(--color-primary)" : "var(--color-text-placeholder)",
    pointerEvents: "none",
    transition: "var(--transition-colors)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--icon-md)",
  }

  // Password toggle button styles
  const passwordToggleStyles = {
    position: "absolute",
    right: "var(--spacing-3)",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    padding: "var(--spacing-1)",
    cursor: "pointer",
    color: "var(--color-text-placeholder)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition-colors)",
  }

  const handleFocus = (e) => {
    setIsFocused(true)
    rest.onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    rest.onBlur?.(e)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div style={containerStyles}>
      {/* Left Icon */}
      {hasIcon && <span style={iconStyles}>{icon}</span>}

      {/* Input Element */}
      <input
        ref={ref}
        type={inputType}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        min={min}
        max={max}
        step={step}
        style={inputStyles}
        className={className}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />

      {/* Password Toggle Button */}
      {isPassword && !disabled && !readOnly && (
        <button type="button" onClick={togglePasswordVisibility} style={passwordToggleStyles} tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
          {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </button>
      )}
    </div>
  )
})

Input.displayName = "Input"

// export default Input
export { Input as default, Input } from "@/components/ui/form"
