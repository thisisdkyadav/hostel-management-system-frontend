/**
 * Audit Timeline Component
 *
 * Renders the merged "who changed what + approval workflow" history for a single
 * entity, backed by GET /student-affairs/events/audit/:entityType/:entityId.
 * Each item is either a data edit (kind: "edit") with a field-level diff, or an
 * approval-workflow event (kind: "approval"). Content-only (drop it inside a
 * Modal), mirroring ApprovalHistory.
 */

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/data-display"
import { Spinner } from "@/components/ui/feedback"
import { Plus, Pencil, Trash2, RotateCcw, Check, X, Send, Clock, FileText } from "lucide-react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"

// Edit actions (kind: "edit") and approval actions (kind: "approval") share one map.
const ACTION_ICONS = {
    create: Plus,
    update: Pencil,
    delete: Trash2,
    restore: RotateCcw,
    submitted: Send,
    recommended: Check,
    approved: Check,
    rejected: X,
    revision_requested: FileText,
}

const ACTION_COLORS = {
    create: "success",
    update: "info",
    delete: "danger",
    restore: "warning",
    submitted: "info",
    recommended: "warning",
    approved: "success",
    rejected: "danger",
    revision_requested: "warning",
}

const ACTION_LABELS = {
    create: "Created",
    update: "Edited",
    delete: "Deleted",
    restore: "Restored",
}

const formatActionLabel = (action) =>
    ACTION_LABELS[action] ||
    String(action || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())

const formatStageLabel = (stage) =>
    stage === "Student Affairs" ? "Office - Student Affairs" : stage

const formatTimestamp = (value) => {
    if (!value) return "Date unavailable"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "Date unavailable"
    return date.toLocaleString()
}

// camelCase / snake_case field key -> human label
const humanizeField = (field) =>
    String(field || "")
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim()

const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "—"
    let text
    if (typeof value === "object") {
        try {
            text = JSON.stringify(value)
        } catch {
            text = String(value)
        }
    } else {
        text = String(value)
    }
    return text.length > 120 ? `${text.slice(0, 117)}…` : text
}

const actorName = (actor) => {
    if (!actor) return "Unknown"
    if (actor.isSystem) return "System"
    return actor.name || "Unknown"
}

const ChangeRow = ({ change }) => (
    <div
        style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: "var(--spacing-1)",
            fontSize: "var(--font-size-xs)",
        }}
    >
        <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>
            {humanizeField(change.field)}:
        </span>
        <span style={{ color: "var(--color-text-muted)", textDecoration: "line-through" }}>
            {formatValue(change.from)}
        </span>
        <span style={{ color: "var(--color-text-placeholder)" }}>→</span>
        <span style={{ color: "var(--color-text-body)" }}>{formatValue(change.to)}</span>
    </div>
)

const AuditTimeline = ({ entityType = null, entityId = null, compact = false, editsOnly = false }) => {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!entityType || !entityId) return undefined
        let cancelled = false
        gymkhanaEventsApi
            .getAuditTimeline(entityType, entityId)
            .then((res) => {
                if (cancelled) return
                // Endpoint uses sendRawResponse -> { items, pagination }
                setItems(res?.items || res?.data?.items || [])
                setError(null)
                setLoading(false)
            })
            .catch((err) => {
                if (cancelled) return
                setError(err.message || "Failed to load history")
                setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [entityType, entityId])

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

    const visible = editsOnly ? items.filter((item) => item.kind === "edit") : items

    if (visible.length === 0) {
        return (
            <div
                style={{
                    textAlign: "center",
                    padding: "var(--spacing-6)",
                    color: "var(--color-text-muted)",
                }}
            >
                <Clock size={32} style={{ margin: "0 auto var(--spacing-2)" }} />
                <p>{editsOnly ? "No edits yet" : "No history yet"}</p>
            </div>
        )
    }

    // Compact mode: one summary line per entry (edits only by default) — full
    // field-level detail lives in the detailed history popup.
    if (compact) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                {visible.map((item, idx) => {
                    const Icon = ACTION_ICONS[item.action] || Clock
                    const color = ACTION_COLORS[item.action] || "default"
                    const actor = item.actor || {}
                    const changeCount = Array.isArray(item.changes) ? item.changes.length : 0

                    return (
                        <div
                            key={item.id || idx}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--spacing-2)",
                                fontSize: "var(--font-size-xs)",
                            }}
                        >
                            <Icon size={14} style={{ color: `var(--color-${color})`, flexShrink: 0 }} />
                            <span style={{ color: "var(--color-text-body)", fontWeight: "var(--font-weight-medium)" }}>
                                {formatActionLabel(item.action)}
                            </span>
                            <span style={{ color: "var(--color-text-muted)" }}>by {actorName(actor)}</span>
                            {item.kind === "edit" && changeCount > 0 ? (
                                <span style={{ color: "var(--color-text-placeholder)" }}>
                                    · {changeCount} change{changeCount === 1 ? "" : "s"}
                                </span>
                            ) : null}
                            <span style={{ color: "var(--color-text-placeholder)", marginLeft: "auto" }}>
                                {formatTimestamp(item.at)}
                            </span>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            {visible.map((item, idx) => {
                const Icon = ACTION_ICONS[item.action] || Clock
                const color = ACTION_COLORS[item.action] || "default"
                const isEdit = item.kind === "edit"
                const changes = Array.isArray(item.changes) ? item.changes : []
                const safeComments = String(item?.comments || "").trim()
                const safeReason = String(item?.reason || "").trim()
                const actor = item.actor || {}

                return (
                    <div
                        key={item.id || idx}
                        style={{
                            display: "flex",
                            gap: "var(--spacing-3)",
                            paddingBottom: "var(--spacing-3)",
                            borderBottom:
                                idx < visible.length - 1
                                    ? "var(--border-1) solid var(--color-border-primary)"
                                    : "none",
                        }}
                    >
                        {/* Icon */}
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "var(--radius-full)",
                                backgroundColor: `var(--color-${color === "default" ? "bg-secondary" : color + "-bg"})`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Icon size={16} style={{ color: `var(--color-${color})` }} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--spacing-2)",
                                    marginBottom: "var(--spacing-1)",
                                    flexWrap: "wrap",
                                }}
                            >
                                <Badge variant={color}>{formatActionLabel(item.action)}</Badge>
                                {!isEdit && item.stage && (
                                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                                        by {formatStageLabel(item.stage)}
                                    </span>
                                )}
                                {isEdit && actor.role && (
                                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                                        {actor.subRole || actor.role}
                                    </span>
                                )}
                            </div>

                            <p
                                style={{
                                    fontSize: "var(--font-size-sm)",
                                    color: "var(--color-text-body)",
                                    marginBottom: changes.length || safeComments || safeReason ? "var(--spacing-2)" : "var(--spacing-1)",
                                }}
                            >
                                {actorName(actor)}
                            </p>

                            {/* Field-level diff for edits */}
                            {isEdit && changes.length > 0 && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "var(--spacing-1)",
                                        padding: "var(--spacing-2)",
                                        backgroundColor: "var(--color-bg-secondary)",
                                        borderRadius: "var(--radius-md)",
                                        marginBottom: "var(--spacing-1)",
                                    }}
                                >
                                    {changes.map((change, i) => (
                                        <ChangeRow key={`${change.field}-${i}`} change={change} />
                                    ))}
                                </div>
                            )}

                            {/* Reason (admin override) for edits */}
                            {isEdit && safeReason && (
                                <p
                                    style={{
                                        fontSize: "var(--font-size-xs)",
                                        color: "var(--color-text-muted)",
                                        fontStyle: "italic",
                                    }}
                                >
                                    Reason: {safeReason}
                                </p>
                            )}

                            {/* Comments for approval events */}
                            {!isEdit && safeComments && (
                                <p
                                    style={{
                                        fontSize: "var(--font-size-xs)",
                                        color: "var(--color-text-muted)",
                                        fontStyle: "italic",
                                    }}
                                >
                                    "{safeComments}"
                                </p>
                            )}

                            <p
                                style={{
                                    fontSize: "var(--font-size-xs)",
                                    color: "var(--color-text-placeholder)",
                                    marginTop: "var(--spacing-1)",
                                }}
                            >
                                {formatTimestamp(item.at)}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default AuditTimeline
