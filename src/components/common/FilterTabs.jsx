import React from "react"
import PropTypes from "prop-types"

/**
 * FilterButton - Modern filter chip button
 * 
 * Styling:
 * - Rounded corners with border radius
 * - Subtle shadow on inactive state
 * - Active: Solid primary color, white text, enhanced shadow
 * - Inactive: White background, gray text
 * - Hover: Background color change
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
        inline-flex items-center gap-2 px-4 py-2 rounded-[10px]
        text-sm font-medium border-none cursor-pointer
        focus:outline-none transition-all duration-200
        ${isActive 
          ? "bg-[#0b57d0] text-white shadow-sm hover:bg-[#083ca8]" 
          : "bg-white text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0b57d0]"
        }
        ${className}
      `}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {children}
      {count !== undefined && (
        <span className={`
          px-2 py-0.5 rounded-md text-xs font-semibold
          ${isActive 
            ? "bg-white/20 text-white" 
            : "bg-[#f1f5f9] text-[#64748b]"
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
    <div 
      className={`flex bg-white rounded-xl p-1 ${className}`}
      style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-[10px]
            text-sm font-medium cursor-pointer border-none
            focus:outline-none transition-all duration-200
            ${activeValue === option.value 
              ? "bg-[#0b57d0] text-white shadow-sm" 
              : "text-[#64748b] hover:text-[#0b57d0] hover:bg-[#f8fafc]"
            }
          `}
        >
          {option.icon && <span className="text-sm">{option.icon}</span>}
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
