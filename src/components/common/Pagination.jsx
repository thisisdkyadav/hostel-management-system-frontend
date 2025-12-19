import React from "react"

const Pagination = ({ currentPage, totalPages, paginate }) => {
  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
      <div className="text-sm text-gray-600 mb-3 sm:mb-0">
        Page {currentPage} of {totalPages}
      </div>

      <nav className="flex flex-wrap justify-center gap-2">
        <button onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-md transition-colors text-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-600 hover:bg-[#1360AB] hover:text-white border border-gray-200"}`}
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
            <button key={pageNum} onClick={() => paginate(pageNum)} className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors text-sm ${currentPage === pageNum ? "bg-[#1360AB] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
              {pageNum}
            </button>
          )
        })}

        <button onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-md transition-colors text-sm ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-600 hover:bg-[#1360AB] hover:text-white border border-gray-200"}`}
        >
          Next
        </button>
      </nav>
    </div>
  )
}

export default Pagination
