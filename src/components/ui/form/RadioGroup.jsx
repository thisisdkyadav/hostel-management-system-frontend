import React, { forwardRef, createContext, useContext } from "react"
import Radio from "./Radio"

// Context for RadioGroup
const RadioGroupContext = createContext({})

/**
 * RadioGroup Component - Group of radio buttons
 * 
 * @param {string} name - Radio group name
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {boolean} disabled - Disable all radios
 * @param {string} size - Size variant: small, medium, large
 * @param {string} orientation - Layout: horizontal, vertical
 * @param {string} label - Group label
 * @param {boolean} required - Required field
 * @param {string} error - Error message
 * @param {React.ReactNode} children - Radio children
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const RadioGroup = forwardRef(({
  name,
  value,
  onChange,
  disabled = false,
  size = "medium",
  orientation = "vertical",
  label,
  required = false,
  error,
  children,
  className = "",
  style = {},
  ...rest
}, ref) => {

  // Container styles
  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-2)",
    ...style,
  }

  // Label styles
  const labelStyles = {
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-secondary)",
    marginBottom: "var(--spacing-1)",
  }

  // Required indicator styles
  const requiredStyles = {
    color: "var(--color-danger)",
    marginLeft: "var(--spacing-0-5)",
  }

  // Radio list styles
  const radioListStyles = {
    display: "flex",
    flexDirection: orientation === "horizontal" ? "row" : "column",
    gap: orientation === "horizontal" ? "var(--spacing-6)" : "var(--spacing-3)",
    flexWrap: orientation === "horizontal" ? "wrap" : "nowrap",
  }

  // Error styles
  const errorStyles = {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-danger)",
    marginTop: "var(--spacing-1)",
  }

  // Handle change
  const handleChange = (e) => {
    if (onChange) {
      onChange(e)
    }
  }

  // Context value
  const contextValue = {
    name,
    value,
    onChange: handleChange,
    disabled,
    size,
  }

  return (
    <div ref={ref} className={className} style={containerStyles} role="radiogroup" {...rest}>
      {label && (
        <span style={labelStyles}>
          {label}
          {required && <span style={requiredStyles} aria-hidden="true">*</span>}
        </span>
      )}
      <RadioGroupContext.Provider value={contextValue}>
        <div style={radioListStyles}>
          {children}
        </div>
      </RadioGroupContext.Provider>
      {error && <span style={errorStyles} role="alert">{error}</span>}
    </div>
  )
})

RadioGroup.displayName = "RadioGroup"

/**
 * RadioGroupItem - Radio button that works with RadioGroup context
 */
export const RadioGroupItem = forwardRef(({
  value,
  label,
  description,
  disabled: itemDisabled,
  ...rest
}, ref) => {
  const context = useContext(RadioGroupContext)

  return (
    <Radio
      ref={ref}
      name={context.name}
      value={value}
      checked={context.value === value}
      onChange={context.onChange}
      disabled={itemDisabled || context.disabled}
      size={context.size}
      label={label}
      description={description}
      {...rest}
    />
  )
})

RadioGroupItem.displayName = "RadioGroupItem"

export default RadioGroup
