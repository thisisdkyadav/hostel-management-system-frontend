/**
 * Approval History Component
 * Displays timeline of approval/rejection logs for calendars/proposals/expenses
 */

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/data-display"
import { Spinner } from "@/components/ui/feedback"
import { Check, X, Send, Clock, FileText } from "lucide-react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"

const ACTION_ICONS = {
    submitted: Send,
    approved: Check,
    rejected: X,
    revision_requested: FileText,
}

const ACTION_COLORS = {
    submitted: "info",
    approved: "success",
    rejected: "danger",
    revision_requested: "warning",
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
            <div style={{ color: "var(--color-danger)", textAlign: "center", padding: "var(--spacing-4)" }}>
                {error}
            </div>
        )
    }

    if (history.length === 0) {
        return (
            <div style={{
                textAlign: "center",
                padding: "var(--spacing-6)",
                color: "var(--color-text-muted)"
            }}>
                <Clock size={32} style={{ margin: "0 auto var(--spacing-2)" }} />
                <p>No approval history yet</p>
            </div>
        )
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            {history.map((log, idx) => {
                const Icon = ACTION_ICONS[log.action] || Clock
                const color = ACTION_COLORS[log.action] || "default"

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
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-1)" }}>
                                <Badge variant={color}>
                                    {log.action?.replace(/_/g, " ")}
                                </Badge>
                                <span style={{
                                    fontSize: "var(--font-size-xs)",
                                    color: "var(--color-text-muted)"
                                }}>
                                    by {log.stage}
                                </span>
                            </div>

                            <p style={{
                                fontSize: "var(--font-size-sm)",
                                color: "var(--color-text-body)",
                                marginBottom: "var(--spacing-1)"
                            }}>
                                {log.performedBy?.name || "Unknown"}
                            </p>

                            {log.comments && (
                                <p style={{
                                    fontSize: "var(--font-size-xs)",
                                    color: "var(--color-text-muted)",
                                    fontStyle: "italic",
                                }}>
                                    "{log.comments}"
                                </p>
                            )}

                            <p style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--color-text-placeholder)",
                                marginTop: "var(--spacing-1)"
                            }}>
                                {new Date(log.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ApprovalHistory
