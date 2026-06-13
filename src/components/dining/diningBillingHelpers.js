/**
 * Shared helpers for the dining billing surfaces (admin billing pages + student
 * billing section). Framework-agnostic (no JSX). Reuses the date/id helpers from
 * diningPeriodHelpers so formatting stays consistent across dining.
 */

import { formatDate, formatDateRange, getIdValue, getErrorMessage } from "./diningPeriodHelpers"

export { formatDate, formatDateRange, getIdValue, getErrorMessage }

/** Formats a number as an INR amount, e.g. 4500 -> "₹4,500". Negative kept. */
export const formatCurrency = (value) => {
  const amount = Number(value || 0)
  const sign = amount < 0 ? "-" : ""
  const abs = Math.abs(amount)
  // Indian grouping (1,00,000) with up to 2 decimals, trailing zeros trimmed.
  const formatted = abs.toLocaleString("en-IN", { maximumFractionDigits: 2 })
  return `${sign}₹${formatted}`
}

/** Derived date range label for a billing period (from its contained periods). */
export const billingDateRange = (billingPeriod = {}) => {
  if (!billingPeriod.startDate || !billingPeriod.endDate) return "No dining periods"
  return formatDateRange(billingPeriod.startDate, billingPeriod.endDate)
}

export const CLEARANCE_LABELS = {
  cleared: "Cleared",
  dues: "Dues",
}

export const formatClearance = (clearance = "") => CLEARANCE_LABELS[clearance] || "—"

/** Maps a billing clearance state to a czero StatusBadge tone. */
export const clearanceTone = (clearance = "") => {
  if (clearance === "cleared") return "success"
  if (clearance === "dues") return "danger"
  return "primary"
}

/** Tone for a balance number (>=0 success, <0 danger). */
export const balanceTone = (balance = 0) => (Number(balance) < 0 ? "danger" : "success")

export const FUND_MODES = [
  { id: "add", label: "Add", hint: "Increase each student's allocation by the amount" },
  { id: "deduct", label: "Deduct", hint: "Decrease each student's allocation by the amount" },
  { id: "set", label: "Set", hint: "Overwrite each student's allocation to the amount" },
]
