/** Shared by the Scanner Photos page and its detail view. */

export const STATUS = {
  valid: { label: "On every machine", tone: "success" },
  pending: { label: "Sending", tone: "warning" },
  failed: { label: "Refused", tone: "danger" },
  missing: { label: "No photo", tone: "neutral" },
}

/** Some machine was asked for its photo and hasn't answered yet. */
export const isChecking = (row) => row.machines.some((m) => m.check?.status === "checking")
