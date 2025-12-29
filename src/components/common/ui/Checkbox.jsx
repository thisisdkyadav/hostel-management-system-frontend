import React, { forwardRef } from "react"

/**
 * Checkbox Component - Specialized checkbox input
 * 
 * @param {string} id - Checkbox id
 * @param {string} name - Checkbox name attribute
 * @param {boolean} checked - Controlled checked state
 * @param {function} onChange - Change handler
 * @param {boolean} disabled - Disabled state
 * @param {string} size - Size variant: sm, md, lg
 * @param {string} label - Optional inline label text
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Checkbox = forwardRef(({
    id,
    name,
    checked = false,
    onChange,
    disabled = false,
    size = "md",
    label,
    className = "",
    style = {},
    ...rest
}, ref) => {

    // Size mappings
    const sizes = {
        sm: {
            checkbox: "var(--icon-sm)",
            label: "var(--font-size-sm)",
        },
        md: {
            checkbox: "var(--icon-md)",
            label: "var(--font-size-base)",
        },
        lg: {
            checkbox: "var(--icon-lg)",
            label: "var(--font-size-lg)",
        },
    }

    const currentSize = sizes[size] || sizes.md

    // Container styles
    const containerStyles = {
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-2)",
        cursor: disabled ? "not-allowed" : "pointer",
    }

    // Checkbox styles
    const checkboxStyles = {
        width: currentSize.checkbox,
        height: currentSize.checkbox,
        accentColor: "var(--color-primary)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? "var(--opacity-disabled)" : "var(--opacity-100)",
        margin: 0,
        ...style,
    }

    // Label styles
    const labelStyles = {
        fontSize: currentSize.label,
        color: disabled ? "var(--color-text-disabled)" : "var(--color-text-body)",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
    }

    const checkboxId = id || name

    // If label is provided, wrap in a label element
    if (label) {
        return (
            <label htmlFor={checkboxId} style={containerStyles}>
                <input
                    ref={ref}
                    type="checkbox"
                    id={checkboxId}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    style={checkboxStyles}
                    className={className}
                    {...rest}
                />
                <span style={labelStyles}>{label}</span>
            </label>
        )
    }

    // Without label, just render the checkbox
    return (
        <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            style={checkboxStyles}
            className={className}
            {...rest}
        />
    )
})

Checkbox.displayName = "Checkbox"

export default Checkbox
