import { Star } from "lucide-react"
import { DIET_LABELS } from "./menuHelpers"

/** The veg / egg / non-veg mark. Colour follows the status tokens; shape differs so it survives greyscale prints. */
export const DietDot = ({ diet = "" }) => (
  <span className="dm-diet" data-diet={diet || "none"} role="img" aria-label={DIET_LABELS[diet || ""]} title={DIET_LABELS[diet || ""]} />
)

/** Read-only dish list: diet dot, name, star for specials. */
export const ItemList = ({ items = [], dense = false }) => (
  <ul className="dm-items" data-dense={dense || undefined}>
    {items.map((item) => (
      <li key={item.name} className="dm-item" data-special={item.special || undefined}>
        <DietDot diet={item.diet} />
        <span className="dm-item__name">{item.name}</span>
        {item.special && <Star size={11} className="dm-item__star" aria-label="Special" fill="currentColor" />}
      </li>
    ))}
  </ul>
)

export const DietLegend = () => (
  <div className="dm-legend" aria-label="Diet key">
    {["veg", "egg", "nonveg"].map((diet) => (
      <span key={diet} className="dm-legend__item">
        <DietDot diet={diet} />
        {diet === "veg" ? "Veg" : diet === "egg" ? "Egg" : "Non-veg"}
      </span>
    ))}
    <span className="dm-legend__item">
      <Star size={11} className="dm-item__star" fill="currentColor" aria-hidden="true" /> Special
    </span>
  </div>
)

/**
 * Student menu only: how many of the caterer's students ate this meal on the same weekday last
 * week (`meal.lastWeek = { date, percent }`, null when there is no figure).
 */
export const LastWeekTurnout = ({ meal, mealName, compact = false }) => {
  const turnout = meal?.lastWeek
  if (!turnout || typeof turnout.percent !== "number") return null
  const percent = Math.max(0, Math.min(100, turnout.percent))
  const when = fmtTurnoutDay(turnout.date)
  const title = `${percent}% of students at this mess ate ${mealName || "this meal"} on ${when.long}.`
  return (
    <span className="dm-turnout" data-compact={compact || undefined} title={title} role="img" aria-label={title}>
      <span className="dm-turnout__bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </span>
      <span className="dm-turnout__text">
        {percent}% ate{compact ? "" : ` last ${when.weekday}`}
      </span>
    </span>
  )
}

const fmtTurnoutDay = (key) => {
  const date = new Date(`${key}T00:00:00`)
  return {
    weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
    long: date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" }),
  }
}
