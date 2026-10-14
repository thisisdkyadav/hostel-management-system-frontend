// Helpers for the Daily meals page (Admin and Dining Office).
import { buildCsvContent } from "@/utils/csvExport"
import { describeRoom, formatDayMonth, percent } from "../caterer/catererHelpers"

/** Look-back choices for "Students to check on"; must match the backend's CHECK_ON_DAYS. */
export const CHECK_ON_DAYS = [2, 3, 5, 7, 14]
export const DEFAULT_CHECK_ON_DAYS = 3

/** Below this share of expected students eating, a meal is called out. */
export const LOW_TURNOUT = 70

export const turnoutTone = (verified, expected) => {
  if (!expected) return "neutral"
  const pct = percent(verified, expected)
  return pct >= 85 ? "good" : pct >= LOW_TURNOUT ? "fair" : "low"
}

export const daysTone = (days) => (days >= 7 ? "danger" : days >= 4 ? "warning" : "neutral")

export const lastMealLabel = (row) =>
  row.lastMealAt ? `${row.lastMealName || "Meal"}, ${formatDayMonth(row.lastMealAt)}` : "No meal this period"

const slug = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
export const fileTag = (name) => (name ? `-${slug(name)}` : "")

const cell = (meal, slot) => {
  if (!meal || slot.state === "upcoming") return ["", ""]
  return [meal.verifiedCount, meal.notEatenCount ?? ""]
}

/** The day sheet as a CSV: one row per caterer plus a total, two columns per meal. */
export const buildDaySheetCsv = (report) => {
  const slots = report?.mealSlots || []
  const head = [
    "Caterer", "Assigned", "Away", "Should eat",
    ...slots.flatMap((slot) => [`${slot.name} ate`, `${slot.name} did not eat`]),
    "Ate at least one meal", "Ate nothing", "Scanner issues",
  ]
  const line = (name, row) => [
    name, row.allocatedCount, row.onRebateCount, row.expectedCount,
    ...slots.flatMap((slot) => cell(row.meals?.[slot.key], slot)),
    row.ateAnyCount, row.ateNothingCount ?? "", row.issueCount,
  ]
  const rows = (report?.caterers || []).map((row) => line(row.name, row))
  if (report?.totals && rows.length > 1) rows.push(line("All caterers", report.totals))
  return buildCsvContent(head, rows)
}

export const buildCheckOnCsv = (students = []) =>
  buildCsvContent(
    ["Name", "Roll number", "Caterer", "Hostel and room", "Email", "Last meal", "Days without a meal"],
    students.map((row) => [
      row.student?.name || "", row.student?.rollNumber || "", row.caterer?.name || "",
      describeRoom(row.student), row.student?.email || "", lastMealLabel(row), row.daysWithoutMeal,
    ])
  )
