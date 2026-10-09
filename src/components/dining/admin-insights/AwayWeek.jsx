import InsightCard, { PanelMessage } from "./InsightCard"
import { fmtInt, WEEKDAY_LONG, WEEKDAY_SHORT, weekdayOf } from "./insightHelpers"

const DAYS_SHOWN = 7

/** Who is away on rebate this week: approved as solid, still-to-approve as a hatched cap. */
const AwayWeek = ({ data, loading }) => {
  const forecast = (data?.rebateForecast || []).slice(0, DAYS_SHOWN)
  const max = Math.max(1, ...forecast.map((d) => (d.onRebate || 0) + (d.pending || 0)))
  const today = forecast[0]
  const peak = forecast.reduce((a, d) => (!a || d.onRebate > a.onRebate ? d : a), null)

  return (
    <InsightCard
      className="dxi-away"
      title="Away this week"
      caption={today ? `${fmtInt(today.onRebate)} away today` : undefined}
      to="/admin/dining-rebates"
      linkLabel="Rebates"
      loading={loading}
    >
      {forecast.length === 0 ? (
        <PanelMessage title="Nobody away" text="No rebates in the coming days." />
      ) : (
        <div className="dxi-away-inner">
          <ol className="dxi-away-bars">
            {forecast.map((day, index) => {
              const approved = day.onRebate || 0
              const pending = day.pending || 0
              return (
                <li
                  key={day.date}
                  className="dxi-away-day"
                  data-today={index === 0 || undefined}
                  title={`${WEEKDAY_LONG[weekdayOf(day.date)]}: ${fmtInt(approved)} away${pending ? `, ${fmtInt(pending)} more waiting for approval` : ""}`}
                >
                  <span className="dxi-away-value">{fmtInt(approved)}</span>
                  <span className="dxi-away-col">
                    <span className="dxi-away-pending" style={{ height: `${(pending / max) * 100}%` }} />
                    <span className="dxi-away-approved" style={{ height: `${(approved / max) * 100}%` }} />
                  </span>
                  <span className="dxi-away-label">{index === 0 ? "Today" : WEEKDAY_SHORT[weekdayOf(day.date)]}</span>
                </li>
              )
            })}
          </ol>
          {peak && peak !== today && (
            <p className="dxi-away-note">Most away on <strong>{WEEKDAY_LONG[weekdayOf(peak.date)]}</strong> ({fmtInt(peak.onRebate)})</p>
          )}
        </div>
      )}
    </InsightCard>
  )
}

export default AwayWeek
