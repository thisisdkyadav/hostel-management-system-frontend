// Pure helpers for the admin dining observatory. No React, no clock reads:
// anything time-dependent takes `nowMin` so the panels stay honest and testable.
import { timeToMinutes } from "../caterer/meal-records/mealRecordsHelpers"
import { toDayKey } from "../caterer/catererHelpers"

export { timeToMinutes }

export const REFRESH_MS = 60000
export const RANGE_OPTIONS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
]
export const DEFAULT_DAYS = 30

/* ---------- formatting ---------- */

const NUMBER = new Intl.NumberFormat("en-IN")

export const fmtInt = (value) => NUMBER.format(Math.round(Number(value) || 0))

/** 0..1 rate -> "86%". Null stays a dash so a missing denominator never reads as zero. */
export const fmtPct = (rate, digits = 0) =>
  typeof rate === "number" && Number.isFinite(rate) ? `${(rate * 100).toFixed(digits)}%` : "-"

export const fmtCompact = (value) => {
  const n = Number(value) || 0
  if (Math.abs(n) >= 10000000) return `${(n / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`
  if (Math.abs(n) >= 100000) return `${(n / 100000).toFixed(2).replace(/\.?0+$/, "")} L`
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(Math.round(n))
}

const parseKey = (key) => {
  const [y, m, d] = String(key || "").split("-").map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}

export const weekdayOf = (key) => parseKey(key)?.getDay() ?? 0
export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
/** Mon -> Sun, the order people read a week in. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const dayLabel = (key) => {
  const d = parseKey(toDayKey(key))
  return d ? `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()} ${d.toLocaleDateString(undefined, { month: "short" })}` : "-"
}
export const longDate = (key) => {
  const d = parseKey(toDayKey(key))
  return d ? d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : ""
}

/* ---------- meal identity ---------- */

// One colour per meal, everywhere. Chosen by meaning first (morning amber, night violet),
// then by position for any meal the college adds later. All of them are hzero series tokens.
const NAMED = [
  [/break|morning|brunch/i, 4],
  [/lunch|noon/i, 1],
  [/snack|tea|evening/i, 2],
  [/dinner|supper|night/i, 5],
]
const SPARE = [3, 6, 7, 8]

export const buildMealPalette = (mealSlots = []) => {
  const palette = {}
  const used = new Set()
  mealSlots.forEach((slot) => {
    const hit = NAMED.find(([re, n]) => re.test(`${slot.name} ${slot.key}`) && !used.has(n))
    if (hit) {
      used.add(hit[1])
      palette[slot.key] = hit[1]
    }
  })
  mealSlots.forEach((slot) => {
    if (palette[slot.key]) return
    const n = SPARE.find((s) => !used.has(s)) || 8
    used.add(n)
    palette[slot.key] = n
  })
  const out = {}
  Object.entries(palette).forEach(([key, n]) => {
    out[key] = {
      n,
      color: `var(--color-series-${n})`,
      soft: `var(--color-series-${n}-bg)`,
      text: `var(--color-series-${n}-text)`,
    }
  })
  return out
}

/** Style object that exposes a meal's colours to CSS as --meal / --meal-soft. */
export const mealVars = (palette, key) => ({
  "--meal": palette[key]?.color || "var(--color-text-muted)",
  "--meal-soft": palette[key]?.soft || "var(--color-bg-tertiary)",
})

export const slotName = (mealSlots, key) => mealSlots.find((s) => s.key === key)?.name || key

/* ---------- today ---------- */

/** open | upcoming | ended, from the clock. Honours the server's idea of the open meal. */
export const mealPhase = (slot, nowMin, currentMealSlotKey) => {
  const start = timeToMinutes(slot.startTime)
  const end = timeToMinutes(slot.endTime)
  if (currentMealSlotKey && slot.key === currentMealSlotKey) return "open"
  if (start === null || end === null) return "upcoming"
  if (nowMin < start) return "upcoming"
  if (nowMin >= end) return "ended"
  return currentMealSlotKey ? "ended" : "open"
}

export const todaySummary = (data, nowMin) => {
  const caterers = data.caterers || []
  const slots = data.mealSlots || []
  const expected = caterers.reduce((s, c) => s + (c.todayExpected || 0), 0)
  const onRebate = data.totals?.todayOnRebate ?? caterers.reduce((s, c) => s + (c.todayOnRebate || 0), 0)
  const meals = slots.map((slot) => {
    const verified = caterers.reduce((s, c) => s + (c.today?.[slot.key]?.verified || 0), 0)
    return { slot, verified, phase: mealPhase(slot, nowMin, data.currentMealSlotKey) }
  })
  const open = meals.find((m) => m.phase === "open") || null
  const next = meals.find((m) => m.phase === "upcoming") || null
  return { expected, onRebate, meals, open, next }
}

/* ---------- ridgeline / area geometry ---------- */

/** Fritsch-Carlson monotone cubic through points; never overshoots below a baseline. */
export const monotonePath = (pts) => {
  const n = pts.length
  if (n === 0) return ""
  if (n === 1) return `M${pts[0][0]},${pts[0][1]}`
  const dx = []
  const m = []
  for (let i = 0; i < n - 1; i += 1) {
    dx.push(pts[i + 1][0] - pts[i][0])
    m.push((pts[i + 1][1] - pts[i][1]) / (dx[i] || 1))
  }
  const t = [m[0]]
  for (let i = 1; i < n - 1; i += 1) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2)
  t.push(m[n - 2])
  for (let i = 0; i < n - 1; i += 1) {
    if (m[i] === 0) {
      t[i] = 0
      t[i + 1] = 0
    } else {
      const a = t[i] / m[i]
      const b = t[i + 1] / m[i]
      const h = Math.hypot(a, b)
      if (h > 3) {
        t[i] = (3 * a * m[i]) / h
        t[i + 1] = (3 * b * m[i]) / h
      }
    }
  }
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`
  for (let i = 0; i < n - 1; i += 1) {
    const c1x = pts[i][0] + dx[i] / 3
    const c1y = pts[i][1] + (t[i] * dx[i]) / 3
    const c2x = pts[i + 1][0] - dx[i] / 3
    const c2y = pts[i + 1][1] - (t[i + 1] * dx[i]) / 3
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${pts[i + 1][0].toFixed(2)},${pts[i + 1][1].toFixed(2)}`
  }
  return d
}

/* ---------- plain-language time ---------- */

/** Minutes since midnight -> "1:10 PM". People read 12-hour clocks faster than 13:10. */
export const friendlyTime = (minutes) => {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) return "-"
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440
  const h = Math.floor(wrapped / 60)
  const m = wrapped % 60
  const suffix = h < 12 ? "AM" : "PM"
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`
}

/** ISO instant -> minutes since local midnight. */
export const isoToMinutes = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.getHours() * 60 + d.getMinutes()
}
