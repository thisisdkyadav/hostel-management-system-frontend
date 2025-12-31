import React, { useState, forwardRef } from "react"

/**
 * Textarea Component - Multi-line text input
 *
 * @param {string} name - Textarea name attribute
 * @param {string} value - Controlled textarea value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {React.ReactNode} icon - Optional left icon
 * @param {boolean|string} error - Error state (boolean or error message string)
 * @param {boolean} disabled - Disabled state
 * @param {boolean} readOnly - ReadOnly state
 * @param {boolean} required - Required field
 * @param {number} rows - Number of visible text rows (default: 4)
 * @param {string} resize - Resize behavior: none, vertical, horizontal, both
 * @param {number} maxLength - Maximum character length
 * @param {boolean} showCount - Show character count
 * @param {string} id - Optional id (defaults to name)
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Textarea = forwardRef(({
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
  showCount = false,
  id,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  const hasError = Boolean(error)
  const hasIcon = Boolean(icon)
  const characterCount = value?.length || 0

  // Resize mapping
  const resizeOptions = {
    none: "none",
    vertical: "vertical",
    horizontal: "horizontal",
    both: "both",
  }

  // Container styles
  const containerStyles = {
    position: "relative",
    width: "100%",
  }

  // Textarea styles using theme variables
  const textareaStyles = {
    width: "100%",
    padding: "var(--spacing-3)",
    paddingLeft: hasIcon ? "var(--spacing-10)" : "var(--spacing-3)",
    border: `var(--border-1) solid ${hasError
      ? "var(--color-danger-border)"
      : isFocused
        ? "var(--input-border-focus)"
        : "var(--input-border)"
      }`,
    borderRadius: "var(--radius-input)",
    backgroundColor: disabled || readOnly
      ? "var(--color-bg-disabled)"
      : hasError
        ? "var(--color-danger-bg-light)"
        : "var(--input-bg)",
    color: disabled
      ? "var(--color-text-disabled)"
      : readOnly
        ? "var(--color-text-muted)"
        : "var(--color-text-body)",
    fontSize: "var(--font-size-base)",
    fontFamily: "inherit",
    lineHeight: "var(--line-height-normal)",
    outline: "none",
    transition: "var(--transition-all)",
    boxShadow: isFocused && !hasError
      ? "var(--input-focus-ring)"
      : hasError && isFocused
        ? "var(--shadow-focus-danger)"
        : "none",
    cursor: disabled ? "not-allowed" : readOnly ? "default" : "text",
    resize: disabled || readOnly ? "none" : resizeOptions[resize] || "vertical",
    minHeight: "auto",
    ...style,
  }

  // Icon styles
  const iconStyles = {
    position: "absolute",
    left: "var(--spacing-3)",
    top: "var(--spacing-3)",
    color: hasError
      ? "var(--color-danger)"
      : isFocused
        ? "var(--color-primary)"
        : "var(--color-text-placeholder)",
    pointerEvents: "none",
    transition: "var(--transition-colors)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--icon-md)",
  }

  // Character count styles
  const countStyles = {
    position: "absolute",
    right: "var(--spacing-3)",
    bottom: "var(--spacing-2)",
    fontSize: "var(--font-size-xs)",
    color: maxLength && characterCount >= maxLength
      ? "var(--color-danger)"
      : "var(--color-text-muted)",
    pointerEvents: "none",
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

  return (
    <div style={containerStyles}>
      {/* Left Icon */}
      {hasIcon && <span style={iconStyles}>{icon}</span>}

      {/* Textarea Element */}
      <textarea
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
        style={textareaStyles}
        className={className}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={hasError}
        {...rest}
      />

      {/* Character Count */}
      {showCount && (
        <span style={countStyles}>
          {maxLength ? `${characterCount}/${maxLength}` : characterCount}
        </span>
      )}
    </div>
  )
})

Textarea.displayName = "Textarea"

export default Textarea
