import React from "react"
import PropTypes from "prop-types"

/**
 * PageHeader - Consistent header across all admin pages
 * 
 * Responsive design:
 * - Mobile: Stacked layout, auto height, smaller text, hidden date
 * - Tablet+: Horizontal layout, fixed 64px height
 * - Desktop: Same as tablet with more padding
 * 
 * @param {string|React.ReactNode} title - Page title text
 * @param {React.ReactNode} children - Action buttons and controls
 * @param {string|React.ReactNode} subtitle - Optional subtitle text (shown below title)
 * @param {boolean} showDate - Show current date when subtitle is not provided
 * @param {string} className - Additional CSS classes
 * @param {boolean} hideTitleOnMobile - If true, hides title and date on mobile view (below sm breakpoint)
 */
const PageHeader = ({
  title,
  children,
  subtitle = null,
  showDate = true,
  className = "",
  hideTitleOnMobile = false,
}) => {
  const formatDate = () => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date().toLocaleDateString(undefined, options)
  }

  return (
    <header
      className={`sticky top-0 z-10 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-primary)] ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="px-3 py-2 sm:px-4 sm:py-0 md:px-6 lg:px-8 sm:h-16 flex items-center">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 w-full">
          {/* Left Section - Title & Date */}
          <div className={`min-w-0 flex-shrink-0 ${hideTitleOnMobile ? "hidden sm:block" : ""}`}>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--color-primary)] tracking-tight truncate">{title}</h1>
            {subtitle ? (
              <p className="hidden sm:block text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
            ) : (
              showDate && <p className="hidden sm:block text-xs text-[var(--color-text-muted)] mt-0.5">{formatDate()}</p>
            )}
          </div>

          {/* Right Section - Actions (optional) */}
          {children && (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap ml-auto sm:ml-0">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
  subtitle: PropTypes.node,
  showDate: PropTypes.bool,
  className: PropTypes.string,
  hideTitleOnMobile: PropTypes.bool,
}

export default PageHeader

