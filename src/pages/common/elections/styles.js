

export const pageStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  minHeight: 0,
  overflow: "hidden",
}

export const workspaceStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "var(--spacing-4) var(--spacing-6)",
  backgroundColor: "transparent",
}

export const infoBannerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-3)",
  flexWrap: "wrap",
  padding: "var(--spacing-3) var(--spacing-4)",
  marginBottom: "var(--spacing-4)",
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-secondary)",
}

export const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "var(--spacing-3)",
  marginBottom: "var(--spacing-4)",
}

export const badgeRowStyle = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  alignItems: "center",
}

export const compactStatStyle = {
  padding: "var(--spacing-2) var(--spacing-3)",
  backgroundColor: "var(--color-bg-secondary)",
  borderRadius: "var(--radius-card-sm)",
  border: "1px solid var(--color-border-primary)",
  display: "flex",
  flexDirection: "column",
  gap: "2px",
}

export const compactStatLabelStyle = {
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
}

export const compactStatValueStyle = {
  fontSize: "var(--font-size-base)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-heading)",
}

export const detailGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "var(--spacing-3)",
}

export const detailPanelStyle = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-secondary)",
  padding: "var(--spacing-3)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-2)",
}

export const mutedTextStyle = {
  color: "var(--color-text-muted)",
  fontSize: "var(--font-size-sm)",
}

export const labelStyle = {
  display: "block",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "var(--spacing-1)",
}

export const inputShellStyle = {
  width: "100%",
  border: "1px solid var(--color-border-input)",
  borderRadius: "var(--radius-input)",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-primary)",
}

export const selectStyle = {
  ...inputShellStyle,
  padding: "10px 12px",
  fontSize: "var(--font-size-sm)",
}

export const headerSelectStyle = {
  ...selectStyle,
  minWidth: "320px",
  backgroundColor: "var(--color-bg-primary)",
}

export const textareaStyle = {
  width: "100%",
  minHeight: "72px",
  border: "1px solid var(--color-border-input)",
  borderRadius: "var(--radius-input)",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-primary)",
  padding: "8px 12px",
  fontSize: "var(--font-size-sm)",
  resize: "vertical",
}

export const pillBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  whiteSpace: "nowrap",
}

export const timelinePreviewStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "var(--spacing-3)",
}

export const timelineCellStyle = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  padding: "var(--spacing-3)",
  backgroundColor: "var(--color-bg-primary)",
}

export const postTabListStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
}

export const postTabStyle = {
  ...pillBaseStyle,
  border: "1px solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-body)",
  cursor: "pointer",
}

export const modalBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-3)",
  maxHeight: "72vh",
  overflowY: "auto",
  paddingRight: "var(--spacing-1)",
}

export const modalHeroStyle = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card)",
  padding: "var(--spacing-3)",
  backgroundColor: "var(--color-bg-primary)",
}

export const errorTextStyle = {
  marginTop: "6px",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-danger-text)",
}

export const errorBannerStyle = {
  padding: "var(--spacing-3) var(--spacing-4)",
  borderRadius: "var(--radius-card-sm)",
  border: "1px solid var(--color-danger)",
  backgroundColor: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  fontSize: "var(--font-size-sm)",
}

export const statusToneStyles = {
  primary: {
    backgroundColor: "var(--color-primary-bg)",
    color: "var(--color-primary)",
  },
  success: {
    backgroundColor: "var(--color-success-bg)",
    color: "var(--color-success-text)",
  },
  warning: {
    backgroundColor: "var(--color-warning-bg-light)",
    color: "var(--color-warning-text)",
  },
  danger: {
    backgroundColor: "var(--color-danger-bg-light)",
    color: "var(--color-danger-text)",
  },
  default: {
    backgroundColor: "var(--color-bg-secondary)",
    color: "var(--color-text-body)",
  },
}

export const getStatusTone = (status) => {
  if (["verified", "published", "completed", "voting"].includes(status)) return "success"
  if (["rejected", "cancelled"].includes(status)) return "danger"
  if (["withdrawal", "campaigning", "results", "handover", "modification_requested", "queued"].includes(status)) return "warning"
  if (["nomination", "announced", "draft", "submitted", "participation"].includes(status)) return "primary"
  return "default"
}
