/**
 * Accommodation workflow statuses — mirrors the backend ACCOMMODATION_STATUS enum.
 * Provides display labels, badge tones, and the student-facing step order.
 */

export const ACCOMMODATION_STATUS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING_CWO_CAPACITY: "Pending CWO Capacity Check",
  PENDING_FA_RECOMMENDATION: "Pending FA Recommendation",
  PENDING_CW_APPROVAL: "Pending CW Approval",
  RETURNED_TO_STUDENT: "Returned to Student",
  REJECTED: "Rejected",
  CW_APPROVED: "CW Approved",
  PAYMENT_REQUESTED: "Payment Requested",
  PAYMENT_DEFERRED: "Payment Deferred",
  PAYMENT_SUBMITTED: "Payment Submitted",
  PAYMENT_VERIFIED: "Payment Verified",
  HOSTEL_ALLOTTED: "Hostel Allotted", // legacy — allotment now happens with the payment request
  ROOMS_ASSIGNED: "Rooms Assigned",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  INVOICED: "Invoiced",
  CANCELLED: "Cancelled",
}

// Student's choice of when to settle the bill.
export const PAYMENT_MODE = { NOW: "now", LATER: "later" }

export const PAYMENT_STATUS = {
  PENDING: "Pending",
  DEFERRED: "Deferred",
  SUBMITTED: "Submitted",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
}

/** Stay date-change requests (student → Chief Warden Office). */
export const SCHEDULE_CHANGE_TYPE = {
  POSTPONE: "postpone",
  EXTEND: "extend",
}

export const SCHEDULE_CHANGE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
}

/** Max requests of each kind per booking. */
export const SCHEDULE_LIMITS = {
  postpone: 1,
  extend: 2,
}

// Guest days run 11:00 → 11:00; outside that is a requested extension.
export const STANDARD_CHECK_TIME = "11:00"
const STANDARD_CHECK_HOUR = 11

const parseTimeOfDay = (value) => {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || "").trim())
  return m ? Number(m[1]) + Number(m[2]) / 60 : NaN
}
const round2 = (n) => Math.round(n * 100) / 100

/** Hours requested outside the standard window, from the two times. */
export const extensionHours = (checkInTime, checkOutTime) => {
  const inH = parseTimeOfDay(checkInTime)
  const outH = parseTimeOfDay(checkOutTime)
  return {
    earlyCheckInHours: Number.isNaN(inH) ? 0 : round2(Math.max(0, STANDARD_CHECK_HOUR - inH)),
    lateCheckOutHours: Number.isNaN(outH) ? 0 : round2(Math.max(0, outH - STANDARD_CHECK_HOUR)),
  }
}

/** "2h early check-in · 3h late check-out", or "" when the stay is standard. */
export const describeExtension = (stay = {}) => {
  const parts = []
  if ((stay.earlyCheckInHours || 0) > 0) parts.push(`${stay.earlyCheckInHours}h early check-in`)
  if ((stay.lateCheckOutHours || 0) > 0) parts.push(`${stay.lateCheckOutHours}h late check-out`)
  return parts.join(" · ")
}

/**
 * Student-facing labels. Internal/staff statuses still use ACCOMMODATION_STATUS
 * values; these soften wording that says "approve/approved" before the Chief
 * Warden Office has allotted a hostel and asked for payment.
 */
export const STUDENT_STATUS_LABEL = {
  [ACCOMMODATION_STATUS.PENDING_CWO_CAPACITY]: "Checking availability",
  [ACCOMMODATION_STATUS.PENDING_FA_RECOMMENDATION]: "With faculty advisor / supervisor",
  [ACCOMMODATION_STATUS.PENDING_CW_APPROVAL]: "With Chief Warden",
  [ACCOMMODATION_STATUS.CW_APPROVED]: "Processing — payment details coming",
  [ACCOMMODATION_STATUS.RETURNED_TO_STUDENT]: "Returned for updates",
}

export const getStudentStatusLabel = (status) => STUDENT_STATUS_LABEL[status] || status

// Tone for the C0 StatusBadge (success | warning | danger | info | primary).
export const STATUS_TONE = {
  [ACCOMMODATION_STATUS.DRAFT]: "primary",
  [ACCOMMODATION_STATUS.SUBMITTED]: "warning",
  [ACCOMMODATION_STATUS.PENDING_CWO_CAPACITY]: "warning",
  [ACCOMMODATION_STATUS.PAYMENT_DEFERRED]: "warning",
  [ACCOMMODATION_STATUS.PENDING_FA_RECOMMENDATION]: "warning",
  [ACCOMMODATION_STATUS.PENDING_CW_APPROVAL]: "warning",
  [ACCOMMODATION_STATUS.RETURNED_TO_STUDENT]: "warning",
  [ACCOMMODATION_STATUS.REJECTED]: "danger",
  [ACCOMMODATION_STATUS.CANCELLED]: "danger",
  [ACCOMMODATION_STATUS.CW_APPROVED]: "primary",
  [ACCOMMODATION_STATUS.PAYMENT_REQUESTED]: "primary",
  [ACCOMMODATION_STATUS.PAYMENT_SUBMITTED]: "primary",
  [ACCOMMODATION_STATUS.PAYMENT_VERIFIED]: "primary",
  [ACCOMMODATION_STATUS.HOSTEL_ALLOTTED]: "primary",
  [ACCOMMODATION_STATUS.ROOMS_ASSIGNED]: "primary",
  [ACCOMMODATION_STATUS.CHECKED_IN]: "success",
  [ACCOMMODATION_STATUS.CHECKED_OUT]: "success",
  [ACCOMMODATION_STATUS.INVOICED]: "success",
}

// C0 StatusBadge only supports these tones; anything else throws at render.
const VALID_TONES = new Set(["primary", "success", "danger", "warning"])
export const getStatusTone = (status) => {
  const tone = STATUS_TONE[status]
  return VALID_TONES.has(tone) ? tone : "primary"
}

// Ordered milestones for the student status timeline (happy path).
export const STUDENT_STEPS = [
  { key: "submitted", label: "Submitted", statuses: [ACCOMMODATION_STATUS.SUBMITTED] },
  { key: "capacity", label: "Availability check", statuses: [ACCOMMODATION_STATUS.PENDING_CWO_CAPACITY] },
  {
    key: "review",
    label: "Recommendation & review",
    statuses: [ACCOMMODATION_STATUS.PENDING_FA_RECOMMENDATION, ACCOMMODATION_STATUS.PENDING_CW_APPROVAL],
  },
  { key: "processing", label: "Processing", statuses: [ACCOMMODATION_STATUS.CW_APPROVED] },
  {
    key: "payment",
    label: "Payment & hostel",
    statuses: [
      ACCOMMODATION_STATUS.PAYMENT_REQUESTED,
      ACCOMMODATION_STATUS.PAYMENT_DEFERRED,
      ACCOMMODATION_STATUS.PAYMENT_SUBMITTED,
      ACCOMMODATION_STATUS.PAYMENT_VERIFIED,
      ACCOMMODATION_STATUS.HOSTEL_ALLOTTED,
    ],
  },
  {
    key: "stay",
    label: "Stay",
    statuses: [ACCOMMODATION_STATUS.ROOMS_ASSIGNED, ACCOMMODATION_STATUS.CHECKED_IN, ACCOMMODATION_STATUS.CHECKED_OUT],
  },
  { key: "invoiced", label: "Invoice", statuses: [ACCOMMODATION_STATUS.INVOICED] },
]

// Index of the step a status belongs to (for marking completed/current).
export const stepIndexForStatus = (status) =>
  STUDENT_STEPS.findIndex((step) => step.statuses.includes(status))

export const isTerminal = (status) =>
  [ACCOMMODATION_STATUS.REJECTED, ACCOMMODATION_STATUS.CANCELLED, ACCOMMODATION_STATUS.INVOICED].includes(status)
