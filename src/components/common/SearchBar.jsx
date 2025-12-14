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
          ${isFocused ? "text-[#0b57d0]" : "text-[#8fa3c4]"}
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
          boxShadow: isFocused ? '0 0 0 3px rgba(11, 87, 208, 0.1)' : 'none',
          transition: 'all 0.3s ease',
        }}
        className={`
          w-full py-3 pl-11 pr-10
          rounded-xl border bg-white
          text-sm text-[#0a1628] font-normal
          placeholder:text-[#8fa3c4]
          focus:outline-none
          ${isFocused 
            ? "border-[#0b57d0]" 
            : "border-[#d4e4fd]"
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
            ${isFocused ? "text-[#0b57d0] hover:text-[#083ca8]" : "text-[#8fa3c4] hover:text-[#4a6085]"}
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
