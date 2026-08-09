import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import StudentDetailModal from "@/components/common/students/StudentDetailModal"
import { Badge, Button, Checkbox, Field, Grid, HStack, Label, Modal, Select, Surface, Text, Textarea, VStack } from "hzero"
import { BadgeCheck, FileText, ShieldCheck, Users } from "lucide-react"
import { POST_SA_STAGE_ORDER, detailBodyStyle, detailTextStyle, formatStageLabel, formatStatusLabel, getStatusVariant, metaBarLeftStyle, metaBarStyle } from "@/components/por/porStatus"
import { PorDetailCard, PorDetailInfoRow } from "@/components/por/PorDetailCard"
import { renderStudentAvatar } from "@/components/por/studentAvatar"
import { countSelectedPostSaApprovers } from "./form"
import { infoBoxStyle, sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"
import { studentApi } from "@/service"
import { useEffect, useState } from "react"

export const PorRequestGroupModal = ({
  isOpen,
  group,
  viewer,
  approversByStage,
  useCommonComment,
  onUseCommonCommentChange,
  commonReviewComment,
  onCommonReviewCommentChange,
  perRequestComments,
  onPerRequestCommentChange,
  postSaAssignments,
  onPostSaAssignmentChange,
  onClose,
  onApprove,
  onDirectApprove,
  onReject,
  onRequestRevision,
  onOpenIndividual,
  actionLoading,
}) => {
  const [studentId, setStudentId] = useState(null)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const requests = Array.isArray(group?.requests) ? group.requests : []
  const student = group?.student || {}
  const canViewStudentProfile = Boolean(student?.userId && viewer?.mode !== "student")
  const isStudentAffairsApproval =
    viewer?.canSelectPostApprovers && group?.status === "pending_student_affairs"
  const primaryDecisionLabel = group?.currentApprovalStage === "Dean SA" ? "Approve" : "Recommend"
  const selectedPostSaApproverCount = countSelectedPostSaApprovers(postSaAssignments)
  const commentRequiredForBulkNegativeAction = useCommonComment
    ? Boolean(String(commonReviewComment || "").trim())
    : requests.every((request) => Boolean(String(perRequestComments?.[request.id] || "").trim()))

  useEffect(() => {
    let isSubscribed = true

    const loadStudentId = async () => {
      if (!isOpen || !canViewStudentProfile) {
        if (isSubscribed) {
          setStudentId(null)
          setShowStudentDetailModal(false)
        }
        return
      }

      try {
        const resolvedStudentId = await studentApi.getStudentId(student.userId)
        if (!isSubscribed) return
        setStudentId(resolvedStudentId || null)
      } catch (error) {
        console.error("Failed to resolve grouped POR student profile id:", error)
        if (!isSubscribed) return
        setStudentId(null)
      }
    }

    loadStudentId()

    return () => {
      isSubscribed = false
    }
  }, [canViewStudentProfile, isOpen, student?.userId])

  const handleOpenStudentDetail = () => {
    if (!canViewStudentProfile || !studentId) return
    setShowStudentDetailModal(true)
  }

  if (!isOpen || !group?.requests?.length) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Grouped POR Review"
      width={1180}
      minHeight="60vh"
      closeButtonVariant="button"
    >
      <div style={detailBodyStyle}>
        <div style={metaBarStyle}>
          <div style={metaBarLeftStyle}>
            <span className="por-detail-meta-chip">
              <Users size={12} />
              {student?.name || "Student"}
            </span>
            <span className="por-detail-meta-chip">{student?.rollNumber || student?.email || "—"}</span>
            <Badge variant={getStatusVariant(group.status)}>{formatStatusLabel(group.status)}</Badge>
            <span className="por-detail-meta-chip">
              <ShieldCheck size={12} />
              {formatStageLabel(group.currentApprovalStage)}
            </span>
            <span className="por-detail-meta-chip">
              <FileText size={12} />
              {group.requestCount} PORs
            </span>
          </div>
        </div>

        <div
          className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]"
          style={{ gap: "var(--spacing-4)", alignItems: "start" }}
        >
          <VStack gap={4}>
            <PorDetailCard
              icon={Users}
              title="Student Overview"
              accentColor="var(--color-info)"
              headerAction={
                canViewStudentProfile ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenStudentDetail}
                    disabled={!studentId}
                  >
                    View Profile
                  </Button>
                ) : null
              }
            >
              <div className="por-student-profile-header">
                {renderStudentAvatar(student?.name)}
                <div className="por-student-profile-info">
                  <span className="por-student-profile-name">{student?.name || "—"}</span>
                  <span className="por-student-profile-roll">{student?.rollNumber || "—"}</span>
                </div>
              </div>
              <div className="por-detail-info-grid">
                <PorDetailInfoRow label="Email" value={student?.email || "—"} />
                <PorDetailInfoRow label="Department" value={student?.department || "—"} />
                <PorDetailInfoRow label="Degree" value={student?.degree || "—"} />
                <PorDetailInfoRow label="Batch" value={student?.batch || "—"} />
              </div>
            </PorDetailCard>

            <PorDetailCard
              icon={FileText}
              title="POR Requests"
              accentColor="var(--color-primary)"
            >
              <VStack gap={4}>
                {requests.map((request, index) => (
                  <Surface bg="secondary" padding={4} radius="card-sm" border="1px solid var(--color-border-primary)" key={request.id}>
                    <HStack gap={2} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-3)" }}>
                      <HStack gap={2} align="center" wrap>
                        <span className="por-detail-meta-chip por-detail-meta-chip-id">
                          {request.id}
                        </span>
                        <span className="por-detail-meta-chip">{request.porCategoryName || "—"}</span>
                        {request.club?.name ? <span className="por-detail-meta-chip">{request.club.name}</span> : null}
                      </HStack>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenIndividual?.(request)}
                      >
                        Open Individually
                      </Button>
                    </HStack>

                    <Grid cols={{ base: 1, lg: 2 }} gap={4}>
                      <div className="por-detail-info-grid">
                        <PorDetailInfoRow label="Position" value={request.positionTitle || "—"} />
                        <PorDetailInfoRow label="Tenure" value={request.tenure || "—"} />
                        <PorDetailInfoRow
                          label="Disciplinary Disclosure"
                          value={request.hasDisciplinaryAction ? "Yes" : "No"}
                        />
                      </div>

                      <Grid cols={1} gap={3}>
                        <div style={infoBoxStyle}>
                          <span style={sectionLabelStyle}>Responsibilities</span>
                          <div style={{ marginTop: "var(--spacing-2)", ...detailTextStyle }}>
                            {request.positionDetails || "—"}
                          </div>
                        </div>

                        {request.hasDisciplinaryAction ? (
                          <Surface padding="var(--spacing-3) var(--spacing-4)" className="por-detail-alert-card">
                            <Text as="div" weight="bold" color="danger" size="xs" style={{ marginBottom: "var(--spacing-1)" }}>
                              Disciplinary Action Details
                            </Text>
                            <div style={detailTextStyle}>
                              {request.disciplinaryActionDetails || "No details provided."}
                            </div>
                          </Surface>
                        ) : null}

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
                        ) : null}
                      </Grid>
                    </Grid>

                    {!useCommonComment ? (
                      <div style={{ marginTop: "var(--spacing-3)" }}>
                        <Label htmlFor={`group-por-comment-${request.id}`}>
                          Comment for POR {index + 1}
                        </Label>
                        <Textarea
                          id={`group-por-comment-${request.id}`}
                          value={perRequestComments?.[request.id] || ""}
                          onChange={(event) => onPerRequestCommentChange?.(request.id, event.target.value)}
                          rows={3}
                          placeholder="Add a separate comment for this POR request"
                        />
                      </div>
                    ) : null}
                  </Surface>
                ))}
              </VStack>
            </PorDetailCard>
          </VStack>

          <VStack gap={4}>
            <PorDetailCard
              icon={BadgeCheck}
              title="Grouped Review Decision"
              accentColor="var(--color-primary)"
            >
              <Grid cols={1} gap={3}>
                <Checkbox
                  id="por-group-common-comment"
                  checked={useCommonComment}
                  onChange={(event) => onUseCommonCommentChange?.(Boolean(event?.target?.checked))}
                  label="Use one common comment for all selected POR requests"
                />

                {useCommonComment ? (
                  <Field label={isStudentAffairsApproval ? "Review Comment & Next Recommenders" : "Review Comment"} htmlFor="por-group-review-comment">
                    <Textarea
                      id="por-group-review-comment"
                      value={commonReviewComment}
                      onChange={(event) => onCommonReviewCommentChange?.(event.target.value)}
                      rows={5}
                      placeholder="Add one comment to apply across all selected POR requests"
                    />
                  </Field>
                ) : (
                  <div style={infoBoxStyle}>
                    <span style={sectionLabelStyle}>Per-POR Comments</span>
                    <Text as="div" size="sm" color="muted" style={{ marginTop: "var(--spacing-2)" }}>
                      Enter comments inside each POR card on the left when you want different rejection or modification notes.
                    </Text>
                  </div>
                )}

                {isStudentAffairsApproval ? (
                  <div style={infoBoxStyle}>
                    <span style={sectionLabelStyle}>Next Recommenders</span>
                    <div className="grid grid-cols-1 gap-3" style={{ marginTop: "var(--spacing-2)" }}>
                      {POST_SA_STAGE_ORDER.map((stage) => (
                        <div key={stage}>
                          <Label htmlFor={`group-por-approver-${stage}`}>{stage}</Label>
                          <Select
                            id={`group-por-approver-${stage}`}
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

                <HStack justify="end" gap={3} wrap>
                  <Button
                    variant="secondary"
                    onClick={onRequestRevision}
                    disabled={actionLoading || !commentRequiredForBulkNegativeAction}
                    loading={actionLoading === "revision"}
                  >
                    Modification Required
                  </Button>
                  <Button
                    variant="danger"
                    onClick={onReject}
                    disabled={actionLoading || !commentRequiredForBulkNegativeAction}
                    loading={actionLoading === "reject"}
                  >
                    Reject All
                  </Button>
                  {isStudentAffairsApproval ? (
                    <Button
                      variant="secondary"
                      onClick={onApprove}
                      disabled={actionLoading || selectedPostSaApproverCount === 0}
                      loading={actionLoading === "approve"}
                    >
                      Recommend & Forward All
                    </Button>
                  ) : null}
                  <Button
                    onClick={isStudentAffairsApproval ? onDirectApprove : onApprove}
                    disabled={actionLoading || (isStudentAffairsApproval && selectedPostSaApproverCount > 0)}
                    loading={actionLoading === (isStudentAffairsApproval ? "direct-approve" : "approve")}
                  >
                    {isStudentAffairsApproval ? "Approve All" : `${primaryDecisionLabel} All`}
                  </Button>
                </HStack>
              </Grid>
            </PorDetailCard>
          </VStack>
        </div>
      </div>


      {showStudentDetailModal && studentId ? (
        <StudentDetailModal
          selectedStudent={{ _id: studentId, userId: student.userId }}
          setShowStudentDetail={setShowStudentDetailModal}
          onUpdate={() => setShowStudentDetailModal(false)}
        />
      ) : null}
    </Modal>
  )
}
