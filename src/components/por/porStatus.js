/**
 * The POR status vocabulary and the detail-view style constants.
 *
 * Kept apart from the components that use them so neither file mixes
 * component and non-component exports — react-refresh cannot hot-update a
 * module that does both, and this vocabulary is imported by the page, the
 * shared detail modal and three extracted modals.
 */


export const POST_SA_STAGE_ORDER = [
  "Officer SA",
  "Associate Dean SA",
  "Dean SA",
]

export const STATUS_META = {
  pending_gymkhana: { label: "Pending Gymkhana", variant: "warning" },
  pending_club: { label: "Pending Club", variant: "warning" },
  pending_gs: { label: "Pending GS", variant: "warning" },
  pending_president: { label: "Pending President", variant: "warning" },
  pending_student_affairs: { label: "Pending Student Affairs", variant: "warning" },
  pending_officer: { label: "Pending Officer", variant: "warning" },
  pending_associate_dean: { label: "Pending Associate Dean", variant: "warning" },
  pending_dean: { label: "Pending Dean", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  revision_requested: { label: "Modification Requested", variant: "info" },
}

export const formatStatusLabel = (status) => STATUS_META[status]?.label || status || "Unknown"

export const getStatusVariant = (status) => STATUS_META[status]?.variant || "default"

export const formatStageLabel = (stage) => {
  if (stage === "Student Affairs") return "Office - Student Affairs"
  return stage || "Completed"
}

export const formatDateTime = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

export const detailBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-4)",
}

export const detailTextStyle = {
  color: "var(--color-text-body)",
  fontSize: "var(--font-size-sm)",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
}

export const metaBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-3)",
  flexWrap: "wrap",
  paddingBottom: "var(--spacing-3)",
  borderBottom: "1px solid var(--color-border-primary)",
}

export const metaBarLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
  flexWrap: "wrap",
}
