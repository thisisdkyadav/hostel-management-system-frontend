import { useState } from "react"
import { Button, Modal, StatusBadge, Table } from "czero/react"
import { CalendarRange, CheckCircle2, XCircle } from "lucide-react"
import { ConfirmDialog, EmptyState, Label, Spinner, Textarea } from "@/components/ui"
import { formatDate, formatRebateStatus, formatRebateType, rebateStatusTone } from "./diningPeriodHelpers"

/**
 * Long-term rebate queue. Renders rebates of any status; Approve/Reject
 * actions only appear for pending rows. Approve goes through a ConfirmDialog;
 * Reject opens a reason modal — both replace the old window.confirm/prompt.
 */
const RebateRequestsPanel = ({ rebates, loading, onApprove, onReject, emptyMessage }) => {
  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectComment, setRejectComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const closeReject = () => {
    setRejectTarget(null)
    setRejectComment("")
  }

  const confirmApprove = async () => {
    if (!approveTarget) return
    await onApprove(approveTarget)
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    setSubmitting(true)
    try {
      await onReject(rejectTarget, rejectComment.trim())
      closeReject()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-10)" }}>
        <Spinner size="large" />
      </div>
    )
  }

  if (rebates.length === 0) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="No Requests"
        message={emptyMessage || "Long-term rebate requests will appear here."}
      />
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Student</Table.Head>
              <Table.Head>Period</Table.Head>
              <Table.Head>Caterer</Table.Head>
              <Table.Head>Days</Table.Head>
              <Table.Head>Type</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rebates.map((rebate) => (
              <Table.Row key={rebate.id}>
                <Table.Cell>
                  <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>
                    {rebate.student?.name || "Student"}
                  </div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    {rebate.rollNumber}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {formatDate(rebate.startDate)} – {formatDate(rebate.endDate)}
                </Table.Cell>
                <Table.Cell>{rebate.caterer?.name || "-"}</Table.Cell>
                <Table.Cell>{rebate.dayCount}</Table.Cell>
                <Table.Cell>{formatRebateType(rebate.type)}</Table.Cell>
                <Table.Cell>
                  <StatusBadge status={formatRebateStatus(rebate.status)} tone={rebateStatusTone(rebate.status)} />
                </Table.Cell>
                <Table.Cell>
                  {rebate.status === "pending" ? (
                    <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                      <Button variant="primary" size="sm" onClick={() => setApproveTarget(rebate)}>
                        <CheckCircle2 size={16} /> Approve
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setRejectTarget(rebate)}>
                        <XCircle size={16} /> Reject
                      </Button>
                    </div>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>—</span>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        onConfirm={confirmApprove}
        title="Approve Rebate"
        message={
          approveTarget
            ? `Approve rebate for ${approveTarget.rollNumber} from ${formatDate(approveTarget.startDate)} to ${formatDate(approveTarget.endDate)} (${approveTarget.dayCount} days)?`
            : ""
        }
        confirmText="Approve"
      />

      {rejectTarget && (
        <Modal
          isOpen={Boolean(rejectTarget)}
          onClose={closeReject}
          title="Reject Rebate"
          width={460}
          footer={
            <>
              <Button variant="secondary" onClick={closeReject} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmReject} loading={submitting}>
                Reject Request
              </Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <p style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
              Rejecting the request for <strong>{rejectTarget.rollNumber}</strong> (
              {formatDate(rejectTarget.startDate)} – {formatDate(rejectTarget.endDate)}).
            </p>
            <div>
              <Label htmlFor="reject-comment">Reason / comment (optional)</Label>
              <Textarea
                id="reject-comment"
                rows={3}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Shared with the student so they understand the decision."
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default RebateRequestsPanel
