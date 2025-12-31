import React, { forwardRef } from "react"
import Label from "./Label"
import Input from "./Input"
import Select from "./Select"
import Textarea from "./Textarea"

/**
 * FormField Component - Wrapper that combines Label with Input/Select/Textarea
 * 
 * @param {string} label - Field label text
 * @param {string} name - Field name attribute
 * @param {string} type - Field type: text, email, password, number, date, time, tel, select, textarea
 * @param {string} value - Controlled field value
 * @param {function} onChange - Change handler
 * @param {boolean} required - Required field indicator
 * @param {string} placeholder - Placeholder text
 * @param {Array} options - Options for select type [{ value, label }]
 * @param {number} rows - Rows for textarea
 * @param {string|boolean} error - Error message or boolean
 * @param {string} className - Additional class names for wrapper
 * @param {object} style - Additional inline styles for wrapper
 */
const FormField = forwardRef(({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  options = [],
  rows = 4,
  error = "",
  className = "",
  style = {},
  disabled = false,
  ...rest
}, ref) => {
  const wrapperStyles = {
    marginBottom: "var(--spacing-4)",
    ...style,
  }

  const errorStyles = {
    marginTop: "var(--spacing-1)",
    fontSize: "var(--font-size-sm)",
    color: "var(--color-danger)",
  }

  const renderField = () => {
    const commonProps = {
      id: name,
      name,
      value,
      onChange,
      required,
      error: Boolean(error),
      disabled,
      ref,
      ...rest,
    }

    if (type === "textarea") {
      return (
        <Textarea
          {...commonProps}
          placeholder={placeholder}
          rows={rows}
        />
      )
    }

    if (type === "select") {
      return (
        <Select
          {...commonProps}
          options={options}
          placeholder={placeholder}
        />
      )
    }

    return (
      <Input
        {...commonProps}
        type={type}
        placeholder={placeholder}
      />
    )
  }

  return (
    <div className={className} style={wrapperStyles}>
      {label && (
        <Label htmlFor={name} required={required} disabled={disabled}>
          {label}
        </Label>
      )}
      {renderField()}
      {error && typeof error === "string" && (
        <p style={errorStyles}>{error}</p>
      )}
    </div>
  )
})

FormField.displayName = "FormField"

export default FormField
