import React from "react"

const FormField = ({ label, name, type = "text", value, onChange, required = false, placeholder = "", options = [], rows = 4, error = "" }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1360AB] focus:border-[#1360AB]" placeholder={placeholder} required={required} />
      ) : type === "select" ? (
        <select id={name} name={name} value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1360AB] focus:border-[#1360AB]" required={required}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} id={name} name={name} value={value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1360AB] focus:border-[#1360AB]" placeholder={placeholder} required={required} />
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default FormField
