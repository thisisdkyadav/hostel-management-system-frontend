import React from "react"

// Individual card component
const StatCard = ({ title, value, subtitle, icon, color = "#1360AB" }) => {
  return (
    <div className="bg-white rounded-[20px] p-5 shadow-[0px_1px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">{title}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold" style={{ color }}>
          {value}
        </h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

// Main component that renders a grid of stat cards
const StatCards = ({ stats, columns = 4 }) => {
  return (
    <div className={`grid grid-cols-${columns} gap-4 mt-6`}>
      {stats.map((stat, index) => (
        <StatCard key={index} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} color={stat.color} />
      ))}
    </div>
  )
}

export default StatCards
