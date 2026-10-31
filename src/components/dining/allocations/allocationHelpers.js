// Vocabulary, filters and CSV for the Allocations page. Day keys are "YYYY-MM-DD";
// the backend owns which day is "today".
import { buildCsvContent } from "@/utils/csvExport"
import { diffDays, formatDayMonth, pluralize, toDayKey } from "../caterer/catererHelpers"
import { formatCurrency, formatClearance } from "../diningBillingHelpers"

export { downloadCsv } from "../caterer/meal-records/mealRecordsHelpers"

export const PAGE_SIZE = 20
export const LOW_ATTENDANCE = 40

export const PHASE_META = {
  current: { label: "Now", tone: "success" },
  upcoming: { label: "Upcoming", tone: "warning" },
  past: { label: "Past", tone: "neutral" },
}

/** "1 Aug – 31 Aug 2026" (the year is shown once, on the end). */
export const periodRange = (startDate, endDate) => {
  const start = toDayKey(startDate)
  const end = toDayKey(endDate)
  if (!start) return "-"
  const year = (end || start).slice(0, 4)
  if (!end || start === end) return `${formatDayMonth(start)} ${year}`
  const startYear = start.slice(0, 4)
  return `${formatDayMonth(start)}${startYear !== year ? ` ${startYear}` : ""} – ${formatDayMonth(end)} ${year}`
}

export const isEditablePeriod = (period) => Boolean(period) && period.phase !== "past" && !period.isArchived

export const formatPct = (value) => (value === null || value === undefined ? "-" : `${value}%`)

export const todayStatus = (student) => {
  if (student.onRebateToday) return { label: "On rebate", tone: "warning" }
  if (student.ateToday) return { label: "Ate", tone: "success" }
  return { label: "Not yet", tone: "primary" }
}

/** What the choice window says: manual allocation, or when it opens / closes. */
export const choiceWindowLabel = (period, now = new Date()) => {
  if (!period) return { value: "-", note: "" }
  if (!period.registrationEnabled) return { value: "Manual allocation", note: "Students are placed by the dining office" }
  const start = period.allocationStartAt ? new Date(period.allocationStartAt) : null
  const end = period.allocationEndAt ? new Date(period.allocationEndAt) : null
  if (start && start > now) return { value: "Not open yet", note: `Opens ${formatDayMonth(toDayKey(period.allocationStartAt))}` }
  if (end && end < now) return { value: "Closed", note: `Closed ${formatDayMonth(toDayKey(period.allocationEndAt))}` }
  if (end) {
    const days = Math.ceil((end - now) / 86400000)
    return { value: "Open", note: days <= 1 ? "Closes within a day" : `Closes in ${pluralize(days, "day")}` }
  }
  return { value: "Open", note: "No closing date" }
}

/** "in 2 days", "in 5 hours", "in 12 minutes"; "" once it has passed. */
const relativeFuture = (target, now) => {
  const ms = target - now
  if (!(ms > 0)) return ""
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `in ${pluralize(Math.max(1, minutes), "minute")}`
  const hours = Math.round(ms / 3600000)
  if (hours < 24) return `in ${pluralize(hours, "hour")}`
  return `in ${pluralize(Math.round(ms / 86400000), "day")}`
}

const whenLabel = (iso) =>
  new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

/**
 * The auto-allocation tile for an upcoming period, or null when there is
 * nothing to say (older backend, or no auto-allocation set up).
 */
export const autoAllocationLabel = (period, now = new Date()) => {
  const run = period?.autoAllocation || null
  const at = period?.autoAllocationAt ? new Date(period.autoAllocationAt) : null
  const validAt = at && !Number.isNaN(at.getTime()) ? at : null
  if (run?.status === "failed") return { value: "Failed", tone: "danger", note: "Auto-allocation failed" }
  if (run?.status === "running") return { value: "Running", tone: "info", note: "Assigning unpicked students now" }
  if (run?.status === "completed") {
    const left = Number(run.leftOver) || 0
    return {
      value: `${Number(run.assigned) || 0} assigned`,
      tone: left > 0 ? "warning" : "success",
      note: `Auto-allocated ${Number(run.assigned) || 0} · ${left} left over`,
    }
  }
  if (!validAt) return null
  const when = relativeFuture(validAt, now)
  return {
    value: when || "Due now",
    tone: "info",
    note: `Auto-assigns unpicked students ${whenLabel(validAt)}`,
  }
}

/** Short tooltip for the period tile when an auto-allocation is still waiting to run; "" otherwise. */
export const autoAllocationPending = (period, now = new Date()) => {
  if (!period?.autoAllocationAt || period.autoAllocation?.status) return ""
  const at = new Date(period.autoAllocationAt)
  if (Number.isNaN(at.getTime()) || at < now) return ""
  return `Auto-assigns unpicked students ${whenLabel(at)}`
}

export const startsInLabel = (period, today) => {
  const days = diffDays(today, toDayKey(period?.startDate))
  if (days <= 0) return { value: "Today", note: "" }
  return { value: String(days), note: days === 1 ? "day to go" : "days to go" }
}

/* ---------- quick filters ---------- */

const neverScanned = (student) => !student.meals && student.chargeableDays > 0

const QUICK_MATCHERS = {
  all: () => true,
  ate: (student) => student.ateToday,
  rebate: (student) => student.onRebateToday,
  never: neverScanned,
  pending: (student) => student.pendingRebates > 0,
  low: (student) => student.attendance !== null && student.attendance !== undefined && student.attendance < LOW_ATTENDANCE,
  neverAte: (student) => !student.meals,
  dues: (student) => student.fee?.clearance === "dues",
}

export const matchesQuick = (student, filter) => (QUICK_MATCHERS[filter] || QUICK_MATCHERS.all)(student)

/** The pill row for a phase: [{ value, label }]. */
export const quickFilterDefs = (phase, oversight) => {
  if (phase === "current") {
    return [
      { value: "all", label: "All" },
      { value: "ate", label: "Ate today" },
      { value: "rebate", label: "On rebate today" },
      { value: "never", label: "Never scanned" },
      { value: "pending", label: "Rebate pending" },
    ]
  }
  if (phase === "past") {
    return [
      { value: "all", label: "All" },
      { value: "low", label: `Low attendance (<${LOW_ATTENDANCE}%)` },
      { value: "neverAte", label: "Never ate" },
      ...(oversight ? [{ value: "dues", label: "In dues" }] : []),
    ]
  }
  return [{ value: "all", label: "All" }]
}

export const validQuick = (phase, oversight, value) => (quickFilterDefs(phase, oversight).some((def) => def.value === value) ? value : "all")

/* ---------- registration (auto-allocated = "unregistered") ---------- */

export const REGISTRATION_OPTIONS = [
  { value: "", label: "All students" },
  { value: "registered", label: "Registered" },
  { value: "unregistered", label: "Unregistered" },
]

/** "" matches everyone; "unregistered" the auto-allocated students still marked; "registered" the rest. */
export const matchesRegistration = (student, value) => {
  if (value === "unregistered") return Boolean(student.unregistered)
  if (value === "registered") return !student.unregistered
  return true
}

/* ---------- dining tags ---------- */

/** One student's entry for one tag: { value, effective, source } (value null = never answered). */
const tagEntry = (student, tagId) => student.tags?.[tagId] || null

/** The student's effective-yes tags as chips: [{ id, name, muted }]; muted = the yes came from the default. */
export const tagChipsFor = (student, tags = []) =>
  tags
    .filter((tag) => tagEntry(student, tag.id)?.effective === true)
    .map((tag) => ({ id: tag.id, name: tag.name, muted: tagEntry(student, tag.id)?.value === null || tagEntry(student, tag.id)?.value === undefined }))

export const TAG_VALUE_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unanswered", label: "Unanswered" },
]

/** Does the student match "<tag> is yes / no / unanswered"? An empty tag id matches everyone. */
export const matchesTag = (student, tagId, value) => {
  if (!tagId) return true
  const entry = tagEntry(student, tagId)
  if (value === "yes") return entry?.effective === true
  if (value === "no") return entry?.effective === false
  if (value === "unanswered") return !entry || entry.value === null || entry.value === undefined
  return true
}

/** "Yes" / "No" / "-" for the effective value, with the where-it-came-from note. */
export const describeTagEntry = (entry, tag) => {
  const effective = entry?.effective
  const answered = entry && entry.value !== null && entry.value !== undefined
  const label = effective === true ? "Yes" : effective === false ? "No" : "Not set"
  const sourceLabel = { student: "answered by the student", admin: "set by the office", csv: "set from a CSV upload" }[entry?.source]
  if (answered) return { label, note: sourceLabel || "answered" }
  if (effective === null || effective === undefined) return { label, note: tag?.defaultValue === null || tag?.defaultValue === undefined ? "no answer and no default" : "no answer" }
  return { label, note: `no answer, using the default (${effective ? "Yes" : "No"})` }
}

export const roomLabel = (student) => {
  const hostel = student.hostel?.name
  const room = student.room?.displayRoom
  return [hostel, room].filter(Boolean).join(" · ")
}

export const programLabel = (student) => [student.degree, student.department, student.batch].filter(Boolean).join(" · ")

/** Flat rows for the table: raw fields stay put so column sorting works on them. */
export const toRow = (student, tags = []) => {
  const tagChips = tagChipsFor(student, tags)
  return {
    ...student,
    sortName: (student.name || "").toLowerCase(),
    roomText: roomLabel(student),
    programText: programLabel(student),
    catererName: student.caterer?.name || "",
    todayText: todayStatus(student).label,
    feeBalance: student.fee ? student.fee.balance : null,
    tagChips,
    tagText: tagChips.map((chip) => chip.name).join(", "),
    selectedTime: student.selectedAt ? new Date(student.selectedAt).getTime() : null,
  }
}

export const searchText = (row) =>
  [row.name, row.rollNumber, row.roomText, row.email].filter(Boolean).join(" ").toLowerCase()

/* ---------- CSV ---------- */

export const buildAllocationsCsv = (rows, { slots = [], oversight = false, phase = "current", tags = [] } = {}) => {
  const head = [
    "Roll number",
    "Name",
    "Email",
    "Hostel",
    "Room",
    "Degree",
    "Department",
    "Batch",
    ...(oversight ? ["Caterer"] : []),
    "Allocated on",
    "Unregistered",
    ...(phase === "upcoming" ? ["Rebate days booked"] : ["Meals", ...slots.map((slot) => slot.name), "Attendance %", "Rebate days", "Billable days", "Billed"]),
    ...(oversight && phase !== "upcoming" ? ["Mess fee", "Balance"] : []),
    ...tags.map((tag) => `Tag: ${tag.name}`),
  ]
  const body = rows.map((row) => [
    row.rollNumber,
    row.name,
    row.email,
    row.hostel?.name || "",
    row.room?.displayRoom || "",
    row.degree,
    row.department,
    row.batch,
    ...(oversight ? [row.caterer?.name || ""] : []),
    row.selectedAt ? toDayKey(row.selectedAt) : "",
    row.unregistered ? "Yes" : "",
    ...(phase === "upcoming"
      ? [row.approvedRebateDays]
      : [
          row.meals,
          ...slots.map((slot) => row.mealsBySlot?.[slot.key] || 0),
          row.attendance ?? "",
          row.rebateDays,
          row.chargeableDays,
          row.billed,
        ]),
    ...(oversight && phase !== "upcoming" ? [row.fee ? formatClearance(row.fee.clearance) : "", row.fee ? row.fee.balance : ""] : []),
    ...tags.map((tag) => {
      const entry = tagEntry(row, tag.id)
      if (entry?.effective === true) return entry.value === true ? "Yes" : "Yes (default)"
      if (entry?.effective === false) return entry.value === false ? "No" : "No (default)"
      return ""
    }),
  ])
  return buildCsvContent(head, body)
}

export { formatCurrency }
