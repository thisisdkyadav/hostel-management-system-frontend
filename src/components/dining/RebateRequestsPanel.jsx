import { useState } from "react"
import { Button, StatusBadge, Table } from "czero/react"
import { HStack, Modal, Text, VStack } from "@/components/ui"
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
                  <Text as="div" weight="semibold" color="secondary">
                    {rebate.student?.name || "Student"}
                  </Text>
                  <Text as="div" color="muted" size="sm">
                    {rebate.rollNumber}
                  </Text>
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
                    <HStack gap={2}>
                      <Button variant="primary" size="sm" onClick={() => setApproveTarget(rebate)}>
                        <CheckCircle2 size={16} /> Approve
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setRejectTarget(rebate)}>
                        <XCircle size={16} /> Reject
                      </Button>
                    </HStack>
                  ) : (
                    <Text as="span" color="muted" size="sm">—</Text>
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
          <VStack gap={3}>
            <Text color="body" size="sm">
              Rejecting the request for <strong>{rejectTarget.rollNumber}</strong> (
              {formatDate(rejectTarget.startDate)} – {formatDate(rejectTarget.endDate)}).
            </Text>
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
          </VStack>
        </Modal>
      )}
    </>
  )
}

export default RebateRequestsPanel
