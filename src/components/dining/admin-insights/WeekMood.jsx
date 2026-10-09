import { TrendingDown, TrendingUp } from "lucide-react"
import InsightCard, { PanelMessage } from "./InsightCard"
import { fmtPct, mealVars, WEEK_ORDER, WEEKDAY_LONG, WEEKDAY_SHORT } from "./insightHelpers"

/** Bubble size and colour depth both follow how many expected students actually came. */
const bubbleStyle = (palette, key, rate) => {
  const t = Math.max(0, Math.min(1, rate ?? 0))
  return {
    ...mealVars(palette, key),
    "--size": (0.55 + t * 0.45).toFixed(3),
    "--depth": `${Math.round(18 + t * 52)}%`,
  }
}

/** Which day and meal people show up for, and which they skip. */
const WeekMood = ({ data, palette, loading, days }) => {
  const mealSlots = data?.mealSlots || []
  const cells = new Map((data?.weekdayHeat || []).map((c) => [`${c.weekday}:${c.mealSlotKey}`, c]))
  const rated = (data?.weekdayHeat || []).filter((c) => typeof c.attendanceRate === "number")
  const worst = rated.reduce((a, c) => (!a || c.attendanceRate < a.attendanceRate ? c : a), null)
  const best = rated.reduce((a, c) => (!a || c.attendanceRate > a.attendanceRate ? c : a), null)
  const name = (key) => mealSlots.find((s) => s.key === key)?.name?.toLowerCase() || key

  return (
    <InsightCard className="dxi-week" title="Who shows up, day by day" caption={`Bigger bubble, more students came · last ${days} days`} loading={loading}>
      {rated.length === 0 ? (
        <PanelMessage title="Not enough meals yet" text="This fills in after a few days of scanning." />
      ) : (
        <div className="dxi-week-inner">
          <div className="dxi-week-grid" style={{ "--cols": WEEK_ORDER.length }}>
            <span />
            {WEEK_ORDER.map((d) => <span key={d} className="dxi-week-day">{WEEKDAY_SHORT[d].slice(0, 2)}</span>)}
            {mealSlots.map((slot) => (
              <div key={slot.key} className="dxi-week-row" style={mealVars(palette, slot.key)}>
                <span className="dxi-week-meal">{slot.name}</span>
                {WEEK_ORDER.map((d) => {
                  const cell = cells.get(`${d}:${slot.key}`)
                  const rate = cell?.attendanceRate
                  const flag = cell && (cell === worst ? "worst" : cell === best ? "best" : undefined)
                  return (
                    <span
                      key={d}
                      className="dxi-bubble-cell"
                      title={`${WEEKDAY_LONG[d]} ${slot.name.toLowerCase()}: ${fmtPct(rate)} came`}
                    >
                      {typeof rate === "number" ? (
                        <span className="dxi-bubble" data-flag={flag} style={bubbleStyle(palette, slot.key, rate)}>
                          {Math.round(rate * 100)}
                        </span>
                      ) : (
                        <span className="dxi-bubble-empty" aria-hidden="true" />
                      )}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="dxi-week-notes">
            {worst && (
              <p className="dxi-week-note" data-tone="low">
                <TrendingDown size={14} aria-hidden="true" />
                <span><strong>{WEEKDAY_LONG[worst.weekday]} {name(worst.mealSlotKey)}</strong> is skipped most: only {fmtPct(worst.attendanceRate)} come</span>
              </p>
            )}
            {best && (
              <p className="dxi-week-note" data-tone="high">
                <TrendingUp size={14} aria-hidden="true" />
                <span><strong>{WEEKDAY_LONG[best.weekday]} {name(best.mealSlotKey)}</strong> is the favourite: {fmtPct(best.attendanceRate)} come</span>
              </p>
            )}
          </div>
        </div>
      )}
    </InsightCard>
  )
}

export default WeekMood
