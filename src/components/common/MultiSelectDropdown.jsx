import React, { useState, useRef, useEffect } from "react"
import { FaChevronDown, FaTimes } from "react-icons/fa"
import Button from "./Button"
import Checkbox from "./ui/Checkbox"

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
      {label && <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">{label}</label>}

      <div className="relative" ref={dropdownRef}>
        <div className={`w-full min-h-[42px] p-2.5 border border-[var(--color-border-input)] rounded-lg focus-within:ring-2 focus-within:ring-[var(--color-primary-bg)] focus-within:border-[var(--color-primary)] bg-[var(--color-bg-primary)] cursor-pointer ${disabled ? "bg-[var(--color-bg-muted)] cursor-not-allowed" : ""}`} onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1 flex-1 min-h-[20px]">
              {selectedValues.length === 0 ? (
                <span className="text-[var(--color-text-muted)] text-sm">{placeholder}</span>
              ) : (
                selectedValues.map((value) => (
                  <span key={value} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--color-primary-bg)] text-[var(--color-primary)] rounded-md">
                    {value}
                    {!disabled && (
                      <Button type="button" onClick={(e) => handleRemoveOption(value, e)} variant="ghost" size="small" icon={<FaTimes className="w-2 h-2" />} aria-label="Remove option" />
                    )}
                  </span>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 ml-2">
              {selectedValues.length > 0 && !disabled && (
                <Button type="button" onClick={handleClearAll} variant="ghost" size="small" icon={<FaTimes className="w-3 h-3" />} aria-label="Clear all" />
              )}
              <FaChevronDown className={`w-4 h-4 text-[var(--color-text-disabled)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-input)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[var(--color-text-muted)]">No options available</div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-[var(--color-border-light)]">
                  <Button type="button" onClick={handleClearAll} variant="ghost" size="small">
                    Clear All
                  </Button>
                </div>
                {options.map((option) => (
                  <div key={option} className={`px-3 py-2 text-sm cursor-pointer hover:bg-[var(--color-bg-tertiary)] ${selectedValues.includes(option) ? "bg-[var(--color-primary-bg)] text-[var(--color-primary)]" : "text-[var(--color-text-body)]"}`} onClick={() => handleToggleOption(option)}
                  >
                    <div className="flex items-center">
                      <Checkbox checked={selectedValues.includes(option)} onChange={() => { }} className="mr-2" />
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
