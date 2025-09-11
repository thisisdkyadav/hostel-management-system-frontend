import React, { useState, useRef, useEffect } from "react"
import { FaChevronDown, FaTimes } from "react-icons/fa"

const MultiSelectDropdown = ({ options = [], selectedValues = [], onChange, placeholder = "Select options...", label, disabled = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggleOption = (value) => {
    const newSelectedValues = selectedValues.includes(value) ? selectedValues.filter((v) => v !== value) : [...selectedValues, value]

    onChange(newSelectedValues)
  }

  const handleRemoveOption = (valueToRemove, e) => {
    e.stopPropagation()
    const newSelectedValues = selectedValues.filter((v) => v !== valueToRemove)
    onChange(newSelectedValues)
  }

  const handleClearAll = (e) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>}

      <div className="relative" ref={dropdownRef}>
        <div className={`w-full min-h-[42px] p-2.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-[#1360AB] bg-white cursor-pointer ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1 flex-1 min-h-[20px]">
              {selectedValues.length === 0 ? (
                <span className="text-gray-500 text-sm">{placeholder}</span>
              ) : (
                selectedValues.map((value) => (
                  <span key={value} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                    {value}
                    {!disabled && (
                      <button type="button" className="ml-1 text-blue-600 hover:text-blue-800" onClick={(e) => handleRemoveOption(value, e)}>
                        <FaTimes className="w-2 h-2" />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 ml-2">
              {selectedValues.length > 0 && !disabled && (
                <button type="button" className="text-gray-400 hover:text-gray-600" onClick={handleClearAll}>
                  <FaTimes className="w-3 h-3" />
                </button>
              )}
              <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-gray-100">
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-800" onClick={handleClearAll}>
                    Clear All
                  </button>
                </div>
                {options.map((option) => (
                  <div key={option} className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedValues.includes(option) ? "bg-blue-50 text-blue-700" : "text-gray-700"}`} onClick={() => handleToggleOption(option)}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={() => {}} // Handled by onClick above
                        className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      {option}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MultiSelectDropdown
