import { useMemo } from "react"
import { Card, ErrorState, Skeleton, StatusBadge } from "hzero"
import { formatDayLong, pluralize } from "../catererHelpers"
import { countByStatus } from "./mealRecordsHelpers"
import PlateBar from "./PlateBar"
import ArrivalCurve from "./ArrivalCurve"
import "./MealRecords.css"

const STATE_BADGE = {
  serving: { label: "Serving now", tone: "success", dot: true },
  ended: { label: "Ended", tone: "neutral", dot: false },
  upcoming: { label: "Upcoming", tone: "primary", dot: false },
}

const headlineFor = (summary, state) => {
  const expected = summary.expectedCount
  if (state === "upcoming") {
    return expected > 0 ? `${pluralize(expected, "student")} expected` : "Nobody is expected for this meal"
  }
  if (expected === 0 && summary.verifiedCount === 0) return "Nobody was expected for this meal"
  return `${summary.verifiedCount} of ${expected} expected ${expected === 1 ? "student" : "students"} ${state === "serving" ? "have eaten so far" : "ate"}`
}

/** The selected service: what happened (plate bar) and when (arrival curve). */
const ServiceSummary = ({ slot, date, record, stale, loading, error, onRetry }) => {
  const students = record?.students
  const counts = useMemo(() => countByStatus(students), [students])

  const heading = `${slot?.name || "Meal"}, ${formatDayLong(date)}`
  const badge = record && !stale ? STATE_BADGE[record.mealState] : null

  let body
  if (error && !record) {
    body = <ErrorState title="Could not load this meal" message={error} onRetry={onRetry} />
  } else if (loading || !record) {
    body = (
      <div className="mr-summary__body" aria-busy="true">
        <div>
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} style={{ marginTop: "var(--spacing-2)" }} />
          <Skeleton variant="rounded" height={14} style={{ marginTop: "var(--spacing-4)" }} />
        </div>
        <Skeleton variant="rounded" height={96} />
      </div>
    )
  } else {
    const { summary, mealState } = record
    const ended = mealState === "ended"
    const facts = [
      ended
        ? `${counts.missed} missed`
        : mealState === "serving"
          ? `${counts.pending} not yet scanned`
          : null,
      `${counts["on-rebate"]} away on rebate`,
      summary.verifiedCount > 0 ? `Manual ${summary.manualCount}, face scan ${summary.faceCount}` : null,
    ].filter(Boolean)

    body = (
      <div className="mr-summary__body" data-stale={stale || undefined} aria-busy={stale || undefined}>
        <div className="mr-summary__plate">
          <p className="mr-summary__headline">{headlineFor(summary, mealState)}</p>
          <ul className="mr-summary__facts">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <PlateBar counts={counts} ended={ended} />
        </div>
        <div className="mr-summary__curve">
          <h3 className="mr-summary__subhead">When they ate</h3>
          <ArrivalCurve students={students} slot={record.mealSlot || slot} />
        </div>
      </div>
    )
  }

  return (
    <Card className="mr-summary">
      <div className="mr-summary__head">
        <div className="mr-summary__title">
          <h2 className="mr-summary__heading">{heading}</h2>
          {slot && <p className="mr-summary__window">{slot.startTime} – {slot.endTime}</p>}
        </div>
        {badge && (
          <StatusBadge tone={badge.tone} showDot={badge.dot}>
            {badge.label}
          </StatusBadge>
        )}
      </div>
      {body}
    </Card>
  )
}

export default ServiceSummary
