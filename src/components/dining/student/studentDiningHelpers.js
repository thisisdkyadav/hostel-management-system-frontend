// Helpers for the student Dining page.
import { formatClock } from "../caterer/meal-records/mealRecordsHelpers"
import { formatRange, toDayKey } from "../caterer/catererHelpers"

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

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

/** The calm heads-up under a pending choice: pick by the deadline or be placed automatically. "" when no auto-allocation is scheduled. */
export const autoAssignLine = (period) => {
  if (!period?.autoAllocationAt || Number.isNaN(Date.parse(period.autoAllocationAt))) return ""
  const choose = period.allocationEndAt ? `Choose by ${formatWhen(period.allocationEndAt)}. ` : ""
  return `${choose}If you don't, you'll be assigned a caterer automatically on ${formatWhen(period.autoAllocationAt)}.`
}

/** True when an open dining-tag question still has no answer from the student. */
export const needsResponse = (item) => Boolean(item?.editable) && typeof item?.value !== "boolean"

/** The unregistered period (from rules.unregisteredPeriods) that the chosen rebate dates touch, or null. */
export const blockedPeriodFor = (unregisteredPeriods, startDate, endDate) => {
  if (!Array.isArray(unregisteredPeriods) || !startDate || !endDate) return null
  return (
    unregisteredPeriods.find((period) => {
      const start = toDayKey(period.startDate)
      const end = toDayKey(period.endDate)
      return start && end && startDate <= end && endDate >= start
    }) || null
  )
}

/** Why a rebate can't be requested for an auto-allocated (unregistered) period; same wording as the server. */
export const unregisteredRebateMessage = (period) =>
  `You were auto-allocated for the dining period ${formatRange(period.startDate, period.endDate)} because you didn't choose a caterer, so you can't request a rebate for those dates. Contact the dining office.`
