import React from "react"

export const StatCard = ({ title, value, subtitle, icon, color = "#1360AB" }) => {
  return (
    <div className="bg-white rounded-xl hover:rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 h-full" style={{ borderLeftColor: color }}>
      <div className="flex justify-between items-start">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <div className="p-2 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          {React.cloneElement(icon, { style: { color }, className: "text-xl" })}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl md:text-3xl font-bold" style={{ color }}>
          {value}
        </h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

const StatCards = ({ stats, columns = 4 }) => {
  const getGridClass = () => {
    // Show 2 cards per row by default, 1 card only on tiny screens (<480px)
    let gridClass = "grid-cols-2 max-[375px]:grid-cols-1"

    if (columns === 1) {
      gridClass = "grid-cols-1"
    } else if (columns === 2) {
      gridClass = "grid-cols-2"
    } else if (columns === 3) {
      gridClass += " md:grid-cols-3"
    } else if (columns >= 4) {
      gridClass += " lg:grid-cols-4"
    }

    return gridClass
  }

  return (
    <div className={`grid ${getGridClass()} gap-3 md:gap-5`}>
      {stats.map((stat, index) => (
        <StatCard key={index} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} color={stat.color} />
      ))}
    </div>
  )
}

export default StatCards
