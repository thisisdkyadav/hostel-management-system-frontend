import React from "react"

export const StatCard = ({ title, value, subtitle, icon, color = "#1360AB" }) => {
  return (
    <div className="bg-white rounded-lg p-3 border-l-4 group relative overflow-hidden shadow-sm transition-all duration-300 ease-out hover:shadow-md" style={{ borderLeftColor: color }}>
      {/* Subtle background animation on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ease-out" style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` }}></div>

      <div className="flex flex-row items-center gap-3 relative z-10">
        {/* Left side - Content */}
        <div className="flex-1">
          <span className="text-gray-600 text-xs font-medium block mb-1">{title}</span>
          <h3 className="text-xl md:text-2xl font-bold transform group-hover:translate-x-1 transition-transform duration-300 ease-out" style={{ color }}>
            {value}
          </h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>

        {/* Right side - Icon */}
        <div className="p-2 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 ease-out ml-auto" style={{ backgroundColor: `${color}15` }}>
          {React.cloneElement(icon, { style: { color }, className: "text-xl" })}
        </div>
      </div>
    </div>
  )
}

const StatCards = ({ stats, columns = 4 }) => {
  const getGridClass = () => {
    // Show 2 cards per row by default, 1 card only on tiny screens (<375px)
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
    <div className={`grid ${getGridClass()} gap-3 md:gap-4`}>
      {stats.map((stat, index) => (
        <StatCard key={index} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} color={stat.color} />
      ))}
    </div>
  )
}

export default StatCards
