import React from "react"

const StatCard = ({ icon, iconColor, bgColor, title, value }) => {
  return (
    <div className={`${bgColor} p-4 rounded-lg text-center`}>
      {icon && <span className={`mx-auto ${iconColor} text-xl mb-2`}>{icon}</span>}
      <p className="text-xs text-gray-600">{title}</p>
      <p className={`text-xl font-bold ${iconColor}`}>{value}</p>
    </div>
  )
}

export default StatCard
