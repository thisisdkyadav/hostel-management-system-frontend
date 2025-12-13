import React from "react"
import PropTypes from "prop-types"

/**
 * FilterButton - Individual filter chip button
 * 
 * Styling:
 * - 8px border radius (rounded-lg)
 * - No shadow, no border
 * - Active: Filled with theme color, white text
 * - Inactive: Light gray background, gray text
 */
export const FilterButton = ({ 
  children, 
  isActive = false, 
  onClick, 
  icon,
  count,
  className = "" 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-1.5 rounded-lg
        text-sm font-medium transition-all duration-200
        focus:outline-none
        ${isActive 
          ? "bg-[#0b57d0] text-white" 
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
        }
        ${className}
      `}
    >
      {icon && <span className="text-xs">{icon}</span>}
      {children}
      {count !== undefined && (
        <span className={`
          px-1.5 py-0.5 rounded text-xs font-semibold
          ${isActive 
            ? "bg-white/20 text-white" 
            : "bg-gray-200 text-gray-600"
          }
        `}>
          {count}
        </span>
      )}
    </button>
  )
}

/**
 * FilterTabs - Container wrapper for multiple FilterButtons
 * 
 * Just provides flex layout with gap spacing
 */
const FilterTabs = ({ tabs, activeTab, setActiveTab, className = "" }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map((tab) => (
        <FilterButton
          key={tab.value}
          isActive={activeTab === tab.value}
          onClick={() => setActiveTab(tab.value)}
          icon={tab.icon}
          count={tab.count}
        >
          {tab.label}
        </FilterButton>
      ))}
    </div>
  )
}

/**
 * FilterChip - Removable filter chip for showing active filters
 */
export const FilterChip = ({ label, onRemove, icon, className = "" }) => {
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 
        bg-[#e8f0fe] text-[#0b57d0] rounded-lg text-sm font-medium
        transition-all duration-200 hover:bg-[#d2e3fc]
        ${className}
      `}
    >
      {icon && <span className="text-xs">{icon}</span>}
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 p-0.5 rounded hover:bg-[#a8c7fa] transition-colors focus:outline-none"
          aria-label={`Remove ${label} filter`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

/**
 * ToggleButtonGroup - Group of toggle buttons with shared background
 * 
 * Use this for binary or small set of mutually exclusive options
 * (like List/Grid toggle)
 */
export const ToggleButtonGroup = ({ options, activeValue, onChange, className = "" }) => {
  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md
            text-sm font-medium transition-all duration-200
            focus:outline-none
            ${activeValue === option.value 
              ? "bg-[#0b57d0] text-white" 
              : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          {option.icon && <span className="text-xs">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  )
}

FilterButton.propTypes = {
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.node,
  count: PropTypes.number,
  className: PropTypes.string,
}

FilterTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      icon: PropTypes.node,
      count: PropTypes.number,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  className: PropTypes.string,
}

FilterChip.propTypes = {
  label: PropTypes.string.isRequired,
  onRemove: PropTypes.func,
  icon: PropTypes.node,
  className: PropTypes.string,
}

ToggleButtonGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ).isRequired,
  activeValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
}

export default FilterTabs
