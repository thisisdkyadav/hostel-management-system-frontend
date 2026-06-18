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

const VALUE_SIZE_CLASSES = {
  sm: "text-base md:text-lg",
  md: "text-lg md:text-xl",
  lg: "text-xl md:text-2xl",
}

// Trend delta: colored arrow + label. Dependency-free (unicode arrows).
const TREND_META = {
  up: { glyph: "↑", color: "var(--color-success)" },
  down: { glyph: "↓", color: "var(--color-danger)" },
  flat: { glyph: "→", color: "var(--color-text-muted)" },
}

const Trend = ({ trend }) => {
  if (!trend) return null
  const meta = TREND_META[trend.direction] || TREND_META.flat
  return (
    <span className="inline-flex items-center gap-1 text-[0.7rem] font-semibold leading-none" style={{ color: meta.color }}>
      <span aria-hidden="true">{meta.glyph}</span>
      <span>{trend.label}</span>
    </span>
  )
}

const Footer = ({ trend, subtitle }) => {
  if (!trend && !subtitle) return null
  return (
    <div className="mt-2 flex items-center gap-2 leading-snug">
      <Trend trend={trend} />
      {subtitle ? <span className="text-[0.7rem] text-[var(--color-text-light)] truncate">{subtitle}</span> : null}
    </div>
  )
}

const Label = ({ title, dotColor }) => (
  <div className="flex items-center gap-1.5">
    {dotColor ? (
      <span className="w-1.5 h-1.5 rounded-[var(--radius-full)] shrink-0" style={{ backgroundColor: dotColor }} />
    ) : null}
    <span className="text-[var(--color-text-muted)] text-[0.66rem] font-semibold uppercase tracking-[0.08em] truncate">{title}</span>
  </div>
)

// The card controls the icon's render size; any fontSize the consumer set on the
// icon (e.g. <FaUsers style={{ fontSize: "var(--font-size-2xl)" }} />) must not win.
const cloneIcon = (icon, size) =>
  React.isValidElement(icon) ? React.cloneElement(icon, { style: { ...(icon.props.style || {}), fontSize: size } }) : icon

// Cursor-tracking glow for the "spotlight" variant.
const trackPointer = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
}

/**
 * StatCard Component
 *
 * @param {string} title - Stat title/label
 * @param {string|number} value - Main value
 * @param {string} subtitle - Secondary text
 * @param {React.ReactNode} icon - Icon element
 * @param {string} color - Icon/accent color (CSS color or var(--token))
 * @param {{direction:"up"|"down"|"flat", label:string}} [trend] - Optional trend delta
 * @param {boolean} tintBackground - Tint the card background with the color
 * @param {boolean} loading - Show skeleton for the value, keep layout fixed
 * @param {"sm"|"md"|"lg"} valueSize - Main value font size (default: "lg")
 * @param {"aurora"|"spotlight"|"orb"|"glass"|"expressive"|"refined"} variant - Visual style
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "var(--color-primary)",
  trend,
  tintBackground = false,
  loading = false,
  valueSize = "lg",
  variant = "glass",
}) => {
  // color-mix works for any CSS color or var(--token); no JS resolution needed.
  const tint = (pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
  const mix = (pct, other) => `color-mix(in srgb, ${color} ${pct}%, ${other})`
  const valueClass = `${VALUE_SIZE_CLASSES[valueSize] || VALUE_SIZE_CLASSES.lg} font-extrabold leading-none tabular-nums`

  const plainValue = (
    <h3 className={`${valueClass} text-[var(--color-text-primary)]`}>{value}</h3>
  )
  const gradientValue = (
    <h3
      className={valueClass}
      style={{
        backgroundImage: `linear-gradient(135deg, ${mix(85, "var(--color-text-primary)")}, ${color})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}
    >
      {value}
    </h3>
  )
  const skeleton = <ShimmerBar width="3.75rem" height={28} />

  // ---------- aurora: layered gradient mesh + gradient-ink number ----------
  if (variant === "aurora") {
    return (
      <div
        className="group relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
        style={{
          background: `radial-gradient(120% 120% at 0% 0%, ${tint(16)} 0%, transparent 52%), radial-gradient(130% 130% at 100% 100%, ${tint(24)} 0%, transparent 56%), var(--color-bg-primary)`,
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div className="relative z-10 flex items-start justify-between gap-2">
          <Label title={title} dotColor={color} />
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            style={{ backgroundColor: tint(14), color }}
            aria-hidden="true"
          >
            {cloneIcon(icon, "1rem")}
          </span>
        </div>
        <div className="relative z-10 mt-3">{loading ? skeleton : gradientValue}</div>
        <div className="relative z-10"><Footer trend={trend} subtitle={subtitle} /></div>
      </div>
    )
  }

  // ---------- spotlight: glow follows the cursor across the card ----------
  if (variant === "spotlight") {
    return (
      <div
        onMouseMove={trackPointer}
        className="group relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] p-4 transition-all duration-300 hover:border-[var(--color-border-dark)] hover:shadow-[var(--shadow-lg)]"
        style={{
          backgroundColor: tintBackground ? tint(8) : "var(--color-bg-primary)",
          boxShadow: "var(--shadow-xs)",
          "--mx": "50%",
          "--my": "0%",
        }}
      >
        {/* Cursor spotlight (invisible until hovered) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(220px circle at var(--mx) var(--my), ${tint(28)} 0%, transparent 60%)` }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border"
            style={{ backgroundColor: tint(10), borderColor: tint(28), color }}
            aria-hidden="true"
          >
            {cloneIcon(icon, "1.05rem")}
          </span>
          <Label title={title} />
        </div>
        <div className="relative z-10 mt-3">{loading ? skeleton : plainValue}</div>
        <div className="relative z-10"><Footer trend={trend} subtitle={subtitle} /></div>
      </div>
    )
  }

  // ---------- orb: levitating gradient orb holding the icon ----------
  if (variant === "orb") {
    return (
      <div
        className="group relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
        style={{ backgroundColor: tintBackground ? tint(8) : "var(--color-bg-primary)", boxShadow: "var(--shadow-xs)" }}
      >
        {/* soft floor glow under the orb */}
        <div className="pointer-events-none absolute -left-2 -top-4 h-24 w-24 rounded-[var(--radius-full)] blur-2xl transition-opacity duration-300 opacity-60 group-hover:opacity-90" style={{ background: tint(45) }} />
        <div className="relative z-10 flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
            style={{
              background: `linear-gradient(140deg, ${color}, ${mix(55, "#000")})`,
              boxShadow: `0 10px 22px -6px ${tint(65)}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            }}
            aria-hidden="true"
          >
            {cloneIcon(icon, "1.25rem")}
          </span>
          <div className="min-w-0">
            <Label title={title} />
            <div className="mt-1.5">{loading ? skeleton : plainValue}</div>
          </div>
        </div>
        <div className="relative z-10"><Footer trend={trend} subtitle={subtitle} /></div>
      </div>
    )
  }

  // ---------- glass: frosted panel + cursor-tracking spotlight glow ----------
  if (variant === "glass") {
    return (
      <div
        onMouseMove={trackPointer}
        className="group relative overflow-hidden rounded-[var(--radius-2xl)] p-4 transition-all duration-300 hover:shadow-[var(--shadow-lg)]"
        style={{
          background: `linear-gradient(150deg, ${mix(22, "var(--color-bg-primary)")}, ${mix(6, "var(--color-bg-primary)")})`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${tint(30)}`,
          boxShadow: `inset 0 1px 0 ${tint(35)}, var(--shadow-md)`,
          "--mx": "50%",
          "--my": "0%",
        }}
      >
        {/* diagonal sheen */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(120deg, transparent 40%, ${tint(14)} 100%)` }}
        />
        {/* cursor-tracking spotlight glow (revealed on hover) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(240px circle at var(--mx) var(--my), ${tint(30)} 0%, transparent 60%)` }}
        />
        {/* gradient rim brightens with the spotlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[var(--radius-2xl)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px ${tint(45)}` }}
        />
        {/* ghosted watermark icon */}
        <div className="pointer-events-none absolute -right-3 -bottom-4 transition-transform duration-300 group-hover:scale-110" style={{ color, opacity: 0.16 }} aria-hidden="true">
          {cloneIcon(icon, "4rem")}
        </div>
        <div className="relative z-10"><Label title={title} dotColor={color} /></div>
        <div className="relative z-10 mt-3">{loading ? skeleton : plainValue}</div>
        <div className="relative z-10"><Footer trend={trend} subtitle={subtitle} /></div>
      </div>
    )
  }

  // ---------- refined: restrained chip + label ----------
  if (variant === "refined") {
    return (
      <div
        className="group relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] p-4 transition-all duration-200 hover:border-[var(--color-border-dark)] hover:shadow-[var(--shadow-sm)]"
        style={{ backgroundColor: tintBackground ? tint(8) : "var(--color-bg-primary)", boxShadow: "var(--shadow-xs)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] transition-transform duration-200 group-hover:scale-105" style={{ backgroundColor: tint(12), color }} aria-hidden="true">
            {cloneIcon(icon, "1.05rem")}
          </span>
          <Label title={title} />
        </div>
        <div className="mt-3">{loading ? skeleton : plainValue}</div>
        <Footer trend={trend} subtitle={subtitle} />
      </div>
    )
  }

  // ---------- expressive (default fallback): watermark icon + corner glow ----------
  return (
    <div
      className="group relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-primary)] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
      style={{ backgroundColor: tintBackground ? tint(10) : "var(--color-bg-primary)", boxShadow: "var(--shadow-xs)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-80 group-hover:opacity-100"
        style={{ background: `radial-gradient(125% 125% at 100% 0%, ${tint(18)} 0%, transparent 46%)` }}
      />
      <div className="pointer-events-none absolute -right-3 -bottom-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6" style={{ color, opacity: 0.12 }} aria-hidden="true">
        {cloneIcon(icon, "4.75rem")}
      </div>
      <div className="relative z-10">
        <div className="mb-2"><Label title={title} dotColor={color} /></div>
        {loading ? skeleton : plainValue}
        <Footer trend={trend} subtitle={subtitle} />
      </div>
    </div>
  )
}

/**
 * StatCards Component - Grid of stat cards
 *
 * @param {Array} stats - Array of stat objects: { title, value, subtitle, icon, color, trend, tintBackground, variant }
 * @param {number} columns - Number of grid columns (default: 4)
 * @param {boolean} loading - Show skeleton for all cards (default: false)
 * @param {number} loadingCount - Number of skeleton cards to show when loading (default: columns)
 * @param {"sm"|"md"|"lg"} valueSize - Main value font size for all cards (default: "lg")
 * @param {string} variant - Visual style applied to all cards (default: "aurora")
 */
const StatCards = ({ stats, columns = 4, loading = false, loadingCount, valueSize = "lg", variant = "glass" }) => {
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
          trend={stat.trend}
          tintBackground={stat.tintBackground}
          loading={loading}
          valueSize={valueSize}
          variant={stat.variant ?? variant}
        />
      ))}
    </div>
  )
}

export default StatCards
