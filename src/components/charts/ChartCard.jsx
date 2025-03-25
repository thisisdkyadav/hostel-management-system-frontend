import React from "react"

const ChartCard = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
      </div>
      <div className="chart-container h-64">{children}</div>
    </div>
  )
}

export default ChartCard
