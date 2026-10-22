import { useEffect, useMemo, useRef, useState } from "react"
import { Button, Input, Modal } from "hzero"
import { CalendarDays, MousePointerClick, Repeat, RotateCcw } from "lucide-react"
import {
  DAY_END_MIN,
  DAY_START_MIN,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  WEEK_ORDER,
  buildMonths,
  copyWeekday,
  dateTiming,
  formatDateKey,
  fromApi,
  keysBetween,
  mealPaletteFor,
  resetDates,
  setDateMeal,
  setWeekdayMeal,
  shortTime,
  slotKey,
  toApi,
  toMinutes,
  weekdayOf,
  weekdayTiming,
} from "./mealPlanner"
import "./MealPlanner.css"

const HOUR_MARKS = [6, 9, 12, 15, 18, 21]
const SPAN = DAY_END_MIN - DAY_START_MIN

const COPY_TARGETS = [
  { label: "Mon–Fri", days: [1, 2, 3, 4, 5] },
  { label: "Weekend", days: [6, 0] },
  { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
]

/** Position of a meal block on a 05:00–24:00 track, as percentages. */
const blockSpan = (timing) => {
  const start = Math.max(toMinutes(timing.startTime) ?? DAY_START_MIN, DAY_START_MIN)
  let end = toMinutes(timing.endTime) ?? start
  if (end < start) end = DAY_END_MIN
  end = Math.min(Math.max(end, start + 20), DAY_END_MIN)
  return { offset: ((start - DAY_START_MIN) / SPAN) * 100, size: ((end - start) / SPAN) * 100 }
}

const mealStyle = (palette, slot) => {
  const color = palette[slotKey(slot.name)]
  return {
    "--meal": color?.color || "var(--color-primary)",
    "--meal-soft": color?.soft || "var(--color-primary-bg)",
    "--meal-text": color?.text || "var(--color-text-heading)",
  }
}

/** A day's meals laid out on a time track (vertical in the week view, horizontal elsewhere). */
const DayTrack = ({ slots, timingFor, palette, vertical = false, labels = false }) => (
  <div className={`mp-track ${vertical ? "mp-track--v" : "mp-track--h"}`}>
    {vertical && HOUR_MARKS.map((hour) => (
      <span key={hour} className="mp-track__rule" style={{ top: `${((hour * 60 - DAY_START_MIN) / SPAN) * 100}%` }} />
    ))}
    {slots.map((slot) => {
      const timing = timingFor(slot)
      const { offset, size } = blockSpan(timing.closed ? slot : timing)
      const position = vertical ? { top: `${offset}%`, height: `${size}%` } : { left: `${offset}%`, width: `${size}%` }
      return (
        <span
          key={slot.name}
          className={`mp-block${timing.closed ? " is-closed" : ""}`}
          style={{ ...mealStyle(palette, slot), ...position }}
          title={`${slot.name}: ${timing.closed ? "not served" : `${timing.startTime}–${timing.endTime}`}`}
        >
          {labels && (
            <>
              <strong>{slot.name}</strong>
              <span>{timing.closed ? "off" : `${shortTime(timing.startTime)}–${shortTime(timing.endTime)}`}</span>
            </>
          )}
        </span>
      )
    })}
  </div>
)

const MealPlannerModal = ({ isOpen, onClose, onApply, mealSlots = [], weekSchedule, dateSchedule, startDate, endDate }) => {
  const [plan, setPlan] = useState({ week: {}, dates: {} })
  const [view, setView] = useState("week")
  const [selectedWeekday, setSelectedWeekday] = useState(1)
  const [selectedDates, setSelectedDates] = useState([])
  const anchorRef = useRef(null)

  const slots = useMemo(() => mealSlots.filter((slot) => slot.name?.trim() && slot.startTime && slot.endTime), [mealSlots])
  const palette = useMemo(() => mealPaletteFor(slots), [slots])
  const months = useMemo(() => buildMonths(startDate, endDate), [startDate, endDate])
  const inPeriod = (key) => key && key >= startDate && key <= endDate

  useEffect(() => {
    if (!isOpen) return
    setPlan(fromApi({ weekSchedule, dateSchedule }))
    setView("week")
    setSelectedWeekday(1)
    setSelectedDates([])
    anchorRef.current = null
  }, [isOpen, weekSchedule, dateSchedule])

  const datedCount = Object.keys(plan.dates).filter(inPeriod).length
  const customWeekdays = WEEK_ORDER.filter((weekday) => plan.week[weekday])

  const handleDateClick = (key, event) => {
    if (event.shiftKey && anchorRef.current) {
      setSelectedDates(keysBetween(anchorRef.current, key).filter(inPeriod))
      return
    }
    anchorRef.current = key
    if (event.ctrlKey || event.metaKey) {
      setSelectedDates((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key].sort()))
    } else {
      setSelectedDates([key])
    }
  }

  const selectAllOfWeekday = (weekday) => {
    const keys = months.flatMap((month) => month.cells).filter((key) => inPeriod(key) && weekdayOf(key) === weekday)
    anchorRef.current = null
    setSelectedDates(keys)
  }

  // ---- editor ----
  const editingDates = view === "calendar"
  const editorKeys = editingDates ? selectedDates : []
  const timingFor = (slot) =>
    editingDates ? dateTiming(plan, editorKeys[0], slot) : weekdayTiming(plan, selectedWeekday, slot)
  const baselineFor = (slot) =>
    editingDates ? weekdayTiming(plan, weekdayOf(editorKeys[0]), slot) : { startTime: slot.startTime, endTime: slot.endTime, closed: false }

  const updateMeal = (slot, patch) => {
    setPlan((prev) =>
      editingDates
        ? editorKeys.reduce((acc, key) => setDateMeal(acc, key, slot, patch), prev)
        : setWeekdayMeal(prev, selectedWeekday, slot, patch)
    )
  }

  const editorTitle = editingDates
    ? editorKeys.length === 1
      ? formatDateKey(editorKeys[0], { weekday: "long", day: "numeric", month: "long" })
      : `${editorKeys.length} dates selected`
    : `Every ${WEEKDAY_LONG[selectedWeekday]}`
  const editorHint = editingDates
    ? editorKeys.length > 1
      ? `${formatDateKey(editorKeys[0])} → ${formatDateKey(editorKeys.at(-1))}. Changes apply to all of them.`
      : "Overrides the weekly rhythm for this date only."
    : "Applies to this weekday across the whole period."
  const hasEditor = !editingDates || editorKeys.length > 0
  const selectionDated = editorKeys.some((key) => plan.dates[key])

  const apply = () => {
    const dates = Object.fromEntries(Object.entries(plan.dates).filter(([key]) => inPeriod(key)))
    onApply(toApi({ ...plan, dates }))
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meal timing planner"
      description="Set a weekly rhythm, then fine-tune any individual date."
      width={1240}
      minHeight="82vh"
      footer={
        <div className="mp-footer">
          <span className="mp-muted">
            {customWeekdays.length ? `${customWeekdays.map((weekday) => WEEKDAY_SHORT[weekday]).join(", ")} customised` : "Weekly rhythm uses standard timings"}
            {datedCount ? ` · ${datedCount} date${datedCount === 1 ? "" : "s"} overridden` : ""}
          </span>
          <div className="mp-footer__actions">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="button" variant="primary" onClick={apply}>Apply timings</Button>
          </div>
        </div>
      }
    >
      <div className="mp">
        <div className="mp-toolbar">
          <div className="mp-legend">
            {slots.map((slot) => (
              <span key={slot.name} className="mp-legend__item" style={mealStyle(palette, slot)}>
                <i />
                {slot.name}
                <em>{shortTime(slot.startTime)}–{shortTime(slot.endTime)}</em>
              </span>
            ))}
          </div>
          <div className="mp-switch" role="tablist">
            <button type="button" role="tab" aria-selected={view === "week"} className={view === "week" ? "is-active" : ""} onClick={() => setView("week")}>
              <Repeat size={14} /> Weekly rhythm
            </button>
            <button type="button" role="tab" aria-selected={view === "calendar"} className={view === "calendar" ? "is-active" : ""} onClick={() => setView("calendar")}>
              <CalendarDays size={14} /> Calendar
              {datedCount > 0 && <b>{datedCount}</b>}
            </button>
          </div>
        </div>

        <div className="mp-body">
          <div className="mp-main">
            {view === "week" ? (
              <div className="mp-week">
                <div className="mp-week__gutter">
                  {HOUR_MARKS.map((hour) => (
                    <span key={hour} style={{ top: `${((hour * 60 - DAY_START_MIN) / SPAN) * 100}%` }}>
                      {shortTime(`${hour}:00`)}
                    </span>
                  ))}
                </div>
                {WEEK_ORDER.map((weekday) => (
                  <button
                    key={weekday}
                    type="button"
                    className={`mp-week__day${selectedWeekday === weekday ? " is-selected" : ""}${plan.week[weekday] ? " is-custom" : ""}`}
                    onClick={() => setSelectedWeekday(weekday)}
                  >
                    <span className="mp-week__name">
                      {WEEKDAY_SHORT[weekday]}
                      {plan.week[weekday] && <i title="Custom timings" />}
                    </span>
                    <DayTrack vertical labels slots={slots} palette={palette} timingFor={(slot) => weekdayTiming(plan, weekday, slot)} />
                  </button>
                ))}
              </div>
            ) : months.length === 0 ? (
              <div className="mp-empty">
                <CalendarDays size={28} />
                <p>Set the period start and end dates on the Schedule tab to plan individual days.</p>
              </div>
            ) : (
              <div className="mp-cal">
                {months.map((month) => (
                  <section key={month.id} className="mp-cal__month">
                    <h4>{month.label}</h4>
                    <div className="mp-cal__grid">
                      {WEEK_ORDER.map((weekday) => (
                        <button key={weekday} type="button" className="mp-cal__head" onClick={() => selectAllOfWeekday(weekday)} title={`Select every ${WEEKDAY_LONG[weekday]}`}>
                          {WEEKDAY_SHORT[weekday]}
                        </button>
                      ))}
                      {month.cells.map((key, index) => {
                        if (!key) return <span key={`pad-${index}`} className="mp-cal__pad" />
                        const active = inPeriod(key)
                        const dated = Boolean(plan.dates[key])
                        const weekCustom = Boolean(plan.week[weekdayOf(key)])
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={!active}
                            className={[
                              "mp-cal__day",
                              selectedDates.includes(key) && "is-selected",
                              dated && "is-dated",
                              !dated && weekCustom && "is-weekly",
                            ].filter(Boolean).join(" ")}
                            onClick={(event) => handleDateClick(key, event)}
                          >
                            <span className="mp-cal__num">{Number(key.slice(8))}</span>
                            {active && (
                              <>
                                <span className="mp-cal__meals">
                                  {slots.map((slot) => {
                                    const timing = dateTiming(plan, key, slot)
                                    const changed = plan.dates[key]?.[slot.name]
                                    return (
                                      <span key={slot.name} className={`mp-cal__meal${timing.closed ? " is-closed" : ""}${changed ? " is-changed" : ""}`} style={mealStyle(palette, slot)}>
                                        <i />
                                        {timing.closed ? "off" : `${shortTime(timing.startTime)}–${shortTime(timing.endTime)}`}
                                      </span>
                                    )
                                  })}
                                </span>
                                <DayTrack slots={slots} palette={palette} timingFor={(slot) => dateTiming(plan, key, slot)} />
                              </>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          <aside className="mp-editor">
            {hasEditor ? (
              <>
                <div className="mp-editor__head">
                  <h3>{editorTitle}</h3>
                  <p>{editorHint}</p>
                  <DayTrack labels={false} slots={slots} palette={palette} timingFor={timingFor} />
                  <div className="mp-editor__scale">
                    <span>5a</span><span>12p</span><span>12a</span>
                  </div>
                </div>

                <div className="mp-editor__meals">
                  {slots.map((slot) => {
                    const timing = timingFor(slot)
                    const baseline = baselineFor(slot)
                    const changed = timing.closed !== baseline.closed || (!timing.closed && (timing.startTime !== baseline.startTime || timing.endTime !== baseline.endTime))
                    return (
                      <div key={slot.name} className={`mp-meal${timing.closed ? " is-closed" : ""}`} style={mealStyle(palette, slot)}>
                        <div className="mp-meal__head">
                          <span className="mp-meal__name"><i />{slot.name}</span>
                          {changed && <span className="mp-meal__tag">changed</span>}
                          <label className="mp-meal__serve">
                            <input type="checkbox" checked={!timing.closed} onChange={(event) => updateMeal(slot, { closed: !event.target.checked })} />
                            Served
                          </label>
                        </div>
                        {!timing.closed && (
                          <div className="mp-meal__times">
                            <Input type="time" aria-label={`${slot.name} start`} value={timing.startTime} onChange={(event) => updateMeal(slot, { startTime: event.target.value })} />
                            <span>to</span>
                            <Input type="time" aria-label={`${slot.name} end`} value={timing.endTime} onChange={(event) => updateMeal(slot, { endTime: event.target.value })} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mp-editor__actions">
                  {editingDates ? (
                    <Button type="button" variant="secondary" size="sm" disabled={!selectionDated} onClick={() => setPlan((prev) => resetDates(prev, editorKeys))}>
                      <RotateCcw size={14} /> Back to weekly rhythm
                    </Button>
                  ) : (
                    <>
                      <span className="mp-muted">Copy {WEEKDAY_SHORT[selectedWeekday]}’s timings to</span>
                      <div className="mp-chips">
                        {COPY_TARGETS.map((target) => (
                          <button key={target.label} type="button" className="mp-chip" onClick={() => setPlan((prev) => copyWeekday(prev, selectedWeekday, target.days))}>
                            {target.label}
                          </button>
                        ))}
                      </div>
                      <Button type="button" variant="ghost" size="sm" disabled={!plan.week[selectedWeekday]} onClick={() => setPlan((prev) => copyWeekday(prev, -1, [selectedWeekday]))}>
                        <RotateCcw size={14} /> Reset to standard
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="mp-empty mp-empty--editor">
                <MousePointerClick size={26} />
                <p>Pick a date to change its timings.</p>
                <ul>
                  <li><kbd>Shift</kbd> + click selects a range</li>
                  <li><kbd>Ctrl</kbd> + click adds single days</li>
                  <li>Click a weekday header to select every one</li>
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Modal>
  )
}

export default MealPlannerModal
