import { Link } from "react-router-dom"
import { Button, Skeleton } from "hzero"
import { ArrowDown, ArrowUp, LogIn, LogOut } from "lucide-react"
import { formatDayMonth, formatWeekday, relativeDay } from "../catererHelpers"
import { ratio } from "./dashboardHelpers"
import PanelMessage from "./PanelMessage"

const dayLabel = (date, today) => {
  const rel = relativeDay(date, today)
  return rel === "Tomorrow" ? rel : formatWeekday(date)
}

const Delta = ({ value }) => {
  if (value === 0) return <span className="cdb-delta" data-dir="flat">Same as today</span>
  const up = value > 0
  return (
    <span className="cdb-delta" data-dir={up ? "up" : "down"}>
      {up ? <ArrowUp size={14} aria-hidden="true" /> : <ArrowDown size={14} aria-hidden="true" />}
      {Math.abs(value)} vs today
    </span>
  )
}

const AwayBar = ({ day }) => {
  const total = Math.max(1, day.allocatedCount)
  return (
    <div className="cdb-awaybar" role="img" aria-label={`${day.onRebateCount} of ${day.allocatedCount} away, ${day.pendingCount} pending`}>
      <span className="cdb-awaybar-seg" data-kind="away" style={{ flex: `${ratio(day.onRebateCount, total) * 100} 1 0` }} />
      <span className="cdb-awaybar-seg" data-kind="pending" style={{ flex: `${ratio(day.pendingCount, total) * 100} 1 0` }} />
      <span className="cdb-awaybar-seg" data-kind="rest" style={{ flex: `${ratio(Math.max(0, total - day.onRebateCount - day.pendingCount), total) * 100} 1 0` }} />
    </div>
  )
}

const Tile = ({ day, today, todayExpected }) => (
  <Link
    to="/caterer/rebates"
    className="cdb-day"
    aria-label={`${relativeDay(day.date, today)}, ${formatDayMonth(day.date)}: cook for ${day.expectedCount}, ${day.onRebateCount} on rebate`}
  >
    <span className="cdb-day-head">
      <span className="cdb-day-name">{dayLabel(day.date, today)}</span>
      <span className="cdb-day-date">{formatDayMonth(day.date)}</span>
    </span>
    <span className="cdb-day-number">{day.expectedCount}</span>
    <span className="cdb-day-sub">cook for, {day.onRebateCount} on rebate</span>
    <Delta value={day.expectedCount - todayExpected} />
    <AwayBar day={day} />
    <span className="cdb-day-foot">
      <span title="Leaving that day"><LogOut size={13} aria-hidden="true" />{day.startingCount}</span>
      <span title="Back that day"><LogIn size={13} aria-hidden="true" />{day.returningCount}</span>
      {day.pendingCount > 0 && <span className="cdb-day-pending">+{day.pendingCount} pending</span>}
    </span>
  </Link>
)

/** Headcount for the next few days, so the kitchen can plan ahead. */
const NextDaysStrip = ({ days, today, todayExpected, loading, error, onRetry }) => {
  let body
  if (loading) {
    body = (
      <div className="cdb-days" aria-hidden="true">
        {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" className="cdb-day-skeleton" />)}
      </div>
    )
  } else if (error && !days.length) {
    body = <PanelMessage title="Could not load the forecast" tone="danger"><Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button></PanelMessage>
  } else if (!days.length) {
    body = <PanelMessage title="No service in the next few days" text="There is no dining period covering the days ahead." />
  } else {
    body = (
      <div className="cdb-days">
        {days.map((day) => <Tile key={day.date} day={day} today={today} todayExpected={todayExpected} />)}
      </div>
    )
  }

  return (
    <section className="cdb-card cdb-next" aria-label="Next days">
      <div className="cdb-card-head">
        <h2 className="cdb-card-title">Next days</h2>
        <Link to="/caterer/rebates" className="cdb-more">All rebates</Link>
      </div>
      {body}
    </section>
  )
}

export default NextDaysStrip
