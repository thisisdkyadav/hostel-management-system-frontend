import React from "react"

export const StatCard = ({ title, value, subtitle, icon, color = "#0b57d0" }) => {
  return (
    <div 
      className="bg-white rounded-xl p-4 py-3 transition-all duration-200 border border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm group"
      style={{ 
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex justify-between items-start">
        <span className="text-[#64748b] text-sm font-medium">{title}</span>
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200"
          style={{ 
            backgroundColor: `${color}10`,
          }}
        >
          {React.cloneElement(icon, {
            style: { color },
            className: "text-lg",
          })}
        </div>
      </div>
      <div className="mt-2">
        <h3 
          className="text-xl md:text-2xl font-bold text-[#1e293b]" 
        >
          {value}
        </h3>
        <p className="text-xs text-[#94a3b8] mt-0.5">{subtitle}</p>
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
  console.log(columns)
  const getGridClass = () => {
    // Show 2 cards per row by default, 1 card only on tiny screens (<480px)
    let gridClass = "grid-cols-2 max-[375px]:grid-cols-1"

    if (columns === 1) {
      gridClass = "grid-cols-1"
    } else if (columns === 2) {
      gridClass = "grid-cols-2"
    } else if (columns === 3) {
      gridClass += " md:grid-cols-3"
    } else if (columns === 4) {
      gridClass += " lg:grid-cols-4"
    } else if (columns >= 5) {
      gridClass += " lg:grid-cols-5"
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
