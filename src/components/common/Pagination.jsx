import React from "react"

const Pagination = ({ currentPage, totalPages, paginate }) => {
  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
      <div className="text-sm text-[var(--color-text-muted)] mb-3 sm:mb-0">
        Page {currentPage} of {totalPages}
      </div>

      <nav className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-md transition-colors text-sm ${currentPage === 1 ? "bg-[var(--color-bg-muted)] text-[var(--color-text-disabled)] cursor-not-allowed" : "bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-border-primary)]"}`}
        >
          Previous
        </button>

        {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
          // Logic to show pages around current page
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
            <button
              key={pageNum}
              onClick={() => paginate(pageNum)}
              className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors text-sm ${currentPage === pageNum ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]"}`}
            >
              {pageNum}
            </button>
          )
        })}

        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-md transition-colors text-sm ${currentPage === totalPages ? "bg-[var(--color-bg-muted)] text-[var(--color-text-disabled)] cursor-not-allowed" : "bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-border-primary)]"}`}
        >
          Next
        </button>
      </nav>
    </div>
  )
}

export default Pagination
