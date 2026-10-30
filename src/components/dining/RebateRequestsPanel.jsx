import { useState } from "react"
import { Badge, Button, Checkbox, ConfirmDialog, EmptyState, Field, HStack, InfoRow, Modal, Spinner, StatusBadge, Surface, Table, Text, Textarea, VStack } from "hzero"
import { CalendarRange, CheckCircle2, Download, Eye, XCircle } from "lucide-react"
import PdfViewerModal from "@/components/common/pdf/PdfViewerModal"
import { getMediaDownloadUrl } from "@/utils/mediaUtils"
import { formatDate, formatDateTime, formatRebateStatus, getRebateWhereLines, formatRebateType, rebateStatusTone } from "./diningPeriodHelpers"

const hasMessage = (rebate) => Boolean(String(rebate?.reason || "").trim())
const needsFormCheck = (rebate) => rebate?.type === "long-term" && Boolean(rebate?.form?.ref)

/** Where the rebate's days land (period range · caterer (days)), one line per placement. */
const RebateWhere = ({ rebate }) => {
  const lines = getRebateWhereLines(rebate)
  if (lines.length === 0) {
    return (
      <Text as="span" color="muted" size="sm">
        -
      </Text>
    )
  }
  return (
    <VStack gap="none">
      {lines.map((line) => (
        <Text as="div" size="sm" color={line.key === "unplaced" ? "muted" : "body"} key={line.key}>
          {line.label}
        </Text>
      ))}
    </VStack>
  )
}

const typeVariant = (type) => (type === "long-term" ? "warning" : "info")

/**
 * Rebate queue for Admin and Dining Office. Renders rebates of any type/status.
 * Every row opens a details modal (student's message, submitted form for
 * long-term rebates); Approve/Reject appear on pending rows and in that modal.
 * Approve goes through a ConfirmDialog (long-term rebates with a form instead
 * need an "I have checked the submitted form" tick); Reject opens a reason modal.
 */
const RebateRequestsPanel = ({ rebates, loading, onApprove, onReject, emptyMessage }) => {
  const [detailsTarget, setDetailsTarget] = useState(null)
  const [viewFormTarget, setViewFormTarget] = useState(null)
  const [formChecked, setFormChecked] = useState(false)
  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectComment, setRejectComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const closeReject = () => {
    setRejectTarget(null)
    setRejectComment("")
  }

  const openApprove = (rebate) => {
    setDetailsTarget(null)
    setFormChecked(false)
    setApproveTarget(rebate)
  }

  const openReject = (rebate) => {
    setDetailsTarget(null)
    setRejectTarget(rebate)
  }

  const closeApprove = () => {
    setApproveTarget(null)
    setFormChecked(false)
  }

  const confirmApprove = async () => {
    if (!approveTarget) return
    if (needsFormCheck(approveTarget) && !formChecked) return
    setSubmitting(true)
    try {
      await onApprove(approveTarget)
      closeApprove()
    } finally {
      setSubmitting(false)
    }
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
        message={emptyMessage || "Rebate requests will appear here."}
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
              <Table.Head>Dates</Table.Head>
              <Table.Head>Where</Table.Head>
              <Table.Head>Days</Table.Head>
              <Table.Head>Type</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Message</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rebates.map((rebate) => (
              <Table.Row key={rebate.id} onClick={() => setDetailsTarget(rebate)} style={{ cursor: "pointer" }}>
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
                <Table.Cell>
                  <RebateWhere rebate={rebate} />
                </Table.Cell>
                <Table.Cell>{rebate.dayCount}</Table.Cell>
                <Table.Cell>{formatRebateType(rebate.type)}</Table.Cell>
                <Table.Cell>
                  <StatusBadge status={formatRebateStatus(rebate.status)} tone={rebateStatusTone(rebate.status)} />
                </Table.Cell>
                <Table.Cell>
                  {hasMessage(rebate) ? (
                    <Text
                      as="div"
                      size="sm"
                      color="body"
                      title={rebate.reason}
                      style={{ maxWidth: "16rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {rebate.reason}
                    </Text>
                  ) : (
                    <Text as="span" color="muted" size="sm">—</Text>
                  )}
                </Table.Cell>
                <Table.Cell onClick={(event) => event.stopPropagation()}>
                  <HStack gap={2}>
                    <Button variant="secondary" size="sm" onClick={() => setDetailsTarget(rebate)}>
                      <Eye size={16} /> View
                    </Button>
                    {rebate.status === "pending" && (
                      <>
                        <Button variant="primary" size="sm" onClick={() => openApprove(rebate)}>
                          <CheckCircle2 size={16} /> Approve
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => openReject(rebate)}>
                          <XCircle size={16} /> Reject
                        </Button>
                      </>
                    )}
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {detailsTarget && (
        <Modal
          isOpen
          onClose={() => setDetailsTarget(null)}
          title="Rebate Request"
          width={560}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDetailsTarget(null)}>
                Close
              </Button>
              {detailsTarget.status === "pending" && (
                <>
                  <Button variant="secondary" onClick={() => openReject(detailsTarget)}>
                    <XCircle size={16} /> Reject
                  </Button>
                  <Button variant="primary" onClick={() => openApprove(detailsTarget)}>
                    <CheckCircle2 size={16} /> Approve
                  </Button>
                </>
              )}
            </>
          }
        >
          <VStack gap={4}>
            <VStack gap={1}>
              <InfoRow label="Student" value={detailsTarget.student?.name || "Student"} />
              <InfoRow label="Roll number" value={detailsTarget.rollNumber || "-"} />
              <InfoRow label="Dates" value={`${formatDate(detailsTarget.startDate)} – ${formatDate(detailsTarget.endDate)}`} />
              <InfoRow label="Where" value={<RebateWhere rebate={detailsTarget} />} />
              <InfoRow label="Days" value={detailsTarget.dayCount} />
              <InfoRow label="Type" value={<Badge variant={typeVariant(detailsTarget.type)} size="sm">{formatRebateType(detailsTarget.type)}</Badge>} />
              <InfoRow
                label="Status"
                value={<StatusBadge status={formatRebateStatus(detailsTarget.status)} tone={rebateStatusTone(detailsTarget.status)} />}
              />
            </VStack>

            <VStack gap={1}>
              <Text weight="semibold" size="sm" color="secondary">Student&apos;s message</Text>
              <Surface bg="var(--color-bg-secondary)" padding="var(--spacing-3)" radius="md" style={{ border: "var(--border-1) solid var(--color-border-primary)" }}>
                {hasMessage(detailsTarget) ? (
                  <Text as="div" size="sm" color="body" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {detailsTarget.reason}
                  </Text>
                ) : (
                  <Text as="div" size="sm" color="muted">No message</Text>
                )}
              </Surface>
            </VStack>

            {String(detailsTarget.adminComment || "").trim() && (
              <VStack gap={1}>
                <Text weight="semibold" size="sm" color="secondary">Admin comment</Text>
                <Text as="div" size="sm" color="body" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {detailsTarget.adminComment}
                </Text>
              </VStack>
            )}

            {detailsTarget.type === "long-term" && (
              <VStack gap={2}>
                <Text weight="semibold" size="sm" color="secondary">Submitted form</Text>
                {detailsTarget.form?.ref ? (
                  <HStack gap={2} align="center" justify="between" wrap>
                    <Text as="span" size="sm" color="body">
                      {detailsTarget.form.name || "Rebate form"}
                      {detailsTarget.form.uploadedAt ? ` · uploaded ${formatDateTime(detailsTarget.form.uploadedAt)}` : ""}
                    </Text>
                    <HStack gap={2}>
                      <Button size="sm" variant="secondary" onClick={() => setViewFormTarget(detailsTarget.form)}>
                        <Eye size={14} /> Open
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(getMediaDownloadUrl(detailsTarget.form.ref), "_blank", "noopener")}
                      >
                        <Download size={14} /> Download
                      </Button>
                    </HStack>
                  </HStack>
                ) : (
                  <Text as="div" size="sm" color="muted">No form submitted</Text>
                )}
              </VStack>
            )}
          </VStack>
        </Modal>
      )}

      <PdfViewerModal
        isOpen={Boolean(viewFormTarget)}
        onClose={() => setViewFormTarget(null)}
        documentUrl={viewFormTarget?.ref}
        title="Submitted rebate form"
        subtitle={viewFormTarget?.name || "Long-term rebate form"}
        downloadFileName={viewFormTarget?.name || "rebate-form.pdf"}
      />

      {approveTarget && !needsFormCheck(approveTarget) && (
        <ConfirmDialog
          isOpen
          onClose={closeApprove}
          onConfirm={confirmApprove}
          title="Approve Rebate"
          message={`Approve rebate for ${approveTarget.rollNumber} from ${formatDate(approveTarget.startDate)} to ${formatDate(approveTarget.endDate)} (${approveTarget.dayCount} days)?`}
          confirmText="Approve"
        />
      )}

      {approveTarget && needsFormCheck(approveTarget) && (
        <Modal
          isOpen
          onClose={closeApprove}
          title="Approve Rebate"
          width={460}
          footer={
            <>
              <Button variant="secondary" onClick={closeApprove} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmApprove} loading={submitting} disabled={!formChecked || submitting}>
                Approve
              </Button>
            </>
          }
        >
          <VStack gap={3}>
            <Text color="body" size="sm">
              Approve rebate for <strong>{approveTarget.rollNumber}</strong> from {formatDate(approveTarget.startDate)} to{" "}
              {formatDate(approveTarget.endDate)} ({approveTarget.dayCount} days)?
            </Text>
            <HStack gap={2}>
              <Button size="sm" variant="secondary" onClick={() => setViewFormTarget(approveTarget.form)}>
                <Eye size={14} /> Open submitted form
              </Button>
            </HStack>
            <Checkbox checked={formChecked} onChange={(event) => setFormChecked(event.target.checked)} label="I have checked the submitted form" />
          </VStack>
        </Modal>
      )}

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
            <Field label="Reason / comment (optional)" htmlFor="reject-comment">
              <Textarea
                id="reject-comment"
                rows={3}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Shared with the student so they understand the decision."
              />
            </Field>
          </VStack>
        </Modal>
      )}
    </>
  )
}

export default RebateRequestsPanel
