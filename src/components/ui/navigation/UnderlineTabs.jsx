import React, { forwardRef, useState } from "react"

/**
 * UnderlineTabs - Simple horizontal tabs with underlined active indicator
 * 
 * Designed for actual page/section navigation (not filter chips).
 * Features minimal gap, clean underline highlight, and compact sizing.
 * 
 * @example
 * <UnderlineTabs
 *   tabs={[
 *     { value: "overview", label: "Overview" },
 *     { value: "details", label: "Details" },
 *     { value: "history", label: "History", icon: <FiClock /> }
 *   ]}
 *   value={activeTab}
 *   onChange={setActiveTab}
 * />
 */
const UnderlineTabs = forwardRef(({
    tabs = [],
    value,
    onChange,
    size = "medium",
    fullWidth = false,
    showBorder = true,
    className = "",
    style = {},
}, ref) => {
    const [hoveredValue, setHoveredValue] = useState(null)

    // Size configurations - compact feel
    const sizeConfig = {
        small: {
            padding: "var(--spacing-1-5) var(--spacing-2)",
            fontSize: "var(--font-size-xs)",
            gap: "var(--spacing-1)",
            iconSize: "12px",
        },
        medium: {
            padding: "var(--spacing-2) var(--spacing-3)",
            fontSize: "var(--font-size-sm)",
            gap: "var(--spacing-1-5)",
            iconSize: "14px",
        },
        large: {
            padding: "var(--spacing-2-5) var(--spacing-4)",
            fontSize: "var(--font-size-base)",
            gap: "var(--spacing-1-5)",
            iconSize: "16px",
        },
    }

    const currentSize = sizeConfig[size] || sizeConfig.medium

    const containerStyles = {
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        borderBottom: showBorder ? "1px solid var(--color-border-primary)" : "none",
        ...(fullWidth && { width: "100%" }),
        ...style,
    }

    const handleTabClick = (tabValue) => {
        if (onChange) {
            onChange(tabValue)
        }
    }

    return (
        <div
            ref={ref}
            className={className}
            style={containerStyles}
            role="tablist"
            aria-label="Tabs"
        >
            {tabs.map((tab) => {
                const isActive = value === tab.value
                const isHovered = hoveredValue === tab.value
                const isDisabled = tab.disabled

                const tabStyles = {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: currentSize.gap,
                    padding: currentSize.padding,
                    fontSize: currentSize.fontSize,
                    fontWeight: isActive ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
                    color: isActive 
                        ? "var(--color-primary)" 
                        : isHovered 
                            ? "var(--color-text-primary)" 
                            : "var(--color-text-muted)",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: isActive 
                        ? "2px solid var(--color-primary)" 
                        : "2px solid transparent",
                    marginBottom: "-1px",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                    transition: "var(--transition-all)",
                    whiteSpace: "nowrap",
                    ...(fullWidth && { flex: 1 }),
                }

                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && handleTabClick(tab.value)}
                        onMouseEnter={() => setHoveredValue(tab.value)}
                        onMouseLeave={() => setHoveredValue(null)}
                        style={tabStyles}
                    >
                        {tab.icon && (
                            <span style={{ display: "flex", alignItems: "center", fontSize: currentSize.iconSize }}>
                                {tab.icon}
                            </span>
                        )}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "0 var(--spacing-1-5)",
                                    minWidth: "20px",
                                    height: "18px",
                                    fontSize: "var(--font-size-xs)",
                                    fontWeight: "var(--font-weight-semibold)",
                                    borderRadius: "var(--radius-sm)",
                                    backgroundColor: isActive 
                                        ? "var(--color-primary-bg)" 
                                        : "var(--color-bg-muted)",
                                    color: isActive 
                                        ? "var(--color-primary)" 
                                        : "var(--color-text-muted)",
                                }}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
})

UnderlineTabs.displayName = "UnderlineTabs"

export default UnderlineTabs
