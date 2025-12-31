import React from "react"
import Button from "@/components/ui/button/Button"

/**
 * Pagination Component - Matches existing design language
 * 
 * @param {number} currentPage - Current active page
 * @param {number} totalPages - Total number of pages
 * @param {function} paginate - Page change handler
 */
const Pagination = ({ currentPage, totalPages, paginate }) => {
  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
      <div className="text-sm text-[var(--color-text-muted)] mb-3 sm:mb-0">
        Page {currentPage} of {totalPages}
      </div>

      <nav className="flex flex-wrap justify-center gap-2">
        <Button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          variant="secondary"
          size="small"
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
              size="small"
            >
              {pageNum}
            </Button>
          )
        })}

        <Button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          variant="secondary"
          size="small"
        >
          Next
        </Button>
      </nav>
    </div>
  )
}

export default Pagination
