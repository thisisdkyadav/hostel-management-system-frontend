import React, { forwardRef } from "react"
import { Input as C0Input } from "czero/react"
import { FaSearch } from "react-icons/fa"

const normalizeSize = (size = "md") => {
  if (size === "small" || size === "sm") return "sm"
  if (size === "large" || size === "lg") return "lg"
  return "md"
}

/**
 * SearchInput compatibility wrapper.
 * Keeps existing frontend API while delegating rendering/styling to C0 SearchInput.
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
  onKeyDown,
  ...props
}, ref) => {
  const hasValue = Boolean(value)

  const handleClear = () => {
    if (onClear) {
      onClear()
      return
    }
    if (onChange) {
      onChange({ target: { value: "" } })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value || "")
    }
    onKeyDown?.(e)
  }

  return (
    <div className={className} style={style}>
      <C0Input
        ref={ref}
        variant="search"
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        size={normalizeSize(size)}
        leftIcon={<FaSearch />}
        onClear={showClear && hasValue ? handleClear : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </div>
  )
})

SearchInput.displayName = "SearchInput"

export default SearchInput
