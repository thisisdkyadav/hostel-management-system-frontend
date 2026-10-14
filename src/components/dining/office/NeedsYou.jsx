import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2 } from "lucide-react"

/** The four things the office acts on, each a link straight to where it gets done. */
const NeedsYou = ({ home, rebates, checkOn, checkOnDays, issues, dues }) => {
  const tiles = [
    { key: "rebates", count: rebates, label: "Rebates to approve", hint: "Longer breaks waiting for you", to: `${home}/dining-rebates` },
    { key: "check-on", count: checkOn, label: "Students to check on", hint: `No meal in the last ${checkOnDays} days`, to: `${home}/daily-meals` },
    { key: "issues", count: issues, label: "Scans that didn't count", hint: "Today, all caterers", to: `${home}/meal-records` },
    { key: "dues", count: dues, label: "Students with dues", hint: "Mess bill below zero", to: `${home}/dining-billing` },
  ]
  const known = tiles.filter((tile) => Number.isFinite(tile.count))
  const allClear = known.length === tiles.length && known.every((tile) => tile.count === 0)

  return (
    <section className="od-needs" aria-labelledby="od-needs-title">
      <h2 id="od-needs-title" className="od-section-title">
        {allClear ? (
          <>
            <CheckCircle2 size={16} aria-hidden="true" className="od-clear" /> All clear, nothing waiting on you
          </>
        ) : (
          "Needs you"
        )}
      </h2>
      <ul className="od-needs__grid">
        {tiles.map((tile) => {
          const ready = Number.isFinite(tile.count)
          return (
            <li key={tile.key}>
              <Link to={tile.to} className="od-tile" data-active={(ready && tile.count > 0) || undefined}>
                <span className="od-tile__count">{ready ? tile.count : "–"}</span>
                <span className="od-tile__label">{tile.label}</span>
                <span className="od-tile__hint">
                  {ready && tile.count === 0 ? "Nothing waiting" : tile.hint}
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default NeedsYou
