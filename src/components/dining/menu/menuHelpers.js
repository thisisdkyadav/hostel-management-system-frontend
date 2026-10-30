// Shared vocabulary + date math for the dining menu (manage pages, caterer view, student card).
// Day keys are "YYYY-MM-DD" strings; the backend owns which day is "today".
import { addDays, diffDays, getErrorMessage } from "../caterer/catererHelpers"
import { WEEKDAY_LONG, WEEKDAY_SHORT, fromKey, mealPaletteFor, slotKey, toKey, toMinutes, WEEK_ORDER } from "../meal-planner/mealPlanner"

export { addDays, diffDays, getErrorMessage, fromKey, mealPaletteFor, slotKey, toKey, toMinutes, WEEK_ORDER, WEEKDAY_LONG, WEEKDAY_SHORT }

export const MAX_ITEMS = 40
export const MAX_NAME = 80
export const MAX_NOTE = 200

/** Diets cycle through this order when the dot is clicked. "" means unmarked. */
export const DIETS = ["", "veg", "egg", "nonveg"]
export const DIET_LABELS = { "": "No diet marked", veg: "Vegetarian", egg: "Contains egg", nonveg: "Non-vegetarian" }
export const nextDiet = (diet) => DIETS[(DIETS.indexOf(diet || "") + 1) % DIETS.length]

/** Day of week of a key, Monday-first index 0..6. */
export const mondayIndex = (key) => (fromKey(key).getDay() + 6) % 7

/** The Monday of the week containing `key`. */
export const weekStartOf = (key) => addDays(key, -mondayIndex(key))

export const weekKeysFrom = (startKey) => Array.from({ length: 7 }, (_, index) => addDays(startKey, index))

/** The next Monday strictly after `key`. */
export const nextMondayAfter = (key) => addDays(weekStartOf(key), 7)

const fmt = (key, options) => fromKey(key).toLocaleDateString("en-IN", options)

/** "2 – 8 Nov 2026", "28 Sep – 4 Oct 2026", "28 Dec 2026 – 3 Jan 2027". */
export const formatWeekRange = (startKey) => {
  const endKey = addDays(startKey, 6)
  const a = fromKey(startKey)
  const b = fromKey(endKey)
  if (a.getFullYear() !== b.getFullYear()) {
    return `${fmt(startKey, { day: "numeric", month: "short", year: "numeric" })} – ${fmt(endKey, { day: "numeric", month: "short", year: "numeric" })}`
  }
  if (a.getMonth() !== b.getMonth()) {
    return `${fmt(startKey, { day: "numeric", month: "short" })} – ${fmt(endKey, { day: "numeric", month: "short", year: "numeric" })}`
  }
  return `${a.getDate()} – ${fmt(endKey, { day: "numeric", month: "short", year: "numeric" })}`
}

export const formatLong = (key) => fmt(key, { weekday: "long", day: "numeric", month: "long" })
export const formatShort = (key) => fmt(key, { day: "numeric", month: "short" })
export const formatDayShort = (key) => fmt(key, { weekday: "short", day: "numeric", month: "short" })
export const formatFull = (key) => fmt(key, { day: "numeric", month: "short", year: "numeric" })

/** "7:00 am" style clock for a "HH:MM" value. */
export const clock12 = (time) => {
  const mins = toMinutes(time)
  if (mins === null) return ""
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "am" : "pm"}`
}

export const timeSpan = (meal) => (meal?.startTime && meal?.endTime ? `${clock12(meal.startTime)} – ${clock12(meal.endTime)}` : "")

// ---- items ----

export const cleanItem = (item) => ({
  name: String(item?.name || "")
    .trim()
    .slice(0, MAX_NAME),
  diet: DIETS.includes(item?.diet) ? item.diet : "",
  special: Boolean(item?.special),
})

/** Keeps the first of each name (case-insensitive) and drops blanks. */
export const cleanItems = (items = []) => {
  const seen = new Set()
  const out = []
  for (const raw of items) {
    const item = cleanItem(raw)
    const key = item.name.toLowerCase()
    if (!item.name || seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out.slice(0, MAX_ITEMS)
}

/** Splits pasted text on commas, semicolons and newlines, dropping bullets and numbering. */
export const parseItemList = (text = "") =>
  String(text)
    .split(/[\n\r,;]+/)
    .map((part) => part.replace(/^\s*(?:[-*•·]+|\d+[.)])\s*/, "").trim())
    .filter(Boolean)

export const sameItems = (a = [], b = []) =>
  a.length === b.length &&
  a.every(
    (item, index) =>
      item.name === b[index].name && (item.diet || "") === (b[index].diet || "") && Boolean(item.special) === Boolean(b[index].special),
  )

export const isEmptyMeal = (meal) => !meal || ((!meal.items || meal.items.length === 0) && !String(meal.note || "").trim())

// ---- board model ----

const canonicalRank = (name) => {
  const text = String(name).toLowerCase()
  const index = ["breakfast", "lunch", "snack", "tea", "dinner", "supper"].findIndex((word) => text.includes(word))
  return index === -1 ? 99 : index
}

/**
 * Meal rows and a lookup for a set of resolved days. Rows are ordered by the earliest start time seen,
 * then by the usual Breakfast, Lunch, Snacks, Dinner order. `timing` is the most common start/end.
 */
export const buildBoard = (days = []) => {
  const rows = new Map()
  const lookup = new Map()
  for (const day of days) {
    for (const meal of day.meals || []) {
      const key = slotKey(meal.name)
      if (!key) continue
      lookup.set(`${day.date}|${key}`, meal)
      const row = rows.get(key) || { key, name: meal.name, starts: new Map(), min: Infinity }
      if (meal.startTime && meal.endTime) {
        const span = `${meal.startTime}|${meal.endTime}`
        row.starts.set(span, (row.starts.get(span) || 0) + 1)
        row.min = Math.min(row.min, toMinutes(meal.startTime) ?? Infinity)
      }
      rows.set(key, row)
    }
  }
  const list = [...rows.values()]
    .map((row) => {
      const [top] = [...row.starts.entries()].sort((a, b) => b[1] - a[1])
      const [startTime, endTime] = top ? top[0].split("|") : [null, null]
      return { key: row.key, name: row.name, startTime, endTime, min: row.min }
    })
    .sort((a, b) => {
      if (a.min !== b.min && Number.isFinite(a.min) && Number.isFinite(b.min)) return a.min - b.min
      return canonicalRank(a.name) - canonicalRank(b.name) || a.name.localeCompare(b.name)
    })
  return { rows: list, cell: (date, key) => lookup.get(`${date}|${key}`) || null }
}

export const cellId = (date, key) => `${date}|${key}`
export const parseCellId = (id) => {
  const index = id.indexOf("|")
  return { date: id.slice(0, index), key: id.slice(index + 1) }
}

/** "now" as minutes since midnight plus a YYYY-MM-DD key, from the browser clock. */
export const nowParts = (now = new Date()) => ({ key: toKey(now), minutes: now.getHours() * 60 + now.getMinutes() })

/** "2 h 10 m" / "35 m" */
export const formatCountdown = (minutes) => {
  const total = Math.max(Math.round(minutes), 0)
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h && m) return `${h} h ${m} m`
  if (h) return `${h} h`
  return `${m} m`
}

/**
 * Where "now" sits in a day's meals: the meal being served (until its end) and the next one to start.
 * Only meaningful when the day is today. Closed meals are ignored.
 */
export const mealProgress = (meals = [], minutes) => {
  let current = null
  let next = null
  for (const meal of meals) {
    if (meal.served === false) continue
    const start = toMinutes(meal.startTime)
    let end = toMinutes(meal.endTime)
    if (start === null || end === null) continue
    if (end < start) end = 24 * 60
    if (minutes >= start && minutes < end) current = { meal, start, end }
    else if (start > minutes && (!next || start < next.start)) next = { meal, start, end }
  }
  return { current, next }
}

/** Exposes a meal's palette colours to CSS as --meal / --meal-soft / --meal-text. */
export const mealVarsFor = (palette, key) => {
  const color = palette?.[key]
  return {
    "--meal": color?.color || "var(--color-primary)",
    "--meal-soft": color?.soft || "var(--color-primary-bg)",
    "--meal-text": color?.text || "var(--color-text-heading)",
  }
}

export const VIEWS = [
  { id: "board", label: "Week board" },
  { id: "weekly", label: "Weekly menu" },
  { id: "insights", label: "Insights" },
]
