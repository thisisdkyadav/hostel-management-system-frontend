import React, { useState, useRef, useEffect, forwardRef, useCallback } from "react"
import { FaChevronDown, FaCheck } from "react-icons/fa"

/**
 * Select Component - Custom styled dropdown select
 * 
 * @param {string} name - Select name attribute
 * @param {string} value - Controlled selected value
 * @param {function} onChange - Change handler
 * @param {Array} options - Array of options: [{ value: "", label: "" }] or ["option1", "option2"]
 * @param {string} placeholder - Placeholder option text
 * @param {React.ReactNode} icon - Optional left icon
 * @param {boolean|string} error - Error state
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field
 * @param {string} size - Size variant: small, medium, large
 * @param {string} id - Optional id (defaults to name)
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Select = forwardRef(({
  name,
  value,
  onChange,
  options = [],
  placeholder,
  icon,
  error,
  disabled = false,
  required = false,
  size = "medium",
  id,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dropdownPosition, setDropdownPosition] = useState("bottom") // "bottom" or "top"
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)

  const hasError = Boolean(error)
  const hasIcon = Boolean(icon)

  // Size variants with consistent padding
  const sizes = {
    small: {
      paddingY: "var(--spacing-1-5)",
      paddingX: "var(--spacing-2-5)",
      fontSize: "var(--font-size-sm)",
      height: "var(--input-height-sm)",
      iconSpace: "var(--spacing-8)",
    },
    medium: {
      paddingY: "var(--spacing-2)",
      paddingX: "var(--spacing-3)",
      fontSize: "var(--font-size-base)",
      height: "var(--input-height-md)",
      iconSpace: "var(--spacing-10)",
    },
    large: {
      paddingY: "var(--spacing-2-5)",
      paddingX: "var(--spacing-4)",
      fontSize: "var(--font-size-lg)",
      height: "var(--input-height-lg)",
      iconSpace: "var(--spacing-12)",
    },
  }

  const currentSize = sizes[size] || sizes.medium

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return "bottom"
    
    const rect = containerRef.current.getBoundingClientRect()
    const dropdownHeight = 240 // max-height of dropdown
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    
    // If not enough space below but enough above, show on top
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      return "top"
    }
    return "bottom"
  }, [])

  // Normalize options to { value, label } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt }
    }
    return opt
  })

  // Find selected option label
  const selectedOption = normalizedOptions.find(opt => opt.value === value)
  const displayValue = selectedOption?.label || ""

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen) {
      setDropdownPosition(calculateDropdownPosition())
    }
  }, [isOpen, calculateDropdownPosition])

  // Recalculate position on scroll/resize when open
  useEffect(() => {
    if (!isOpen) return

    const handlePositionUpdate = () => {
      setDropdownPosition(calculateDropdownPosition())
    }

    window.addEventListener("scroll", handlePositionUpdate, true)
    window.addEventListener("resize", handlePositionUpdate)
    
    return () => {
      window.removeEventListener("scroll", handlePositionUpdate, true)
      window.removeEventListener("resize", handlePositionUpdate)
    }
  }, [isOpen, calculateDropdownPosition])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault()
        if (isOpen && highlightedIndex >= 0) {
          handleSelect(normalizedOptions[highlightedIndex])
        } else {
          setIsOpen(!isOpen)
        }
        break
      case "ArrowDown":
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex(prev =>
            prev < normalizedOptions.length - 1 ? prev + 1 : 0
          )
        }
        break
      case "ArrowUp":
        e.preventDefault()
        if (isOpen) {
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : normalizedOptions.length - 1
          )
        }
        break
      case "Escape":
        setIsOpen(false)
        break
      case "Tab":
        setIsOpen(false)
        break
      default:
        break
    }
  }

  const handleSelect = (option) => {
    if (onChange) {
      const syntheticEvent = {
        target: {
          name,
          value: option.value,
        },
      }
      onChange(syntheticEvent)
    }
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setIsFocused(true)
    }
  }

  // Container styles
  const containerStyles = {
    position: "relative",
    width: "100%",
  }

  // Trigger button styles
  const triggerStyles = {
    width: "100%",
    height: currentSize.height,
    padding: `${currentSize.paddingY} ${currentSize.paddingX}`,
    paddingLeft: hasIcon ? currentSize.iconSpace : currentSize.paddingX,
    paddingRight: currentSize.iconSpace,
    border: `var(--border-1) solid ${hasError
      ? "var(--color-danger-border)"
      : isOpen || isFocused
        ? "var(--input-border-focus)"
        : "var(--input-border)"
      }`,
    borderRadius: "var(--radius-input)",
    backgroundColor: disabled
      ? "var(--color-bg-disabled)"
      : hasError
        ? "var(--color-danger-bg-light)"
        : "var(--input-bg)",
    color: disabled
      ? "var(--color-text-disabled)"
      : value
        ? "var(--color-text-body)"
        : "var(--color-text-placeholder)",
    fontSize: currentSize.fontSize,
    fontWeight: "var(--font-weight-normal)",
    outline: "none",
    transition: "var(--transition-all)",
    boxShadow: (isOpen || isFocused) && !hasError
      ? "var(--input-focus-ring)"
      : hasError && isFocused
        ? "var(--shadow-focus-danger)"
        : "none",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "left",
    ...style,
  }

  // Icon styles
  const iconStyles = {
    position: "absolute",
    left: "var(--spacing-3)",
    top: "50%",
    transform: "translateY(-50%)",
    color: hasError
      ? "var(--color-danger)"
      : isOpen || isFocused
        ? "var(--color-primary)"
        : "var(--color-text-placeholder)",
    pointerEvents: "none",
    transition: "var(--transition-colors)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--icon-md)",
  }

  // Chevron styles
  const chevronStyles = {
    position: "absolute",
    right: "var(--spacing-3)",
    top: "50%",
    transform: `translateY(-50%) rotate(${isOpen ? "180deg" : "0deg"})`,
    color: isOpen ? "var(--color-primary)" : "var(--color-text-placeholder)",
    pointerEvents: "none",
    transition: "var(--transition-all)",
    fontSize: "var(--icon-sm)",
  }

  // Dropdown styles with dynamic positioning
  const dropdownStyles = {
    position: "absolute",
    ...(dropdownPosition === "bottom" 
      ? { top: "calc(100% + var(--spacing-1))" }
      : { bottom: "calc(100% + var(--spacing-1))" }
    ),
    left: 0,
    right: 0,
    backgroundColor: "var(--color-bg-primary)",
    border: "var(--border-1) solid var(--color-border-primary)",
    borderRadius: "var(--radius-dropdown)",
    boxShadow: "var(--shadow-dropdown)",
    zIndex: "var(--z-dropdown)",
    maxHeight: "240px",
    overflowY: "auto",
    overflowX: "hidden",
    padding: "var(--spacing-1)",
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    transform: isOpen 
      ? "translateY(0)" 
      : dropdownPosition === "bottom" 
        ? "translateY(-8px)" 
        : "translateY(8px)",
    transition: "opacity 0.2s ease, transform 0.2s ease, visibility 0.2s",
  }

  // Option styles
  const getOptionStyles = (option, index) => ({
    padding: "var(--spacing-2-5) var(--spacing-3)",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--spacing-2)",
    fontSize: "var(--font-size-base)",
    fontWeight: option.value === value ? "var(--font-weight-medium)" : "var(--font-weight-normal)",
    color: option.value === value
      ? "var(--color-primary)"
      : "var(--color-text-body)",
    backgroundColor: option.value === value
      ? "var(--color-primary-bg)"
      : highlightedIndex === index
        ? "var(--color-bg-hover)"
        : "transparent",
    transition: "var(--transition-colors)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  })

  // Check icon styles
  const checkIconStyles = {
    fontSize: "var(--icon-sm)",
    color: "var(--color-primary)",
    flexShrink: 0,
  }

  return (
    <div ref={containerRef} style={containerStyles}>
      {/* Hidden native select for form compatibility */}
      <select
        ref={ref}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
        }}
        tabIndex={-1}
        aria-hidden="true"
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Left Icon */}
      {hasIcon && (
        <span style={iconStyles}>
          {icon}
        </span>
      )}

      {/* Custom Trigger Button */}
      <button
        type="button"
        style={triggerStyles}
        className={className}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => !isOpen && setIsFocused(false)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id || name}
        aria-invalid={hasError}
      >
        <span style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
        }}>
          {displayValue || placeholder || "Select..."}
        </span>
      </button>

      {/* Chevron Icon */}
      <span style={chevronStyles}>
        <FaChevronDown />
      </span>

      {/* Custom Dropdown */}
      <div
        ref={dropdownRef}
        style={dropdownStyles}
        role="listbox"
        aria-activedescendant={highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined}
      >
        {/* Placeholder option if exists */}
        {placeholder && !required && (
          <div
            style={getOptionStyles({ value: "", label: placeholder }, -1)}
            onClick={() => handleSelect({ value: "", label: placeholder })}
            onMouseEnter={() => setHighlightedIndex(-1)}
            role="option"
            aria-selected={value === ""}
          >
            <span style={{
              color: "var(--color-text-placeholder)",
              fontStyle: "italic",
            }}>
              {placeholder}
            </span>
          </div>
        )}

        {/* Options */}
        {normalizedOptions.map((opt, index) => (
          <div
            key={opt.value}
            id={`option-${index}`}
            style={getOptionStyles(opt, index)}
            onClick={() => handleSelect(opt)}
            onMouseEnter={() => setHighlightedIndex(index)}
            role="option"
            aria-selected={opt.value === value}
          >
            <span style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
            }}>
              {opt.label}
            </span>
            {opt.value === value && (
              <FaCheck style={checkIconStyles} />
            )}
          </div>
        ))}

        {/* Empty state */}
        {normalizedOptions.length === 0 && (
          <div style={{
            padding: "var(--spacing-3)",
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-sm)",
            textAlign: "center",
          }}>
            No options available
          </div>
        )}
      </div>
    </div>
  )
})

Select.displayName = "Select"

export default Select
