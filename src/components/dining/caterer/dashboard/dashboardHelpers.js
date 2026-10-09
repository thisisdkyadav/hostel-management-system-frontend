// Page-specific helpers for the caterer Dashboard.
// Shared day-key math lives in ../catererHelpers.js; slot/clock helpers in ../meal-records/mealRecordsHelpers.js.
import { useEffect, useState } from "react"
import { diffDays } from "../catererHelpers"
import { minutesToClock, nowMinutes, sortSlots, timeToMinutes } from "../meal-records/mealRecordsHelpers"

export const RECENT_MEALS = 8
export const RECENT_DAYS = 7
export const OPTIONS_REFRESH_MS = 60000
export const OVERVIEW_REFRESH_MS = 300000
export const LIVE_REFRESH_MS = 30000
export const FORECAST_AHEAD = 3

/** Minutes since local midnight, re-read every 30 seconds so the "now" marker and meal states stay honest. */
export const useMinuteClock = () => {
  const [minutes, setMinutes] = useState(() => nowMinutes())
  useEffect(() => {
    const id = setInterval(() => setMinutes(nowMinutes()), 30000)
    return () => clearInterval(id)
  }, [])
  return minutes
}

export const greetingFor = (minutes) => {
  if (minutes < 12 * 60) return "Good morning"
  if (minutes < 17 * 60) return "Good afternoon"
  return "Good evening"
}

/** "in 2h 10m", "in 25m". */
export const formatCountdown = (minutes) => {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export const ratio = (part, whole) => (whole > 0 ? Math.min(1, Math.max(0, part / whole)) : 0)

/** Slot end in minutes, pushed past midnight when the window wraps. */
const slotWindow = (slot) => {
  const start = timeToMinutes(slot.startTime)
  let end = timeToMinutes(slot.endTime)
  if (start === null || end === null) return null
  if (end <= start) end += 1440
  return { start, end }
}

/**
 * Today's meals placed on a time scale.
 * Returns { scale: {from,to}, ticks, segments[], nowPct } where every segment carries a state:
 * ended | serving | upcoming.
 */
export const LABEL_GAP_PX = 60

export const buildDayTrack = ({ slots, nowMin, currentMealSlotKey, verifiedByKey = {}, expected = 0, live = null, laneWidth = 0 }) => {
  const placed = sortSlots(slots)
    .map((slot) => ({ slot, window: slotWindow(slot) }))
    .filter((item) => item.window)
  if (!placed.length) return null

  const first = Math.min(...placed.map((item) => item.window.start))
  const last = Math.max(...placed.map((item) => item.window.end))
  const from = Math.max(0, Math.floor((first - 45) / 60) * 60)
  const to = Math.min(1440, Math.ceil((last + 45) / 60) * 60)
  const span = Math.max(60, to - from)
  const pct = (minutes) => ((minutes - from) / span) * 100

  const segments = placed.map(({ slot, window }) => {
    let state = "upcoming"
    if (currentMealSlotKey ? slot.key === currentMealSlotKey : nowMin >= window.start && nowMin < window.end) state = "serving"
    else if (nowMin >= window.end) state = "ended"
    const verified = state === "serving" && live ? live.verifiedCount : verifiedByKey[slot.key] ?? 0
    const expectedHere = state === "serving" && live ? live.expectedCount : expected
    return {
      key: slot.key,
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
      state,
      left: pct(window.start),
      width: Math.max(2, pct(window.end) - pct(window.start)),
      verified,
      expected: expectedHere,
      fill: ratio(verified, expectedHere),
      minutesUntil: window.start - nowMin,
    }
  })

  // Labels sit centred under their segment; when two would touch, the later one drops to a second row.
  let rows = 1
  let previous = null
  for (const segment of segments) {
    const center = segment.left + segment.width / 2
    const apart = previous === null ? Infinity : ((center - previous.center) / 100) * laneWidth
    segment.row = previous && previous.row === 0 && apart < LABEL_GAP_PX ? 1 : 0
    if (segment.row === 1) rows = 2
    previous = { center, row: segment.row }
  }

  const ticks = []
  const step = span > 12 * 60 ? 180 : 120
  for (let t = Math.ceil(from / step) * step; t <= to; t += step) ticks.push({ at: pct(t), label: minutesToClock(t) })

  const nowPct = nowMin >= from && nowMin <= to ? pct(nowMin) : null
  return { segments, ticks, nowPct, rows }
}

/**
 * The last N meals that have finished, oldest first, from the overview window.
 * A meal counts as finished when its day is before today, or it is today and the slot has ended.
 */
export const buildRecentMeals = ({ days = [], slots = [], today, nowMin, limit = RECENT_MEALS }) => {
  const ordered = sortSlots(slots)
  const meals = []
  for (const day of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    if (day.date > today) continue
    for (const slot of ordered) {
      const window = slotWindow(slot)
      if (!window) continue
      if (day.date === today && nowMin < window.end) continue
      const expected = day.expectedCount ?? 0
      const verified = day.meals?.[slot.key]?.verifiedCount ?? 0
      if (expected <= 0 && verified <= 0) continue
      meals.push({
        id: `${day.date}:${slot.key}`,
        date: day.date,
        slotKey: slot.key,
        slotName: slot.name,
        verified,
        expected,
        rate: expected > 0 ? Math.min(1.25, verified / expected) : 1,
      })
    }
  }
  return meals.slice(-limit)
}

export const summarizeMeals = (meals) => {
  if (!meals.length) return { average: 0, best: null }
  const average = Math.round((meals.reduce((sum, meal) => sum + meal.rate, 0) / meals.length) * 100)
  const bySlot = new Map()
  for (const meal of meals) {
    const entry = bySlot.get(meal.slotName) || { total: 0, count: 0 }
    entry.total += meal.rate
    entry.count += 1
    bySlot.set(meal.slotName, entry)
  }
  let best = null
  for (const [name, { total, count }] of bySlot) {
    const mean = total / count
    if (!best || mean > best.mean) best = { name, mean }
  }
  return { average, best: best?.name ?? null }
}

export const daysUntil = (today, key) => diffDays(today, key)

export const mealRecordsLink = ({ periodId, date, meal }) => {
  const params = new URLSearchParams()
  if (periodId) params.set("period", periodId)
  if (date) params.set("date", date)
  if (meal) params.set("meal", meal)
  const query = params.toString()
  return query ? `/caterer/meal-records?${query}` : "/caterer/meal-records"
}

/** Width of an element in px, kept current through a ResizeObserver. */
export const useElementWidth = () => {
  const [node, setNode] = useState(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!node) return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])
  return [setNode, width]
}
