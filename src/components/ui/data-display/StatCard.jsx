import React from "react"

// Shared shimmer bar used inside the skeleton
const ShimmerBar = ({ width, height, style }) => (
  <div
    className="animate-pulse"
    style={{
      width,
      height,
      borderRadius: 4,
      backgroundColor: "var(--color-bg-hover)",
      ...style,
    }}
  />
)

/**
 * StatCard Component - Matches existing design language
 *
 * @param {string} title - Stat title/label
 * @param {string|number} value - Main value
 * @param {string} subtitle - Secondary text
 * @param {React.ReactNode} icon - Icon element
 * @param {string} color - Icon/value color (CSS color or variable)
 * @param {boolean} tintBackground - Whether to tint the card background with the color
 * @param {boolean} loading - Show skeleton loading state instead of content
 */
export const StatCard = ({ title, value, subtitle, icon, color = "var(--color-primary)", tintBackground = false, loading = false }) => {
  const getColorValue = (cssVar) => {
    if (cssVar.startsWith("var(")) return null
    return cssVar
  }

  const colorValue =
    getColorValue(color) ||
    getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() ||
    "#1360AB"

  const cardClass = `bg-[var(--color-bg-primary)] rounded-xl p-3 border border-[var(--color-border-primary)]`

  if (loading) {
    return (
      <div
        className={cardClass}
        style={{ boxShadow: "var(--shadow-xs)" }}
      >
        {/* Header row mirrors: flex justify-between items-start mb-1.5 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <ShimmerBar width="55%" height={12} style={{ marginTop: 4 }} />
          {/* Icon placeholder: w-8 h-8 = 32×32 rounded-lg */}
          <div
            className="animate-pulse"
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "var(--color-bg-hover)", flexShrink: 0 }}
          />
        </div>
        {/* Value: text-2xl font-bold leading-none */}
        <ShimmerBar width="45%" height={24} style={{ marginBottom: 6 }} />
        {/* Subtitle: text-xs mt-0.5 */}
        <ShimmerBar width="65%" height={10} />
      </div>
    )
  }

  return (
    <div
      className={`${cardClass} transition-all duration-200 hover:border-[var(--color-border-dark)] hover:scale-[1.02] group`}
      style={{
        boxShadow: "var(--shadow-xs)",
        ...(tintBackground && { backgroundColor: `${colorValue}14` }),
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
 * @param {Array} stats - Array of stat objects with title, value, subtitle, icon, color, tintBackground
 * @param {number} columns - Number of grid columns (default: 4)
 * @param {boolean} loading - Show skeleton for all cards (default: false)
 * @param {number} loadingCount - Number of skeleton cards to show when loading (default: columns)
 */
const StatCards = ({ stats, columns = 4, loading = false, loadingCount }) => {
  const getGridClass = () => {
    let gridClass = "grid-cols-2 max-[375px]:grid-cols-1"
    if (columns === 1) gridClass = "grid-cols-1"
    else if (columns === 2) gridClass = "grid-cols-2"
    else if (columns === 3) gridClass += " md:grid-cols-3"
    else if (columns === 4) gridClass += " lg:grid-cols-4"
    else if (columns >= 5) gridClass += " lg:grid-cols-5"
    return gridClass
  }

  const skeletonCount = loadingCount ?? (loading ? columns : (stats?.length ?? columns))

  if (loading) {
    return (
      <div className={`grid ${getGridClass()} gap-3 md:gap-5`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <StatCard key={i} loading title="" value="" subtitle="" icon={<span />} />
        ))}
      </div>
    )
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
