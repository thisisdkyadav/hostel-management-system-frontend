import { useEffect, useMemo, useRef } from "react"
import { DatePicker, IconButton, Tooltip } from "hzero"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatDayShort, formatRange, percent } from "../catererHelpers"
import {
  attendanceStep,
  cellPhase,
  dayKeysBetween,
  formatDayTip,
  formatMonthShort,
  HEAT_STEPS,
} from "./mealRecordsHelpers"
import "./MealRecords.css"

const cellTip = ({ slot, date, phase, day, verified, expected, away }) => {
  const head = `${slot.name}, ${formatDayTip(date)}`
  if (phase === "future") return `${head}: not served yet`
  if (!day) return `${head}: loading`
  if (phase === "upcoming") return `${head}: not started, ${expected} expected`
  return `${head}: ${verified} of ${expected} ate (${percent(verified, expected)}%), ${away} away`
}

/** Heatmap navigator: meals down the side, days across, attendance as intensity. */
const ServiceGrid = ({
  slots,
  windowFrom,
  windowTo,
  dayMap,
  today,
  nowMin,
  selectedDate,
  selectedMeal,
  loading,
  periodStart,
  periodEnd,
  canPrev,
  canNext,
  onSelect,
  onShift,
  onJump,
}) => {
  const scrollerRef = useRef(null)
  const dates = useMemo(() => dayKeysBetween(windowFrom, windowTo), [windowFrom, windowTo])

  // Bring the chosen column into view inside the scroller only (scrollIntoView would also scroll the page).
  useEffect(() => {
    const scroller = scrollerRef.current
    const selected = scroller?.querySelector('[aria-pressed="true"]')
    if (!scroller || !selected) return
    const label = scroller.querySelector(".mr-grid__label")
    const labelWidth = label ? label.getBoundingClientRect().width : 0
    const box = scroller.getBoundingClientRect()
    const cell = selected.getBoundingClientRect()
    const left = cell.left - box.left + scroller.scrollLeft
    const right = left + cell.width
    const visibleLeft = scroller.scrollLeft + labelWidth
    const visibleRight = scroller.scrollLeft + scroller.clientWidth
    if (left < visibleLeft) scroller.scrollLeft = Math.max(0, left - labelWidth)
    else if (right > visibleRight) scroller.scrollLeft = right - scroller.clientWidth
  }, [selectedDate, selectedMeal, windowFrom, windowTo, slots.length])

  const handleJump = (event) => {
    const value = event?.target?.value
    if (value) onJump(value)
  }

  return (
    <section className="mr-grid" aria-label="Service grid">
      <div className="mr-grid__controls">
        <div className="mr-grid__nav">
          <IconButton
            icon={<ChevronLeft size={16} />}
            ariaLabel="Show earlier days"
            variant="outline"
            size="small"
            disabled={!canPrev}
            onClick={() => onShift(-1)}
          />
          <span className="mr-grid__range" aria-live="polite">{formatRange(windowFrom, windowTo)}</span>
          <IconButton
            icon={<ChevronRight size={16} />}
            ariaLabel="Show later days"
            variant="outline"
            size="small"
            disabled={!canNext}
            onClick={() => onShift(1)}
          />
          <div className="mr-grid__jump">
            <DatePicker
              size="small"
              value={selectedDate}
              min={periodStart}
              max={periodEnd < today ? periodEnd : today}
              onChange={handleJump}
              placeholder="Jump to date"
              aria-label="Jump to date"
            />
          </div>
        </div>
        <ul className="mr-legend" aria-label="Share of expected students who ate">
          <li className="mr-legend__title">Ate</li>
          {HEAT_STEPS.map(({ step, label }) => (
            <li key={step} className="mr-legend__item">
              <span className="mr-legend__swatch" data-step={step} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mr-grid__scroller" ref={scrollerRef}>
        <div
          className="mr-grid__body"
          role="group"
          aria-label="Meals by day"
          aria-busy={loading || undefined}
          style={{ "--mr-days": dates.length }}
        >
          <div className="mr-grid__corner" />
          {dates.map((date, index) => {
            const isToday = date === today
            const month = formatMonthShort(date)
            const showMonth = index === 0 || month !== formatMonthShort(dates[index - 1])
            return (
              <div key={date} className="mr-grid__head" data-today={isToday || undefined}>
                <span className="mr-grid__head-note">{isToday ? "Today" : showMonth ? month : ""}</span>
                <span className="mr-grid__head-day">
                  {formatDayShort(date)}
                  {isToday && showMonth ? ` ${month}` : ""}
                </span>
              </div>
            )
          })}

          {slots.map((slot) => (
            <SlotRow
              key={slot.key}
              slot={slot}
              dates={dates}
              dayMap={dayMap}
              today={today}
              nowMin={nowMin}
              selectedDate={selectedDate}
              selectedMeal={selectedMeal}
              loading={loading}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const SlotRow = ({ slot, dates, dayMap, today, nowMin, selectedDate, selectedMeal, loading, onSelect }) => (
  <>
    <div className="mr-grid__label">
      <span className="mr-grid__label-name">{slot.name}</span>
      <span className="mr-grid__label-time">{slot.startTime} – {slot.endTime}</span>
    </div>
    {dates.map((date) => {
      const day = dayMap.get(date)
      const phase = cellPhase({ date, slot, today, nowMin })
      const verified = day?.meals?.[slot.key]?.verifiedCount ?? 0
      const expected = day?.expectedCount ?? 0
      const away = day?.onRebateCount ?? 0
      const selected = date === selectedDate && slot.key === selectedMeal
      const tip = cellTip({ slot, date, phase, day, verified, expected, away })

      if (phase === "future") {
        return (
          <div key={date} className="mr-grid__slot">
            <button type="button" className="mr-cell" data-phase="future" disabled aria-label={tip} />
          </div>
        )
      }

      const hasData = Boolean(day)
      const step = phase === "upcoming" || !hasData ? 0 : attendanceStep(verified, expected)
      return (
        <div key={date} className="mr-grid__slot">
          <Tooltip content={tip} placement="top" delay={150}>
            <button
              type="button"
              className="mr-cell"
              data-step={step}
              data-phase={hasData ? phase : "loading"}
              aria-pressed={selected}
              aria-label={tip}
              onClick={() => onSelect(date, slot.key)}
            >
              {hasData ? (
                <>
                  <span className="mr-cell__count">{phase === "upcoming" ? "–" : verified}</span>
                  <span className="mr-cell__rate">{phase === "upcoming" ? "" : `${percent(verified, expected)}%`}</span>
                </>
              ) : (
                !loading && <span className="mr-cell__count">0</span>
              )}
            </button>
          </Tooltip>
        </div>
      )
    })}
  </>
)

export default ServiceGrid
