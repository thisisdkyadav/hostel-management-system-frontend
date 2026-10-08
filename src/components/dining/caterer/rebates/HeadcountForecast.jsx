import { Card, Heading, Skeleton, Text, Tooltip } from "hzero"
import { LogIn, LogOut } from "lucide-react"
import { formatDayMonth, formatWeekday } from "../catererHelpers"
import { dayOfMonth, describeForecastDay, isWeekend } from "./rebateHelpers"
import "./Rebates.css"

const Legend = () => (
  <div className="rf-legend" aria-label="Legend">
    <span className="reb-key"><span className="reb-swatch" data-kind="expected" />Expected</span>
    <span className="reb-key"><span className="reb-swatch" data-kind="away" />Away</span>
    <span className="reb-key"><span className="reb-swatch" data-kind="pending" />Pending</span>
    <span className="reb-key"><LogOut size={12} aria-hidden="true" />Leaving</span>
    <span className="reb-key"><LogIn size={12} aria-hidden="true" />Back</span>
  </div>
)

const Column = ({ day, index, scaleMax, today, selected, onSelect }) => {
  const served = Boolean(day.periodId)
  // Pending students are still counted in expected; carve them out so the
  // stack adds up to the allocated headcount.
  const pending = served ? Math.min(day.pendingCount, day.expectedCount) : 0
  const solid = served ? day.expectedCount - pending : 0
  const away = served ? day.onRebateCount : 0
  const heightPct = served && scaleMax > 0 ? (day.allocatedCount / scaleMax) * 100 : 0
  const isToday = day.date === today

  return (
    <Tooltip content={describeForecastDay(day)}>
      <button
        type="button"
        className="rf-col"
        aria-pressed={selected}
        aria-label={describeForecastDay(day)}
        disabled={!served}
        data-today={isToday}
        data-weekend={isWeekend(day.date)}
        onClick={() => onSelect(day.date)}
      >
        <span className="rf-count">{served ? day.onRebateCount : "–"}</span>
        <span className="rf-plot">
          {served ? (
            <span className="rf-bar" style={{ height: `${heightPct}%`, "--rf-i": index }}>
              <span className="reb-seg" data-kind="expected" data-nonzero={solid > 0} style={{ flexGrow: solid }} />
              <span className="reb-seg" data-kind="away" data-nonzero={away > 0} style={{ flexGrow: away }} />
              <span className="reb-seg" data-kind="pending" data-nonzero={pending > 0} style={{ flexGrow: pending }} />
            </span>
          ) : (
            <span className="rf-none">No service</span>
          )}
        </span>
        <span className="rf-weekday">{isToday ? "Today" : formatWeekday(day.date)}</span>
        <span className="rf-date">{dayOfMonth(day.date)}</span>
        <span className="rf-flows" aria-hidden="true">
          <span className="rf-flow" data-empty={!served || day.startingCount === 0}>
            <LogOut size={12} />{day.startingCount}
          </span>
          <span className="rf-flow" data-empty={!served || day.returningCount === 0}>
            <LogIn size={12} />{day.returningCount}
          </span>
        </span>
      </button>
    </Tooltip>
  )
}

/**
 * Fourteen days of headcount. Every column shares one baseline and one scale
 * (the largest allocation in view), so bar height is the roster size.
 */
const HeadcountForecast = ({ days, today, selectedDate, onSelect, loading }) => {
  const scaleMax = Math.max(0, ...(days || []).map((day) => (day.periodId ? day.allocatedCount : 0)))
  const last = days?.length ? days[days.length - 1].date : ""

  return (
    <Card>
      <div className="rf">
        <div className="rf-head">
          <div>
            <Heading as="h3" size="lg" weight="bold" color="heading" style={{ margin: 0 }}>Headcount forecast</Heading>
            <Text size="sm" color="muted" style={{ margin: "var(--spacing-1) 0 0" }}>
              {last ? `Today to ${formatDayMonth(last)}, after approved rebates. Select a day for names.` : "Next two weeks, after approved rebates."}
            </Text>
          </div>
          <Legend />
        </div>
        {loading ? (
          <Skeleton variant="rectangular" height="14rem" />
        ) : (
          <div className="rf-scroll">
            <div className="rf-strip">
              {days.map((day, index) => (
                <Column
                  key={day.date}
                  day={day}
                  index={index}
                  scaleMax={scaleMax}
                  today={today}
                  selected={selectedDate === day.date}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default HeadcountForecast
