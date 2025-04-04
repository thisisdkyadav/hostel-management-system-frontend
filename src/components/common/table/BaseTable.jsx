import React from "react"

const BaseTable = ({ columns, data, onRowClick, emptyMessage = "No data to display" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.className || ""} ${column.align === "right" ? "text-right" : "text-left"}`}>
                  {column.customHeaderRender ? column.customHeaderRender() : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr key={item.id || index} onClick={() => onRowClick && onRowClick(item)} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${onRowClick ? "cursor-pointer" : ""}`}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`px-4 py-3 whitespace-nowrap ${column.className || ""} ${column.align === "right" ? "text-right" : "text-left"}`}>
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && <div className="text-center py-8 text-gray-500">{emptyMessage}</div>}
    </div>
  )
}

export default BaseTable
