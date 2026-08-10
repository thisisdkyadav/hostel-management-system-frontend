/**
 * Approval History Component
 * Displays timeline of approval/rejection logs for calendars/proposals/expenses
 */

import { useState, useEffect, useCallback } from "react"
import { Badge, HStack, Spinner, Surface, Text, VStack } from "hzero"
import { Check, X, Send, Clock, FileText } from "lucide-react"
import { formatIndianDateTime } from "@/utils/formatters"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"

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

const formatStageLabel = (stage) =>
    stage === "Student Affairs" ? "Office - Student Affairs" : stage

const formatTimestamp = (value) => {
    if (!value) return "Date unavailable"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "Date unavailable"
    return formatIndianDateTime(date)
}

const ApprovalHistory = ({
    calendarId = null,
    proposalId = null,
    expenseId = null,
    megaProposalOccurrenceId = null,
    megaExpenseOccurrenceId = null,
}) => {
    const [loading, setLoading] = useState(true)
    const [history, setHistory] = useState([])
    const [error, setError] = useState(null)

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true)
            const res = megaProposalOccurrenceId
                ? await gymkhanaEventsApi.getMegaOccurrenceProposalHistory(megaProposalOccurrenceId)
                : megaExpenseOccurrenceId
                    ? await gymkhanaEventsApi.getMegaOccurrenceExpenseHistory(megaExpenseOccurrenceId)
                    : proposalId
                        ? await gymkhanaEventsApi.getProposalHistory(proposalId)
                        : expenseId
                            ? await gymkhanaEventsApi.getExpenseHistory(expenseId)
                            : await gymkhanaEventsApi.getCalendarHistory(calendarId)
            setHistory(res.data?.history || res.history || [])
        } catch (err) {
            setError(err.message || "Failed to load history")
        } finally {
            setLoading(false)
        }
    }, [calendarId, proposalId, expenseId, megaProposalOccurrenceId, megaExpenseOccurrenceId])

    useEffect(() => {
        if (calendarId || proposalId || expenseId || megaProposalOccurrenceId || megaExpenseOccurrenceId) {
            fetchHistory()
        }
    }, [calendarId, proposalId, expenseId, megaProposalOccurrenceId, megaExpenseOccurrenceId, fetchHistory])

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-6)" }}>
                <Spinner size="medium" />
            </div>
        )
    }

    if (error) {
        return (
            <Surface padding={4} color="danger" align="center">
                {error}
            </Surface>
        )
    }

    if (history.length === 0) {
        return (
            <Surface padding={6} color="muted" align="center">
                <Clock size={32} style={{ margin: "0 auto var(--spacing-2)" }} />
                <p>No approval history yet</p>
            </Surface>
        )
    }
    return (
        <VStack gap={3}>
            {history.map((log, idx) => {
                const Icon = ACTION_ICONS[log.action] || Clock
                const color = ACTION_COLORS[log.action] || "default"
                const safeComments = String(log?.comments || "").trim()
                const actionLabel = formatActionLabel(log.action)

                return (
                    <div
                        key={log._id || idx}
                        style={{
                            display: "flex",
                            gap: "var(--spacing-3)",
                            paddingBottom: "var(--spacing-3)",
                            borderBottom: idx < history.length - 1 ? "var(--border-1) solid var(--color-border-primary)" : "none",
                        }}
                    >
                        {/* Icon */}
                        <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: `var(--color-${color === "default" ? "bg-secondary" : color + "-bg"})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <Icon size={16} style={{ color: `var(--color-${color})` }} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <HStack gap={2} align="center" style={{ marginBottom: "var(--spacing-1)" }}>
                                <Badge variant={color}>
                                    {actionLabel}
                                </Badge>
                                <Text as="span" size="xs" color="muted">
                                    by {formatStageLabel(log.stage)}
                                </Text>
                            </HStack>

                            <Text size="sm" color="body" style={{ marginBottom: "var(--spacing-1)" }}>
                                {log.performedBy?.name || "Unknown"}
                            </Text>

                            {safeComments && (
                                <Text size="xs" color="muted" style={{ fontStyle: "italic" }}>
                                    "{safeComments}"
                                </Text>
                            )}

                            <Text size="xs" color="placeholder" style={{ marginTop: "var(--spacing-1)" }}>
                                {formatTimestamp(log.createdAt)}
                            </Text>
                        </div>
                    </div>
                )
            })}
        </VStack>
    )
}

export default ApprovalHistory
