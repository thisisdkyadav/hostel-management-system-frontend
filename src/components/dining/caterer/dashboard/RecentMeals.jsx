import { Link } from "react-router-dom"
import { Button, Skeleton } from "hzero"
import { formatDayMonth, formatWeekday } from "../catererHelpers"
import { mealRecordsLink } from "./dashboardHelpers"
import PanelMessage from "./PanelMessage"

const Column = ({ meal, index, latest, periodId }) => {
  const rate = Math.round(meal.rate * 100)
  const description = `${meal.slotName}, ${formatWeekday(meal.date)} ${formatDayMonth(meal.date)}: ${meal.verified} of ${meal.expected} ate, ${rate}%`
  return (
    <Link
      className="cdb-col"
      data-latest={latest || undefined}
      style={{ "--cdb-i": index }}
      to={mealRecordsLink({ periodId, date: meal.date, meal: meal.slotKey })}
      title={description}
      aria-label={description}
    >
      <span className="cdb-col-plot">
        <span className="cdb-bar" style={{ height: `${Math.min(1, meal.rate) * 100}%` }}>
          <span className="cdb-bar-fill" />
          <span className="cdb-bar-value">{rate}%</span>
        </span>
      </span>
      <span className="cdb-col-label">
        <span className="cdb-col-slot">{meal.slotName.charAt(0).toUpperCase()}</span>
        <span className="cdb-col-day">{formatWeekday(meal.date)}</span>
      </span>
    </Link>
  )
}

/** Attendance for the most recent finished meals, oldest to newest, with the average as a dashed line. */
const RecentMeals = ({ meals, summary, periodId, loading, error, noPeriod, onRetry }) => {
  let body
  if (loading) {
    body = <Skeleton variant="rounded" className="cdb-chart-skeleton" />
  } else if (noPeriod) {
    body = <PanelMessage title="No current dining period" text="Recent meals appear once a dining period is running for you." />
  } else if (error && !meals.length) {
    body = <PanelMessage title="Could not load recent meals" tone="danger"><Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button></PanelMessage>
  } else if (!meals.length) {
    body = <PanelMessage title="No finished meals yet" text="Attendance for recent meals shows up here once they end." />
  } else {
    body = (
      <div className="cdb-chart">
        <div className="cdb-chart-cols" style={{ "--cdb-n": meals.length, "--cdb-avg": Math.min(100, summary.average) / 100 }}>
          <span className="cdb-avgline" aria-hidden="true" />
          {meals.map((meal, index) => (
            <Column key={meal.id} meal={meal} index={index} latest={index === meals.length - 1} periodId={periodId} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="cdb-card cdb-recent" aria-label="Recent meals">
      <div className="cdb-card-head">
        <h2 className="cdb-card-title">Recent meals</h2>
        {meals.length > 0 && (
          <span className="cdb-caption">
            <span className="cdb-avg-key" aria-hidden="true" />
            Average {summary.average}%{summary.best ? `, best ${summary.best}` : ""}
          </span>
        )}
      </div>
      {body}
    </section>
  )
}

export default RecentMeals
