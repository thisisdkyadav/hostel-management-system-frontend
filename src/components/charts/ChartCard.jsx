import React from "react"

const ChartCard = ({ title, icon, children }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        {icon && <span className="mr-2 text-lg">{icon}</span>} {title}
      </h2>
      <div className="h-64">{children}</div>
    </div>
  )
}

export default ChartCard
