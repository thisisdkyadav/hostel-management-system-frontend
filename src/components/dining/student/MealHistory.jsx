import { formatDayFull } from "../caterer/catererHelpers"
import { dayHead, formatClock, ISSUE_REASONS, MEAL_STATUS_LABELS } from "./studentDiningHelpers"

const describe = (meal) => {
  if (meal.status === "ate") return `ate at ${formatClock(meal.at)}`
  if (meal.status === "away") return "away on rebate"
  if (meal.status === "missed") return "missed"
  return "not served yet"
}

const tip = (slot, day, meal) => {
  const issue = meal.issue ? ` (a scan didn't count: ${ISSUE_REASONS[meal.issue] || "it was rejected"})` : ""
  return `${slot.name}, ${formatDayFull(day.date)}: ${describe(meal)}${issue}`
}

/** Last two weeks as a dot grid: meals down the side, days across. */
const MealHistory = ({ slots = [], days = [], summary, today }) => (
  <div className="sd-history">
    <div className="sd-history__scroll">
      <table className="sd-history__grid">
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Meal</span>
            </th>
            {days.map((day) => {
              const head = dayHead(day.date)
              return (
                <th scope="col" key={day.date} data-today={day.date === today || undefined} title={formatDayFull(day.date)}>
                  <span className="sd-history__weekday">{head.weekday}</span>
                  <span className="sd-history__day">{head.day}</span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.key}>
              <th scope="row">{slot.name}</th>
              {days.map((day) => {
                const meal = day.meals[slot.key]
                const label = tip(slot, day, meal)
                return (
                  <td key={day.date} data-today={day.date === today || undefined}>
                    <span className="sd-dot" data-status={meal.status} title={label} role="img" aria-label={label} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="sd-history__legend">
      {["ate", "missed", "away"].map((status) => (
        <span key={status} className="sd-history__key">
          <span className="sd-dot" data-status={status} aria-hidden="true" />
          {MEAL_STATUS_LABELS[status]}
          {summary && <strong>{summary[status]}</strong>}
        </span>
      ))}
    </div>
  </div>
)

export default MealHistory
