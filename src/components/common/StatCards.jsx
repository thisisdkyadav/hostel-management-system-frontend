import React from "react"

export const StatCard = ({ title, value, subtitle, icon, color = "#1360AB" }) => {
  return (
    <div className="bg-white rounded-xl hover:rounded-2xl p-4 py-3 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 group relative overflow-hidden" style={{ borderLeftColor: color }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ease-out" style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` }}></div>

      <div className="flex justify-between items-start relative z-10">
        <span className="text-gray-600 text-sm font-medium transform group-hover:translate-x-1 transition-transform duration-300">{title}</span>
        <div className="p-1.5 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-all duration-300" style={{ backgroundColor: `${color}15` }}>
          {React.cloneElement(icon, {
            style: { color },
            className: "text-lg group-hover:rotate-12 transition-all duration-300",
          })}
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-xl md:text-2xl font-bold transform group-hover:translate-x-2 transition-transform duration-300" style={{ color }}>
          {value}
        </h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

/**
 * A reusable component to display statistics in cards
 *
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects with title, value, subtitle, icon, and color
 * @param {number} props.columns - Number of columns for the grid (default: 4)
 */
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
