import React from "react"

/**
 * StatCard Component - Matches existing design language
 * 
 * @param {string} title - Stat title/label
 * @param {string|number} value - Main value
 * @param {string} subtitle - Secondary text
 * @param {React.ReactNode} icon - Icon element
 * @param {string} color - Icon/value color (CSS color or variable)
 * @param {boolean} tintBackground - Whether to tint the card background with the color
 */
export const StatCard = ({ title, value, subtitle, icon, color = "var(--color-primary)", tintBackground = false }) => {
  // Get the actual color value for dynamic opacity backgrounds
  const getColorValue = (cssVar) => {
    if (cssVar.startsWith("var(")) return null
    return cssVar
  }

  const colorValue =
    getColorValue(color) ||
    getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() ||
    "#1360AB"

  return (
    <div
      className={`bg-[var(--color-bg-primary)] rounded-xl p-3 transition-all duration-200 border border-[var(--color-border-primary)] hover:border-[var(--color-border-dark)] hover:scale-[1.02] group`}
      style={{
        boxShadow: "var(--shadow-xs)",
        ...(tintBackground && {
          backgroundColor: `${colorValue}14`,
        }),
      }}
    >
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wide">
          {title}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${colorValue}15` }}
        >
          {React.cloneElement(icon, {
            style: { color: colorValue },
            className: "text-base",
          })}
        </div>
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-bold leading-none" style={{ color: colorValue }}>
          {value}
        </h3>
        <p className="text-xs text-[var(--color-text-light)] mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

/**
 * StatCards Component - Grid of stat cards
 * 
 * @param {Array} stats - Array of stat objects
 * @param {number} columns - Number of grid columns
 */
const StatCards = ({ stats, columns = 4 }) => {
  const getGridClass = () => {
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
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          tintBackground={stat.tintBackground}
        />
      ))}
    </div>
  )
}

export default StatCards
