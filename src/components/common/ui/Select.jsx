import React, { useState, forwardRef } from "react"
import { FaChevronDown } from "react-icons/fa"

/**
 * Select Component - Dropdown select input
 * 
 * @param {string} name - Select name attribute
 * @param {string} value - Controlled selected value
 * @param {function} onChange - Change handler
 * @param {Array} options - Array of options: [{ value: "", label: "" }] or ["option1", "option2"]
 * @param {string} placeholder - Placeholder option text (shown as first disabled option)
 * @param {React.ReactNode} icon - Optional left icon
 * @param {boolean|string} error - Error state
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field
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
    id,
    className = "",
    style = {},
    ...rest
}, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    const hasError = Boolean(error)
    const hasIcon = Boolean(icon)

    // Normalize options to { value, label } format
    const normalizedOptions = options.map((opt) => {
        if (typeof opt === "string") {
            return { value: opt, label: opt }
        }
        return opt
    })

    // Container styles
    const containerStyles = {
        position: "relative",
        width: "100%",
    }

    // Select styles
    const selectStyles = {
        width: "100%",
        padding: "var(--input-padding)",
        paddingLeft: hasIcon ? "var(--spacing-10)" : "var(--input-padding)",
        paddingRight: "var(--spacing-10)", // Space for chevron
        border: `var(--border-1) solid ${hasError
                ? "var(--color-danger-border)"
                : isFocused
                    ? "var(--input-border-focus)"
                    : "var(--input-border)"
            }`,
        borderRadius: "var(--input-radius)",
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
        fontSize: "var(--font-size-base)",
        outline: "none",
        transition: "var(--transition-all)",
        boxShadow: isFocused && !hasError
            ? "var(--input-focus-ring)"
            : hasError && isFocused
                ? "var(--shadow-focus-danger)"
                : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        appearance: "none", // Remove default arrow
        WebkitAppearance: "none",
        MozAppearance: "none",
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
            : isFocused
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
        transform: "translateY(-50%)",
        color: "var(--color-text-placeholder)",
        pointerEvents: "none",
        transition: "var(--transition-colors)",
        fontSize: "var(--icon-sm)",
    }

    const handleFocus = (e) => {
        setIsFocused(true)
        rest.onFocus?.(e)
    }

    const handleBlur = (e) => {
        setIsFocused(false)
        rest.onBlur?.(e)
    }

    return (
        <div style={containerStyles}>
            {/* Left Icon */}
            {hasIcon && (
                <span style={iconStyles}>
                    {icon}
                </span>
            )}

            {/* Select Element */}
            <select
                ref={ref}
                id={id || name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                style={selectStyles}
                className={className}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...rest}
            >
                {/* Placeholder option */}
                {placeholder && (
                    <option value="" disabled={required}>
                        {placeholder}
                    </option>
                )}

                {/* Options */}
                {normalizedOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Chevron Icon */}
            <span style={chevronStyles}>
                <FaChevronDown />
            </span>
        </div>
    )
})

Select.displayName = "Select"

export default Select
