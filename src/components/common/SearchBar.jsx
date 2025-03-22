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
      <div
        className={`
          flex items-center w-full overflow-hidden
          border ${isFocused ? "border-[#1360AB] shadow-sm" : "border-gray-300"}
          bg-white rounded-xl transition-all duration-200
          focus-within:border-[#1360AB] focus-within:shadow-sm
        `}
      >
        <div className="flex items-center justify-center pl-3">
          <FaSearch className={`text-gray-400 ${isFocused ? "text-[#1360AB]" : ""} transition-colors duration-200`} />
        </div>

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-2 pr-8 py-2.5 rounded-xl text-gray-700
                    focus:outline-none bg-transparent"
        />

        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600 
                     focus:outline-none transition-colors duration-200"
            aria-label="Clear search"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>

      <div
        className={`
          absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#1360AB] 
          transition-all duration-300 rounded-full
          ${isFocused ? "w-[95%] opacity-100" : "w-0 opacity-0"}
        `}
      ></div>
    </div>
  )
}

export default SearchBar
