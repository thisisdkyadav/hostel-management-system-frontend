import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { formatDayLong, percent } from "../caterer/catererHelpers"
import { turnoutTone } from "../daily/dailyMealsHelpers"

const STATE_LABELS = { ended: "Done", serving: "Now", upcoming: "Later" }

const MealRow = ({ slot, verified, expected }) => {
  const started = slot.state !== "upcoming"
  return (
    <li className="od-meal" data-state={slot.state}>
      <div className="od-meal__name">
        <strong>{slot.name}</strong>
        <span>
          {slot.startTime}–{slot.endTime}
        </span>
      </div>
      <span className="od-meal__state">
        {slot.state === "serving" && <span className="od-live-dot" aria-hidden="true" />}
        {STATE_LABELS[slot.state]}
      </span>
      <div className="od-bar" data-tone={started ? turnoutTone(verified, expected) : "neutral"} aria-hidden="true">
        <span style={{ width: `${started ? percent(verified, expected) : 0}%` }} />
      </div>
      <span className="od-meal__count">
        {started ? (
          <>
            <strong>{verified}</strong> of {expected} ate
          </>
        ) : (
          `${expected} expected`
        )}
      </span>
    </li>
  )
}

/** Today, meal by meal across every caterer, then a line per caterer when there is more than one. */
const TodayCard = ({ home, report, dailyRate }) => {
  const slots = report.mealSlots || []
  const totals = report.totals
  const caterers = report.caterers || []

  return (
    <section className="od-card od-today">
      <header className="od-card__head">
        <div>
          <h2 className="od-card__title">Today</h2>
          <p className="od-card__note">{formatDayLong(report.date)}</p>
        </div>
        <Link to={`${home}/daily-meals`} className="od-link">
          Who ate <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>

      <ul className="od-meals">
        {slots.map((slot) => (
          <MealRow key={slot.key} slot={slot} verified={totals.meals?.[slot.key]?.verifiedCount || 0} expected={totals.expectedCount} />
        ))}
      </ul>

      <p className="od-facts">
        <span>
          <strong>{totals.allocatedCount}</strong> students
        </span>
        <span>
          <strong>{totals.onRebateCount}</strong> away
        </span>
        <span>
          <strong>{totals.expectedCount}</strong> should eat
        </span>
        {dailyRate ? <span>₹{dailyRate} a day</span> : null}
      </p>

      {caterers.length > 1 && (
        <table className="od-table">
          <thead>
            <tr>
              <th scope="col">Caterer</th>
              <th scope="col">Should eat</th>
              {slots.map((slot) => (
                <th scope="col" key={slot.key}>
                  {slot.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {caterers.map((caterer) => (
              <tr key={caterer.id}>
                <th scope="row">{caterer.name}</th>
                <td>{caterer.expectedCount}</td>
                {slots.map((slot) => (
                  <td key={slot.key}>{slot.state === "upcoming" ? "–" : caterer.meals?.[slot.key]?.verifiedCount || 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {caterers.length === 1 && <p className="od-card__note">Everyone eats at {caterers[0].name}.</p>}
    </section>
  )
}

export default TodayCard
