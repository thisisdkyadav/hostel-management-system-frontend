import { useMemo, useState } from "react"
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  Clock3,
  FileText,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Avatar, Badge, Button, DetailSection, Divider, Field, Grid, HStack, InfoRow, Modal, Select, Text, Textarea, VStack } from "hzero"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import PorApprovalHistory from "@/components/por/PorApprovalHistory"

const POST_SA_STAGE_ORDER = [
  "Officer SA",
  "Associate Dean SA",
  "Dean SA",
]

const STATUS_META = {
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

const formatStatusLabel = (status) => STATUS_META[status]?.label || status || "Unknown"
const getStatusVariant = (status) => STATUS_META[status]?.variant || "default"

const formatStageLabel = (stage) => {
  if (stage === "Student Affairs") return "Office - Student Affairs"
  return stage || "Completed"
}

const formatDateTime = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

const bodyTextStyle = { whiteSpace: "pre-wrap" }

const countSelectedPostSaApprovers = (assignments = {}) =>
  POST_SA_STAGE_ORDER.reduce(
    (count, stage) => count + (String(assignments?.[stage] || "").trim() ? 1 : 0),
    0
  )

const formatCurrentReviewerLabel = (request) => {
  const currentApproverUsers = Array.isArray(request?.currentApproverUsers)
    ? request.currentApproverUsers.filter(Boolean)
    : []

  if (currentApproverUsers.length > 0) {
    return currentApproverUsers
      .map((user) => user?.name || user?.email || user?.subRole || "Reviewer")
      .join(", ")
  }

  if (request?.currentApproverUser?.name) {
    return request.currentApproverUser.name
  }

  if (request?.currentApproverUser?.email) {
    return request.currentApproverUser.email
  }

  return "—"
}

const PorRequestDetailModal = ({
  isOpen,
  request,
  viewer,
  approversByStage = {},
  reviewComment = "",
  onReviewCommentChange,
  postSaAssignments = {},
  onPostSaAssignmentChange,
  onClose,
  onApprove,
  onDirectApprove,
  onReject,
  onRequestRevision,
  onEdit,
  actionLoading = "",
  canViewStudentProfile = false,
  onOpenStudentProfile,
  onGenerateCertificate,
  isGeneratingCertificate = false,
}) => {
  const [showFullHistoryModal, setShowFullHistoryModal] = useState(false)
  const canAct = Boolean(request?.permissions?.canApprove)
  const isStudentAffairsApproval =
    viewer?.canSelectPostApprovers && request?.status === "pending_student_affairs"
  const primaryDecisionLabel = request?.currentApprovalStage === "Dean SA" ? "Approve" : "Recommend"
  const selectedPostSaApproverCount = useMemo(
    () => countSelectedPostSaApprovers(postSaAssignments),
    [postSaAssignments]
  )

  if (!isOpen || !request) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="POR request details"
      width={1080}
      minHeight="50vh"
      closeButtonVariant="button"
    >
      <VStack gap={4}>
        <VStack gap={3}>
          <HStack gap={3} align="center" justify="between" wrap>
            <HStack gap={2} align="center" wrap>
              <Badge variant="outline" size="small">{request.id}</Badge>
              <Badge variant={getStatusVariant(request.status)} size="small">
                {formatStatusLabel(request.status)}
              </Badge>
              <Badge size="small">{request.porCategoryName || "—"}</Badge>
              <Badge size="small" icon={<ShieldCheck />}>
                {formatStageLabel(request.currentApprovalStage)}
              </Badge>
              <Badge size="small" icon={<CalendarDays />}>
                Submitted {formatDateTime(request.createdAt)}
              </Badge>
            </HStack>

            <HStack gap={2} wrap>
              {onGenerateCertificate ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onGenerateCertificate(request)}
                  loading={isGeneratingCertificate}
                >
                  <BadgeCheck size={15} /> Generate certificate
                </Button>
              ) : null}
              {request?.permissions?.canEdit ? (
                <Button variant="secondary" size="sm" onClick={onEdit}>
                  Edit & resubmit
                </Button>
              ) : null}
            </HStack>
          </HStack>

          <Divider spacing="none" />
        </VStack>

        <Grid cols={{ base: 1, xl: 3 }} gap={4} align="start">
          <VStack gap={4} className="xl:col-span-2">
            <DetailSection title="POR submission" icon={FileText}>
              <InfoRow label="Position" value={request.positionTitle || "—"} strong />
              <InfoRow label="Tenure" value={request.tenure || "—"} />
            </DetailSection>

            <DetailSection title="Responsibilities" icon={ClipboardList}>
              <Text size="sm" color="body" leading="var(--line-height-relaxed)" style={bodyTextStyle}>
                {request.positionDetails || "—"}
              </Text>
            </DetailSection>

            <DetailSection title="Supporting document" icon={Paperclip}>
              {request.supportingDocumentUrl ? (
                <PdfUploadField
                  label="Supporting PDF"
                  value={request.supportingDocumentUrl}
                  onChange={() => {}}
                  disabled
                  uploadedText={request.supportingDocumentName || "Supporting PDF uploaded"}
                  viewerTitle="POR supporting document"
                  viewerSubtitle="Uploaded supporting PDF"
                  downloadFileName={request.supportingDocumentName || "por-document.pdf"}
                />
              ) : (
                <Text size="sm" color="muted">No supporting PDF attached.</Text>
              )}
            </DetailSection>

            <Grid cols={{ base: 1, lg: 2 }} gap={4} align="start">
              <DetailSection
                title="Student details"
                icon={Users}
                actions={
                  canViewStudentProfile ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onOpenStudentProfile}
                    >
                      View profile
                    </Button>
                  ) : null
                }
              >
                <HStack gap={3} align="center">
                  <Avatar name={request.student?.name || "S"} size="small" />
                  <VStack gap="none">
                    <Text as="span" size="sm" weight="semibold" color="heading">
                      {request.student?.name || "—"}
                    </Text>
                    <Text as="span" size="xs" color="muted">
                      {request.student?.rollNumber || "—"}
                    </Text>
                  </VStack>
                </HStack>

                <InfoRow label="Email" value={request.student?.email || "—"} />
                <InfoRow label="Department" value={request.student?.department || "—"} />
                <InfoRow label="Degree" value={request.student?.degree || "—"} />
                <InfoRow label="Batch" value={request.student?.batch || "—"} />
              </DetailSection>

              <DetailSection title="Routing details" icon={Building2}>
                <InfoRow label="POR category" value={request.porCategoryName || "—"} />
                <InfoRow label="Club" value={request.club?.name || "—"} />
                <InfoRow
                  label="Current stage"
                  value={formatStageLabel(request.currentApprovalStage)}
                />
                <InfoRow
                  label="Current reviewer"
                  value={formatCurrentReviewerLabel(request)}
                />
                <InfoRow
                  label="Last updated"
                  value={formatDateTime(request.updatedAt)}
                />
              </DetailSection>
            </Grid>

            <DetailSection
              title="Disciplinary disclosure"
              icon={request.hasDisciplinaryAction ? ShieldAlert : ShieldCheck}
              tone={request.hasDisciplinaryAction ? "danger" : "success"}
            >
              {request.hasDisciplinaryAction ? (
                <>
                  <Text as="div" size="sm" weight="semibold" color="danger-text">
                    Disciplinary action disclosed
                  </Text>
                  <Text size="sm" color="body" leading="var(--line-height-relaxed)" style={bodyTextStyle}>
                    {request.disciplinaryActionDetails || "No details provided."}
                  </Text>
                </>
              ) : (
                <>
                  <Text as="div" size="sm" weight="semibold" color="success-text">
                    No disciplinary action declared
                  </Text>
                  <Text size="xs" color="body">
                    The student has declared that they have no past or active disciplinary actions.
                  </Text>
                </>
              )}
            </DetailSection>

            {canAct ? (
              <DetailSection title="Review decision" icon={BadgeCheck} tone="primary">
                <Field
                  label={isStudentAffairsApproval ? "Review comment & next recommenders" : "Review comment"}
                  htmlFor="por-review-comment"
                >
                  <Textarea
                    id="por-review-comment"
                    value={reviewComment}
                    onChange={(event) => onReviewCommentChange?.(event.target.value)}
                    rows={5}
                    placeholder="Add comments for approval, modification, or rejection"
                  />
                </Field>

                {isStudentAffairsApproval ? (
                  <VStack gap={3}>
                    <Text as="span" size="xs" weight="semibold" color="muted">
                      Next recommenders
                    </Text>
                    <Grid cols={1} gap={3}>
                      {POST_SA_STAGE_ORDER.map((stage) => (
                        <Field key={stage} label={stage} htmlFor={`por-approver-${stage}`}>
                          <Select
                            id={`por-approver-${stage}`}
                            value={postSaAssignments[stage] || ""}
                            onChange={(event) => onPostSaAssignmentChange?.(stage, event.target.value)}
                            options={(approversByStage?.[stage] || []).map((option) => ({
                              value: option.userId || option.value,
                              label: option.label,
                            }))}
                            placeholder="Optional"
                          />
                        </Field>
                      ))}
                    </Grid>
                  </VStack>
                ) : null}

                <HStack justify="end" gap={3} wrap>
                  <Button
                    variant="secondary"
                    onClick={onRequestRevision}
                    disabled={actionLoading || !String(reviewComment || "").trim()}
                    loading={actionLoading === "revision"}
                  >
                    Modification required
                  </Button>
                  <Button
                    variant="danger"
                    onClick={onReject}
                    disabled={actionLoading || !String(reviewComment || "").trim()}
                    loading={actionLoading === "reject"}
                  >
                    Reject
                  </Button>
                  {isStudentAffairsApproval ? (
                    <Button
                      variant="secondary"
                      onClick={onApprove}
                      disabled={actionLoading || selectedPostSaApproverCount === 0}
                      loading={actionLoading === "approve"}
                    >
                      Recommend & forward
                    </Button>
                  ) : null}
                  <Button
                    onClick={isStudentAffairsApproval ? onDirectApprove : onApprove}
                    disabled={actionLoading || (isStudentAffairsApproval && selectedPostSaApproverCount > 0)}
                    loading={actionLoading === (isStudentAffairsApproval ? "direct-approve" : "approve")}
                  >
                    {isStudentAffairsApproval ? "Approve" : primaryDecisionLabel}
                  </Button>
                </HStack>
              </DetailSection>
            ) : null}
          </VStack>

          <DetailSection
            title="Approval history"
            icon={Clock3}
            plain
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFullHistoryModal(true)}
              >
                More details
              </Button>
            }
          >
            <PorApprovalHistory porRequestId={request.id} compact />
          </DetailSection>
        </Grid>
      </VStack>

      <Modal
        isOpen={showFullHistoryModal}
        onClose={() => setShowFullHistoryModal(false)}
        title="Approval history details"
        width={980}
        minHeight="50vh"
        closeButtonVariant="button"
      >
        <PorApprovalHistory porRequestId={request.id} />
      </Modal>
    </Modal>
  )
}

export default PorRequestDetailModal
