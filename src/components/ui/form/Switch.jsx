import React, { forwardRef } from "react"

/**
 * Switch Component - Toggle switch for boolean values
 * 
 * @param {string} id - Switch id
 * @param {string} name - Switch name attribute
 * @param {boolean} checked - Controlled checked state
 * @param {function} onChange - Change handler
 * @param {boolean} disabled - Disabled state
 * @param {string} size - Size variant: small, medium, large
 * @param {string} label - Optional inline label text
 * @param {string} description - Optional description below label
 * @param {string} labelPosition - Label position: left, right
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Switch = forwardRef(({
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
  style = {},
  ...rest
}, ref) => {

  // Size mappings
  const sizes = {
    small: {
      track: { width: "32px", height: "18px" },
      thumb: { size: "14px", translate: "14px" },
      label: "var(--font-size-sm)",
      description: "var(--font-size-xs)",
    },
    medium: {
      track: { width: "40px", height: "22px" },
      thumb: { size: "18px", translate: "18px" },
      label: "var(--font-size-base)",
      description: "var(--font-size-sm)",
    },
    large: {
      track: { width: "48px", height: "26px" },
      thumb: { size: "22px", translate: "22px" },
      label: "var(--font-size-lg)",
      description: "var(--font-size-base)",
    },
  }

  const currentSize = sizes[size] || sizes.medium

  // Container styles
  const containerStyles = {
    display: "inline-flex",
    alignItems: description ? "flex-start" : "center",
    gap: "var(--spacing-3)",
    cursor: disabled ? "not-allowed" : "pointer",
    flexDirection: labelPosition === "left" ? "row-reverse" : "row",
    ...style,
  }

  // Track styles
  const trackStyles = {
    position: "relative",
    width: currentSize.track.width,
    height: currentSize.track.height,
    borderRadius: "var(--radius-full)",
    backgroundColor: checked ? "var(--color-primary)" : "var(--color-border-input)",
    transition: "var(--transition-all)",
    opacity: disabled ? 0.5 : 1,
    flexShrink: 0,
  }

  // Thumb styles
  const thumbStyles = {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: currentSize.thumb.size,
    height: currentSize.thumb.size,
    borderRadius: "var(--radius-full)",
    backgroundColor: "white",
    boxShadow: "var(--shadow-sm)",
    transition: "var(--transition-all)",
    transform: checked ? `translateX(${currentSize.thumb.translate})` : "translateX(0)",
  }

  // Hidden input styles
  const hiddenInputStyles = {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: disabled ? "not-allowed" : "pointer",
    margin: 0,
    zIndex: 1,
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

  const switchId = id || name

  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e)
    }
  }

  const content = (
    <>
      <div style={trackStyles}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={switchId}
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          style={hiddenInputStyles}
          className={className}
          aria-checked={checked}
          {...rest}
        />
        <div style={thumbStyles} />
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
      <label htmlFor={switchId} style={containerStyles}>
        {content}
      </label>
    )
  }

  return <div style={containerStyles}>{content}</div>
})

Switch.displayName = "Switch"

export default Switch
