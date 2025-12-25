import React, { useState } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"
import Button from "./Button"

const SearchBar = ({ value, onChange, placeholder = "Search...", className }) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    const event = { target: { value: "" } }
    onChange(event)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <FaSearch className={` absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${isFocused ? "text-[var(--color-primary)]" : "text-[var(--color-text-placeholder)]"} `} size={14} />

      {/* Search Input */}
      <input type="text" placeholder={placeholder} value={value} onChange={onChange} onFocus={() => setIsFocused(true)}
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
        <Button onClick={handleClear}
          variant="ghost"
          size="small"
          icon={<FaTimes size={14} />}
          aria-label="Clear search"
          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
        />
      )}
    </div>
  )
}

export default SearchBar
