const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Interpret a value as a local Date for *display* without timezone surprises.
 * A date-only "YYYY-MM-DD" string is built in local time so it never shifts a
 * day; other inputs (ISO timestamps, Date) use the native parser.
 */
export const toDisplayDate = (value) => {
  if (typeof value === "string" && DATE_ONLY_RE.test(value.trim())) {
    const [y, m, d] = value.trim().split("-").map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(value)
}

export const formatDate = (dateString) => {
  const date = toDisplayDate(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** Date-only formatter that returns "" for empty values (safe for optional fields). */
export const formatDateOnly = (value, locale = "en-US") => {
  if (!value) return ""
  return toDisplayDate(value).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Indian digit grouping — 1,23,456 rather than 123,456.
 *
 * Not a preference: it is how the number is read aloud. A budget of
 * ₹1,50,000 is "one lakh fifty thousand", and writing it ₹150,000 makes the
 * reader parse digits instead of seeing a value. Bare toLocaleString() follows
 * whatever locale the *browser* is set to, so the same figure grouped three
 * different ways depending on who opened the page.
 */
export const formatINR = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return "₹0"
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
}

/**
 * Day first, the way a date is written in India: 10 Aug 2026.
 *
 * The month is spelled because the numeric form is genuinely ambiguous —
 * 10/8/2026 is August in Delhi and October in New York, and nothing on the
 * screen says which one you are looking at.
 */
export const formatIndianDate = (value, fallback = "—") => {
  if (!value) return fallback
  const date = toDisplayDate(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

/** The same date with a 12-hour clock: 10 Aug 2026, 04:35 pm. */
export const formatIndianDateTime = (value, fallback = "—") => {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  const time = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  return `${formatIndianDate(date, fallback)}, ${time}`
}
