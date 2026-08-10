// Shared frontend constants + helpers for the expenditure feature.

export const OCCURRENCE_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
}

// Roles allowed to manage expenditure occurrences.
export const MANAGER_ROLES = ["Admin", "Super Admin"]
export const isManagerRole = (role) => MANAGER_ROLES.includes(role)

// Files accepted for attachments (PDF + images) — matches the backend 'certificate' upload policy.
export const ATTACHMENT_ACCEPT = "application/pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif"
export const MAX_ATTACHMENTS = 20

/** Format a number as Indian Rupees (no decimals). */
export const formatINR = (value) =>
  (Number(value) || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })

export const isImageAttachment = (a) =>
  String(a?.contentType || "").startsWith("image/") ||
  /\.(png|jpe?g|webp|gif)$/i.test(a?.originalName || "")

export const formatDate = (value) => {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, { dateStyle: "medium" })
}
