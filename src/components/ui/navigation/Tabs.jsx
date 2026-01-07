import React, { forwardRef, useState, createContext, useContext } from "react"

/**
 * Tabs context
 */
const TabsContext = createContext(null)

/**
 * Tabs Component - Tab navigation
 * 
 * Supports two usage patterns:
 * 1. Compound pattern: <Tabs value={} onChange={}><TabList><Tab value="x">...</Tab></TabList></Tabs>
 * 2. Simple array pattern (FilterTabs compatible): <Tabs tabs={[{label, value, icon, count}]} activeTab={} setActiveTab={} />
 * 
 * @param {React.ReactNode} children - Tab components (for compound pattern)
 * @param {Array} tabs - Array of tab objects [{label, value, icon, count}] (for simple pattern)
 * @param {string|number} value - Current active tab value
 * @param {string|number} activeTab - Alias for value (FilterTabs compatible)
 * @param {function} onChange - Tab change handler
 * @param {function} setActiveTab - Alias for onChange (FilterTabs compatible)
 * @param {string} variant - Style variant: underline, pills, enclosed
 * @param {string} size - Size: small, medium, large
 * @param {boolean} fullWidth - Tabs take full width
 * @param {string} className - Additional class names
 * @param {object} style - Additional inline styles
 */
const Tabs = forwardRef(({
  children,
  tabs,
  value,
  activeTab,
  onChange,
  setActiveTab,
  variant = "pills",
  size = "medium",
  fullWidth = false,
  className = "",
  style = {},
  ...rest
}, ref) => {
  // Support both value/onChange and activeTab/setActiveTab APIs
  const currentValue = value !== undefined ? value : activeTab
  const handleChange = onChange || setActiveTab

  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    ...style,
  }

  // Simple array-based tabs (FilterTabs compatible mode)
  if (tabs && Array.isArray(tabs)) {
    return (
      <div ref={ref} className={`flex flex-wrap gap-2 ${className}`} style={style} {...rest}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleChange?.(tab.value)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium border-none cursor-pointer 
              focus:outline-none transition-all duration-200
              ${currentValue === tab.value 
                ? "bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-dark)]" 
                : "bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-bg-hover)] hover:text-[var(--color-primary)] border border-[var(--color-border-light)]"
              }
            `}
          >
            {tab.icon && <span className="text-sm">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`
                px-2 py-0.5 rounded-md text-xs font-semibold
                ${currentValue === tab.value 
                  ? "bg-white/20 text-white" 
                  : "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]"
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  // Compound component pattern
  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange, variant, size, fullWidth }}>
      <div ref={ref} className={className} style={containerStyles} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})

Tabs.displayName = "Tabs"

/**
 * TabList Component - Container for Tab items
 */
export const TabList = forwardRef(({
  children,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const context = useContext(TabsContext)
  const { variant, fullWidth } = context || {}

  const listStyles = {
    display: "flex",
    alignItems: "center",
    gap: variant === "pills" ? "var(--spacing-2)" : 0,
    borderBottom: variant === "underline" ? "1px solid var(--color-border-primary)" : "none",
    background: variant === "enclosed" ? "var(--color-bg-secondary)" : "transparent",
    padding: variant === "enclosed" ? "var(--spacing-1)" : 0,
    borderRadius: variant === "enclosed" ? "var(--radius-md)" : 0,
    ...(fullWidth && { width: "100%" }),
    ...style,
  }

  return (
    <div ref={ref} role="tablist" className={className} style={listStyles} {...rest}>
      {children}
    </div>
  )
})

TabList.displayName = "TabList"

/**
 * Tab Component - Individual tab button
 */
export const Tab = forwardRef(({
  children,
  value: tabValue,
  disabled = false,
  icon,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const context = useContext(TabsContext)
  const { value, onChange, variant, size, fullWidth } = context || {}
  const [isHovered, setIsHovered] = useState(false)
  
  const isActive = value === tabValue

  const sizes = {
    small: {
      padding: variant === "pills" ? "var(--spacing-1-5) var(--spacing-3)" : "var(--spacing-2) var(--spacing-3)",
      fontSize: "var(--font-size-sm)",
    },
    medium: {
      padding: variant === "pills" ? "var(--spacing-2) var(--spacing-4)" : "var(--spacing-3) var(--spacing-4)",
      fontSize: "var(--font-size-base)",
    },
    large: {
      padding: variant === "pills" ? "var(--spacing-2-5) var(--spacing-5)" : "var(--spacing-4) var(--spacing-5)",
      fontSize: "var(--font-size-lg)",
    },
  }

  const currentSize = sizes[size] || sizes.medium

  const getTabStyles = () => {
    const baseStyles = {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--spacing-2)",
      padding: currentSize.padding,
      fontSize: currentSize.fontSize,
      fontWeight: "var(--font-weight-medium)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      border: "none",
      background: "transparent",
      transition: "var(--transition-all)",
      outline: "none",
      whiteSpace: "nowrap",
      ...(fullWidth && { flex: 1, justifyContent: "center" }),
    }

    if (variant === "underline") {
      return {
        ...baseStyles,
        color: isActive ? "var(--color-primary)" : isHovered ? "var(--color-text-primary)" : "var(--color-text-muted)",
        borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
        marginBottom: "-1px",
      }
    }

    if (variant === "pills") {
      return {
        ...baseStyles,
        color: isActive ? "white" : isHovered ? "var(--color-primary)" : "var(--color-text-muted)",
        background: isActive ? "var(--color-primary)" : isHovered ? "var(--color-primary-bg)" : "transparent",
        borderRadius: "var(--radius-button-md)",
      }
    }

    if (variant === "enclosed") {
      return {
        ...baseStyles,
        color: isActive ? "var(--color-text-heading)" : "var(--color-text-muted)",
        background: isActive ? "var(--color-bg-primary)" : "transparent",
        borderRadius: "var(--radius-sm)",
        boxShadow: isActive ? "var(--shadow-sm)" : "none",
      }
    }

    return baseStyles
  }

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(tabValue)
    }
  }

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={className}
      style={{ ...getTabStyles(), ...style }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {icon && <span style={{ display: "flex" }}>{icon}</span>}
      {children}
    </button>
  )
})

Tab.displayName = "Tab"

/**
 * TabPanels Component - Container for TabPanel items
 */
export const TabPanels = forwardRef(({
  children,
  className = "",
  style = {},
  ...rest
}, ref) => {
  return (
    <div ref={ref} className={className} style={style} {...rest}>
      {children}
    </div>
  )
})

TabPanels.displayName = "TabPanels"

/**
 * TabPanel Component - Individual tab content panel
 */
export const TabPanel = forwardRef(({
  children,
  value: panelValue,
  className = "",
  style = {},
  ...rest
}, ref) => {
  const context = useContext(TabsContext)
  const { value } = context || {}
  const isActive = value === panelValue

  if (!isActive) return null

  const panelStyles = {
    padding: "var(--spacing-4) 0",
    ...style,
  }

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={className}
      style={panelStyles}
      {...rest}
    >
      {children}
    </div>
  )
})

TabPanel.displayName = "TabPanel"

export default Tabs
