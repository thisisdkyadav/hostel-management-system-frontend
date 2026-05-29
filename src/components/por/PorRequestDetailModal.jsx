import { useMemo, useState } from "react"
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Button, Modal } from "czero/react"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import PorApprovalHistory from "@/components/por/PorApprovalHistory"
import {
  Badge,
  Label,
  Select,
  Textarea,
} from "@/components/ui"
import {
  SectionHeader,
  eventDetailMetaChipStyles,
  infoBoxStyle,
} from "@/components/gymkhana/events-page/sharedPrimitives"
import "../../styles/por-requests.css"

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

const detailBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-4)",
}

const detailTextStyle = {
  color: "var(--color-text-body)",
  fontSize: "var(--font-size-sm)",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
}

const metaBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-3)",
  flexWrap: "wrap",
  paddingBottom: "var(--spacing-3)",
  borderBottom: "1px solid var(--color-border-primary)",
}

const metaBarLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
  flexWrap: "wrap",
}

const buildMetaChipStyle = (extra = {}) => ({
  ...eventDetailMetaChipStyles,
  ...extra,
})

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

const renderStudentAvatar = (name) => {
  const initials = String(name || "S")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return <div className="por-student-avatar">{initials}</div>
}

const PorDetailCard = ({
  icon: Icon,
  title,
  accentColor = "var(--color-primary)",
  children,
  headerAction = null,
}) => (
  <div className="por-detail-card">
    <div className="por-detail-card-header">
      <div className="por-detail-card-header-left">
        <span
          className="por-detail-card-icon-wrapper"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            color: accentColor,
          }}
        >
          {Icon && <Icon size={14} />}
        </span>
        <h4 className="por-detail-card-title">{title}</h4>
      </div>
      {headerAction}
    </div>
    <div className="por-detail-card-body">{children}</div>
  </div>
)

const PorDetailInfoRow = ({ label, value }) => (
  <div className="por-detail-info-row">
    <span className="por-detail-info-label">{label}</span>
    <span className="por-detail-info-value">{value}</span>
  </div>
)

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
      title="POR Request Details"
      width={1080}
      minHeight="50vh"
      closeButtonVariant="button"
    >
      <div style={detailBodyStyle}>
        <div style={metaBarStyle}>
          <div style={metaBarLeftStyle}>
            <span className="por-detail-meta-chip por-detail-meta-chip-id">
              {request.id}
            </span>
            <Badge variant={getStatusVariant(request.status)}>{formatStatusLabel(request.status)}</Badge>
            <span className="por-detail-meta-chip">{request.porCategoryName || "—"}</span>
            <span className="por-detail-meta-chip">
              <ShieldCheck size={12} />
              {formatStageLabel(request.currentApprovalStage)}
            </span>
            <span className="por-detail-meta-chip">
              <CalendarDays size={12} />
              Submitted {formatDateTime(request.createdAt)}
            </span>
          </div>

          <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
            {request?.permissions?.canEdit ? (
              <Button variant="secondary" size="sm" onClick={onEdit}>
                Edit & Resubmit
              </Button>
            ) : null}
          </div>
        </div>

        <div
          className="grid grid-cols-1 xl:grid-cols-3"
          style={{ gap: "var(--spacing-4)", alignItems: "start" }}
        >
          <div
            className="xl:col-span-2"
            style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}
          >
            <PorDetailCard
              icon={FileText}
              title="POR Submission"
              accentColor="var(--color-primary)"
            >
              <div style={{ display: "grid", gap: "var(--spacing-4)" }}>
                <div className="por-detail-hero-box">
                  <div className="por-detail-hero-title">
                    {request.positionTitle || "—"}
                  </div>
                  <div className="por-detail-hero-subtitle">
                    Tenure: {request.tenure || "—"}
                  </div>
                </div>

                <SectionHeader>Responsibilities</SectionHeader>
                <div style={detailTextStyle}>{request.positionDetails || "—"}</div>

                <SectionHeader>Supporting Document</SectionHeader>
                {request.supportingDocumentUrl ? (
                  <PdfUploadField
                    label="Supporting PDF"
                    value={request.supportingDocumentUrl}
                    onChange={() => {}}
                    disabled
                    uploadedText={request.supportingDocumentName || "Supporting PDF uploaded"}
                    viewerTitle="POR Supporting Document"
                    viewerSubtitle="Uploaded supporting PDF"
                    downloadFileName={request.supportingDocumentName || "por-document.pdf"}
                  />
                ) : (
                  <div className="por-detail-info-grid">
                    <div style={detailTextStyle}>
                      No supporting PDF attached.
                    </div>
                  </div>
                )}
              </div>
            </PorDetailCard>

            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "var(--spacing-4)" }}>
              <PorDetailCard
                icon={Users}
                title="Student Details"
                accentColor="var(--color-info)"
                headerAction={
                  canViewStudentProfile ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onOpenStudentProfile}
                    >
                      View Profile
                    </Button>
                  ) : null
                }
              >
                <div className="por-student-profile-header">
                  {renderStudentAvatar(request.student?.name)}
                  <div className="por-student-profile-info">
                    <span className="por-student-profile-name">{request.student?.name || "—"}</span>
                    <span className="por-student-profile-roll">{request.student?.rollNumber || "—"}</span>
                  </div>
                </div>
                <div className="por-detail-info-grid">
                  <PorDetailInfoRow label="Email" value={request.student?.email || "—"} />
                  <PorDetailInfoRow label="Department" value={request.student?.department || "—"} />
                  <PorDetailInfoRow label="Degree" value={request.student?.degree || "—"} />
                  <PorDetailInfoRow label="Batch" value={request.student?.batch || "—"} />
                </div>
              </PorDetailCard>

              <PorDetailCard
                icon={Building2}
                title="Routing Details"
                accentColor="var(--color-success)"
              >
                <div className="por-detail-info-grid">
                  <PorDetailInfoRow label="POR Category" value={request.porCategoryName || "—"} />
                  <PorDetailInfoRow label="Club" value={request.club?.name || "—"} />
                  <PorDetailInfoRow
                    label="Current Stage"
                    value={formatStageLabel(request.currentApprovalStage)}
                  />
                  <PorDetailInfoRow
                    label="Current Reviewer"
                    value={formatCurrentReviewerLabel(request)}
                  />
                  <PorDetailInfoRow
                    label="Last Updated"
                    value={formatDateTime(request.updatedAt)}
                  />
                </div>
              </PorDetailCard>
            </div>

            <PorDetailCard
              icon={request.hasDisciplinaryAction ? ShieldAlert : ShieldCheck}
              title="Disciplinary Disclosure"
              accentColor={request.hasDisciplinaryAction ? "var(--color-danger)" : "var(--color-success)"}
            >
              {request.hasDisciplinaryAction ? (
                <div className="por-detail-alert-card">
                  <div style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-danger)", marginBottom: "var(--spacing-2)", fontSize: "var(--font-size-sm)" }}>
                    Disciplinary Action Disclosed
                  </div>
                  <div style={detailTextStyle}>
                    {request.disciplinaryActionDetails || "No details provided."}
                  </div>
                </div>
              ) : (
                <div className="por-detail-success-card">
                  <div style={{ fontWeight: "var(--font-weight-bold)", color: "var(--color-success)", fontSize: "var(--font-size-sm)" }}>
                    ✓ No Disciplinary Action Declared
                  </div>
                  <div style={{ ...detailTextStyle, marginTop: "var(--spacing-1)", fontSize: "var(--font-size-xs)" }}>
                    The student has declared that they have no past or active disciplinary actions.
                  </div>
                </div>
              )}
            </PorDetailCard>

            {canAct ? (
              <PorDetailCard
                icon={BadgeCheck}
                title="Review Decision"
                accentColor="var(--color-primary)"
              >
                <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                  <div>
                    <Label htmlFor="por-review-comment">
                      {isStudentAffairsApproval ? "Review Comment & Next Recommenders" : "Review Comment"}
                    </Label>
                    <Textarea
                      id="por-review-comment"
                      value={reviewComment}
                      onChange={(event) => onReviewCommentChange?.(event.target.value)}
                      rows={5}
                      placeholder="Add comments for approval, modification, or rejection"
                    />
                  </div>

                  {isStudentAffairsApproval ? (
                    <div style={infoBoxStyle}>
                      <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Next Recommenders
                      </span>
                      <div
                        className="grid grid-cols-1 gap-3"
                        style={{ marginTop: "var(--spacing-2)" }}
                      >
                        {POST_SA_STAGE_ORDER.map((stage) => (
                          <div key={stage}>
                            <Label htmlFor={`por-approver-${stage}`}>{stage}</Label>
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
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={onRequestRevision}
                      disabled={actionLoading || !String(reviewComment || "").trim()}
                      loading={actionLoading === "revision"}
                    >
                      Modification Required
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
                        Recommend & Forward
                      </Button>
                    ) : null}
                    <Button
                      onClick={isStudentAffairsApproval ? onDirectApprove : onApprove}
                      disabled={actionLoading || (isStudentAffairsApproval && selectedPostSaApproverCount > 0)}
                      loading={actionLoading === (isStudentAffairsApproval ? "direct-approve" : "approve")}
                    >
                      {isStudentAffairsApproval ? "Approve" : primaryDecisionLabel}
                    </Button>
                  </div>
                </div>
              </PorDetailCard>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <PorDetailCard
              icon={Clock3}
              title="Approval History"
              accentColor="var(--color-text-heading)"
              headerAction={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFullHistoryModal(true)}
                >
                  More Details
                </Button>
              }
            >
              <PorApprovalHistory porRequestId={request.id} compact />
            </PorDetailCard>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showFullHistoryModal}
        onClose={() => setShowFullHistoryModal(false)}
        title="Approval History Details"
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
