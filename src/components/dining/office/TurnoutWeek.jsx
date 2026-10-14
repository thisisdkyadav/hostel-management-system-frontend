import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { formatDayFull, formatDayShort, percent } from "../caterer/catererHelpers"
import { turnoutTone } from "../daily/dailyMealsHelpers"

/** Share of expected students who ate, per meal, for the last few full days. */
const TurnoutWeek = ({ home, overview }) => {
  const days = overview?.days || []
  const slots = overview?.mealSlots || []
  if (days.length === 0) return null

  const average = (slot) => {
    const verified = days.reduce((sum, day) => sum + (day.meals?.[slot.key]?.verifiedCount || 0), 0)
    const expected = days.reduce((sum, day) => sum + (day.expectedCount || 0), 0)
    return percent(verified, expected)
  }

  return (
    <section className="od-card">
      <header className="od-card__head">
        <div>
          <h2 className="od-card__title">Last {days.length === 1 ? "day" : `${days.length} days`}</h2>
          <p className="od-card__note">Share of students who should eat that actually did</p>
        </div>
        <Link to={`${home}/meal-records`} className="od-link">
          Meal records <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>
      <div className="od-week__scroll">
        <table className="od-week">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Meal</span>
              </th>
              {days.map((day) => (
                <th scope="col" key={day.date} title={formatDayFull(day.date)}>
                  {formatDayShort(day.date)}
                </th>
              ))}
              <th scope="col">Average</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.key}>
                <th scope="row">{slot.name}</th>
                {days.map((day) => {
                  const verified = day.meals?.[slot.key]?.verifiedCount || 0
                  return (
                    <td key={day.date} title={`${verified} of ${day.expectedCount} ate`}>
                      <span className="od-cell" data-tone={turnoutTone(verified, day.expectedCount)}>
                        {day.expectedCount ? `${percent(verified, day.expectedCount)}%` : "–"}
                      </span>
                    </td>
                  )
                })}
                <td>
                  <strong>{average(slot)}%</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default TurnoutWeek
