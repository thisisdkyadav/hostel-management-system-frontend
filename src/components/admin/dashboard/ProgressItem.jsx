import React from "react"

const ProgressItem = ({ title, pending, color, percentage }) => {
  const bgColorMap = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    yellow: "bg-yellow-50",
    purple: "bg-purple-50",
  }

  const badgeColorMap = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
  }

  const barColorMap = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
    purple: "bg-purple-600",
  }

  return (
    <div className={`${bgColorMap[color]} p-3 rounded-lg`}>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{title}</p>
        <span className={`text-xs ${badgeColorMap[color]} px-2 py-0.5 rounded`}>{pending} pending</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div className={`${barColorMap[color]} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="text-xs text-right mt-1 text-gray-500">{percentage}% complete</p>
    </div>
  )
}

export default ProgressItem
