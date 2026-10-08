// Shared vocabulary + date math for the caterer Meal Records and Rebates pages.
// Day keys are "YYYY-MM-DD" strings; the backend owns which day is "today".

export const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback

const parseKey = (key) => {
  const [y, m, d] = String(key || "").split("-").map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const toKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export const localTodayKey = () => toKey(new Date())

export const addDays = (key, days) => {
  const date = parseKey(key)
  if (!date) return key
  date.setDate(date.getDate() + days)
  return toKey(date)
}

export const diffDays = (fromKey, toKeyValue) => {
  const a = parseKey(fromKey)
  const b = parseKey(toKeyValue)
  if (!a || !b) return 0
  return Math.round((b - a) / 86400000)
}

export const minKey = (a, b) => (a <= b ? a : b)
export const maxKey = (a, b) => (a >= b ? a : b)

/** ISO date or day key → day key. */
export const toDayKey = (value) => {
  if (!value) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : toKey(date)
}

const format = (key, options) => {
  const date = parseKey(toDayKey(key))
  return date ? date.toLocaleDateString(undefined, options) : "-"
}

export const formatDayShort = (key) => format(key, { weekday: "short", day: "numeric" })
export const formatDayMonth = (key) => format(key, { day: "numeric", month: "short" })
export const formatDayLong = (key) => format(key, { weekday: "long", day: "numeric", month: "long" })
export const formatDayFull = (key) => format(key, { weekday: "short", day: "numeric", month: "short", year: "numeric" })
export const formatWeekday = (key) => format(key, { weekday: "short" })
export const formatMonth = (key) => format(key, { month: "long", year: "numeric" })

export const formatTime = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

/** "Today" / "Tomorrow" / "Yesterday" / weekday + date. */
export const relativeDay = (key, todayKey) => {
  const delta = diffDays(todayKey, key)
  if (delta === 0) return "Today"
  if (delta === 1) return "Tomorrow"
  if (delta === -1) return "Yesterday"
  return formatDayFull(key)
}

export const formatRange = (startKey, endKey) => {
  const start = toDayKey(startKey)
  const end = toDayKey(endKey)
  if (!start) return "-"
  if (!end || start === end) return formatDayMonth(start)
  return `${formatDayMonth(start)} – ${formatDayMonth(end)}`
}

export const percent = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0)

export const pluralize = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`

/** Roster status → label + StatusBadge tone. */
export const MEAL_STATUS = {
  verified: { label: "Ate", tone: "success" },
  missed: { label: "Missed", tone: "danger" },
  pending: { label: "Not yet", tone: "primary" },
  "on-rebate": { label: "On rebate", tone: "warning" },
}

export const SCAN_SOURCE_LABELS = {
  manual: "Manual",
  "face-scanner": "Face scan",
}

export const ISSUE_LABELS = {
  duplicate: "Scanned again",
  "wrong-caterer": "Wrong caterer",
  "not-allocated": "Not allocated",
  "unknown-student": "Unknown student",
  "outside-meal-time": "Outside meal time",
  "no-active-period": "No active period",
  "on-rebate": "Scanned while on rebate",
}

export const REBATE_STATUS_TONES = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
}

export const capitalize = (value) => (value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "")

export const describeRoom = (student) => {
  const hostel = student?.hostel?.name
  const room = student?.room?.displayRoom
  if (hostel && room) return `${hostel}, ${room}`
  return hostel || room || ""
}
