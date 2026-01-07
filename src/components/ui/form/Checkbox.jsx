import React, { forwardRef, useState } from "react"

/**
 * Checkbox Component - Styled checkbox input
 * 
 * @param {string} id - Checkbox id
 * @param {string} name - Checkbox name attribute
 * @param {boolean} checked - Controlled checked state
 * @param {function} onChange - Change handler
 * @param {boolean} disabled - Disabled state
 * @param {string} size - Size variant: small, medium, large
 * @param {string} label - Optional inline label text
 * @param {string} description - Optional description below label
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Checkbox = forwardRef(({
  id,
  name,
  checked = false,
  onChange,
  disabled = false,
  size = "medium",
  label,
  description,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  // Size mappings
  const sizes = {
    small: {
      checkbox: "16px",
      label: "var(--font-size-sm)",
      description: "var(--font-size-xs)",
    },
    medium: {
      checkbox: "18px",
      label: "var(--font-size-base)",
      description: "var(--font-size-sm)",
    },
    large: {
      checkbox: "20px",
      label: "var(--font-size-lg)",
      description: "var(--font-size-base)",
    },
  }

  const currentSize = sizes[size] || sizes.medium

  // Container styles
  const containerStyles = {
    display: "inline-flex",
    alignItems: description ? "flex-start" : "center",
    gap: "var(--spacing-2-5)",
    cursor: disabled ? "not-allowed" : "pointer",
    ...style,
  }

  // Checkbox wrapper styles
  const checkboxWrapperStyles = {
    position: "relative",
    width: currentSize.checkbox,
    height: currentSize.checkbox,
    flexShrink: 0,
  }

  // Hidden checkbox styles
  const hiddenCheckboxStyles = {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: disabled ? "not-allowed" : "pointer",
    margin: 0,
    zIndex: 1,
  }

  // Custom checkbox styles
  const customCheckboxStyles = {
    width: "100%",
    height: "100%",
    borderRadius: "var(--radius-sm)",
    border: `2px solid ${checked ? "var(--color-primary)" : "var(--color-border-input)"}`,
    backgroundColor: checked ? "var(--color-primary)" : "transparent",
    transition: "var(--transition-all)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.5 : 1,
    boxShadow: isFocused && !disabled ? "0 0 0 2px var(--color-primary-muted)" : "none",
  }

  // Checkmark styles
  const checkmarkStyles = {
    color: "white",
    fontSize: size === "small" ? "10px" : size === "large" ? "14px" : "12px",
    opacity: checked ? 1 : 0,
    transition: "var(--transition-opacity)",
  }

  // Label container styles
  const labelContainerStyles = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-0-5)",
  }

  // Label styles
  const labelStyles = {
    fontSize: currentSize.label,
    color: disabled ? "var(--color-text-disabled)" : "var(--color-text-body)",
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    lineHeight: "1.4",
  }

  // Description styles
  const descriptionStyles = {
    fontSize: currentSize.description,
    color: "var(--color-text-muted)",
    lineHeight: "1.4",
  }

  const checkboxId = id || name

  const content = (
    <>
      <div style={checkboxWrapperStyles}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={hiddenCheckboxStyles}
          className={className}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        <div style={customCheckboxStyles}>
          <svg
            style={checkmarkStyles}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      {(label || description) && (
        <div style={labelContainerStyles}>
          {label && <span style={labelStyles}>{label}</span>}
          {description && <span style={descriptionStyles}>{description}</span>}
        </div>
      )}
    </>
  )

  // Wrap in label if text is provided
  if (label || description) {
    return (
      <label htmlFor={checkboxId} style={containerStyles}>
        {content}
      </label>
    )
  }

  return <div style={containerStyles}>{content}</div>
})

Checkbox.displayName = "Checkbox"

export default Checkbox
