import { Link } from "react-router-dom"
import { Trophy, Users } from "lucide-react"
import InsightCard, { PanelMessage } from "./InsightCard"
import { fmtInt, fmtPct, friendlyTime, longDate, mealVars, timeToMinutes, todaySummary } from "./insightHelpers"

// The dial is a 24-hour clock face: noon at the top, midnight at the bottom,
// so the day's meals ride across the upper half like the sun.
const C = 130
const R = 92
const angleOf = (minutes) => ((minutes / 1440) * 360 + 180) % 360
const point = (minutes, r) => {
  const a = (angleOf(minutes) * Math.PI) / 180
  return [C + r * Math.sin(a), C - r * Math.cos(a)]
}
const arc = (from, to, r) => {
  const span = (((to - from) % 1440) + 1440) % 1440
  const [x1, y1] = point(from, r)
  const [x2, y2] = point(from + span, r)
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${span > 720 ? 1 : 0} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`
}

const HOUR_LABELS = [
  { minutes: 720, label: "Noon" },
  { minutes: 1080, label: "6 PM" },
  { minutes: 0, label: "Midnight" },
  { minutes: 360, label: "6 AM" },
]

const mealStatus = ({ phase, verified, slot }) => {
  if (phase === "open") return `${fmtInt(verified)} so far`
  if (phase === "ended") return `${fmtInt(verified)} ate`
  return `at ${friendlyTime(timeToMinutes(slot.startTime))}`
}

const Dial = ({ meals, expected, nowMin, palette }) => (
  <svg className="dxi-dial-svg" viewBox="0 0 260 260" role="img" aria-label="Today's meals on a 24-hour clock">
    <circle className="dxi-dial-track" cx={C} cy={C} r={R} />
    {Array.from({ length: 24 }, (_, hour) => {
      const [x1, y1] = point(hour * 60, R + 13)
      const [x2, y2] = point(hour * 60, R + (hour % 6 === 0 ? 19 : 16))
      return <line key={hour} className="dxi-dial-tick" data-major={hour % 6 === 0 || undefined} x1={x1} y1={y1} x2={x2} y2={y2} />
    })}
    {HOUR_LABELS.map(({ minutes, label }) => {
      const [x, y] = point(minutes, R + 30)
      return <text key={label} className="dxi-dial-hour" x={x} y={y} textAnchor="middle" dominantBaseline="middle">{label}</text>
    })}
    {meals.map(({ slot, verified, phase }) => {
      const start = timeToMinutes(slot.startTime)
      const end = timeToMinutes(slot.endTime)
      if (start === null || end === null) return null
      const share = expected > 0 ? Math.min(1, verified / expected) : 0
      const d = arc(start, end, R)
      return (
        <g key={slot.key} style={mealVars(palette, slot.key)} data-phase={phase} className="dxi-dial-meal">
          <path className="dxi-dial-window" d={d} />
          {phase !== "upcoming" && (
            <path className="dxi-dial-fill" d={d} pathLength="100" style={{ strokeDasharray: `${(share * 100).toFixed(1)} 100` }} />
          )}
        </g>
      )
    })}
    {(() => {
      const [x, y] = point(nowMin, R)
      const [hx, hy] = point(nowMin, R - 26)
      return (
        <g className="dxi-dial-now">
          <line x1={hx} y1={hy} x2={x} y2={y} />
          <circle className="dxi-dial-now-halo" cx={x} cy={y} r="11" />
          <circle className="dxi-dial-now-dot" cx={x} cy={y} r="5.5" />
        </g>
      )
    })()}
  </svg>
)

const CentreText = ({ summary }) => {
  const { open, next, expected } = summary
  if (open) {
    return (
      <>
        <span className="dxi-dial-kicker" style={{ color: "var(--meal)" }}>
          <span className="dxi-live-dot" aria-hidden="true" /> {open.slot.name} is on
        </span>
        <span className="dxi-dial-big">{fmtInt(open.verified)}</span>
        <span className="dxi-dial-sub">have eaten so far</span>
        <span className="dxi-dial-note">of {fmtInt(expected)} expected</span>
      </>
    )
  }
  return (
    <>
      <span className="dxi-dial-kicker">Today</span>
      <span className="dxi-dial-big">{fmtInt(expected)}</span>
      <span className="dxi-dial-sub">students expected</span>
      <span className="dxi-dial-note">
        {next ? `${next.slot.name} at ${friendlyTime(timeToMinutes(next.slot.startTime))}` : "All meals done for today"}
      </span>
    </>
  )
}

const CatererStandings = ({ caterers }) => {
  const ranked = [...caterers].sort((a, b) => (b.attendanceRate ?? -1) - (a.attendanceRate ?? -1))
  const shown = ranked.slice(0, 5)
  return (
    <div className="dxi-standings">
      <div className="dxi-standings-head">
        <span>Caterers</span>
        <span>students who turn up</span>
      </div>
      <ol className="dxi-standings-list">
        {shown.map((caterer, index) => (
          <li key={caterer.id} className="dxi-standing" data-first={index === 0 || undefined}>
            <span className="dxi-standing-rank" aria-label={`Rank ${index + 1}`}>
              {index === 0 ? <Trophy size={14} aria-hidden="true" /> : index + 1}
            </span>
            <span className="dxi-standing-name" title={caterer.name}>{caterer.name}</span>
            <span className="dxi-standing-bar" aria-hidden="true">
              <span style={{ width: `${Math.round((caterer.attendanceRate || 0) * 100)}%` }} />
            </span>
            <span className="dxi-standing-pct">{fmtPct(caterer.attendanceRate)}</span>
          </li>
        ))}
      </ol>
      {ranked.length > shown.length && (
        <Link to="/admin/caterers" className="dxi-standings-more">+{ranked.length - shown.length} more caterers</Link>
      )}
    </div>
  )
}

/** Hero: today on a 24-hour dial, the meals as glowing arcs, and how each caterer is doing. */
const TodayDial = ({ data, palette, nowMin, loading }) => {
  const summary = data ? todaySummary(data, nowMin) : null
  const openVars = summary?.open ? mealVars(palette, summary.open.slot.key) : undefined

  return (
    <InsightCard className="dxi-today" title="Today in the mess" caption={data ? longDate(data.today) : undefined} loading={loading}>
      {summary && (
        <div className="dxi-today-inner">
          <div className="dxi-dial">
            <Dial meals={summary.meals} expected={summary.expected} nowMin={nowMin} palette={palette} />
            <div className="dxi-dial-centre" style={openVars}>
              <CentreText summary={summary} />
            </div>
          </div>

          <ul className="dxi-meal-chips">
            {summary.meals.map((meal) => (
              <li key={meal.slot.key} className="dxi-meal-chip" data-phase={meal.phase} style={mealVars(palette, meal.slot.key)}>
                <span className="dxi-meal-chip-name">{meal.slot.name}</span>
                <span className="dxi-meal-chip-status">{mealStatus(meal)}</span>
              </li>
            ))}
          </ul>

          <Link to="/admin/dining-rebates" className="dxi-away-line">
            <Users size={14} aria-hidden="true" />
            <strong>{fmtInt(summary.onRebate)}</strong> students away on rebate today
          </Link>

          {(data.caterers || []).length > 0 ? (
            <CatererStandings caterers={data.caterers} />
          ) : (
            <PanelMessage title="No caterers yet" text="Caterers appear here once a dining period is running." />
          )}
        </div>
      )}
    </InsightCard>
  )
}

export default TodayDial
