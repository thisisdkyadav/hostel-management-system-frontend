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
      icon: <FaTools style={{ color: "var(--color-text-body)" }} />,
      bgColor: "var(--color-bg-hover)",
    },
    {
      name: "Plumbing",
      value: countByCategory.Plumbing || 0,
      icon: <FaWrench style={{ color: "var(--color-info)" }} />,
      bgColor: "var(--color-info-bg-light)",
    },
    {
      name: "Electrical",
      value: countByCategory.Electrical || 0,
      icon: <FaBolt style={{ color: "var(--color-warning)" }} />,
      bgColor: "var(--color-warning-bg-light)",
    },
    {
      name: "Civil",
      value: countByCategory.Civil || 0,
      icon: <FaBuilding style={{ color: "var(--color-orange-text)" }} />,
      bgColor: "var(--color-orange-bg)",
    },
    {
      name: "Cleanliness",
      value: countByCategory.Cleanliness || 0,
      icon: <FaBroom style={{ color: "var(--color-success)" }} />,
      bgColor: "var(--color-success-bg-light)",
    },
    {
      name: "Internet",
      value: countByCategory.Internet || 0,
      icon: <FaWifi style={{ color: "var(--color-purple-text)" }} />,
      bgColor: "var(--color-purple-bg)",
    },
    {
      name: "Attendant",
      value: countByCategory.Attendant || 0,
      icon: <FaUserTie style={{ color: "var(--color-girls-text)" }} />,
      bgColor: "var(--color-girls-bg)",
    },
    {
      name: "Other",
      value: countByCategory.Other || 0,
      icon: <FaEllipsisH style={{ color: "var(--color-text-muted)" }} />,
      bgColor: "var(--color-bg-tertiary)",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {statCards.map((stat) => (
        <div key={stat.name} style={{ backgroundColor: stat.bgColor, borderRadius: "var(--radius-xl)", padding: "var(--spacing-4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: "var(--spacing-10)", height: "var(--spacing-10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-2)" }}>{stat.icon}</div>
          <div style={{ fontSize: "var(--font-size-3xl)", fontWeight: "var(--font-weight-bold)" }}>{stat.value}</div>
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginTop: "var(--spacing-1)" }}>{stat.name}</div>
        </div>
      ))}
    </div>
  )
}

export default MaintenanceStats
