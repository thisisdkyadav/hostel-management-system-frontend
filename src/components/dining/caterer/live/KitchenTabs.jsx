import { percent } from "../catererHelpers"
import { catererColor } from "../diningScope"

const Tab = ({ active, color, name, verified, expected, issues, onClick, label }) => {
  const pct = percent(verified, expected)
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className="lf-kitchen"
      data-active={active || undefined}
      style={{ "--kitchen": color, "--fill": `${Math.min(100, pct)}%` }}
      onClick={onClick}
      title={label}
    >
      <span className="lf-kitchen-fill" aria-hidden="true" />
      <span className="lf-kitchen-name">
        <span className="lf-kitchen-dot" aria-hidden="true" />
        <span className="lf-kitchen-label">{name}</span>
        {issues > 0 && <span className="lf-kitchen-issues" title={`${issues} ${issues === 1 ? "issue" : "issues"}`}>{issues}</span>}
      </span>
      <span className="lf-kitchen-count">
        <strong>{verified}</strong>
        <span>/ {expected}</span>
        <span className="lf-kitchen-pct">{pct}%</span>
      </span>
    </button>
  )
}

/**
 * Every caterer as a tab that fills up as its students eat. Picking one narrows the whole
 * screen (count, rush, scans) to that caterer; "All caterers" brings everyone back.
 */
const KitchenTabs = ({ caterers = [], kitchens = [], totals, palette, value, onChange }) => {
  if (caterers.length < 2) return null
  const byId = new Map(kitchens.map((kitchen) => [kitchen.id, kitchen]))
  return (
    <div className="lf-kitchens" role="tablist" aria-label="Caterer">
      <Tab
        active={!value}
        color="var(--color-success)"
        name="All caterers"
        verified={totals?.verifiedCount ?? 0}
        expected={totals?.expectedCount ?? 0}
        issues={totals?.issueCount ?? 0}
        onClick={() => onChange("")}
        label="Show every caterer"
      />
      {caterers.map((caterer) => {
        const kitchen = byId.get(caterer.id)
        return (
          <Tab
            key={caterer.id}
            active={value === caterer.id}
            color={catererColor(palette, caterer.id)}
            name={caterer.name}
            verified={kitchen?.verifiedCount ?? 0}
            expected={kitchen?.expectedCount ?? 0}
            issues={kitchen?.issueCount ?? 0}
            onClick={() => onChange(value === caterer.id ? "" : caterer.id)}
            label={value === caterer.id ? "Show every caterer" : `Show only ${caterer.name}`}
          />
        )
      })}
    </div>
  )
}

export default KitchenTabs
