import React, { useState, useRef, useEffect, useMemo } from "react"
import { FaChevronDown, FaTimes } from "react-icons/fa"
import { Button, HStack } from "hzero"
import Checkbox from "./ui/Checkbox"

/** Normalize string options and `{ value, label }` objects to a common shape. */
const normalizeOption = (option) => {
  if (option && typeof option === "object") {
    const value = option.value ?? option.id ?? option.key
    if (value === undefined || value === null) return null
    return {
      value: String(value),
      label: String(option.label ?? option.name ?? value),
    }
  }
  if (option === undefined || option === null || option === "") return null
  return { value: String(option), label: String(option) }
}

const MultiSelectDropdown = ({ options = [], selectedValues = [], onChange, placeholder = "Select options...", label, disabled = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption).filter(Boolean),
    [options],
  )

  const labelByValue = useMemo(() => {
    const map = new Map()
    normalizedOptions.forEach((option) => {
      map.set(option.value, option.label)
    })
    return map
  }, [normalizedOptions])

  const selected = useMemo(
    () => (Array.isArray(selectedValues) ? selectedValues.map(String) : []),
    [selectedValues],
  )

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
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(next)
  }

  const handleRemoveOption = (valueToRemove, e) => {
    e.stopPropagation()
    onChange(selected.filter((v) => v !== valueToRemove))
  }

  const handleClearAll = (e) => {
    e.stopPropagation()
    onChange([])
  }

  const displayLabel = (value) => labelByValue.get(value) || value

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">{label}</label>}

      <div className="relative" ref={dropdownRef}>
        <div className={`w-full min-h-[42px] p-2.5 border border-[var(--color-border-input)] rounded-lg focus-within:ring-2 focus-within:ring-[var(--color-primary-bg)] focus-within:border-[var(--color-primary)] bg-[var(--color-bg-primary)] cursor-pointer ${disabled ? "bg-[var(--color-bg-muted)] cursor-not-allowed" : ""}`} onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <HStack gap={1} wrap className="flex-1 min-h-[20px]">
              {selected.length === 0 ? (
                <span className="text-[var(--color-text-muted)] text-sm">{placeholder}</span>
              ) : (
                selected.map((value) => (
                  <span key={value} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--color-primary-bg)] text-[var(--color-primary)] rounded-md">
                    {displayLabel(value)}
                    {!disabled && (
                      <Button type="button" onClick={(e) => handleRemoveOption(value, e)} variant="ghost" size="sm" aria-label={`Remove ${displayLabel(value)}`}><FaTimes className="w-2 h-2" /></Button>
                    )}
                  </span>
                ))
              )}
            </HStack>

            <HStack align="center" gap={2} className="ml-2">
              {selected.length > 0 && !disabled && (
                <Button type="button" onClick={handleClearAll} variant="ghost" size="sm" aria-label="Clear all"><FaTimes className="w-3 h-3" /></Button>
              )}
              <FaChevronDown className={`w-4 h-4 text-[var(--color-text-disabled)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </HStack>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-input)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[var(--color-text-muted)]">No options available</div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-[var(--color-border-light)]">
                  <Button type="button" onClick={handleClearAll} variant="ghost" size="sm">
                    Clear All
                  </Button>
                </div>
                {normalizedOptions.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <div
                      key={option.value}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-[var(--color-bg-tertiary)] ${isSelected ? "bg-[var(--color-primary-bg)] text-[var(--color-primary)]" : "text-[var(--color-text-body)]"}`}
                      onClick={() => handleToggleOption(option.value)}
                    >
                      <div className="flex items-center">
                        <Checkbox checked={isSelected} onChange={() => {}} className="mr-2" />
                        {option.label}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MultiSelectDropdown
