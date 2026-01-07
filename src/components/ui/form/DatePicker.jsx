import React, { useState, useRef, useEffect, useCallback, forwardRef } from "react"
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa"

/**
 * DatePicker Component - Material Design 3 inspired date picker
 * 
 * @param {string} name - Input name attribute
 * @param {string} value - Selected date in YYYY-MM-DD format
 * @param {function} onChange - Change handler (receives date string)
 * @param {string} placeholder - Placeholder text
 * @param {React.ReactNode} icon - Optional custom icon (defaults to calendar)
 * @param {boolean|string} error - Error state (boolean or error message string)
 * @param {boolean} disabled - Disabled state
 * @param {boolean} readOnly - ReadOnly state
 * @param {boolean} required - Required field
 * @param {string} min - Minimum date (YYYY-MM-DD)
 * @param {string} max - Maximum date (YYYY-MM-DD)
 * @param {string} size - Size variant: small, medium, large
 * @param {string} id - Optional id (defaults to name)
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const DatePicker = forwardRef(({
  name,
  value,
  onChange,
  placeholder = "Select date",
  icon,
  error,
  disabled = false,
  readOnly = false,
  required = false,
  min,
  max,
  size = "medium",
  id,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) return new Date(value)
    return new Date()
  })
  const [dropdownPosition, setDropdownPosition] = useState("bottom")
  
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const hasError = Boolean(error)

  // Size variants
  const sizes = {
    small: {
      padding: "var(--spacing-2) var(--spacing-3)",
      paddingRight: "var(--spacing-8)",
      fontSize: "var(--font-size-sm)",
      height: "var(--input-height-sm)",
    },
    medium: {
      padding: "var(--spacing-2-5) var(--spacing-3)",
      paddingRight: "var(--spacing-10)",
      fontSize: "var(--font-size-base)",
      height: "var(--input-height-md)",
    },
    large: {
      padding: "var(--spacing-3) var(--spacing-4)",
      paddingRight: "var(--spacing-12)",
      fontSize: "var(--font-size-lg)",
      height: "var(--input-height-lg)",
    },
  }

  const currentSize = sizes[size] || sizes.medium

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Day names
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const dropdownHeight = 340 // Approximate height of calendar
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setDropdownPosition("top")
    } else {
      setDropdownPosition("bottom")
    }
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      if (isOpen) calculateDropdownPosition()
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("scroll", handleScroll, true)
    window.addEventListener("resize", calculateDropdownPosition)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", calculateDropdownPosition)
    }
  }, [isOpen, calculateDropdownPosition])

  // Parse value to Date object
  const selectedDate = value ? new Date(value) : null

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const daysInPrevMonth = getDaysInMonth(year, month - 1)
    
    const days = []
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(year, month - 1, day)
      days.push({ date, day, isCurrentMonth: false })
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, day, isCurrentMonth: true })
    }
    
    // Next month days to fill grid
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, day, isCurrentMonth: false })
    }
    
    return days
  }

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  // Format date for value
  const formatValueDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Check if date is disabled
  const isDateDisabled = (date) => {
    if (min) {
      const minDate = new Date(min)
      minDate.setHours(0, 0, 0, 0)
      if (date < minDate) return true
    }
    if (max) {
      const maxDate = new Date(max)
      maxDate.setHours(23, 59, 59, 999)
      if (date > maxDate) return true
    }
    return false
  }

  // Check if date is today
  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Check if date is selected
  const isSelected = (date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  // Handle date select
  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return
    const formattedDate = formatValueDate(date)
    onChange?.({ target: { name, value: formattedDate } })
    setIsOpen(false)
  }

  // Navigate month
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  // Navigate year
  const navigateYear = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setFullYear(prev.getFullYear() + direction)
      return newDate
    })
  }

  // Go to today
  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    handleDateSelect(today)
  }

  // Handle input click
  const handleInputClick = () => {
    if (disabled || readOnly) return
    calculateDropdownPosition()
    setIsOpen(!isOpen)
  }

  // Handle keyboard
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleInputClick()
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  // Styles
  const containerStyles = {
    position: "relative",
    width: "100%",
  }

  const inputStyles = {
    width: "100%",
    height: currentSize.height,
    padding: currentSize.padding,
    paddingRight: currentSize.paddingRight,
    border: `1px solid ${hasError
      ? "var(--color-danger-border)"
      : isFocused || isOpen
        ? "var(--color-primary)"
        : "var(--input-border)"
    }`,
    borderRadius: "var(--radius-input)",
    backgroundColor: disabled || readOnly
      ? "var(--color-bg-disabled)"
      : hasError
        ? "var(--color-danger-bg-light)"
        : "var(--input-bg)",
    color: value
      ? disabled
        ? "var(--color-text-disabled)"
        : "var(--color-text-body)"
      : "var(--color-text-placeholder)",
    fontSize: currentSize.fontSize,
    outline: "none",
    cursor: disabled ? "not-allowed" : readOnly ? "default" : "pointer",
    transition: "border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: (isFocused || isOpen) && !hasError
      ? "0 0 0 3px color-mix(in srgb, var(--color-primary) 16%, transparent)"
      : hasError && isFocused
        ? "0 0 0 3px color-mix(in srgb, var(--color-danger) 16%, transparent)"
        : "none",
    textAlign: "left",
    ...style,
  }

  const iconContainerStyles = {
    position: "absolute",
    right: "var(--spacing-3)",
    top: "50%",
    transform: "translateY(-50%)",
    color: hasError
      ? "var(--color-danger)"
      : isFocused || isOpen
        ? "var(--color-primary)"
        : "var(--color-text-placeholder)",
    pointerEvents: "none",
    transition: "color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  const dropdownStyles = {
    position: "absolute",
    left: 0,
    right: 0,
    ...(dropdownPosition === "top" ? { bottom: "100%", marginBottom: "var(--spacing-1)" } : { top: "100%", marginTop: "var(--spacing-1)" }),
    zIndex: 50,
    background: "var(--color-bg-primary)",
    borderRadius: "var(--radius-xl)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)",
    border: "1px solid color-mix(in srgb, var(--color-text-muted) 12%, transparent)",
    overflow: "hidden",
    minWidth: "300px",
    animation: "fadeIn 0.15s ease-out",
  }

  const headerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--spacing-3) var(--spacing-4)",
    borderBottom: "1px solid color-mix(in srgb, var(--color-text-muted) 12%, transparent)",
  }

  const navButtonStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    background: "transparent",
    color: "var(--color-text-body)",
    cursor: "pointer",
    transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  }

  const monthYearStyles = {
    fontSize: "var(--font-size-base)",
    fontWeight: "500",
    color: "var(--color-text-primary)",
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-1)",
  }

  const calendarGridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    padding: "var(--spacing-2) var(--spacing-3) var(--spacing-3)",
    gap: "2px",
  }

  const dayHeaderStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "36px",
    fontSize: "var(--font-size-xs)",
    fontWeight: "500",
    color: "var(--color-text-muted)",
  }

  const getDayStyles = (dayInfo) => {
    const { date, isCurrentMonth } = dayInfo
    const selected = isSelected(date)
    const today = isToday(date)
    const dateDisabled = isDateDisabled(date)

    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      border: "none",
      fontSize: "var(--font-size-sm)",
      fontWeight: selected || today ? "500" : "400",
      cursor: dateDisabled ? "not-allowed" : "pointer",
      transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      background: selected
        ? "var(--color-primary)"
        : today && !selected
          ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
          : "transparent",
      color: dateDisabled
        ? "var(--color-text-disabled)"
        : selected
          ? "white"
          : !isCurrentMonth
            ? "var(--color-text-muted)"
            : today
              ? "var(--color-primary)"
              : "var(--color-text-body)",
      opacity: dateDisabled && !isCurrentMonth ? 0.3 : dateDisabled ? 0.5 : 1,
    }
  }

  const footerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--spacing-2) var(--spacing-3)",
    borderTop: "1px solid color-mix(in srgb, var(--color-text-muted) 12%, transparent)",
  }

  const todayButtonStyles = {
    padding: "var(--spacing-2) var(--spacing-3)",
    borderRadius: "var(--radius-full)",
    border: "none",
    background: "transparent",
    color: "var(--color-primary)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  }

  const clearButtonStyles = {
    ...todayButtonStyles,
    color: "var(--color-text-muted)",
  }

  const calendarDays = generateCalendarDays()

  return (
    <div ref={containerRef} style={containerStyles}>
      {/* Input Field */}
      <div
        ref={inputRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={inputStyles}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-invalid={hasError}
        {...rest}
      >
        {value ? formatDisplayDate(value) : placeholder}
      </div>

      {/* Calendar Icon */}
      <span style={iconContainerStyles}>
        {icon || <FaCalendarAlt size={16} />}
      </span>

      {/* Hidden input for form submission */}
      <input
        ref={ref}
        type="hidden"
        id={id || name}
        name={name}
        value={value || ""}
        required={required}
      />

      {/* Calendar Dropdown */}
      {isOpen && (
        <div ref={dropdownRef} style={dropdownStyles} role="dialog" aria-label="Date picker">
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(${dropdownPosition === "top" ? "8px" : "-8px"}); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>

          {/* Header */}
          <div style={headerStyles}>
            <div style={{ display: "flex", gap: "var(--spacing-1)" }}>
              <button
                type="button"
                style={navButtonStyles}
                onClick={() => navigateYear(-1)}
                onMouseEnter={(e) => e.target.style.background = "color-mix(in srgb, var(--color-text-muted) 8%, transparent)"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
                aria-label="Previous year"
              >
                <FaChevronLeft size={10} />
                <FaChevronLeft size={10} style={{ marginLeft: "-6px" }} />
              </button>
              <button
                type="button"
                style={navButtonStyles}
                onClick={() => navigateMonth(-1)}
                onMouseEnter={(e) => e.target.style.background = "color-mix(in srgb, var(--color-text-muted) 8%, transparent)"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
                aria-label="Previous month"
              >
                <FaChevronLeft size={12} />
              </button>
            </div>

            <span style={monthYearStyles}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>

            <div style={{ display: "flex", gap: "var(--spacing-1)" }}>
              <button
                type="button"
                style={navButtonStyles}
                onClick={() => navigateMonth(1)}
                onMouseEnter={(e) => e.target.style.background = "color-mix(in srgb, var(--color-text-muted) 8%, transparent)"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
                aria-label="Next month"
              >
                <FaChevronRight size={12} />
              </button>
              <button
                type="button"
                style={navButtonStyles}
                onClick={() => navigateYear(1)}
                onMouseEnter={(e) => e.target.style.background = "color-mix(in srgb, var(--color-text-muted) 8%, transparent)"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
                aria-label="Next year"
              >
                <FaChevronRight size={10} />
                <FaChevronRight size={10} style={{ marginLeft: "-6px" }} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={calendarGridStyles}>
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} style={dayHeaderStyles}>
                {day}
              </div>
            ))}

            {/* Days */}
            {calendarDays.map((dayInfo, index) => (
              <button
                key={index}
                type="button"
                style={getDayStyles(dayInfo)}
                onClick={() => handleDateSelect(dayInfo.date)}
                onMouseEnter={(e) => {
                  if (!isDateDisabled(dayInfo.date) && !isSelected(dayInfo.date)) {
                    e.target.style.background = "color-mix(in srgb, var(--color-text-muted) 8%, transparent)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected(dayInfo.date)) {
                    e.target.style.background = isToday(dayInfo.date) 
                      ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" 
                      : "transparent"
                  }
                }}
                disabled={isDateDisabled(dayInfo.date)}
                aria-label={dayInfo.date.toLocaleDateString()}
                aria-selected={isSelected(dayInfo.date)}
              >
                {dayInfo.day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={footerStyles}>
            <button
              type="button"
              style={clearButtonStyles}
              onClick={() => {
                onChange?.({ target: { name, value: "" } })
                setIsOpen(false)
              }}
              onMouseEnter={(e) => e.target.style.background = "color-mix(in srgb, var(--color-text-muted) 8%, transparent)"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
            >
              Clear
            </button>
            <button
              type="button"
              style={todayButtonStyles}
              onClick={goToToday}
              onMouseEnter={(e) => e.target.style.background = "color-mix(in srgb, var(--color-primary) 12%, transparent)"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

DatePicker.displayName = "DatePicker"

export default DatePicker
