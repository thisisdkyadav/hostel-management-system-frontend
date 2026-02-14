import React, { forwardRef } from "react"
import { Tabs as C0Tabs } from "czero/react"

const cx = (...parts) => parts.filter(Boolean).join(" ")

/**
 * Frontend compatibility adapter over C0 Tabs.
 * Keeps existing app-facing API while delegating behavior/styling to C0.
 */
const Tabs = forwardRef(({
  value,
  activeTab,
  onChange,
  setActiveTab,
  variant = "pills",
  size = "medium",
  ...rest
}, ref) => {
  const currentValue = value !== undefined ? value : activeTab
  const handleChange = onChange || setActiveTab

  return (
    <C0Tabs
      ref={ref}
      value={currentValue}
      onChange={handleChange}
      variant={variant}
      size={size}
      {...rest}
    />
  )
})

Tabs.displayName = "Tabs"

export const TabList = forwardRef(({ className = "", ...props }, ref) => (
  <C0Tabs.List ref={ref} className={className} {...props} />
))

TabList.displayName = "TabList"

export const Tab = forwardRef(({
  children,
  value,
  isSelected,
  icon,
  count,
  className = "",
  ...props
}, ref) => {
  // Backward-compatible fallback for the few legacy non-value tabs.
  if (value === undefined || value === null) {
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={Boolean(isSelected)}
        className={cx("cz-tabs-trigger", isSelected && "cz-tabs-trigger-active", className)}
        {...props}
      >
        {icon ? <span className="cz-tabs-trigger-icon">{icon}</span> : null}
        {children}
        {count !== undefined && count !== null ? (
          <span className="cz-tabs-trigger-count">{count}</span>
        ) : null}
      </button>
    )
  }

  return (
    <C0Tabs.Trigger
      ref={ref}
      value={value}
      icon={icon}
      count={count}
      className={className}
      {...props}
    >
      {children}
    </C0Tabs.Trigger>
  )
})

Tab.displayName = "Tab"

export const TabPanels = forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
))

TabPanels.displayName = "TabPanels"

export const TabPanel = forwardRef(({ children, value, ...props }, ref) => {
  if (value === undefined || value === null) {
    return (
      <div ref={ref} role="tabpanel" {...props}>
        {children}
      </div>
    )
  }

  return (
    <C0Tabs.Content ref={ref} value={value} {...props}>
      {children}
    </C0Tabs.Content>
  )
})

TabPanel.displayName = "TabPanel"

export default Tabs
