import { AlertTriangle, Check, Clock, Plane, X } from "lucide-react"
import { issueLine, mealLine } from "./studentDiningHelpers"

const ICONS = { ate: Check, missed: X, away: Plane, serving: Clock, upcoming: Clock }

/** Today's meals, one tile each: did it count, is it on now, or when it starts. */
const TodayMeals = ({ meals = [] }) => (
  <ul className="sd-today" aria-label="Today's meals">
    {meals.map((meal) => {
      const Icon = ICONS[meal.status] || Clock
      const issue = issueLine(meal)
      return (
        <li key={meal.key} className="sd-meal" data-status={meal.status}>
          <div className="sd-meal__head">
            <span className="sd-meal__name">{meal.name}</span>
            <span className="sd-meal__time">
              {meal.startTime}–{meal.endTime}
            </span>
          </div>
          <div className="sd-meal__status">
            <span className="sd-meal__icon" aria-hidden="true">
              {meal.status === "serving" ? <span className="sd-live-dot" /> : <Icon size={14} strokeWidth={2.5} />}
            </span>
            {mealLine(meal)}
          </div>
          {issue && (
            <p className="sd-meal__issue">
              <AlertTriangle size={13} aria-hidden="true" /> {issue}
            </p>
          )}
        </li>
      )
    })}
  </ul>
)

export default TodayMeals
