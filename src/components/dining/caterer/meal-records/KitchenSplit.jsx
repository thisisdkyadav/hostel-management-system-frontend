import { percent } from "../catererHelpers"
import { catererColor } from "../diningScope"

/** Every caterer's share of one meal, side by side. Picking one narrows the page to that caterer. */
const KitchenSplit = ({ caterers = [], palette, mealState, onPick }) => {
  if (caterers.length < 2) return null
  const upcoming = mealState === "upcoming"
  const leader = upcoming ? null : caterers.reduce((best, c) => (c.expectedCount > 0 && (!best || c.verifiedCount / c.expectedCount > best.verifiedCount / best.expectedCount) ? c : best), null)

  return (
    <div className="mr-kitchens">
      <h3 className="mr-summary__subhead">By caterer</h3>
      <ul className="mr-kitchens__list">
        {caterers.map((caterer) => {
          const pct = percent(caterer.verifiedCount, caterer.expectedCount)
          const left = mealState === "ended" ? caterer.missedCount : caterer.pendingCount
          return (
            <li key={caterer.id}>
              <button
                type="button"
                className="mr-kitchen"
                style={{ "--kitchen": catererColor(palette, caterer.id) }}
                onClick={() => onPick(caterer.id)}
                title={`Show only ${caterer.name}`}
              >
                <span className="mr-kitchen__name">
                  <span className="mr-kitchen__dot" aria-hidden="true" />
                  <span className="mr-kitchen__label">{caterer.name}</span>
                  {leader?.id === caterer.id && pct > 0 && <span className="mr-kitchen__lead">Fullest</span>}
                </span>
                <span className="mr-kitchen__count">
                  {upcoming ? (
                    <><strong>{caterer.expectedCount}</strong> expected</>
                  ) : (
                    <><strong>{caterer.verifiedCount}</strong> of {caterer.expectedCount} ate<span className="mr-kitchen__pct">{pct}%</span></>
                  )}
                </span>
                <span className="mr-kitchen__bar" aria-hidden="true">
                  <span style={{ width: `${Math.min(100, pct)}%` }} />
                </span>
                <span className="mr-kitchen__meta">
                  {!upcoming && <span>{left} {mealState === "ended" ? "missed" : "not yet"}</span>}
                  <span>{caterer.onRebateCount} away</span>
                  {caterer.issueCount > 0 && <span className="mr-kitchen__issues">{caterer.issueCount} {caterer.issueCount === 1 ? "issue" : "issues"}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default KitchenSplit
