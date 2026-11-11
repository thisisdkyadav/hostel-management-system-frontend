/** Shared by the rebate board page, its rows, card and dialogs. Day keys are UTC "YYYY-MM-DD". */

const DAY_MS = 86400000

export const toKey = (value) => {
  if (!value) return ""
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

const keyMs = (key) => Date.parse(`${key}T00:00:00Z`)
export const addDays = (key, days) => new Date(keyMs(key) + days * DAY_MS).toISOString().slice(0, 10)
/** Whole days from a to b (b − a). */
export const daysBetween = (a, b) => Math.round((keyMs(b) - keyMs(a)) / DAY_MS)
export const listKeys = (from, to) => {
  if (!from || !to || from > to) return []
  const out = []
  for (let key = from; key <= to; key = addDays(key, 1)) out.push(key)
  return out
}
export const weekday = (key) => new Date(keyMs(key)).getUTCDay()
export const isWeekend = (key) => [0, 6].includes(weekday(key))

const fmt = (key, options) => (key ? new Date(keyMs(key)).toLocaleDateString("en-IN", { timeZone: "UTC", ...options }) : "")
/** "14 Nov" */
export const shortDate = (key) => fmt(key, { day: "numeric", month: "short" })
/** "Thu 14 Nov" */
export const dayLabel = (key) => fmt(key, { weekday: "short", day: "numeric", month: "short" })
/** "14 Nov 2026" */
export const longDate = (key) => fmt(key, { day: "numeric", month: "short", year: "numeric" })
/** "14 – 20 Nov", "28 Nov – 3 Dec", "28 Dec 2026 – 3 Jan 2027" */
export const rangeText = (from, to) => {
  if (!from) return ""
  if (!to || from === to) return shortDate(from)
  if (from.slice(0, 4) !== to.slice(0, 4)) return `${longDate(from)} – ${longDate(to)}`
  if (from.slice(0, 7) === to.slice(0, 7)) return `${Number(from.slice(8))} – ${shortDate(to)}`
  return `${shortDate(from)} – ${shortDate(to)}`
}
export const periodText = (period) => (period ? rangeText(period.startDate, period.endDate) : "")

export const days = (n) => `${n} day${n === 1 ? "" : "s"}`
export const number = (value) => (value || 0).toLocaleString("en-IN")

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?"

/** A rebate's state on the board: its status, or archived. */
export const STATES = {
  pending: { label: "Pending", tone: "warn" },
  approved: { label: "Approved", tone: "ok" },
  rejected: { label: "Rejected", tone: "bad" },
  archived: { label: "Archived", tone: "none" },
}
export const stateOf = (rebate) => (rebate?.archivedAt ? "archived" : rebate?.status || "pending")

export const TYPES = {
  "short-term": { label: "Short-term", short: "Short" },
  "long-term": { label: "Long-term", short: "Long" },
}

export const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending", tone: "warn" },
  { value: "approved", label: "Approved", tone: "ok" },
  { value: "rejected", label: "Rejected", tone: "bad" },
  { value: "archived", label: "Archived", tone: "none" },
]

/** The rebate's day keys inside the period. */
export const keysIn = (dateKeys = [], period) => (period ? dateKeys.filter((key) => key >= period.startDate && key <= period.endDate) : [])

/**
 * Where a rebate sits on a period's track, in % of the period: { left, width,
 * cutStart, cutEnd } (cut* = it carries on past that edge). Null when it
 * doesn't touch the period.
 */
export const trackOf = (startKey, endKey, period) => {
  if (!period || !startKey || !endKey) return null
  const total = daysBetween(period.startDate, period.endDate) + 1
  const from = Math.max(0, daysBetween(period.startDate, startKey))
  const to = Math.min(total - 1, daysBetween(period.startDate, endKey))
  if (to < 0 || from > total - 1 || from > to) return null
  return {
    left: (from / total) * 100,
    width: ((to - from + 1) / total) * 100,
    cutStart: startKey < period.startDate,
    cutEnd: endKey > period.endDate,
  }
}

/**
 * The parts of a rebate outside the period, for the card's ribbon:
 * before / after (with the period they land in, from placements) and days in no period.
 */
export const spillOf = (rebate, period, placements = rebate?.placements || []) => {
  const keys = rebate?.dateKeys || []
  if (!period) return { before: [], after: [], before0: 0, after0: 0 }
  const others = (placements || []).filter((p) => String(p.periodId || p.period?.id) !== String(period.id))
  const segment = (side) =>
    others
      .filter((p) => (side === "before" ? toKey(p.period?.endDate) < period.startDate : toKey(p.period?.startDate) > period.endDate))
      .map((p) => ({ dayCount: p.dayCount, period: { startDate: toKey(p.period?.startDate), endDate: toKey(p.period?.endDate) }, caterer: p.caterer?.name || "" }))
  const before = segment("before")
  const after = segment("after")
  const placedBefore = before.reduce((sum, p) => sum + p.dayCount, 0)
  const placedAfter = after.reduce((sum, p) => sum + p.dayCount, 0)
  return {
    before,
    after,
    // Days outside the period that no other period holds either.
    before0: Math.max(0, keys.filter((key) => key < period.startDate).length - placedBefore),
    after0: Math.max(0, keys.filter((key) => key > period.endDate).length - placedAfter),
  }
}

/** The placement of the rebate in this period (caterer + counted), if any. */
export const placementIn = (rebate, period, placements = rebate?.placements || []) =>
  period ? (placements || []).find((p) => String(p.periodId || p.period?.id) === String(period.id)) || null : null

export const personName = (person, fallback = "") => person?.name || fallback

export const formatWhen = (value) =>
  value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : ""
