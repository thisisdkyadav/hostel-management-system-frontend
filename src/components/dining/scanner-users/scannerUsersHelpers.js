/** Shared by the Scanner Photos page and its student card. */

/** Why a student's face doesn't work at the mess yet (or that it does). */
export const REASONS = {
  noPhoto: { label: "No photo", tone: "none" },
  refused: { label: "Refused", tone: "bad" },
  noFace: { label: "No face", tone: "bad" },
  sending: { label: "Sending", tone: "warn" },
  unchecked: { label: "Not checked", tone: "warn" },
  working: { label: "Working", tone: "ok" },
}
export const NOT_WORKING = ["noPhoto", "refused", "noFace", "sending", "unchecked"]

/** Some machine was asked for its photo and hasn't answered yet. */
export const isChecking = (row) => row.machines.some((m) => m.check?.status === "checking")

export const number = (value) => (value || 0).toLocaleString("en-IN")

/** "2 min ago", "3 h ago", "4 Nov" */
export const ago = (value, now = Date.now()) => {
  if (!value) return ""
  const ms = now - new Date(value).getTime()
  if (ms < 60000) return "just now"
  if (ms < 3600000) return `${Math.round(ms / 60000)} min ago`
  if (ms < 86400000) return `${Math.round(ms / 3600000)} h ago`
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?"
