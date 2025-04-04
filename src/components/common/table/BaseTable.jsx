import React from "react"

const BaseTable = ({ columns, data, onRowClick, emptyMessage = "No data to display", isLoading = false, stickyHeader = false, title, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`bg-gray-50 ${stickyHeader ? "sticky top-0 z-10" : ""}`}>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.className || ""} ${column.align === "right" ? "text-right" : "text-left"}`}>
                  {column.customHeaderRender ? column.customHeaderRender() : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center">
                  <div className="flex justify-center">
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Loading data...</div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <tr key={item.id || index} onClick={() => onRowClick && onRowClick(item)} className={`transition-colors duration-150 hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${onRowClick ? "cursor-pointer" : ""}`}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 text-sm text-gray-700 ${column.className || ""} ${column.align === "right" ? "text-right" : "text-left"}`}>
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
      </div>
      {!isLoading && data.length === 0 && (
        <div className="text-center py-10 px-4">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}

export default BaseTable
