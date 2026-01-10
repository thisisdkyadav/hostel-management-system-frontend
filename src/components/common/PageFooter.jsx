import React from "react"
import PropTypes from "prop-types"

/**
 * PageFooter - Consistent footer across all admin pages
 * 
 * Responsive design:
 * - Mobile: Stacked layout, auto height, centered content
 * - Tablet+: Horizontal layout, fixed 48px height
 * - Desktop: Same as tablet with more padding
 * 
 * @param {Array} leftContent - Array of React nodes for left section
 * @param {Array} rightContent - Array of React nodes for right section
 * @param {string} className - Additional CSS classes
 */
const PageFooter = ({ leftContent = [], rightContent = [], className = "" }) => {
    return (
        <footer
            className={`sticky bottom-0 z-10 bg-[var(--color-bg-primary)] border-t border-[var(--color-border-primary)] ${className}`}
            style={{
                boxShadow: 'var(--shadow-sm)',
            }}
        >
            <div className="px-3 py-2 sm:px-4 sm:py-0 md:px-6 lg:px-8 sm:h-12 flex items-center">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 w-full">
                    {/* Left Section */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                        {leftContent.map((item, index) => (
                            <React.Fragment key={index}>{item}</React.Fragment>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                        {rightContent.map((item, index) => (
                            <React.Fragment key={index}>{item}</React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

PageFooter.propTypes = {
    leftContent: PropTypes.arrayOf(PropTypes.node),
    rightContent: PropTypes.arrayOf(PropTypes.node),
    className: PropTypes.string,
}

export default PageFooter

