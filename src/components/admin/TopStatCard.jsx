import React from "react"

const TopStatCard = ({ title, value, subtitle, icon, color = "#1360AB" }) => {
  return (
    <div className="bg-white rounded-[20px] p-5 shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">{title}</span>
        <div className={`text-[${color}] text-2xl`}>{icon}</div>
      </div>
      <div className="mt-4">
        <h3 className={`text-3xl font-bold text-[${color}]`}>{value}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

export default TopStatCard
