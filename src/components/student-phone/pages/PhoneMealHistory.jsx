import { useState } from "react"
import { Check, Plane, X } from "lucide-react"
import { formatDayFull } from "../../dining/caterer/catererHelpers"
import { dayHead, formatClock, ISSUE_REASONS, MEAL_STATUS_LABELS } from "../../dining/student/studentDiningHelpers"

const SYMBOL = { ate: Check, missed: X, away: Plane }
const KEY_LABEL = { ate: "Ate", missed: "No meal recorded", away: "Away", upcoming: "Not yet" }

const rangeOf = (week) => {
  if (!week.length) return ""
  const fmt = (key, withMonth) => new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", withMonth ? { day: "numeric", month: "short" } : { day: "numeric" })
  const first = week[0].date
  const last = week.at(-1).date
  return `${fmt(first, first.slice(5, 7) !== last.slice(5, 7))} – ${fmt(last, true)}`
}

const describe = (slot, day, meal) => {
  const what =
    meal.status === "ate" ? `ate at ${formatClock(meal.at)}` : meal.status === "away" ? "away on rebate" : meal.status === "missed" ? "no meal recorded" : "not served yet"
  const issue = meal.issue ? ` · a scan didn't count (${ISSUE_REASONS[meal.issue] || "it was rejected"})` : ""
  return `${slot.name}, ${formatDayFull(day.date)}: ${what}${issue}`
}

/** Splits the days (oldest first) into weeks of seven, newest week first. */
const weeksOf = (days) => {
  const weeks = []
  for (let end = days.length; end > 0; end -= 7) weeks.push(days.slice(Math.max(0, end - 7), end))
  return weeks
}

/**
 * The last two weeks of meals, sized for a phone: one week per block (this
 * week on top), every day visible, each status drawn with its own symbol as
 * well as its colour. Tapping a cell says exactly what happened.
 */
const PhoneMealHistory = ({ slots = [], days = [], summary, today }) => {
  const [picked, setPicked] = useState(null) // "date:slot"
  const pickedText = (() => {
    if (!picked) return ""
    const [date, key] = picked.split(":")
    const day = days.find((item) => item.date === date)
    const slot = slots.find((item) => item.key === key)
    return day && slot && day.meals[key] ? describe(slot, day, day.meals[key]) : ""
  })()
  const total = summary ? summary.ate + summary.missed + summary.away : 0

  return (
    <div className="mmh">
      {summary && total > 0 && (
        <p className="mmh__score">
          <strong>{Math.round((summary.ate / Math.max(1, summary.ate + summary.missed)) * 100)}%</strong> of meals eaten <span className="mmh__note">· away days not counted</span>
        </p>
      )}
      <div className="mmh__legend">
        {["ate", "missed", "away", "upcoming"].map((status) => {
          const Icon = SYMBOL[status]
          return (
            <span key={status} className="mmh__key">
              <span className="mmh__cell" data-status={status} aria-hidden="true">
                {Icon && <Icon size={12} strokeWidth={3} />}
              </span>
              {KEY_LABEL[status]}
              {summary && status !== "upcoming" && <strong>{summary[status]}</strong>}
            </span>
          )
        })}
      </div>
      {!pickedText && <p className="mmh__tip">Tap any meal to see exactly what was recorded.</p>}
      {weeksOf(days).map((week, index) => (
        <section key={week[0]?.date || index} className="mmh__week" aria-label={index === 0 ? "This week" : "Week before"}>
          <h3 className="mmh__range">
            {index === 0 ? "This week" : "Week before"} <span>· {rangeOf(week)}</span>
          </h3>
          <div className="mmh__grid" style={{ "--cols": week.length }}>
            <span aria-hidden="true" />
            {week.map((day) => {
              const head = dayHead(day.date)
              return (
                <span key={day.date} className="mmh__day" data-today={day.date === today || undefined}>
                  <span>{new Date(`${day.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2)}</span>
                  <strong>{head.day}</strong>
                </span>
              )
            })}
            {slots.map((slot) => (
              <div key={slot.key} className="mmh__row">
                <span className="mmh__slot">{slot.name}</span>
                {week.map((day) => {
                  const meal = day.meals[slot.key] || { status: "upcoming" }
                  const Icon = SYMBOL[meal.status]
                  const id = `${day.date}:${slot.key}`
                  return (
                    <button
                      key={day.date}
                      type="button"
                      className="mmh__cell"
                      data-status={meal.status}
                      data-issue={meal.issue ? "" : undefined}
                      data-today={day.date === today || undefined}
                      aria-pressed={picked === id}
                      aria-label={describe(slot, day, meal)}
                      onClick={() => setPicked(picked === id ? null : id)}
                    >
                      {Icon && <Icon size={14} strokeWidth={3} aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          {picked && pickedText && week.some((day) => picked.startsWith(`${day.date}:`)) && (
            <p className="mmh__picked" aria-live="polite">
              {pickedText}
            </p>
          )}
        </section>
      ))}
    </div>
  )
}

export default PhoneMealHistory
