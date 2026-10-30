import { nextMondayAfter, toKey } from "./menuHelpers"

export const maxAheadKey = (today) => {
  const date = new Date(`${today}T00:00:00`)
  date.setMonth(date.getMonth() + 6)
  return toKey(date)
}

/** The date an "Apply from" choice stands for. */
export const resolveApplyDate = ({ choice, custom }, today, keepDate) => {
  if (choice === "keep" && keepDate) return keepDate
  if (choice === "monday") return nextMondayAfter(today)
  if (choice === "date") return custom
  return today
}

export const initialApplyChoice = (keepDate) => ({ choice: keepDate ? "keep" : "today", custom: "" })

export const applyDateError = (date, today) => {
  if (!date) return "Pick a date."
  if (date < today) return "That date has passed. Menus can only start today or later."
  if (date > maxAheadKey(today)) return "Menus can start at most 6 months ahead."
  return ""
}
