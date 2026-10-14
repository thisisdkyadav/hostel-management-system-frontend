// Helpers for the student Dining page.
import { formatClock } from "../caterer/meal-records/mealRecordsHelpers"

export { formatClock }

/** Why a scan did not count, in the student's words. */
export const ISSUE_REASONS = {
  "wrong-caterer": "you scanned at a different caterer",
  "not-allocated": "you were not on this caterer's list",
  "outside-meal-time": "it was outside meal time",
  "on-rebate": "you were on rebate that day",
  "no-active-period": "there was no dining period running",
  "unknown-student": "the scanner did not recognise you",
}

export const MEAL_STATUS_LABELS = {
  ate: "Ate",
  missed: "Missed",
  away: "Away",
  serving: "Now",
  upcoming: "Later",
}

export const mealLine = (meal) => {
  if (meal.status === "ate") return `Ate at ${formatClock(meal.at)}`
  if (meal.status === "away") return "You're away (rebate)"
  if (meal.status === "serving") return `Being served now · until ${meal.endTime}`
  if (meal.status === "upcoming") return `Starts at ${meal.startTime}`
  return "You didn't eat this meal"
}

export const issueLine = (meal) =>
  meal.issue ? `Your scan at ${formatClock(meal.issueAt)} didn't count: ${ISSUE_REASONS[meal.issue] || "it was rejected"}.` : ""

/** "Wed" + "14" for the history grid headers. */
export const dayHead = (key) => {
  const [y, m, d] = String(key).split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return { weekday: date.toLocaleDateString(undefined, { weekday: "narrow" }), day: d }
}
