import React from "react"
import { FaRegClock, FaRegCalendarAlt, FaBell, FaUsers } from "react-icons/fa"

const NotificationStats = ({ stats }) => {
  const statItems = [
    {
      title: "Total Notifications",
      value: stats?.total || 0,
      icon: <FaBell className="text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Active Notifications",
      value: stats?.active || 0,
      icon: <FaUsers className="text-green-500" />,
      color: "bg-green-50",
    },
    {
      title: "Expired Notifications",
      value: stats?.expired || 0,
      icon: <FaRegCalendarAlt className="text-red-500" />,
      color: "bg-red-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => (
        <div key={index} className={`p-4 rounded-xl ${item.color} border border-gray-100 shadow-sm transition-all duration-200 hover:shadow`}>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-white mr-3 shadow-sm">{item.icon}</div>
            <div>
              <h3 className="text-sm text-gray-600">{item.title}</h3>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationStats
