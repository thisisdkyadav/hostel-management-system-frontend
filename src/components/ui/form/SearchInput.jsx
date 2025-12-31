import React, { useState, forwardRef } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"

/**
 * SearchInput Component - Search input with icon and clear button
 * 
 * @param {string} value - Controlled search value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disabled state
 * @param {string} size - Size variant: sm, md, lg
 * @param {boolean} showClear - Show clear button when has value
 * @param {function} onClear - Clear button handler
 * @param {function} onSearch - Search submit handler (Enter key)
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const SearchInput = forwardRef(({
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  size = "md",
  showClear = true,
  onClear,
  onSearch,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isClearHovered, setIsClearHovered] = useState(false)

  const hasValue = Boolean(value)

  // Size variants
  const sizes = {
    sm: {
      padding: "var(--spacing-2) var(--spacing-3)",
      paddingLeft: "var(--spacing-8)",
      paddingRight: showClear && hasValue ? "var(--spacing-8)" : "var(--spacing-3)",
      fontSize: "var(--font-size-sm)",
      height: "var(--input-height-sm)",
      iconSize: "14px",
    },
    md: {
      padding: "var(--spacing-2-5) var(--spacing-3)",
      paddingLeft: "var(--spacing-10)",
      paddingRight: showClear && hasValue ? "var(--spacing-10)" : "var(--spacing-3)",
      fontSize: "var(--font-size-base)",
      height: "var(--input-height-md)",
      iconSize: "16px",
    },
    lg: {
      padding: "var(--spacing-3) var(--spacing-4)",
      paddingLeft: "var(--spacing-12)",
      paddingRight: showClear && hasValue ? "var(--spacing-12)" : "var(--spacing-4)",
      fontSize: "var(--font-size-lg)",
      height: "var(--input-height-lg)",
      iconSize: "18px",
    },
  }

  const currentSize = sizes[size] || sizes.md

  // Container styles - width controlled by className
  const containerStyles = {
    position: "relative",
  }

  // Input styles
  const inputStyles = {
    width: "100%",
    height: currentSize.height,
    padding: currentSize.padding,
    paddingLeft: currentSize.paddingLeft,
    paddingRight: currentSize.paddingRight,
    border: `var(--border-1) solid ${isFocused ? "var(--input-border-focus)" : "var(--input-border)"}`,
    borderRadius: "var(--radius-input)",
    backgroundColor: disabled ? "var(--color-bg-disabled)" : "var(--input-bg)",
    color: disabled ? "var(--color-text-disabled)" : "var(--color-text-body)",
    fontSize: currentSize.fontSize,
    outline: "none",
    transition: "var(--transition-all)",
    boxShadow: isFocused ? "var(--input-focus-ring)" : "none",
    cursor: disabled ? "not-allowed" : "text",
    ...style,
  }

  // Search icon styles
  const searchIconStyles = {
    position: "absolute",
    left: "var(--spacing-3)",
    top: "50%",
    transform: "translateY(-50%)",
    color: isFocused ? "var(--color-primary)" : "var(--color-text-placeholder)",
    pointerEvents: "none",
    transition: "var(--transition-colors)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  // Clear button styles
  const clearButtonStyles = {
    position: "absolute",
    right: "var(--spacing-3)",
    top: "50%",
    transform: "translateY(-50%)",
    background: isClearHovered ? "var(--color-bg-hover)" : "transparent",
    border: "none",
    padding: "var(--spacing-1)",
    cursor: "pointer",
    color: isClearHovered ? "var(--color-danger)" : "var(--color-text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition-colors)",
    borderRadius: "var(--radius-sm)",
  }

  const handleFocus = (e) => {
    setIsFocused(true)
    rest.onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    rest.onBlur?.(e)
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (onChange) {
      onChange({ target: { value: "" } })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value)
    }
    rest.onKeyDown?.(e)
  }

  return (
    <div style={containerStyles} className={className}>
      {/* Search Icon */}
      <span style={searchIconStyles}>
        <FaSearch size={currentSize.iconSize} />
      </span>

      {/* Input Element */}
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyles}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...rest}
      />

      {/* Clear Button */}
      {showClear && hasValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          style={clearButtonStyles}
          tabIndex={-1}
          aria-label="Clear search"
          onMouseEnter={() => setIsClearHovered(true)}
          onMouseLeave={() => setIsClearHovered(false)}
        >
          <FaTimes size={currentSize.iconSize} />
        </button>
      )}
    </div>
  )
})

SearchInput.displayName = "SearchInput"

export default SearchInput
