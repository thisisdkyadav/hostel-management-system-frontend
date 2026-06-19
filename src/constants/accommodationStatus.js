/**
 * Accommodation workflow statuses — mirrors the backend ACCOMMODATION_STATUS enum.
 * Provides display labels, badge tones, and the student-facing step order.
 */

export const ACCOMMODATION_STATUS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING_FA_RECOMMENDATION: "Pending FA Recommendation",
  PENDING_CW_APPROVAL: "Pending CW Approval",
  RETURNED_TO_STUDENT: "Returned to Student",
  REJECTED: "Rejected",
  CW_APPROVED: "CW Approved",
  PAYMENT_REQUESTED: "Payment Requested",
  PAYMENT_SUBMITTED: "Payment Submitted",
  PAYMENT_VERIFIED: "Payment Verified",
  HOSTEL_ALLOTTED: "Hostel Allotted",
  ROOMS_ASSIGNED: "Rooms Assigned",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  INVOICED: "Invoiced",
  CANCELLED: "Cancelled",
}

// Tone for the C0 StatusBadge (success | warning | danger | info | primary).
export const STATUS_TONE = {
  [ACCOMMODATION_STATUS.DRAFT]: "primary",
  [ACCOMMODATION_STATUS.SUBMITTED]: "warning",
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
  {
    key: "review",
    label: "Recommendation & Approval",
    statuses: [ACCOMMODATION_STATUS.PENDING_FA_RECOMMENDATION, ACCOMMODATION_STATUS.PENDING_CW_APPROVAL],
  },
  { key: "approved", label: "Approved", statuses: [ACCOMMODATION_STATUS.CW_APPROVED] },
  {
    key: "payment",
    label: "Payment",
    statuses: [
      ACCOMMODATION_STATUS.PAYMENT_REQUESTED,
      ACCOMMODATION_STATUS.PAYMENT_SUBMITTED,
      ACCOMMODATION_STATUS.PAYMENT_VERIFIED,
    ],
  },
  { key: "allotted", label: "Allotment", statuses: [ACCOMMODATION_STATUS.HOSTEL_ALLOTTED] },
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
