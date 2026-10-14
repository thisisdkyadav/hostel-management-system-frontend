import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { formatDayLong, percent } from "../caterer/catererHelpers"

/** How many plates to plan for tomorrow, per caterer, after approved rebates. */
export const TomorrowCard = ({ report }) => {
  const caterers = (report?.caterers || []).filter((caterer) => caterer.allocatedCount > 0)
  return (
    <section className="od-card">
      <header className="od-card__head">
        <div>
          <h2 className="od-card__title">Tomorrow</h2>
          {report && <p className="od-card__note">{formatDayLong(report.date)}</p>}
        </div>
      </header>
      {!report ? (
        <p className="od-card__note">Loading…</p>
      ) : !report.period || caterers.length === 0 ? (
        <p className="od-card__note">No meals are planned for tomorrow.</p>
      ) : (
        <>
          <div className="od-big">
            <span className="od-big__value">{report.totals.expectedCount}</span>
            <span className="od-big__label">students to cook for, each meal</span>
          </div>
          <ul className="od-list">
            {caterers.map((caterer) => (
              <li key={caterer.id}>
                <span>{caterer.name}</span>
                <span className="od-list__value">
                  <strong>{caterer.expectedCount}</strong>
                  {caterer.onRebateCount > 0 && <span className="od-muted"> · {caterer.onRebateCount} away</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="od-card__note">Counts only rebates approved so far.</p>
        </>
      )}
    </section>
  )
}

/** Seats taken per caterer in the running period. */
export const SeatsCard = ({ home, breakdown = [] }) => {
  const caterers = breakdown.filter((caterer) => caterer.allocatedCount > 0 || caterer.maxStudentCount > 0)
  if (caterers.length === 0) return null
  return (
    <section className="od-card">
      <header className="od-card__head">
        <h2 className="od-card__title">Caterer seats</h2>
        <Link to={`${home}/caterers`} className="od-link">
          Caterers <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>
      <ul className="od-seats">
        {caterers.map((caterer) => {
          const full = caterer.maxStudentCount > 0 && caterer.allocatedCount >= caterer.maxStudentCount
          return (
            <li key={caterer.id}>
              <div className="od-seats__line">
                <span>{caterer.name}</span>
                <span className="od-muted">
                  {caterer.allocatedCount} / {caterer.maxStudentCount || "–"}
                </span>
              </div>
              <div className="od-bar" data-tone={full ? "low" : "neutral"} aria-hidden="true">
                <span style={{ width: `${percent(caterer.allocatedCount, caterer.maxStudentCount)}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
