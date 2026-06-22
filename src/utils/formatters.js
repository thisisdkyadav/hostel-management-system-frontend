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
