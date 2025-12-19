import React from "react"
import PropTypes from "prop-types"

/**
 * PageHeader - Consistent header across all admin pages
 * 
 * Matches the admin Dashboard header styling:
 * - Title in theme color (text-xl font-semibold)
 * - Date below title (text-xs text-gray-500)
 * - Optional right-side content for actions
 */
const PageHeader = ({ title, children, className = "" }) => {
  const formatDate = () => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date().toLocaleDateString(undefined, options)
  }

  return (
    <header className={`sticky top-0 z-10 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-primary)] ${className}`} style={{ boxShadow: 'var(--shadow-sm)', }} >
      <div className="px-4 md:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Title & Date */}
          <div>
            <h1 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">{title}</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{formatDate()}</p>
          </div>

          {/* Right Section - Actions (optional) */}
          {children && (
            <div className="flex items-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
}

export default PageHeader
