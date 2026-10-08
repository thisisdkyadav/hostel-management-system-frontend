import { pluralize } from "../catererHelpers"
import "./MealRecords.css"

/**
 * One stacked bar across everyone allocated to the meal: ate, then missed (or not yet), then away on rebate.
 * Each segment is direct-labelled underneath, so colour is never the only carrier.
 */
const PlateBar = ({ counts, ended }) => {
  const segments = [
    { key: "ate", label: "Ate", count: counts.verified },
    ended
      ? { key: "missed", label: "Missed", count: counts.missed }
      : { key: "pending", label: "Not yet", count: counts.pending },
    { key: "away", label: "Away on rebate", count: counts["on-rebate"] },
  ]
  const total = segments.reduce((sum, segment) => sum + segment.count, 0)
  const description = segments.map((segment) => `${segment.count} ${segment.label.toLowerCase()}`).join(", ")

  return (
    <div className="mr-plate">
      {total > 0 && (
        <div className="mr-plate__bar" role="img" aria-label={`${pluralize(total, "student")} allocated: ${description}`}>
          {segments.map(
            (segment) =>
              segment.count > 0 && (
                <span
                  key={segment.key}
                  className="mr-plate__segment"
                  data-segment={segment.key}
                  style={{ flexGrow: segment.count }}
                />
              )
          )}
        </div>
      )}
      <ul className="mr-plate__labels">
        {segments.map((segment) => (
          <li key={segment.key} className="mr-plate__label">
            <span className="mr-plate__dot" data-segment={segment.key} aria-hidden="true" />
            <span className="mr-plate__label-count">{segment.count}</span>
            <span className="mr-plate__label-name">{segment.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PlateBar
