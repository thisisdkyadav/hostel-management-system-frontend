import React from "react"
import { FaUserShield, FaUsers, FaUserCheck } from "react-icons/fa"

const AdminStats = ({ admins }) => {
  const totalAdmins = admins.length
  const activeAdmins = admins.filter((admin) => admin.isActive !== false).length
  const recentAdmins = admins.filter((admin) => {
    if (!admin.createdAt) return false
    const createdDate = new Date(admin.createdAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return createdDate >= thirtyDaysAgo
  }).length

  const stats = [
    {
      title: "Total Admins",
      value: totalAdmins,
      icon: FaUsers,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Active Admins",
      value: activeAdmins,
      icon: FaUserCheck,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "New This Month",
      value: recentAdmins,
      icon: FaUserShield,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className={`${stat.lightColor} p-3 rounded-lg`}>
              <stat.icon className={`text-xl ${stat.textColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AdminStats
