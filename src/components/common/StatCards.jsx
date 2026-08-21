import React from "react"
import { Heading } from "hzero"

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

export const StatCard = ({ title, value, subtitle, icon, color = "var(--color-primary)", tintBackground = false, loading = false }) => {
  // Background style with optional tint
  const cardStyle = tintBackground
    ? {
        boxShadow: 'var(--shadow-xs)',
        backgroundColor: `color-mix(in srgb, ${color} 9%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 21%, transparent)`,
      }
    : { boxShadow: 'var(--shadow-xs)' }

  return (
    <div
      className={`rounded-xl p-3 transition-all duration-200 border hover:border-[var(--color-border-dark)] hover:scale-[1.02] group ${!tintBackground ? 'bg-[var(--color-bg-primary)] border-[var(--color-border-primary)]' : ''}`}
      style={cardStyle}
    >
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wide">{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110" style={{ backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`, }} >
          {React.isValidElement(icon)
            ? React.cloneElement(icon, {
                style: { color },
                className: "text-base",
              })
            : null}
        </div>
      </div>
      <div>
        {loading ? (
          <ShimmerBar width="3.5rem" height={24} style={{ marginBottom: 2 }} />
        ) : (
          <Heading as="h3" color={color} className="text-xl md:text-2xl font-bold leading-none">
            {value}
          </Heading>
        )}
        <p className="text-xs text-[var(--color-text-light)] mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

/**
 * A reusable component to display statistics in cards
 *
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects with title, value, subtitle, icon, color, and tintBackground
 * @param {number} props.columns - Number of columns for the grid (default: 4)
 * @param {boolean} props.loading - Keep layout fixed and show skeleton only for value
 * @param {number} props.loadingCount - Number of cards to show while loading when stats are not provided
 */
const StatCards = ({ stats, columns = 4, loading = false, loadingCount }) => {
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
        <StatCard key={stat._key ?? index} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} color={stat.color} tintBackground={stat.tintBackground} loading={loading} />
      ))}
    </div>
  )
}

export default StatCards
