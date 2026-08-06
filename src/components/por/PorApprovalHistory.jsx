import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/data-display"
import { Spinner } from "@/components/ui/feedback"
import { Check, Clock, FileText, Send, X } from "lucide-react"
import { porApi } from "@/service"
import { Grid, HStack, Text, VStack } from "@/components/ui"

const ACTION_ICONS = {
  submitted: Send,
  recommended: Check,
  approved: Check,
  rejected: X,
  revision_requested: FileText,
}

const ACTION_COLORS = {
  submitted: "info",
  recommended: "warning",
  approved: "success",
  rejected: "danger",
  revision_requested: "warning",
}

const formatActionLabel = (action) =>
  String(action || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

const formatStageLabel = (stage) => {
  if (stage === "Student Affairs") return "Office - Student Affairs"
  return stage || "Unknown Stage"
}

const formatTimestamp = (value) => {
  if (!value) return "Date unavailable"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date unavailable"
  return date.toLocaleString()
}

const timelineRailStyle = {
  position: "relative",
  width: "32px",
  minHeight: "100%",
  display: "flex",
  justifyContent: "center",
  flexShrink: 0,
}

const timelineLineStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: "50%",
  width: "2px",
  transform: "translateX(-50%)",
  backgroundColor: "var(--color-border-primary)",
}

const PorApprovalHistory = ({ porRequestId = null, compact = false }) => {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [error, setError] = useState("")

  const fetchHistory = useCallback(async () => {
    if (!porRequestId) return

    try {
      setLoading(true)
      setError("")
      const response = await porApi.getHistory(porRequestId)
      setHistory(Array.isArray(response?.history) ? response.history : [])
    } catch (err) {
      setError(err?.message || "Failed to load POR history")
    } finally {
      setLoading(false)
    }
  }, [porRequestId])

  useEffect(() => {
    if (porRequestId) {
      fetchHistory()
    }
  }, [porRequestId, fetchHistory])

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-6)" }}>
        <Spinner size="medium" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ color: "var(--color-danger)", textAlign: "center", padding: "var(--spacing-4)" }}>
        {error}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--spacing-6)",
          color: "var(--color-text-muted)",
        }}
      >
        <Clock size={32} style={{ margin: "0 auto var(--spacing-2)" }} />
        <p>No approval history yet</p>
      </div>
    )
  }

  return (
    <VStack gap={compact ? "var(--spacing-2)" : "var(--spacing-3)"}>
      {history.map((log, idx) => {
        const Icon = ACTION_ICONS[log.action] || Clock
        const baseColor = ACTION_COLORS[log.action] || "default"
        const safeComments = String(log?.comments || "").trim()
        const safeActorName = log.performedBy?.name || "Unknown"
        const safeActorRole = log.performedBy?.subRole || log.performedBy?.email || ""
        const isLast = idx === history.length - 1
        const actionLabel = formatActionLabel(log.action)
        const color = log.action === "recommended" ? "warning" : baseColor

        if (compact) {
          return (
            <Grid cols="32px minmax(0, 1fr)" gap={3} align="start" key={log._id || idx}>
              <div style={timelineRailStyle}>
                {!isLast ? <div style={timelineLineStyle} /> : null}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: `var(--color-${color === "default" ? "bg-secondary" : `${color}-bg`})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 0 4px var(--color-bg-primary)",
                  }}
                >
                  <Icon size={16} style={{ color: `var(--color-${color})` }} />
                </div>
              </div>

              <div
                style={{
                  minWidth: 0,
                  border: "1px solid var(--color-border-primary)",
                  borderRadius: "var(--radius-card-sm)",
                  backgroundColor: "var(--color-bg-secondary)",
                  padding: "var(--spacing-3)",
                }}
              >
                <HStack gap={2} align="center" justify="between" wrap>
                  <Badge variant={color}>{actionLabel}</Badge>
                  <Text as="span" size="11px" color="placeholder">
                    {formatTimestamp(log.createdAt)}
                  </Text>
                </HStack>

                <Grid cols={1} gap="4px" style={{ marginTop: "var(--spacing-2)" }}>
                  <Text as="span" size="xs" weight="semibold" color="secondary">
                    {formatStageLabel(log.stage)}
                  </Text>
                  <Text as="span" size="xs" color="muted">
                    {safeActorName}
                  </Text>
                  {safeActorRole ? (
                    <Text as="span" size="11px" color="placeholder">
                      {safeActorRole}
                    </Text>
                  ) : null}
                </Grid>
              </div>
            </Grid>
          )
        }

        return (
          <Grid cols="minmax(140px, 190px) 32px minmax(0, 1fr)" gap={3} align="start" key={log._id || idx}>
                <Grid cols={1} gap="4px" style={{ paddingTop: "4px", justifyItems: "end", textAlign: "right" }}>
              <Text as="span" size="xs" weight="semibold" color="secondary">
                {formatStageLabel(log.stage)}
              </Text>
              <Text as="span" size="xs" color="muted">
                {safeActorName}
              </Text>
              {safeActorRole ? (
                <Text as="span" size="11px" color="placeholder">
                  {safeActorRole}
                </Text>
              ) : null}
              <Text as="span" size="11px" color="placeholder">
                {formatTimestamp(log.createdAt)}
              </Text>
            </Grid>

            <div style={timelineRailStyle}>
              {!isLast ? <div style={timelineLineStyle} /> : null}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: "32px",
                  height: "32px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: `var(--color-${color === "default" ? "bg-secondary" : `${color}-bg`})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 0 4px var(--color-bg-primary)",
                }}
              >
                <Icon size={16} style={{ color: `var(--color-${color})` }} />
              </div>
            </div>

            <div
              style={{
                minWidth: 0,
                border: "1px solid var(--color-border-primary)",
                borderRadius: "var(--radius-card-sm)",
                backgroundColor: "var(--color-bg-secondary)",
                padding: "var(--spacing-3)",
              }}
            >
              <HStack gap={2} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-1)" }}>
                <Badge variant={color}>{actionLabel}</Badge>
                <Text as="span" size="xs" color="muted">
                  {safeActorName}
                </Text>
              </HStack>

              {safeComments ? (
                <Text size="sm" color="body" leading={1.6} style={{ whiteSpace: "pre-wrap" }}>
                  {safeComments}
                </Text>
              ) : (
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-muted)",
                    fontStyle: "italic",
                  }}
                >
                  No comments added for this step.
                </p>
              )}
            </div>
          </Grid>
        )
      })}
    </VStack>
  )
}

export default PorApprovalHistory
