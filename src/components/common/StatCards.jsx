import React from "react"

export const StatCard = ({ title, value, subtitle, icon, color = "var(--color-primary)" }) => {
  // Get the actual color value for dynamic opacity backgrounds
  const getColorValue = (cssVar) => {
    if (cssVar.startsWith('var(')) return null
    return cssVar
  }

  const colorValue = getColorValue(color) || getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#1360AB'

  return (
    <div className="bg-[var(--color-bg-primary)] rounded-xl p-3 transition-all duration-200 border border-[var(--color-border-primary)] hover:border-[var(--color-border-dark)] hover:scale-[1.02] group" style={{ boxShadow: 'var(--shadow-xs)', }} >
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wide">{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110" style={{ backgroundColor: `${colorValue}15`, }} >
          {React.cloneElement(icon, {
            style: { color: colorValue },
            className: "text-base",
          })}
        </div>
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-bold leading-none" style={{ color: colorValue }} >
          {value}
        </h3>
        <p className="text-xs text-[var(--color-text-light)] mt-0.5">{subtitle}</p>
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
