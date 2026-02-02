import React from "react"
import { Button } from "czero/react"

/**
 * Pagination Component - Matches existing design language
 * 
 * @param {number} currentPage - Current active page
 * @param {number} totalPages - Total number of pages
 * @param {function} paginate - Page change handler
 * @param {boolean} compact - If true, removes padding/margins for minimal height (default: false)
 * @param {boolean} showPageInfo - If true, shows "Page X of Y" text (default: true)
 */
const Pagination = ({ currentPage, totalPages, paginate, compact = false, showPageInfo = true }) => {
  const wrapperStyles = compact
    ? { display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }
    : {}

  const wrapperClass = compact
    ? ""
    : "mt-6 flex flex-col sm:flex-row justify-between items-center"

  return (
    <div className={wrapperClass} style={wrapperStyles}>
      {showPageInfo && (
        <div className={`text-sm text-[var(--color-text-muted)] ${compact ? '' : 'mb-3 sm:mb-0'}`}>
          Page {currentPage} of {totalPages}
        </div>
      )}

      <nav className="flex flex-wrap justify-center gap-2">
        <Button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          variant="secondary"
          size="sm"
        >
          Previous
        </Button>

        {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = index + 1
          } else if (currentPage <= 3) {
            pageNum = index + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + index
          } else {
            pageNum = currentPage - 2 + index
          }

          return (
            <Button
              key={pageNum}
              onClick={() => paginate(pageNum)}
              variant={currentPage === pageNum ? "primary" : "secondary"}
              size="sm"
            >
              {pageNum}
            </Button>
          )
        })}

        <Button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          variant="secondary"
          size="sm"
        >
          Next
        </Button>
      </nav>
    </div>
  )
}

export default Pagination

