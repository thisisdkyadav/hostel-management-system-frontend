import React from "react"

const FormField = ({ label, name, type = "text", value, onChange, required = false, placeholder = "", options = [], rows = 4, error = "", className = "" }) => {
  const inputClasses = `
    w-full px-3 py-2 
    border border-[var(--color-border-input)] 
    rounded-md shadow-sm 
    focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
    bg-[var(--color-bg-primary)] text-[var(--color-text-body)]
    ${className}
  `

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-[var(--color-text-body)] mb-1">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className={inputClasses} placeholder={placeholder} required={required} />
      ) : type === "select" ? (
        <select id={name} name={name} value={value} onChange={onChange} className={inputClasses} required={required} >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} id={name} name={name} value={value} onChange={onChange} className={inputClasses} placeholder={placeholder} required={required} />
      )}

      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}

export default FormField
