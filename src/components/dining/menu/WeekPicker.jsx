import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { WEEKDAY_SHORT, WEEK_ORDER, buildMonths, fromKey, toKey } from "../meal-planner/mealPlanner"
import { formatWeekRange, weekStartOf } from "./menuHelpers"

const monthBounds = (cursor) => {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
  return [toKey(first), toKey(last)]
}

/** "Week of 2 – 8 Nov 2026" button that opens a month calendar; picking any day selects its Mon–Sun week. */
const WeekPicker = ({ weekStart, today, onPick }) => {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(() => fromKey(weekStart))
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const month = useMemo(() => {
    const [start, end] = monthBounds(cursor)
    return buildMonths(start, end)[0]
  }, [cursor])

  const toggle = () => {
    if (!open) setCursor(fromKey(weekStart))
    setOpen((value) => !value)
  }
  const shiftMonth = (delta) => setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))

  return (
    <div className="dm-picker" ref={rootRef}>
      <button type="button" className="dm-picker__button" aria-haspopup="dialog" aria-expanded={open} onClick={toggle}>
        <CalendarDays size={15} aria-hidden="true" />
        <span>
          <em>Week of</em> {formatWeekRange(weekStart)}
        </span>
      </button>
      {open && (
        <div className="dm-picker__pop" role="dialog" aria-label="Pick a week">
          <div className="dm-picker__nav">
            <button type="button" className="dm-iconbtn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <strong>{month.label}</strong>
            <button type="button" className="dm-iconbtn" onClick={() => shiftMonth(1)} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="dm-picker__grid">
            {WEEK_ORDER.map((weekday) => (
              <span key={weekday} className="dm-picker__head">
                {WEEKDAY_SHORT[weekday].slice(0, 2)}
              </span>
            ))}
            {month.cells.map((key, index) =>
              key ? (
                <button
                  key={key}
                  type="button"
                  className="dm-picker__day"
                  data-in-week={weekStartOf(key) === weekStart || undefined}
                  data-today={key === today || undefined}
                  onClick={() => {
                    onPick(weekStartOf(key))
                    setOpen(false)
                  }}
                >
                  {Number(key.slice(8))}
                </button>
              ) : (
                <span key={`pad-${index}`} />
              ),
            )}
          </div>
          <button
            type="button"
            className="dm-picker__today"
            onClick={() => {
              onPick(weekStartOf(today))
              setOpen(false)
            }}
          >
            Jump to this week
          </button>
        </div>
      )}
    </div>
  )
}

export default WeekPicker
