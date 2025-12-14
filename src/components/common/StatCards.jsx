import React, { useState } from "react"

export const StatCard = ({ title, value, subtitle, icon, color = "#0b57d0" }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="rounded-[20px] p-4 py-3 transition-all duration-300 border group relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(232,241,254,0.8))',
        borderColor: isHovered ? '#a8c9fc' : '#d4e4fd',
        boxShadow: isHovered ? '0 10px 30px rgba(11, 87, 208, 0.1)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start relative z-10">
        <span className="text-[#4a6085] text-sm font-medium">{title}</span>
        <div 
          className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-300"
          style={{ 
            background: isHovered 
              ? `linear-gradient(135deg, ${color}, ${color}99)`
              : `${color}15`,
          }}
        >
          {React.cloneElement(icon, {
            style: { color: isHovered ? '#ffffff' : color },
            className: "text-lg transition-all duration-300",
          })}
        </div>
      </div>
      <div className="mt-2">
        <h3 
          className="text-xl md:text-2xl font-bold transition-colors duration-300" 
          style={{ color: '#0a1628' }}
        >
          {value}
        </h3>
        <p className="text-xs text-[#8fa3c4]">{subtitle}</p>
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
