import React, { forwardRef, useState } from "react"

/**
 * Radio Component - Single radio button
 * 
 * @param {string} id - Radio id
 * @param {string} name - Radio name attribute (should be same for group)
 * @param {string} value - Radio value
 * @param {boolean} checked - Controlled checked state
 * @param {function} onChange - Change handler
 * @param {boolean} disabled - Disabled state
 * @param {string} size - Size variant: small, medium, large
 * @param {string} label - Optional inline label text
 * @param {string} description - Optional description below label
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Radio = forwardRef(({
  id,
  name,
  value,
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
      radio: "16px",
      dot: "6px",
      label: "var(--font-size-sm)",
      description: "var(--font-size-xs)",
    },
    medium: {
      radio: "18px",
      dot: "8px",
      label: "var(--font-size-base)",
      description: "var(--font-size-sm)",
    },
    large: {
      radio: "20px",
      dot: "10px",
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

  // Radio wrapper styles
  const radioWrapperStyles = {
    position: "relative",
    width: currentSize.radio,
    height: currentSize.radio,
    flexShrink: 0,
  }

  // Hidden radio styles
  const hiddenRadioStyles = {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: disabled ? "not-allowed" : "pointer",
    margin: 0,
    zIndex: 1,
  }

  // Custom radio styles
  const customRadioStyles = {
    width: "100%",
    height: "100%",
    borderRadius: "var(--radius-full)",
    border: `2px solid ${checked ? "var(--color-primary)" : "var(--color-border-input)"}`,
    backgroundColor: "transparent",
    transition: "var(--transition-all)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.5 : 1,
    boxShadow: isFocused && !disabled ? "0 0 0 2px var(--color-primary-muted)" : "none",
  }

  // Inner dot styles
  const dotStyles = {
    width: currentSize.dot,
    height: currentSize.dot,
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--color-primary)",
    opacity: checked ? 1 : 0,
    transform: checked ? "scale(1)" : "scale(0)",
    transition: "var(--transition-all)",
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

  const radioId = id || `${name}-${value}`

  const content = (
    <>
      <div style={radioWrapperStyles}>
        <input
          ref={ref}
          type="radio"
          id={radioId}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={hiddenRadioStyles}
          className={className}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        <div style={customRadioStyles}>
          <div style={dotStyles} />
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
      <label htmlFor={radioId} style={containerStyles}>
        {content}
      </label>
    )
  }

  return <div style={containerStyles}>{content}</div>
})

Radio.displayName = "Radio"

export default Radio
