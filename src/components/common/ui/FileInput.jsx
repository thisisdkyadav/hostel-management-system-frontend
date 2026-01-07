import React, { forwardRef } from "react"

/**
 * FileInput Component - Specialized file upload input
 *
 * @param {string} accept - Accepted file types (e.g., ".csv,.pdf,image/*")
 * @param {function} onChange - Change handler
 * @param {boolean} disabled - Disabled state
 * @param {boolean} multiple - Allow multiple file selection
 * @param {boolean} hidden - Hide the input (for custom trigger buttons)
 * @param {string} id - Input id
 * @param {string} name - Input name
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const FileInput = forwardRef(({ accept, onChange, disabled = false, multiple = false, hidden = false, id, name, className = "", style = {}, ...rest }, ref) => {
  // Hidden input styles (for custom trigger buttons)
  const hiddenStyles = {
    display: "none",
  }

  // Visible input styles
  const visibleStyles = {
    width: "100%",
    padding: "var(--input-padding)",
    border: "var(--border-1) solid var(--input-border)",
    borderRadius: "var(--input-radius)",
    backgroundColor: "var(--input-bg)",
    color: "var(--color-text-body)",
    fontSize: "var(--font-size-base)",
    outline: "none",
    transition: "var(--transition-all)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? "var(--opacity-disabled)" : "var(--opacity-100)",
    ...style,
  }

  const inputStyles = hidden ? hiddenStyles : visibleStyles

  return <input ref={ref} type="file" id={id} name={name} accept={accept} onChange={onChange} disabled={disabled} multiple={multiple} style={inputStyles} className={className} {...rest} />
})

FileInput.displayName = "FileInput"

// export default FileInput
export { FileInput as default, FileInput } from "@/components/ui/form"
