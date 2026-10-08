import { useMemo } from "react"
import { EmptyState, Panel, Skeleton, Text } from "hzero"
import { CalendarClock, ChevronRight } from "lucide-react"
import { addDays, relativeDay } from "../catererHelpers"
import { COMING_UP_DAYS, formatDayCompact } from "./rebateHelpers"
import "./Rebates.css"

/** Days in the next week where approved rebates begin, from the overview. */
const ComingUpPanel = ({ days, today, loading, onSelect }) => {
  const upcoming = useMemo(() => {
    const limit = addDays(today, COMING_UP_DAYS)
    return (days || []).filter((day) => day.date > today && day.date <= limit && day.periodId && day.startingCount > 0)
  }, [days, today])

  let body
  if (loading) body = <Skeleton variant="text" lines={3} />
  else if (upcoming.length === 0) {
    body = <EmptyState icon={CalendarClock} title="Nothing starting soon" message="No rebates begin in the next 7 days." />
  } else {
    body = upcoming.map((day) => {
      const label = relativeDay(day.date, today)
      return (
        <button type="button" className="reb-list-btn" key={day.date} onClick={() => onSelect(day.date)}>
          <span>
            <Text as="div" color="heading" weight="medium">{label === "Tomorrow" ? "Tomorrow" : formatDayCompact(day.date)}</Text>
            <Text as="div" size="xs" color="muted">{day.startingCount} {day.startingCount === 1 ? "student leaves" : "students leave"}</Text>
          </span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )
    })
  }

  return (
    <Panel title="Coming up" subtitle="Rebates starting in the next 7 days" accent="neutral" height="lg">
      <Panel.Body scroll>{body}</Panel.Body>
    </Panel>
  )
}

export default ComingUpPanel
