import React from "react"

const BaseTable = ({ columns, data, onRowClick, emptyMessage = "No data to display", isLoading = false, stickyHeader = false, title, className = "" }) => {
  return (
    <div 
      className={`rounded-2xl overflow-hidden border border-[#e2e8f0] bg-white ${className}`}
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {title && (
        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#fafbfc]">
          <h3 className="text-base font-semibold text-[#1a1a2e]">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className={`bg-[#f8fafc] ${stickyHeader ? "sticky top-0 z-10" : ""}`}>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className={`
                    px-6 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider
                    border-b border-[#e2e8f0]
                    ${column.className || ""} 
                    ${column.align === "right" ? "text-right" : "text-left"}
                  `}
                >
                  {column.customHeaderRender ? column.customHeaderRender() : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center bg-white">
                  <div className="flex justify-center">
                    <svg className="animate-spin h-6 w-6 text-[#0b57d0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div className="mt-3 text-sm text-[#64748b]">Loading...</div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  onClick={() => onRowClick && onRowClick(item)} 
                  className={`
                    transition-colors duration-150 
                    border-b border-[#f1f5f9] last:border-b-0
                    ${onRowClick ? "cursor-pointer" : ""}
                    ${index % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}
                    hover:bg-[#f0f7ff]
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`
                        px-6 py-4 text-sm text-[#334155]
                        ${column.className || ""} 
                        ${column.align === "right" ? "text-right" : "text-left"}
                      `}
                    >
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
        <div className="text-center py-12 px-4 bg-white">
          <svg className="mx-auto h-10 w-10 text-[#cbd5e1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-3 text-sm text-[#64748b]">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}

export default BaseTable
