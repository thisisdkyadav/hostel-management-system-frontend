import { useEffect, useMemo, useState } from "react"
import { Badge, Button, Grid, HStack, Modal, Surface, Text, useToast, VStack } from "hzero"
import PdfViewerModal from "@/components/common/pdf/PdfViewerModal"
import StudentDetailModal from "@/components/common/students/StudentDetailModal"
import ProfileAvatar from "@/components/profile/ProfileAvatar"
import { overallBestPerformerApi, studentApi } from "@/service"
import { BTP_AWARD_OPTIONS, PROJECT_GRADE_OPTIONS, getApplicationItemsForReviewSection } from "../scoring"
import { fieldClusterStyle, fieldLabelStyle, helperTextStyle, statusTone } from "../styles"
import { collectApplicationPdfDocuments, downloadBlobFile, mergePdfDocuments, resolvePrimaryProof, slugifyFilePart } from "../documents"
import { PorProofDetailModal } from "./PorProofDetailModal"
import { ScoreBreakdownCard } from "./ScoreCards"
import { MarkingSchemeModal } from "./MarkingSchemeModal"
import { ProofActionButton } from "./ProofActionButton"
import { PorDetailCard, PorDetailInfoRow } from "./PorDetailCard"
import { ItemsReviewTable } from "./ItemsReviewTable"
import { ReviewItemDetailModal } from "./ReviewItemDetailModal"
import { HodVerificationsCard } from "./HodVerificationsCard"
import { EditCourseworkScoreModal } from "./EditCourseworkScoreModal"
import { EditProjectThesisGradesModal } from "./EditProjectThesisGradesModal"
import { Download, FileText, BadgeCheck, CheckCircle2, Eye, MessageSquare, Trophy, Users, XCircle, Pencil } from "lucide-react"
import { sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"

export const ReviewModal = ({
  application,
  open,
  onClose,
  onDecision,
  onApplicationUpdated,
  deciding,
  reviewMode = "readonly",
}) => {
  const [remarks, setRemarks] = useState("")
  const [activePorDetail, setActivePorDetail] = useState(null)
  const [activePdfDetail, setActivePdfDetail] = useState(null)
  const [activeItemDetail, setActiveItemDetail] = useState(null)
  const [savingItemType, setSavingItemType] = useState(false)
  const [showCourseworkScoreModal, setShowCourseworkScoreModal] = useState(false)
  const [savingCourseworkScore, setSavingCourseworkScore] = useState(false)
  const [showProjectThesisGradesModal, setShowProjectThesisGradesModal] = useState(false)
  const [savingProjectThesisGrades, setSavingProjectThesisGrades] = useState(false)
  const [downloadingAllPdfs, setDownloadingAllPdfs] = useState(false)
  const [showReviewMarkingSchemeModal, setShowReviewMarkingSchemeModal] = useState(false)
  const [studentProfileId, setStudentProfileId] = useState(null)
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const { toast } = useToast()
  const canAdminReview = reviewMode === "admin"
  const canHodVerify = reviewMode === "hod"
  const canTakeAction = canAdminReview || canHodVerify
  const applicationPdfDocuments = useMemo(
    () => collectApplicationPdfDocuments(application),
    [application]
  )

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setRemarks(canAdminReview ? application?.review?.remarks || "" : "")
        setActivePorDetail(null)
        setActivePdfDetail(null)
        setActiveItemDetail(null)
        setSavingItemType(false)
        setShowCourseworkScoreModal(false)
        setSavingCourseworkScore(false)
        setShowProjectThesisGradesModal(false)
        setSavingProjectThesisGrades(false)
        setDownloadingAllPdfs(false)
        setShowReviewMarkingSchemeModal(false)
        setShowStudentDetailModal(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, application, canAdminReview])

  useEffect(() => {
    let isSubscribed = true

    const loadStudentProfileId = async () => {
      if (!open || !application?.studentUserId) {
        if (isSubscribed) {
          setStudentProfileId(null)
        }
        return
      }

      if (application?.studentProfileId) {
        setStudentProfileId(application.studentProfileId)
        return
      }

      try {
        const resolvedStudentId = await studentApi.getStudentId(application.studentUserId)
        if (!isSubscribed) return
        setStudentProfileId(resolvedStudentId || null)
      } catch (error) {
        console.error("Failed to resolve Best Performer student profile id:", error)
        if (!isSubscribed) return
        setStudentProfileId(null)
      }
    }

    loadStudentProfileId()

    return () => {
      isSubscribed = false
    }
  }, [application?.studentProfileId, application?.studentUserId, open])

  if (!open || !application) return null

  const handleDownloadAllPdfs = async () => {
    if (!applicationPdfDocuments.length) {
      toast.error("No supporting PDFs are attached to this application.")
      return
    }

    try {
      setDownloadingAllPdfs(true)
      const mergedPdfBytes = await mergePdfDocuments(applicationPdfDocuments)
      const filename = `${slugifyFilePart(application.rollNumber || application.studentName, "best-performer")}-supporting-documents.pdf`
      downloadBlobFile(new Blob([mergedPdfBytes], { type: "application/pdf" }), filename)
      toast.success("Supporting PDFs downloaded.")
    } catch (error) {
      console.error("Failed to merge Best Performer PDFs:", error)
      toast.error(error?.message || "Failed to download supporting PDFs.")
    } finally {
      setDownloadingAllPdfs(false)
    }
  }

  const handleOpenItemDetail = (detail) => {
    const latestItems = getApplicationItemsForReviewSection(application, detail?.sectionKey)
    setActiveItemDetail({
      ...detail,
      item: latestItems?.[detail?.itemIndex] || detail?.item || {},
    })
  }

  const handleSaveItemType = async (scoreType, excludedFromScoring = false) => {
    if (!canAdminReview || !application?.id || !activeItemDetail?.sectionKey) return

    try {
      setSavingItemType(true)
      const response = await overallBestPerformerApi.updateApplicationItemType(application.id, {
        sectionKey: activeItemDetail.sectionKey,
        itemIndex: activeItemDetail.itemIndex,
        scoreType,
        excludedFromScoring,
      })
      const updatedApplication = response?.data?.application || response?.application || null
      toast.success(response?.message || "Application item type updated")
      setActiveItemDetail(null)
      if (updatedApplication) {
        await onApplicationUpdated?.(updatedApplication)
      } else {
        await onApplicationUpdated?.()
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update item type")
    } finally {
      setSavingItemType(false)
    }
  }

  const handleSaveCourseworkScore = async (scoreValue) => {
    if (!canAdminReview || !application?.id) return

    try {
      setSavingCourseworkScore(true)
      const response = await overallBestPerformerApi.updateApplicationCourseworkScore(application.id, {
        scoreValue,
      })
      const updatedApplication = response?.data?.application || response?.application || null
      toast.success(response?.message || "CGPA / CPI updated")
      setShowCourseworkScoreModal(false)
      if (updatedApplication) {
        await onApplicationUpdated?.(updatedApplication)
      } else {
        await onApplicationUpdated?.()
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update CGPA / CPI")
    } finally {
      setSavingCourseworkScore(false)
    }
  }

  const handleSaveProjectThesisGrades = async (payload) => {
    if (!canAdminReview || !application?.id) return

    try {
      setSavingProjectThesisGrades(true)
      const response = await overallBestPerformerApi.updateApplicationProjectThesisGrades(application.id, payload)
      const updatedApplication = response?.data?.application || response?.application || null
      toast.success(response?.message || "BTP grades updated")
      setShowProjectThesisGradesModal(false)
      if (updatedApplication) {
        await onApplicationUpdated?.(updatedApplication)
      } else {
        await onApplicationUpdated?.()
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update BTP grades")
    } finally {
      setSavingProjectThesisGrades(false)
    }
  }

  return (
    <Modal title={`${canTakeAction ? "Review" : "View"} ${application.studentName}`} onClose={onClose} width={1800} fullHeight={true}>
      <VStack gap={4}>
        {/* Upper Meta Bar */}
        <HStack gap={3} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-2)" }}>
          <HStack gap={2} align="center" wrap>
            <span className="por-detail-meta-chip por-detail-meta-chip-id">
              {application.rollNumber}
            </span>
            <Badge variant={statusTone(application.review?.status)}>{application.review?.status || "submitted"}</Badge>
            <span className="por-detail-meta-chip">
              <Trophy size={12} />
              Calculated Score: {application.calculatedTotal || 0}
            </span>
            <span className="por-detail-meta-chip">
              <CheckCircle2 size={12} />
              Final Score: {application.finalScore || 0}
            </span>
          </HStack>
          <HStack gap={2} align="center" wrap>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowReviewMarkingSchemeModal(true)}
            >
              <FileText size={14} /> Show Marking Scheme
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownloadAllPdfs}
              loading={downloadingAllPdfs}
              disabled={downloadingAllPdfs || !applicationPdfDocuments.length}
            >
              <Download size={14} /> Download All PDFs
            </Button>
          </HStack>
        </HStack>

        {/* Main 3-Column Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3" style={{ gap: "var(--spacing-4)", alignItems: "start" }}>
          
          {/* Main content - col-span-2 */}
          <VStack gap={4} style={{ marginTop: "calc(-1 * var(--spacing-4))" }} className="xl:col-span-2">
            
            {/* Academic profile card */}
            <PorDetailCard
              icon={Users}
              title="Student Academic Profile"
              accentColor="var(--color-primary)"
            >
              <div className="por-student-profile-header">
                <ProfileAvatar
                  user={{
                    name: application.studentName,
                    profileImage: application.studentProfileImage,
                  }}
                  size="medium"
                />
                <div className="por-student-profile-info" style={{ minWidth: 0 }}>
                  <span className="por-student-profile-name">{application.studentName}</span>
                  <span className="por-student-profile-roll">{application.rollNumber}</span>
                </div>
                {canAdminReview && application?.studentUserId ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowStudentDetailModal(true)}
                    disabled={!studentProfileId}
                    style={{ marginLeft: "auto", flexShrink: 0 }}
                  >
                    <Eye size={14} /> View Student Profile
                  </Button>
                ) : null}
              </div>

              <div className="por-detail-info-grid">
                <PorDetailInfoRow label="Programme" value={application.personalAcademic?.programme || "—"} />
                <PorDetailInfoRow label="Department" value={application.personalAcademic?.department || application.department || "—"} />
                <PorDetailInfoRow
                  label="CGPA / CPI"
                  value={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                      <span>{application.coursework?.scoreValue || "—"}</span>
                      {application.coursework?.proofs?.length ? (
                        <ProofActionButton
                          proof={resolvePrimaryProof(application.coursework?.proofs)}
                          onViewPor={setActivePorDetail}
                          onViewPdf={setActivePdfDetail}
                        />
                      ) : null}
                      {canAdminReview ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setShowCourseworkScoreModal(true)}
                        >
                          <Pencil size={14} /> Edit
                        </Button>
                      ) : null}
                    </span>
                  }
                />
              </div>

              {/* Declarations (Yes/No fields) styled beautifully! */}
              <div style={{ marginTop: "var(--spacing-4)", borderTop: "1px solid var(--color-border-primary)", paddingTop: "var(--spacing-4)" }}>
                <Text as="div" size="xs" weight="semibold" color="secondary" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-3)" }}>
                  Disclosures & Declarations
                </Text>
                <Grid cols={4} gap={3}>
                  <Surface padding="10px 12px" className={application.personalAcademic?.isPassingOutStudent ? "por-detail-success-card" : "por-detail-alert-card"}>
                    <Text as="div" size="xs" color="muted">Passing Out Student</Text>
                    <HStack align="center" gap="4px" size="sm" weight="bold" style={{ marginTop: "4px" }}>
                      {application.personalAcademic?.isPassingOutStudent ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Yes</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> No</>
                      )}
                    </HStack>
                  </Surface>
                  <Surface padding="10px 12px" className={application.personalAcademic?.hasNoDisciplinaryAction ? "por-detail-success-card" : "por-detail-alert-card"}>
                    <Text as="div" size="xs" color="muted">No Disciplinary Action</Text>
                    <HStack align="center" gap="4px" size="sm" weight="bold" style={{ marginTop: "4px" }}>
                      {application.personalAcademic?.hasNoDisciplinaryAction ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Declared Clean</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> Action Disclosed</>
                      )}
                    </HStack>
                  </Surface>
                  <Surface padding="10px 12px" className={application.personalAcademic?.hasNoFrGrade ? "por-detail-success-card" : "por-detail-alert-card"}>
                    <Text as="div" size="xs" color="muted">No FR Grade</Text>
                    <HStack align="center" gap="4px" size="sm" weight="bold" style={{ marginTop: "4px" }}>
                      {application.personalAcademic?.hasNoFrGrade ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> None</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> Has FR Grade</>
                      )}
                    </HStack>
                  </Surface>
                  <Surface padding="10px 12px" className={application.personalAcademic?.declarationAccepted ? "por-detail-success-card" : "por-detail-alert-card"}>
                    <Text as="div" size="xs" color="muted">Undertaking Accepted</Text>
                    <HStack align="center" gap="4px" size="sm" weight="bold" style={{ marginTop: "4px" }}>
                      {application.personalAcademic?.declarationAccepted ? (
                        <><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Confirmed</>
                      ) : (
                        <><XCircle size={14} className="text-[var(--color-danger)]" /> Pending</>
                      )}
                    </HStack>
                  </Surface>
                </Grid>
              </div>
            </PorDetailCard>

            {/* BTP details card if applicable */}
            {application.projectThesis?.track === "btech_project" &&
            (canAdminReview || application.projectThesis?.btpAwardLevel !== "none" || application.projectThesis?.projectGrade !== "none") ? (
              <PorDetailCard
                icon={Trophy}
                title="BTP & Project Grade Details"
                accentColor="var(--color-warning)"
                headerAction={canAdminReview ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowProjectThesisGradesModal(true)}
                  >
                    <Pencil size={14} /> Edit
                  </Button>
                ) : null}
              >
                <Grid min={240} gap={4}>
                  {application.projectThesis?.btpAwardLevel !== "none" ? (
                    <div className="por-detail-hero-box" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderLeft: "4px solid var(--color-warning)" }}>
                      <Text as="div" size="xs" color="muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-2)" }}>
                        BTP Award
                      </Text>
                      <Text as="div" weight="bold" color="primary" size="md">
                        {BTP_AWARD_OPTIONS.find((option) => option.value === application.projectThesis?.btpAwardLevel)?.label || application.projectThesis?.btpAwardLevel}
                      </Text>
                      <Text as="div" color="body" size="sm" style={{ marginTop: "6px" }}>
                        {application.projectThesis?.btpAwardTitle || "—"}
                      </Text>
                      {application.projectThesis?.btpAwardNotes ? (
                        <Text as="div" color="muted" size="xs" style={{ marginTop: "6px", fontStyle: "italic" }}>
                          Notes: {application.projectThesis.btpAwardNotes}
                        </Text>
                      ) : null}
                      <div style={{ marginTop: "var(--spacing-3)" }}>
                        <ProofActionButton
                          proof={resolvePrimaryProof(application.projectThesis?.btpAwardProofs)}
                          onViewPor={setActivePorDetail}
                          onViewPdf={setActivePdfDetail}
                        />
                      </div>
                    </div>
                  ) : null}

                  {application.projectThesis?.projectGrade !== "none" ? (
                    <div className="por-detail-hero-box" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-primary)", borderLeft: "4px solid var(--color-primary)" }}>
                      <Text as="div" size="xs" color="muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--spacing-2)" }}>
                        Project Grade
                      </Text>
                      <Text as="div" weight="bold" color="primary" size="md">
                        {PROJECT_GRADE_OPTIONS.find((option) => option.value === application.projectThesis?.projectGrade)?.label || application.projectThesis?.projectGrade}
                      </Text>
                      <Text as="div" color="body" size="sm" style={{ marginTop: "6px" }}>
                        {application.projectThesis?.projectGradeTitle || "—"}
                      </Text>
                      {application.projectThesis?.projectGradeNotes ? (
                        <Text as="div" color="muted" size="xs" style={{ marginTop: "6px", fontStyle: "italic" }}>
                          Notes: {application.projectThesis.projectGradeNotes}
                        </Text>
                      ) : null}
                      <div style={{ marginTop: "var(--spacing-3)" }}>
                        <ProofActionButton
                          proof={resolvePrimaryProof(application.projectThesis?.projectGradeProofs)}
                          onViewPor={setActivePorDetail}
                          onViewPdf={setActivePdfDetail}
                        />
                      </div>
                    </div>
                  ) : null}
                </Grid>
              </PorDetailCard>
            ) : null}

            {/* List of achievements tables styled beautifully */}
            <ItemsReviewTable title="Project publications / patents" items={application.projectThesis?.publicationItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Technology transfer" items={application.projectThesis?.technologyTransferItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Responsibilities" items={application.responsibilityItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Awards" items={application.awardItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Cultural activities" items={application.culturalItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Science & Technology activities" items={application.scienceTechnologyItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Games & Sports activities" items={application.gamesSportsItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
            <ItemsReviewTable title="Co-curricular activities" items={application.coCurricularItems || []} onViewPor={setActivePorDetail} onViewPdf={setActivePdfDetail} onOpenMore={handleOpenItemDetail} />
          </VStack>

          {/* Right sidebar column */}
          <VStack gap={4}>
            
            {/* Scorecard */}
            <ScoreBreakdownCard breakdown={application.scoreBreakdown} />

            <HodVerificationsCard verifications={application.hodVerifications} />

            {/* Admin Decision card */}
            <PorDetailCard
              icon={canHodVerify ? BadgeCheck : CheckCircle2}
              title={canAdminReview ? "Application Review Decision" : canHodVerify ? "HOD Verification" : "Review Summary"}
              accentColor="var(--color-primary)"
            >
              {canAdminReview ? (
                <div>
                  <label style={{ ...fieldLabelStyle, marginBottom: "var(--spacing-2)" }}>Review Remarks / Notes</label>
                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    className="por-decision-textarea"
                    placeholder="Add review feedback, notes, or justification for rejection..."
                  />
                  <div className="por-decision-actions">
                    <Button
                      onClick={() => onDecision("approved", remarks)}
                      loading={deciding}
                      disabled={deciding}
                    >
                      <CheckCircle2 size={16} /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => onDecision("rejected", remarks)}
                      loading={deciding}
                      disabled={deciding}
                    >
                      <XCircle size={16} /> Reject
                    </Button>
                  </div>
                </div>
              ) : canHodVerify ? (
                <div>
                  <label style={{ ...fieldLabelStyle, marginBottom: "var(--spacing-2)" }}>Verification Comment</label>
                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    className="por-decision-textarea"
                    placeholder="Add your verification note or comment..."
                  />
                  <div style={{ ...helperTextStyle, marginTop: "var(--spacing-2)" }}>
                    A comment is required for both actions.
                  </div>
                  <div className="por-decision-actions">
                    <Button
                      onClick={() => onDecision("verified", remarks)}
                      loading={deciding}
                      disabled={deciding || !String(remarks || "").trim()}
                    >
                      <BadgeCheck size={16} /> Verify
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onDecision("commented", remarks)}
                      loading={deciding}
                      disabled={deciding || !String(remarks || "").trim()}
                    >
                      <MessageSquare size={16} /> Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <Grid cols={1} gap={3}>
                  <div className="por-detail-info-grid">
                    <PorDetailInfoRow label="Review Status" value={application.review?.status || "submitted"} />
                    <PorDetailInfoRow label="Final Score" value={application.finalScore ?? "—"} />
                  </div>
                  <div style={fieldClusterStyle}>
                    <span style={sectionLabelStyle}>Review Remarks / Notes</span>
                    <Text as="div" color="body" size="sm" leading={1.7}>
                      {application.review?.remarks || "No review remarks have been added yet."}
                    </Text>
                  </div>
                </Grid>
              )}
            </PorDetailCard>
          </VStack>
        </div>

        {/* Support Modal portals */}
        <ReviewItemDetailModal
          detail={activeItemDetail}
          canEditType={canAdminReview}
          saving={savingItemType}
          onClose={() => setActiveItemDetail(null)}
          onSaveType={handleSaveItemType}
          onViewPor={setActivePorDetail}
          onViewPdf={setActivePdfDetail}
        />
        <MarkingSchemeModal
          open={showReviewMarkingSchemeModal}
          onClose={() => setShowReviewMarkingSchemeModal(false)}
        />
        <EditCourseworkScoreModal
          open={showCourseworkScoreModal}
          scoreValue={application.coursework?.scoreValue || ""}
          saving={savingCourseworkScore}
          onClose={() => setShowCourseworkScoreModal(false)}
          onSave={handleSaveCourseworkScore}
        />
        <EditProjectThesisGradesModal
          open={showProjectThesisGradesModal}
          projectThesis={application.projectThesis || {}}
          saving={savingProjectThesisGrades}
          onClose={() => setShowProjectThesisGradesModal(false)}
          onSave={handleSaveProjectThesisGrades}
        />
        <PorProofDetailModal
          open={Boolean(activePorDetail)}
          onClose={() => setActivePorDetail(null)}
          porRequest={activePorDetail}
        />
        <PdfViewerModal
          isOpen={Boolean(activePdfDetail?.url)}
          onClose={() => setActivePdfDetail(null)}
          documentUrl={activePdfDetail?.url}
          title={activePdfDetail?.title || "Supporting Document"}
          subtitle="Uploaded supporting PDF"
          downloadFileName={`${activePdfDetail?.title || "supporting-document"}.pdf`}
        />
        {showStudentDetailModal && studentProfileId ? (
          <StudentDetailModal
            selectedStudent={{ _id: studentProfileId, userId: application.studentUserId }}
            setShowStudentDetail={setShowStudentDetailModal}
            onUpdate={() => setShowStudentDetailModal(false)}
          />
        ) : null}
      </VStack>
    </Modal>
  )

}
