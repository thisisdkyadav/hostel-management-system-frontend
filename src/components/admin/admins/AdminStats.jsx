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
      color: "bg-[var(--color-primary)]",
      lightColor: "bg-[var(--color-primary-bg)]",
      textColor: "text-[var(--color-primary)]",
    },
    {
      title: "Active Admins",
      value: activeAdmins,
      icon: FaUserCheck,
      color: "bg-[var(--color-success)]",
      lightColor: "bg-[var(--color-success-bg)]",
      textColor: "text-[var(--color-success-text)]",
    },
    {
      title: "New This Month",
      value: recentAdmins,
      icon: FaUserShield,
      color: "bg-[var(--color-purple-text)]",
      lightColor: "bg-[var(--color-purple-bg)]",
      textColor: "text-[var(--color-purple-text)]",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-4)] mb-[var(--spacing-6)]">
      {stats.map((stat, index) => (
        <div key={index} className="bg-[var(--color-bg-primary)] rounded-[var(--radius-xl)] p-[var(--spacing-6)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-[var(--transition-shadow)] duration-[var(--duration-normal)]">
          <div className="flex items-center">
            <div className={`${stat.lightColor} p-[var(--spacing-3)] rounded-[var(--radius-lg)]`}>
              <stat.icon className={`text-[var(--font-size-xl)] ${stat.textColor}`} />
            </div>
            <div className="ml-[var(--spacing-4)]">
              <p className="text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-[var(--color-text-muted)]">{stat.title}</p>
              <p className="text-[var(--font-size-2xl)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)]">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AdminStats
