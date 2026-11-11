import { useState } from "react"
import { X } from "lucide-react"
import { dayLabel, daysBetween, days, isWeekend, longDate, number, periodText, shortDate, weekday } from "./rebateBoardHelpers"

/** The line under the period's dates: where today is in it. */
const periodLine = (period, today) => {
  if (!period) return ""
  if (period.phase === "current") {
    const at = daysBetween(period.startDate, today) + 1
    const left = daysBetween(today, period.endDate)
    return `Day ${at} of ${period.days} · ${left === 0 ? "last day today" : `${days(left)} to go`}`
  }
  if (period.phase === "upcoming") return `Starts in ${days(daysBetween(today, period.startDate))} · ${days(period.days)}`
  return `Ended ${longDate(period.endDate)} · ${days(period.days)}`
}

const Tile = ({ label, value, sub, tone, className = "" }) => (
  <div className={`rb-tile ${className}`} data-tone={tone}>
    <span className="rb-label">{label}</span>
    <b>
      {value}
      {sub ? <small>{sub}</small> : null}
    </b>
  </div>
)

/** One bar per day: approved (solid) under pending (hatched). Clicking a day filters the list to it. */
const AwayChart = ({ daily, today, day, onDay }) => {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...daily.map((d) => d.approved + d.pending))
  const dense = daily.length > 45
  const shown = daily.find((d) => d.date === (hover || day)) || null

  const axisLabel = (d, index) => {
    const first = index === 0 || d.date.endsWith("-01")
    if (first) return { text: shortDate(d.date), month: true }
    // Day numbers on Mondays, but not crowding a month label just before.
    const nearMonth = index < 3 || Number(d.date.slice(8)) <= 3
    if (!nearMonth && (dense ? index % 7 === 0 : weekday(d.date) === 1)) return { text: String(Number(d.date.slice(8))) }
    return null
  }

  return (
    <div className="rb-chart">
      <div className="rb-chart__head">
        <span className="rb-label">Away each day</span>
        <span className="rb-chart__read" aria-live="polite">
          {shown ? (
            <>
              {dayLabel(shown.date)} · <b>{number(shown.approved)} away</b>
              {shown.pending ? <span> · {number(shown.pending)} waiting approval</span> : null}
              {!hover && day ? <span> · listed on the left</span> : null}
            </>
          ) : (
            <span>Click a day to list who&apos;s away</span>
          )}
        </span>
      </div>
      <div className="rb-bars" data-picked={day || undefined} onMouseLeave={() => setHover(null)}>
        {daily.map((d) => {
          const total = d.approved + d.pending
          return (
            <button
              key={d.date}
              type="button"
              aria-pressed={d.date === day}
              aria-label={`${dayLabel(d.date)}: ${d.approved} away${d.pending ? `, ${d.pending} pending` : ""}`}
              data-weekend={isWeekend(d.date) || undefined}
              data-today={d.date === today || undefined}
              data-past={d.date < today || undefined}
              onMouseEnter={() => setHover(d.date)}
              onFocus={() => setHover(d.date)}
              onBlur={() => setHover(null)}
              onClick={() => onDay(d.date === day ? "" : d.date)}
            >
              {total > 0 && (
                <>
                  <i className="rb-bar--ok" style={{ height: `${(d.approved / max) * 100}%` }} />
                  <i className="rb-bar--warn" style={{ height: `${(d.pending / max) * 100}%` }} />
                </>
              )}
            </button>
          )
        })}
      </div>
      <div className="rb-axis" aria-hidden="true">
        {daily.map((d, index) => {
          const label = axisLabel(d, index)
          return (
            <span key={d.date} data-month={label?.month || undefined}>
              {label?.text || ""}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/**
 * The dark panel on top of the board: the selected period, its numbers, and
 * the "away each day" chart. `status` is a line of feedback (with an optional
 * undo) shown at the bottom.
 */
const PeriodConsole = ({ overview, day, onDay, status, onDismissStatus }) => {
  const stats = overview?.stats
  const period = overview?.period
  const today = overview?.today || ""
  const daily = overview?.daily || []
  const outside = overview?.scope === "outside"
  const todayRow = daily.find((d) => d.date === today)
  const busiest = daily.reduce((best, d) => (d.approved > (best?.approved || 0) ? d : best), null)
  const progress = period?.phase === "current" ? ((daysBetween(period.startDate, today) + 1) / period.days) * 100 : period?.phase === "past" ? 100 : 0
  const value = (n) => (stats ? number(n) : "…")

  return (
    <div className="rb-console">
      <div className="rb-period">
        <span className="rb-label">{outside ? "Not in any period" : "Dining period"}</span>
        <b>{outside ? "Outside periods" : period ? periodText(period) : "…"}</b>
        <span className="rb-period__sub">{outside ? "Days no dining period covers yet" : periodLine(period, today)}</span>
        {!outside && (
          <span className="rb-progress" aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
          </span>
        )}
      </div>

      <div className="rb-tiles">
        {period?.phase === "current" ? (
          <Tile className="rb-tile--away" label="Away today" value={value(todayRow?.approved)} sub={todayRow?.pending ? `+${todayRow.pending} pending` : ""} />
        ) : (
          <Tile className="rb-tile--away" label={outside ? "Days off" : "Busiest day"} value={outside ? value(stats?.approvedDays) : busiest ? number(busiest.approved) : value(0)} sub={!outside && busiest ? shortDate(busiest.date) : ""} />
        )}
        <Tile label="Rebates" value={value((stats?.approved || 0) + (stats?.pending || 0))} sub={stats ? `${number(stats.students)} ${stats.students === 1 ? "student" : "students"}` : ""} />
        <Tile label="Waiting approval" tone="warn" value={value(stats?.pending)} />
        <Tile label={outside ? "Long-term" : "Run into another period"} tone="none" value={value(outside ? stats?.longTerm : stats?.crossing)} />
      </div>

      {outside ? (
        <p className="rb-console__note">
          These days count once a dining period covers them and the student is allocated there.
        </p>
      ) : daily.length > 0 ? (
        <AwayChart daily={daily} today={today} day={day} onDay={onDay} />
      ) : null}

      {status && (
        <div className="rb-console__status" data-tone={status.tone} role="status">
          <span>{status.message}</span>
          <div>
            {status.undo && (
              <button type="button" className="rb-undo" onClick={status.undo}>
                Undo
              </button>
            )}
            <button type="button" onClick={onDismissStatus} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PeriodConsole
