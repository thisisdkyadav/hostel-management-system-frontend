import { eventDetailMetaChipStyles, infoBoxStyle } from "@/components/gymkhana/events-page/sharedPrimitives"

export const fieldLabelStyle = {
  display: "block",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "var(--spacing-1)",
}

export const inputStyle = {
  width: "100%",
  border: "1px solid var(--color-border-input)",
  borderRadius: "var(--radius-input)",
  backgroundColor: "var(--color-bg-primary)",
  padding: "10px 12px",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-primary)",
}

export const textareaStyle = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
}

export const helperTextStyle = {
  marginTop: "var(--spacing-1)",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-muted)",
  lineHeight: 1.5,
}

export const fieldClusterStyle = {
  ...infoBoxStyle,
  display: "grid",
  gap: "var(--spacing-3)",
}

export const checklistItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--spacing-3)",
  padding: "var(--spacing-3)",
  borderRadius: "var(--radius-card-sm)",
  border: "1px solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-secondary)",
}

export const buildMetaChipStyle = (extra = {}) => ({
  ...eventDetailMetaChipStyles,
  ...extra,
})

export const badgeStyle = (tone = "default") => {
  const variants = {
    default: {
      backgroundColor: "var(--color-bg-tertiary)",
      color: "var(--color-text-body)",
    },
    success: {
      backgroundColor: "var(--color-success-bg)",
      color: "var(--color-success-text)",
    },
    danger: {
      backgroundColor: "var(--color-danger-bg-light)",
      color: "var(--color-danger-text)",
    },
    primary: {
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
    },
    warning: {
      backgroundColor: "var(--color-warning-bg-light)",
      color: "var(--color-warning-text)",
    },
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-1)",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-semibold)",
    ...variants[tone],
  }
}

export const statusTone = (status) => {
  if (status === "approved") return "success"
  if (status === "rejected") return "danger"
  if (status === "active") return "primary"
  return "warning"
}

export const getApplicationWindowLabel = (status) => {
  if (status === "open") return "Application open"
  if (status === "scheduled") return "Upcoming"
  if (status === "closed") return "Closed"
  return "Unavailable"
}

export const getPointBadgeStyle = (points = 0) => {
  const numericPoints = Number(points || 0)
  const isZero = numericPoints === 0
  return {
    display: "inline-flex",
    padding: "4px 8px",
    borderRadius: "var(--radius-sm)",
    backgroundColor: isZero
      ? "color-mix(in srgb, var(--color-danger) 12%, transparent)"
      : "var(--color-primary-bg)",
    color: isZero ? "var(--color-danger)" : "var(--color-primary)",
    fontWeight: "var(--font-weight-bold)",
    fontSize: "var(--font-size-xs)",
  }
}
