import Papa from "papaparse"
import { toDayKey } from "../caterer/catererHelpers"
import { formatDateTime } from "../diningPeriodHelpers"

export { downloadCsv, periodRange } from "../allocations/allocationHelpers"

export const PAGE_SIZE = 20
export const MAX_BULK_ENTRIES = 5000
export const MAX_NAME_LENGTH = 60

export const AUDIENCE_ALL = "all-active"
export const AUDIENCE_CUSTOM = "custom"

/* ---------- display ---------- */

export const defaultLabel = (value) => (value === true ? "Yes" : value === false ? "No" : "None")

export const audienceLabel = (form) => {
  if (!form?.enabled) return "-"
  if (form.audience === AUDIENCE_CUSTOM) {
    const count = (form.rollNumbers || []).length
    return `${count} roll number${count === 1 ? "" : "s"}`
  }
  return "All active"
}

/** { label, tone } for the answer form: Off / Opens <dt> / Open until <dt> / Closed. */
export const formStatus = (form, now = Date.now()) => {
  if (!form?.enabled) return { label: "Off", tone: "neutral" }
  const opens = form.opensAt ? new Date(form.opensAt).getTime() : null
  const closes = form.closesAt ? new Date(form.closesAt).getTime() : null
  if (form.isOpen === true) return { label: `Open until ${formatDateTime(form.closesAt)}`, tone: "success" }
  if (opens !== null && now < opens) return { label: `Opens ${formatDateTime(form.opensAt)}`, tone: "warning" }
  if (closes !== null && now >= closes) return { label: "Closed", tone: "neutral" }
  return { label: form.isOpen === false ? "Closed" : "Off", tone: "neutral" }
}

export const answerLabel = (value) => (value === true ? "Yes" : value === false ? "No" : "-")
export const answerTone = (value) => (value === true ? "success" : value === false ? "danger" : "neutral")

export const SOURCE_META = {
  student: { label: "Student", tone: "info" },
  admin: { label: "Admin", tone: "primary" },
  csv: { label: "CSV", tone: "purple" },
}

export const dateRange = (tag) => {
  const start = toDayKey(tag.startDate)
  const end = toDayKey(tag.endDate)
  return { start, end }
}

/* ---------- form ---------- */

export const toDateTimeLocal = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export const emptyForm = () => ({
  name: "",
  question: "",
  description: "",
  startDate: "",
  endDate: "",
  defaultValue: "none",
  formEnabled: false,
  opensAt: "",
  closesAt: "",
  audience: AUDIENCE_ALL,
  rollText: "",
})

const valueToChoice = (value) => (value === true ? "yes" : value === false ? "no" : "none")
const choiceToValue = (choice) => (choice === "yes" ? true : choice === "no" ? false : null)

export const formFromTag = (tag) => ({
  name: tag.name || "",
  question: tag.question || "",
  description: tag.description || "",
  startDate: toDayKey(tag.startDate),
  endDate: toDayKey(tag.endDate),
  defaultValue: valueToChoice(tag.defaultValue),
  formEnabled: Boolean(tag.form?.enabled),
  opensAt: toDateTimeLocal(tag.form?.opensAt),
  closesAt: toDateTimeLocal(tag.form?.closesAt),
  audience: tag.form?.audience === AUDIENCE_CUSTOM ? AUDIENCE_CUSTOM : AUDIENCE_ALL,
  rollText: (tag.form?.rollNumbers || []).join("\n"),
})

/** Roll numbers from free text (commas, spaces, newlines), upper-cased and de-duplicated. */
export const parseRollText = (text) => [
  ...new Set(
    String(text || "")
      .split(/[\s,;]+/)
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
  ),
]

/** Returns an error message, or "" when the form is valid (mirrors the API contract). */
export const validateForm = (form) => {
  const name = form.name.trim()
  if (!name) return "Enter a name for the tag."
  if (name.length > MAX_NAME_LENGTH) return `The name can be at most ${MAX_NAME_LENGTH} characters.`
  if (!form.startDate || !form.endDate) return "Pick a start and an end date."
  if (form.startDate > form.endDate) return "The start date must be on or before the end date."
  if (form.formEnabled) {
    if (!form.opensAt || !form.closesAt) return "Set when the form opens and closes."
    if (new Date(form.opensAt).getTime() >= new Date(form.closesAt).getTime()) return "The form must open before it closes."
    if (form.audience === AUDIENCE_CUSTOM && parseRollText(form.rollText).length === 0) {
      return "Add at least one roll number for a custom audience."
    }
  }
  return ""
}

export const buildPayload = (form) => {
  const payload = {
    name: form.name.trim(),
    question: form.question.trim(),
    description: form.description.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    defaultValue: choiceToValue(form.defaultValue),
  }
  if (form.formEnabled) {
    payload.form = {
      enabled: true,
      opensAt: new Date(form.opensAt).toISOString(),
      closesAt: new Date(form.closesAt).toISOString(),
      audience: form.audience,
      rollNumbers: form.audience === AUDIENCE_CUSTOM ? parseRollText(form.rollText) : [],
    }
  } else {
    payload.form = { enabled: false }
  }
  return payload
}

/* ---------- CSV in ---------- */

const YES = new Set(["yes", "y", "true", "1"])
const NO = new Set(["no", "n", "false", "0"])
const HEADER_WORDS = new Set(["rollnumber", "roll", "rollno", "roll_number", "roll number"])

/**
 * Parse `rollNumber,value` lines (value yes/no/true/false/1/0; header row optional) or a roll-only
 * list (meaning yes). The last line for a roll number wins. Returns { entries, invalid, duplicates }.
 */
export const parseTagCsv = (text) => {
  const parsed = Papa.parse(String(text || "").trim(), { skipEmptyLines: "greedy" })
  const byRoll = new Map()
  const invalid = []
  let duplicates = 0

  parsed.data.forEach((cells, index) => {
    const line = index + 1
    const roll = String(cells[0] ?? "").trim().toUpperCase()
    const rawValue = cells.length > 1 ? String(cells[1] ?? "").trim().toLowerCase() : ""
    if (!roll) return invalid.push({ line, text: cells.join(","), reason: "Missing roll number" })
    if (index === 0 && HEADER_WORDS.has(roll.toLowerCase())) return
    if (/\s/.test(roll)) return invalid.push({ line, text: cells.join(","), reason: "Roll number has spaces" })

    let value = true
    if (rawValue) {
      if (YES.has(rawValue)) value = true
      else if (NO.has(rawValue)) value = false
      else return invalid.push({ line, text: cells.join(","), reason: `Unknown value "${cells[1].trim()}"` })
    }
    if (byRoll.has(roll)) duplicates += 1
    byRoll.set(roll, value)
  })

  return { entries: [...byRoll].map(([rollNumber, value]) => ({ rollNumber, value })), invalid, duplicates }
}

/* ---------- CSV out ---------- */

export const buildRosterCsv = (rows) => {
  const head = ["Roll number", "Name", "Hostel", "Answer", "Effective", "Source", "Updated"]
  const body = rows.map((row) => [
    row.rollNumber,
    row.name,
    hostelName(row),
    row.value === true ? "yes" : row.value === false ? "no" : "",
    row.effective === true ? "yes" : row.effective === false ? "no" : "",
    row.source || "",
    row.updatedAt ? new Date(row.updatedAt).toISOString() : "",
  ])
  return Papa.unparse([head, ...body])
}

export const hostelName = (row) => (typeof row.hostel === "string" ? row.hostel : row.hostel?.name || "")
