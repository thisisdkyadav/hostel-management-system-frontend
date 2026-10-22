/**
 * Meal planner model. The API stores day-specific meal timings as
 *   weekSchedule: [{ weekday, slots: [{ name, startTime, endTime, closed }] }]
 *   dateSchedule: [{ date: "YYYY-MM-DD", slots: [...] }]
 * The planner edits them as maps keyed by weekday / date, then meal name.
 * Precedence (mirrors backend services/dining/mealSchedule.js): date > weekday > default.
 */
import { buildMealPalette } from "../admin-insights/insightHelpers"

export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const DAY_START_MIN = 5 * 60
export const DAY_END_MIN = 24 * 60

export const slotKey = (name = "") =>
  String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

export const mealPaletteFor = (mealSlots = []) =>
  buildMealPalette(mealSlots.map((slot) => ({ ...slot, key: slotKey(slot.name) })))

const pad = (n) => String(n).padStart(2, "0")
export const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
export const fromKey = (key) => new Date(`${key}T00:00:00`)
export const weekdayOf = (key) => fromKey(key).getDay()

export const toMinutes = (time = "") => {
  const [h, m] = String(time).split(":").map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null
}

/** "07:00" -> "7a", "12:30" -> "12:30p" */
export const shortTime = (time = "") => {
  const mins = toMinutes(time)
  if (mins === null) return "–"
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  const suffix = h < 12 ? "a" : "p"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}${m ? `:${pad(m)}` : ""}${suffix}`
}

const sameTiming = (a, b) =>
  Boolean(a.closed) === Boolean(b.closed) && (a.closed || (a.startTime === b.startTime && a.endTime === b.endTime))

const toMap = (entries = [], keyField) =>
  (Array.isArray(entries) ? entries : []).reduce((acc, entry) => {
    const meals = {}
    ;(entry.slots || []).forEach((slot) => {
      meals[slot.name] = { startTime: slot.startTime || "", endTime: slot.endTime || "", closed: Boolean(slot.closed) }
    })
    if (Object.keys(meals).length) acc[entry[keyField]] = meals
    return acc
  }, {})

const toList = (map, keyField, cast = (v) => v) =>
  Object.entries(map)
    .map(([key, meals]) => ({
      [keyField]: cast(key),
      slots: Object.entries(meals).map(([name, timing]) => ({ name, ...timing })),
    }))
    .filter((entry) => entry.slots.length > 0)

export const fromApi = ({ weekSchedule, dateSchedule }) => ({
  week: toMap(weekSchedule, "weekday"),
  dates: toMap(dateSchedule, "date"),
})

export const toApi = ({ week, dates }) => ({
  weekSchedule: toList(week, "weekday", Number),
  dateSchedule: toList(dates, "date"),
})

const baseTiming = (slot) => ({ startTime: slot.startTime, endTime: slot.endTime, closed: false })

export const weekdayTiming = (plan, weekday, slot) => plan.week[weekday]?.[slot.name] || baseTiming(slot)
export const dateTiming = (plan, key, slot) => plan.dates[key]?.[slot.name] || weekdayTiming(plan, weekdayOf(key), slot)

/** Patch one meal on one weekday; stores only differences from the default. */
export const setWeekdayMeal = (plan, weekday, slot, patch) => {
  const next = { ...weekdayTiming(plan, weekday, slot), ...patch }
  const day = { ...(plan.week[weekday] || {}) }
  if (sameTiming(next, baseTiming(slot))) delete day[slot.name]
  else day[slot.name] = next
  const week = { ...plan.week, [weekday]: day }
  if (!Object.keys(day).length) delete week[weekday]
  return { ...plan, week }
}

/** Patch one meal on one date; stores only differences from that weekday's pattern. */
export const setDateMeal = (plan, key, slot, patch) => {
  const next = { ...dateTiming(plan, key, slot), ...patch }
  const day = { ...(plan.dates[key] || {}) }
  if (sameTiming(next, weekdayTiming(plan, weekdayOf(key), slot))) delete day[slot.name]
  else day[slot.name] = next
  const dates = { ...plan.dates, [key]: day }
  if (!Object.keys(day).length) delete dates[key]
  return { ...plan, dates }
}

export const copyWeekday = (plan, fromWeekday, toWeekdays) => {
  const week = { ...plan.week }
  toWeekdays.forEach((weekday) => {
    if (plan.week[fromWeekday]) week[weekday] = { ...plan.week[fromWeekday] }
    else delete week[weekday]
  })
  return { ...plan, week }
}

export const resetDates = (plan, keys) => {
  const dates = { ...plan.dates }
  keys.forEach((key) => delete dates[key])
  return { ...plan, dates }
}

/** Calendar months covering [startKey, endKey], each as Monday-first weeks of keys (null = padding). */
export const buildMonths = (startKey, endKey) => {
  if (!startKey || !endKey || startKey > endKey) return []
  const start = fromKey(startKey)
  const end = fromKey(endKey)
  const months = []
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cursor <= end && months.length < 24) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const lead = (new Date(year, month, 1).getDay() + 6) % 7
    const cells = Array.from({ length: lead }, () => null)
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(toKey(new Date(year, month, day)))
    while (cells.length % 7) cells.push(null)
    months.push({
      id: `${year}-${month}`,
      label: cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      cells,
    })
    cursor.setMonth(month + 1)
  }
  return months
}

export const keysBetween = (a, b) => {
  const [from, to] = a <= b ? [a, b] : [b, a]
  const keys = []
  const cursor = fromKey(from)
  const end = fromKey(to)
  while (cursor <= end) {
    keys.push(toKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

export const formatDateKey = (key, options = { weekday: "short", day: "numeric", month: "short" }) =>
  fromKey(key).toLocaleDateString("en-IN", options)

/** Short summary for the period form, e.g. "Sun custom · 3 dates changed". */
export const summarizePlan = ({ weekSchedule = [], dateSchedule = [] }) => {
  const days = WEEK_ORDER.filter((weekday) => weekSchedule.some((entry) => Number(entry.weekday) === weekday))
  const parts = []
  if (days.length) parts.push(`${days.map((weekday) => WEEKDAY_SHORT[weekday]).join(", ")} customised`)
  if (dateSchedule.length) parts.push(`${dateSchedule.length} date${dateSchedule.length === 1 ? "" : "s"} changed`)
  return parts.length ? parts.join(" · ") : "Same timings every day"
}
