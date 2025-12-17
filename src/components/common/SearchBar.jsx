import React, { useState } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"

const SearchBar = ({ value, onChange, placeholder = "Search...", className }) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    const event = { target: { value: "" } }
    onChange(event)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <FaSearch 
        className={`
          absolute left-4 top-1/2 -translate-y-1/2 
          pointer-events-none transition-colors duration-300
          ${isFocused ? "text-[var(--color-primary)]" : "text-[var(--color-text-placeholder)]"}
        `}
        size={14}
      />

      {/* Search Input */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          boxShadow: isFocused ? 'var(--shadow-focus-primary)' : 'none',
          transition: 'var(--transition-all)',
        }}
        className={`
          w-full py-3 pl-11 pr-10
          rounded-[var(--radius-input)] border bg-[var(--color-bg-primary)]
          text-sm text-[var(--color-text-primary)] font-normal
          placeholder:text-[var(--color-text-placeholder)]
          focus:outline-none
          ${isFocused 
            ? "border-[var(--color-primary)]" 
            : "border-[var(--color-border-secondary)]"
          }
        `}
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={handleClear}
          className={`
            absolute right-4 top-1/2 -translate-y-1/2
            transition-colors duration-200
            focus:outline-none
            ${isFocused ? "text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]" : "text-[var(--color-text-placeholder)] hover:text-[var(--color-text-tertiary)]"}
          `}
          aria-label="Clear search"
        >
          <FaTimes size={14} />
        </button>
      )}
    </div>
  )
}

export default SearchBar
