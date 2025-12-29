import React from "react"
import PropTypes from "prop-types"

/**
 * ToggleButtonGroup - A group of toggle buttons for switching between options
 * 
 * Features:
 * - Multiple button options with icons and labels
 * - Controlled value state
 * - Pill or corner-rounded shapes
 * - Multiple size and variant options
 * - Responsive label hiding
 * 
 * @example
 * <ToggleButtonGroup
 *   options={[
 *     { value: "list", label: "List", icon: <FaList /> },
 *     { value: "grid", label: "Grid", icon: <FaTh /> }
 *   ]}
 *   value={viewMode}
 *   onChange={setViewMode}
 *   shape="pill"
 *   size="medium"
 * />
 */
const ToggleButtonGroup = ({
    options,
    value,
    onChange,
    shape = "pill",
    size = "medium",
    variant = "muted",
    fullWidth = false,
    hideLabelsOnMobile = true,
    className = "",
    style = {},
    disabled = false,
}) => {
    // Container border radius based on shape
    const containerRadius = {
        pill: "var(--radius-full)",
        rounded: "var(--radius-lg)",
        square: "var(--radius-md)",
    }

    // Button border radius based on shape
    const buttonRadius = {
        pill: "var(--radius-full)",
        rounded: "var(--radius-md)",
        square: "var(--radius-sm)",
    }

    // Size configurations
    const sizeConfig = {
        small: {
            padding: "var(--spacing-1) var(--spacing-2)",
            fontSize: "var(--font-size-xs)",       // 12px
            iconSize: "var(--font-size-xs)",
            gap: "var(--spacing-1)",
            containerPadding: "var(--spacing-0-5)",
        },
        medium: {
            padding: "var(--spacing-1-5) var(--spacing-3)",
            fontSize: "var(--font-size-base)",     // 14px
            iconSize: "var(--font-size-base)",
            gap: "var(--spacing-2)",
            containerPadding: "var(--spacing-1)",
        },
        large: {
            padding: "var(--spacing-2) var(--spacing-4)",
            fontSize: "var(--font-size-lg)",       // 16px
            iconSize: "var(--font-size-lg)",
            gap: "var(--spacing-2)",
            containerPadding: "var(--spacing-1-5)",
        },
    }

    // Variant configurations for container background
    const containerVariantStyles = {
        muted: {
            backgroundColor: "var(--color-bg-muted)",
        },
        primary: {
            backgroundColor: "var(--color-primary-bg)",
        },
        outline: {
            backgroundColor: "transparent",
            border: "1px solid var(--color-border-primary)",
        },
        white: {
            backgroundColor: "var(--color-bg-primary)",
            boxShadow: "var(--shadow-sm)",
        },
    }

    // Active button styles per variant
    const activeStyles = {
        muted: {
            backgroundColor: "var(--color-bg-primary)",
            color: "var(--color-primary)",
            boxShadow: "var(--shadow-sm)",
        },
        primary: {
            backgroundColor: "var(--color-primary)",
            color: "var(--color-white)",
            boxShadow: "var(--shadow-sm)",
        },
        outline: {
            backgroundColor: "var(--color-primary-bg)",
            color: "var(--color-primary)",
        },
        white: {
            backgroundColor: "var(--color-primary)",
            color: "var(--color-white)",
        },
    }

    // Inactive button styles per variant
    const inactiveStyles = {
        muted: {
            backgroundColor: "transparent",
            color: "var(--color-text-muted)",
        },
        primary: {
            backgroundColor: "transparent",
            color: "var(--color-primary)",
        },
        outline: {
            backgroundColor: "transparent",
            color: "var(--color-text-muted)",
        },
        white: {
            backgroundColor: "transparent",
            color: "var(--color-text-muted)",
        },
    }

    // Hover color for inactive buttons
    const hoverColor = "var(--color-text-primary)"

    const currentSize = sizeConfig[size]
    const currentContainerVariant = containerVariantStyles[variant]

    const containerStyles = {
        display: "flex",
        alignItems: "center",
        borderRadius: containerRadius[shape],
        padding: currentSize.containerPadding,
        ...currentContainerVariant,
        ...(fullWidth && { width: "100%" }),
        ...style,
    }

    const handleButtonClick = (optionValue) => {
        if (!disabled && onChange) {
            onChange(optionValue)
        }
    }

    return (
        <div
            className={`toggle-button-group ${className}`}
            style={containerStyles}
            role="group"
            aria-label="Toggle button group"
        >
            {options.map((option) => {
                const isActive = value === option.value
                const buttonStyle = isActive ? activeStyles[variant] : inactiveStyles[variant]

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleButtonClick(option.value)}
                        disabled={disabled || option.disabled}
                        className="flex items-center font-medium"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: currentSize.gap,
                            padding: currentSize.padding,
                            fontSize: currentSize.fontSize,
                            borderRadius: buttonRadius[shape],
                            border: "none",
                            cursor: disabled || option.disabled ? "not-allowed" : "pointer",
                            transition: "var(--transition-all)",
                            opacity: disabled || option.disabled ? 0.5 : 1,
                            ...(fullWidth && { flex: 1 }),
                            ...buttonStyle,
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive && !disabled && !option.disabled) {
                                e.currentTarget.style.color = hoverColor
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive && !disabled && !option.disabled) {
                                e.currentTarget.style.color = inactiveStyles[variant].color
                            }
                        }}
                        aria-pressed={isActive}
                        aria-label={option.ariaLabel || option.label}
                    >
                        {option.icon && (
                            <span
                                className="flex-shrink-0"
                                style={{ fontSize: currentSize.iconSize }}
                            >
                                {option.icon}
                            </span>
                        )}
                        {option.label && (
                            <span className={hideLabelsOnMobile ? "hidden sm:inline" : ""}>
                                {option.label}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

ToggleButtonGroup.propTypes = {
    /** Array of toggle options */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string,
            icon: PropTypes.node,
            disabled: PropTypes.bool,
            ariaLabel: PropTypes.string,
        })
    ).isRequired,
    /** Currently selected value */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Callback when value changes */
    onChange: PropTypes.func,
    /** Shape of the toggle group container and buttons */
    shape: PropTypes.oneOf(["pill", "rounded", "square"]),
    /** Size of the toggle buttons */
    size: PropTypes.oneOf(["small", "medium", "large"]),
    /** Visual variant of the toggle group */
    variant: PropTypes.oneOf(["muted", "primary", "outline", "white"]),
    /** Whether buttons should fill available width */
    fullWidth: PropTypes.bool,
    /** Hide labels on mobile, show only icons */
    hideLabelsOnMobile: PropTypes.bool,
    /** Additional CSS classes */
    className: PropTypes.string,
    /** Additional inline styles */
    style: PropTypes.object,
    /** Disable all toggle buttons */
    disabled: PropTypes.bool,
}

export default ToggleButtonGroup
