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
 * @param {boolean} loading - Keep layout fixed and show skeleton only for value
 * @param {"sm"|"md"|"lg"} valueSize - Main value font size (default: "lg")
 */
const VALUE_SIZE_CLASSES = {
  sm: "text-base md:text-lg",
  md: "text-lg md:text-xl",
  lg: "text-xl md:text-2xl",
}

export const StatCard = ({ title, value, subtitle, icon, color = "var(--color-primary)", tintBackground = false, loading = false, valueSize = "lg" }) => {
  // color-mix works for any CSS color or var(--token); no JS resolution needed.
  const tint = (pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`

  return (
    <div
      className="group relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
      style={{
        backgroundColor: tintBackground ? tint(10) : "var(--color-bg-primary)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      {/* Soft color glow from the top-right corner */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-80 group-hover:opacity-100"
        style={{ background: `radial-gradient(125% 125% at 100% 0%, ${tint(18)} 0%, transparent 46%)` }}
      />

      {/* Oversized watermark icon bleeding out of the corner */}
      <div
        className="pointer-events-none absolute -right-3 -bottom-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6"
        style={{ color, opacity: 0.12 }}
        aria-hidden="true"
      >
        {React.isValidElement(icon) ? React.cloneElement(icon, { style: { fontSize: "4.75rem" } }) : icon}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-[var(--radius-full)] shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 0 3px ${tint(20)}` }} />
          <span className="text-[var(--color-text-muted)] text-[0.66rem] font-semibold uppercase tracking-[0.08em] truncate">
            {title}
          </span>
        </div>
        {loading ? (
          <ShimmerBar width="3.5rem" height={28} style={{ marginBottom: 4 }} />
        ) : (
          <h3 className={`${VALUE_SIZE_CLASSES[valueSize] || VALUE_SIZE_CLASSES.lg} font-extrabold leading-none text-[var(--color-text-heading)] tabular-nums`}>
            {value}
          </h3>
        )}
        {subtitle ? <p className="text-[0.7rem] text-[var(--color-text-light)] mt-1.5 leading-snug">{subtitle}</p> : null}
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
 * @param {"sm"|"md"|"lg"} valueSize - Main value font size for all cards (default: "lg")
 */
const StatCards = ({ stats, columns = 4, loading = false, loadingCount, valueSize = "lg" }) => {
  const getGridClass = () => {
    let gridClass = "grid-cols-2 max-[375px]:grid-cols-1"
    if (columns === 1) gridClass = "grid-cols-1"
    else if (columns === 2) gridClass = "grid-cols-2"
    else if (columns === 3) gridClass += " md:grid-cols-3"
    else if (columns === 4) gridClass += " lg:grid-cols-4"
    else if (columns === 5) gridClass += " lg:grid-cols-5"
    else if (columns === 6) gridClass += " lg:grid-cols-6"
    else if (columns >= 7) gridClass += " lg:grid-cols-7"
    return gridClass
  }

  const normalizedStats = Array.isArray(stats) ? stats : []
  const skeletonCount = loadingCount ?? (normalizedStats.length || columns)
  const loadingStats =
    normalizedStats.length > 0
      ? normalizedStats
      : Array.from({ length: skeletonCount }).map((_, i) => ({
          title: "Loading",
          value: "",
          subtitle: "",
          icon: <span />,
          color: "var(--color-primary)",
          _key: `stat-loading-${i}`,
        }))
  const statsToRender = loading ? loadingStats : normalizedStats

  return (
    <div className={`grid ${getGridClass()} gap-3 md:gap-5`}>
      {statsToRender.map((stat, index) => (
        <StatCard
          key={stat._key ?? index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          tintBackground={stat.tintBackground}
          loading={loading}
          valueSize={valueSize}
        />
      ))}
    </div>
  )
}

export default StatCards
