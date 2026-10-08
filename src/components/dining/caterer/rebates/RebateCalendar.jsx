import { useMemo } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ErrorState, Heading, IconButton, Skeleton, Text } from "hzero"
import { catererApi } from "@/service"
import { queryKeys } from "@/lib/query"
import { formatMonth } from "../catererHelpers"
import {
  buildMonthWeeks, dayOfMonth, formatDayCompact, heatLevel, monthBounds, summarizeMonth, weekdayHeadings,
} from "./rebateHelpers"
import "./Rebates.css"

const HEADINGS = weekdayHeadings()

/** Month grid, Monday first. Cell shade is away count relative to the month's busiest day. */
const RebateCalendar = ({ month, onMonthChange, today, onSelect }) => {
  const { first, last } = useMemo(() => monthBounds(month), [month])
  const params = { from: first, to: last }
  const query = useQuery({
    queryKey: queryKeys.caterer.rebateOverview(params),
    queryFn: () => catererApi.getRebateOverview(params),
    placeholderData: keepPreviousData,
  })

  const weeks = useMemo(() => buildMonthWeeks(first), [first])
  const byDate = useMemo(() => new Map((query.data?.days || []).map((day) => [day.date, day])), [query.data])
  const max = useMemo(() => Math.max(0, ...(query.data?.days || []).map((day) => (day.periodId ? day.onRebateCount : 0))), [query.data])
  const summary = useMemo(() => summarizeMonth(query.data?.days), [query.data])

  let summaryText = ""
  if (query.data) {
    if (!summary) summaryText = "No dining period in this month."
    else if (summary.busiest.onRebateCount === 0) summaryText = "Nobody is on rebate this month."
    else summaryText = `Busiest day: ${formatDayCompact(summary.busiest.date)}, ${summary.busiest.onRebateCount} away. Average ${summary.average} away per day.`
  }

  return (
    <div>
      <div className="cal-nav">
        <IconButton icon={<ChevronLeft size={18} />} ariaLabel="Previous month" variant="outline" onClick={() => onMonthChange(-1)} />
        <Heading as="h3" size="lg" weight="bold" color="heading" style={{ margin: 0 }} aria-live="polite">{formatMonth(first)}</Heading>
        <IconButton icon={<ChevronRight size={18} />} ariaLabel="Next month" variant="outline" onClick={() => onMonthChange(1)} />
      </div>

      {query.isError && !query.data ? (
        <ErrorState message="Could not load this month." onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <Skeleton variant="rectangular" height="20rem" />
      ) : (
        <>
          <div className="cal-grid" role="grid" aria-label={formatMonth(first)}>
            {HEADINGS.map((name) => <div className="cal-head" role="columnheader" key={name}>{name}</div>)}
            {weeks.flat().map((date) => {
              const inMonth = date >= first && date <= last
              const day = inMonth ? byDate.get(date) : null
              const served = Boolean(day?.periodId)
              const label = served ? `${formatDayCompact(date)}: ${day.onRebateCount} away` : `${formatDayCompact(date)}: no service`
              return (
                <button
                  type="button"
                  key={date}
                  className="cal-cell"
                  data-level={served ? heatLevel(day.onRebateCount, max) : 0}
                  data-today={date === today}
                  data-outside={!inMonth}
                  disabled={!inMonth}
                  title={inMonth ? label : undefined}
                  aria-label={inMonth ? label : undefined}
                  onClick={() => onSelect(date)}
                >
                  <span className="cal-date">{dayOfMonth(date)}</span>
                  {inMonth && (
                    <span className="cal-count" data-empty={!served || day.onRebateCount === 0}>{served ? day.onRebateCount : "-"}</span>
                  )}
                </button>
              )
            })}
          </div>
          <Text size="sm" color="muted" style={{ margin: "var(--spacing-3) 0 0" }}>{summaryText}</Text>
        </>
      )}
    </div>
  )
}

export default RebateCalendar
