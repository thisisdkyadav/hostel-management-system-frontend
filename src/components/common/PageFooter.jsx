import React from "react"
import PropTypes from "prop-types"

/**
 * PageFooter - Consistent footer across all admin pages
 * 
 * Designed for pagination and info display:
 * - Left section for pagination info (e.g., "Page 1 of 5")
 * - Right section for record counts (e.g., "10 of 3000 students")
 * - Minimal height, fixed at bottom for desktop
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
                height: '48px',
                maxHeight: '48px',
            }}
        >
            <div className="h-full px-4 md:px-6 lg:px-8 py-2 flex items-center">
                <div className="flex items-center justify-between gap-4 w-full">
                    {/* Left Section */}
                    <div className="flex items-center gap-3">
                        {leftContent.map((item, index) => (
                            <React.Fragment key={index}>{item}</React.Fragment>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
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
