import { useId } from "react"
import { Button, Skeleton } from "hzero"
import { LogIn, LogOut } from "lucide-react"
import { ratio } from "./dashboardHelpers"
import PanelMessage from "./PanelMessage"

const RADIUS = 52
const STROKE = 13

/** One arc of the ring. pathLength=100 so `start` and `length` read as percentages of the circle. */
const Arc = ({ start, length, className, stroke }) => {
  if (length <= 0) return null
  return (
    <circle
      cx="60"
      cy="60"
      r={RADIUS}
      fill="none"
      strokeWidth={STROKE}
      pathLength="100"
      strokeDasharray={`${length} ${100 - length}`}
      strokeDashoffset={-start}
      className={className}
      stroke={stroke}
      transform="rotate(-90 60 60)"
    />
  )
}

/** Allocated students as a ring: cooking for (solid), maybe away (hatched), away on rebate. */
const Ring = ({ expected, pending, away, allocated }) => {
  const hatchId = useId()
  const total = Math.max(1, expected + away)
  const solid = Math.max(0, expected - pending)
  const seg = (count) => ratio(count, total) * 100
  const solidLen = seg(solid)
  const pendingLen = seg(pending)
  const awayLen = seg(away)

  return (
    <div className="cdb-ring">
      <svg viewBox="0 0 120 120" role="img" aria-label={`Cook for ${expected} of ${allocated} students; ${away} away on rebate, ${pending} pending`}>
        <defs>
          <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" className="cdb-hatch-bg" />
            <line x1="0" y1="0" x2="0" y2="6" strokeWidth="2.5" className="cdb-hatch-line" />
          </pattern>
        </defs>
        <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth={STROKE} className="cdb-ring-track" />
        <Arc start={0} length={solidLen} className="cdb-arc-cook" />
        <Arc start={solidLen} length={pendingLen} stroke={`url(#${hatchId})`} />
        <Arc start={solidLen + pendingLen} length={awayLen} className="cdb-arc-away" />
      </svg>
      <div className="cdb-ring-center">
        <span className="cdb-ring-label">Cook for</span>
        <span className="cdb-ring-number">{expected}</span>
        <span className="cdb-ring-sub">of {allocated} students</span>
      </div>
    </div>
  )
}

const CookForHero = ({ day, loading, error, onRetry, children }) => {
  let body
  if (loading) {
    body = (
      <div className="cdb-hero-body">
        <Skeleton variant="circular" className="cdb-ring-skeleton" />
        <Skeleton variant="text" width="60%" />
      </div>
    )
  } else if (error && !day) {
    body = (
      <PanelMessage title="Could not load today's headcount" tone="danger">
        <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>
      </PanelMessage>
    )
  } else if (!day || !day.periodId) {
    body = <PanelMessage title="No service today" text="You have no active dining period today, so there is nothing to cook for." />
  } else {
    body = (
      <div className="cdb-hero-body">
        <Ring expected={day.expectedCount} pending={Math.min(day.pendingCount, day.expectedCount)} away={day.onRebateCount} allocated={day.allocatedCount} />
        <ul className="cdb-legend" aria-label="Headcount breakdown">
          <li><span className="cdb-swatch" data-kind="cook" />Confirmed {day.expectedCount - Math.min(day.pendingCount, day.expectedCount)}</li>
          <li><span className="cdb-swatch" data-kind="away" />Away {day.onRebateCount}</li>
          {day.pendingCount > 0 && (
            <li title="Counted in the cook-for number; they may be away if approved">
              <span className="cdb-swatch" data-kind="pending" />
              {day.pendingCount} pending, may be away
            </li>
          )}
        </ul>
        <div className="cdb-chips">
          <span className="cdb-chip"><LogOut size={14} aria-hidden="true" />{day.startingCount} leaving today</span>
          <span className="cdb-chip"><LogIn size={14} aria-hidden="true" />{day.returningCount} back today</span>
        </div>
      </div>
    )
  }

  return (
    <section className="cdb-card cdb-hero" aria-label="Today's headcount">
      <h2 className="cdb-card-title">Today</h2>
      {body}
      {children}
    </section>
  )
}

export default CookForHero
