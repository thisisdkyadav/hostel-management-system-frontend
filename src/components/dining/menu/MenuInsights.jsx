import { useMemo } from "react"
import { ErrorState, Skeleton } from "hzero"
import { BarChart3 } from "lucide-react"
import { analyzeMenu } from "./insights"
import useMenuRange from "./useMenuRange"
import { addDays, formatFull, formatShort, getErrorMessage } from "./menuHelpers"

const percent = (value) => `${Math.round(value * 100)}%`

const Meter = ({ value, label, tone = "primary" }) => (
  <div
    className="dm-meter"
    role="meter"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value * 100)}
    aria-label={label}
    data-tone={tone}
  >
    <span style={{ width: percent(Math.min(Math.max(value, 0), 1)) }} />
  </div>
)

const Card = ({ title, aside, children, wide }) => (
  <section className="dm-ins__card" data-wide={wide || undefined}>
    <header>
      <h3>{title}</h3>
      {aside && <span>{aside}</span>}
    </header>
    {children}
  </section>
)

const varietyWords = (value) => (value >= 0.7 ? "Lots of variety" : value >= 0.45 ? "Fair variety" : "Quite repetitive")

/**
 * Menu insights for the four weeks ending with the selected week, plus a look further back for dishes
 * that have gone quiet. Simple meters and bars: this is a glance, not a report.
 */
const MenuInsights = ({ readOnly, catererId, weekStart }) => {
  const from = addDays(weekStart, -49)
  const to = addDays(weekStart, 6)
  const query = useMenuRange({ readOnly, catererId, from, to })
  const stats = useMemo(() => (query.data ? analyzeMenu(query.data.days || [], weekStart) : null), [query.data, weekStart])

  if (query.isError && !query.data) {
    return <ErrorState message={getErrorMessage(query.error, "Couldn't load the insights.")} onRetry={() => query.refetch()} />
  }
  if (!stats) return <Skeleton variant="rounded" height={280} />

  if (!stats.slots && !stats.quiet.length) {
    return (
      <div className="dm-quiet">
        <BarChart3 size={26} aria-hidden="true" />
        <p>No dishes listed in these weeks yet. Insights appear once a menu is in place.</p>
      </div>
    )
  }

  const maxRepeat = Math.max(1, ...stats.repeated.map((entry) => entry.count))
  const coverage = stats.openMeals ? stats.filledMeals / stats.openMeals : 0

  return (
    <div className="dm-ins" data-stale={query.isPlaceholderData || undefined}>
      <p className="dm-ins__range">
        Four weeks to {formatFull(addDays(weekStart, 6))}, starting {formatShort(addDays(weekStart, -21))}.
      </p>

      <div className="dm-ins__grid">
        <Card title="Variety" aside={varietyWords(stats.variety)}>
          <div className="dm-ins__big">{percent(stats.variety)}</div>
          <Meter value={stats.variety} label="Variety score" />
          <p className="dm-ins__quiet">
            {stats.distinct} different dishes across {stats.slots} places on the menu.
          </p>
        </Card>

        <Card title="Menu filled in" aside="Selected week">
          <div className="dm-ins__big">
            {stats.filledMeals}
            <small> of {stats.openMeals} meals</small>
          </div>
          <Meter value={coverage} label="Meals with a menu" tone={coverage === 1 ? "success" : "warning"} />
          <p className="dm-ins__quiet">
            {stats.openMeals - stats.filledMeals
              ? `${stats.openMeals - stats.filledMeals} still have no dishes listed.`
              : "Every open meal has a menu."}
          </p>
        </Card>

        <Card title="Specials" aside="Four weeks">
          <div className="dm-ins__big">{stats.specials}</div>
          <p className="dm-ins__quiet">
            {stats.specialNames.length ? stats.specialNames.join(", ") : "No dishes were starred as specials."}
          </p>
        </Card>

        <Card title="Egg and non-veg days" aside="Days per week" wide>
          <ul className="dm-weeks">
            {stats.weeks.map((week, index) => (
              <li key={week.start}>
                <span className="dm-weeks__label">{index === stats.weeks.length - 1 ? "This week" : `From ${week.label}`}</span>
                <div className="dm-weeks__bars">
                  <div className="dm-bar" data-tone="danger" title={`${week.nonveg} non-veg days`}>
                    <span style={{ width: percent(week.nonveg / 7) }} />
                    <em>{week.nonveg}</em>
                  </div>
                  <div className="dm-bar" data-tone="warning" title={`${week.egg} egg days`}>
                    <span style={{ width: percent(week.egg / 7) }} />
                    <em>{week.egg}</em>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="dm-ins__legend">
            <span data-tone="danger">Non-veg</span>
            <span data-tone="warning">Egg</span>
          </p>
        </Card>

        <Card title="Most repeated dishes" aside="Four weeks" wide>
          {stats.repeated.length ? (
            <ul className="dm-rank">
              {stats.repeated.map((entry) => (
                <li key={entry.name}>
                  <span className="dm-rank__name">{entry.name}</span>
                  <div className="dm-bar">
                    <span style={{ width: percent(entry.count / maxRepeat) }} />
                  </div>
                  <b>{entry.count}×</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dm-ins__quiet">Nothing is repeated more than once.</p>
          )}
        </Card>

        <Card title="Not served in a while" aside="Not in the last 2 weeks" wide>
          {stats.quiet.length ? (
            <ul className="dm-quiet-list">
              {stats.quiet.map((entry) => (
                <li key={entry.name}>
                  <span>{entry.name}</span>
                  <em>last {formatShort(entry.date)}</em>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dm-ins__quiet">Everything from the earlier weeks has been served recently.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default MenuInsights
