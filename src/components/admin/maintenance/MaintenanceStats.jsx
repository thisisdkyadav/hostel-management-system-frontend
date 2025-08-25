import React from "react"
import { FaTools, FaWrench, FaBolt, FaBuilding, FaBroom, FaWifi, FaEllipsisH, FaUserTie } from "react-icons/fa"

const MaintenanceStats = ({ maintenanceStaff }) => {
  // Count staff by category
  const countByCategory = maintenanceStaff.reduce((acc, staff) => {
    acc[staff.category] = (acc[staff.category] || 0) + 1
    return acc
  }, {})

  const totalStaff = maintenanceStaff.length

  const statCards = [
    {
      name: "Total Staff",
      value: totalStaff,
      icon: <FaTools className="text-gray-700" />,
      bgColor: "bg-gray-100",
    },
    {
      name: "Plumbing",
      value: countByCategory.Plumbing || 0,
      icon: <FaWrench className="text-blue-500" />,
      bgColor: "bg-blue-50",
    },
    {
      name: "Electrical",
      value: countByCategory.Electrical || 0,
      icon: <FaBolt className="text-yellow-500" />,
      bgColor: "bg-yellow-50",
    },
    {
      name: "Civil",
      value: countByCategory.Civil || 0,
      icon: <FaBuilding className="text-orange-500" />,
      bgColor: "bg-orange-50",
    },
    {
      name: "Cleanliness",
      value: countByCategory.Cleanliness || 0,
      icon: <FaBroom className="text-green-500" />,
      bgColor: "bg-green-50",
    },
    {
      name: "Internet",
      value: countByCategory.Internet || 0,
      icon: <FaWifi className="text-purple-500" />,
      bgColor: "bg-purple-50",
    },
    {
      name: "Attendant",
      value: countByCategory.Attendant || 0,
      icon: <FaUserTie className="text-pink-500" />,
      bgColor: "bg-pink-50",
    },
    {
      name: "Other",
      value: countByCategory.Other || 0,
      icon: <FaEllipsisH className="text-gray-500" />,
      bgColor: "bg-gray-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {statCards.map((stat) => (
        <div key={stat.name} className={`${stat.bgColor} rounded-xl p-4 flex flex-col items-center justify-center shadow-sm`}>
          <div className="w-10 h-10 flex items-center justify-center mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-sm text-gray-600 mt-1">{stat.name}</div>
        </div>
      ))}
    </div>
  )
}

export default MaintenanceStats
