import { Badge, Button, DataTable, EmptyState, ErrorState, Grid, HStack, InfoRow, Input, LoadingState, Modal, Panel, Select, StatCards, Surface, Text, useToast, VStack } from "hzero"
import { BookOpen, CalendarDays, CheckCircle2, Clock3, Download, Eye, FileText, Plus, Save, Trophy, Upload, Users, XCircle } from "lucide-react"
import { infoBoxStyle, sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"
import useLocalFormDraft, { readLocalFormDraft } from "@/hooks/useLocalFormDraft"
import PageHeader from "@/components/common/PageHeader"
import CsvUploader from "@/components/common/CsvUploader"
import ProfileAvatar from "@/components/profile/ProfileAvatar"
import { useAuth } from "@/contexts/AuthProvider"
import { overallBestPerformerApi, porApi } from "@/service"
import { ACTIVITY_LEVEL_OPTIONS, APPLICANT_STAGE_OPTIONS, AWARD_OPTIONS, BTP_AWARD_OPTIONS, CO_CURRICULAR_OPTIONS, PROJECT_GRADE_OPTIONS, PUBLICATION_OPTIONS, RESPONSIBILITY_OPTIONS, TECH_TRANSFER_OPTIONS, computeStudentScorePreview, getApplicantStage, validateScoredItems } from "./overall-best-performer/scoring"
import { badgeStyle, checklistItemStyle, fieldClusterStyle, fieldLabelStyle, getApplicationWindowLabel, helperTextStyle, inputStyle, statusTone, textareaStyle } from "./overall-best-performer/styles"
import { collectLinkedPorsFromApplication, downloadCsvFile, escapeCsvValue, formatExportDateTime, summarizeItemsForExport, summarizeProofsForExport } from "./overall-best-performer/documents"
import { buildEligibleStudentRows, buildOverallBestPerformerDraftKey, buildPayload, createInitialForm, createOccurrenceFormState, formatDateTimeInput, getDefaultBestPerformerOccurrenceId, hasSelectedProof, normalizeRollNumbers } from "./overall-best-performer/form"
import { useEffect, useMemo, useState } from "react"
import "../../styles/por-requests.css"
import { MinimalScoredItemsEditor, SingleSelectionAchievementEditor } from "./overall-best-performer/components/ScoredItemsEditors"
import { SummaryMetric, ScoreBreakdownCard } from "./overall-best-performer/components/ScoreCards"
import { MarkingSchemeModal } from "./overall-best-performer/components/MarkingSchemeModal"
import { ReviewModal } from "./overall-best-performer/components/ReviewModal"
import { SupportingProofField } from "./overall-best-performer/components/SupportingProofField"

const OverallBestPerformerPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdminView = user?.role === "Admin" || user?.role === "Super Admin"
  const isAcademicsView = user?.role === "Academics"
  const isReviewerView = isAdminView || isAcademicsView
  const canManageOccurrence = isAdminView
  const canReviewApplications = isAdminView
  const canAddHodVerification = isAcademicsView

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectorData, setSelectorData] = useState(null)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState("")
  const [occurrenceDetail, setOccurrenceDetail] = useState(null)
  const [portalState, setPortalState] = useState(null)
  const [verifiedPors, setVerifiedPors] = useState([])
  const [applicationForm, setApplicationForm] = useState(createInitialForm())
  const [applicationDraftReady, setApplicationDraftReady] = useState(false)
  const [savingApplication, setSavingApplication] = useState(false)
  const [savingOccurrence, setSavingOccurrence] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false)
  const [showEligibleStudentsModal, setShowEligibleStudentsModal] = useState(false)
  const [showMarkingSchemeModal, setShowMarkingSchemeModal] = useState(false)
  const [occurrenceModalMode, setOccurrenceModalMode] = useState("create")
  const [reviewApplication, setReviewApplication] = useState(null)
  const [occurrenceForm, setOccurrenceForm] = useState(createOccurrenceFormState())
  const [eligibleStudentSearch, setEligibleStudentSearch] = useState("")
  const [manualEligibleRollNumber, setManualEligibleRollNumber] = useState("")

  const currentOccurrence = isReviewerView ? occurrenceDetail?.occurrence : portalState?.data?.occurrence
  const currentApplication = portalState?.data?.application || null
  const canEditStudentForm = Boolean(portalState?.data?.canEdit)
  const applicationDraftKey = isReviewerView
    ? ""
    : buildOverallBestPerformerDraftKey(portalState?.data?.student, portalState?.data?.occurrence)
  const applicantStage = useMemo(() => getApplicantStage(applicationForm), [applicationForm])
  const studentScorePreview = useMemo(
    () => computeStudentScorePreview(applicationForm),
    [applicationForm]
  )
  const filteredEligibleStudents = useMemo(() => {
    const normalizedSearch = String(eligibleStudentSearch || "").trim().toLowerCase()
    const rows = Array.isArray(occurrenceForm.eligibleStudents) ? occurrenceForm.eligibleStudents : []

    if (!normalizedSearch) return rows

    return rows.filter((student) =>
      [
        student?.rollNumber,
        student?.name,
        student?.email,
        student?.department,
        student?.degree,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [eligibleStudentSearch, occurrenceForm.eligibleStudents])
  const { clearDraft: clearApplicationDraft } = useLocalFormDraft({
    formKey: applicationDraftKey,
    value: applicationForm,
    enabled: Boolean(!isReviewerView && canEditStudentForm && applicationDraftKey),
    ready: applicationDraftReady,
  })

  const updatePersonalAcademicField = (field, value) => {
    setApplicationForm((current) => ({
      ...current,
      personalAcademic: {
        ...current.personalAcademic,
        [field]: value,
      },
    }))
  }

  const syncApplicantStage = (nextStage) => {
    setApplicationForm((current) => {
      const isPg = nextStage === "pg"

      return {
        ...current,
        coursework: {
          ...current.coursework,
          evaluationMode: isPg ? "pg_cpi" : "ug_cgpa",
        },
        projectThesis: {
          ...current.projectThesis,
          track: isPg ? "pg_thesis" : "btech_project",
          ...(isPg
            ? {
                btpAwardLevel: "none",
                btpAwardTitle: "",
                btpAwardNotes: "",
                btpAwardProofSourceType: "upload",
                btpAwardProofUrl: "",
                btpAwardProofPorId: "",
                projectGrade: "none",
                projectGradeTitle: "",
                projectGradeNotes: "",
                projectGradeProofSourceType: "upload",
                projectGradeProofUrl: "",
                projectGradeProofPorId: "",
              }
            : {
                technologyTransferItems: [],
              }),
        },
      }
    })
  }

  const loadAdminData = async () => {
    const selector = await overallBestPerformerApi.getOccurrenceSelector()
    const selectorPayload = selector?.data || {}
    setSelectorData(selectorPayload)

    const defaultOccurrenceId = getDefaultBestPerformerOccurrenceId(selectorPayload)
    if (defaultOccurrenceId && !selectedOccurrenceId) {
      setSelectedOccurrenceId(String(defaultOccurrenceId))
    }

    return selectorPayload
  }

  const loadAdminOccurrence = async (occurrenceId) => {
    if (!occurrenceId) {
      setOccurrenceDetail(null)
      return
    }
    const detail = await overallBestPerformerApi.getOccurrenceDetail(occurrenceId)
    setOccurrenceDetail(detail?.data || null)
  }

  const loadStudentData = async () => {
    const [state, porWorkspace] = await Promise.all([
      overallBestPerformerApi.getStudentPortalState(),
      porApi.getWorkspace().catch(() => null),
    ])
    const baseForm = createInitialForm(state?.data?.student, state?.data?.application)
    const draftKey = buildOverallBestPerformerDraftKey(
      state?.data?.student,
      state?.data?.occurrence
    )
    const savedDraft = state?.data?.canEdit ? readLocalFormDraft(draftKey) : null

    setPortalState(state)
    setApplicationForm(savedDraft?.data || baseForm)
    setApplicationDraftReady(true)

    if (savedDraft?.data) {
      toast.success("Restored your unsaved Best Performer draft from this browser.")
    }

    const approvedWorkspacePors = (porWorkspace?.requests || []).filter((request) => request.status === "approved")
    const linkedApplicationPors = collectLinkedPorsFromApplication(state?.data?.application)
    const mergedPors = new Map()

    for (const por of [...approvedWorkspacePors, ...linkedApplicationPors]) {
      if (por?.id) {
        mergedPors.set(por.id, por)
      }
    }

    setVerifiedPors(
      [...mergedPors.values()].sort(
        (left, right) => new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0)
      )
    )
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        setApplicationDraftReady(false)
        if (isReviewerView) {
          setVerifiedPors([])
          await loadAdminData()
        } else {
          await loadStudentData()
        }
      } catch (err) {
        setError(err.message || "Failed to load Overall Best Performer data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isReviewerView])

  useEffect(() => {
    const defaultOccurrenceId = getDefaultBestPerformerOccurrenceId(selectorData)
    if (isReviewerView && defaultOccurrenceId && !selectedOccurrenceId) {
      setSelectedOccurrenceId(String(defaultOccurrenceId))
    }
  }, [isReviewerView, selectorData, selectedOccurrenceId])

  useEffect(() => {
    if (!isReviewerView) return

    const loadDetail = async () => {
      try {
        if (selectedOccurrenceId) {
          await loadAdminOccurrence(selectedOccurrenceId)
        } else {
          setOccurrenceDetail(null)
        }
      } catch (err) {
        setError(err.message || "Failed to load occurrence detail")
      }
    }

    loadDetail()
  }, [isReviewerView, selectedOccurrenceId])

  const resetOccurrenceForm = (mode = "create") => {
    if (mode === "edit" && occurrenceDetail?.occurrence) {
      const eligibleRollNumbers = normalizeRollNumbers(occurrenceDetail.occurrence.eligibleRollNumbers)
      setOccurrenceForm(createOccurrenceFormState({
        title: occurrenceDetail.occurrence.title || "",
        awardYear: String(occurrenceDetail.occurrence.awardYear || new Date().getFullYear()),
        applyStartAt: formatDateTimeInput(occurrenceDetail.occurrence.applyStartAt),
        applyEndAt: formatDateTimeInput(occurrenceDetail.occurrence.applyEndAt),
        description: occurrenceDetail.occurrence.description || "",
        eligibleRows: [],
        eligibleRollNumbers,
        eligibleStudents: buildEligibleStudentRows(
          eligibleRollNumbers,
          occurrenceDetail.occurrence.eligibleStudents
        ),
        studentListTouched: false,
      }))
      setOccurrenceModalMode("edit")
      setEligibleStudentSearch("")
      setManualEligibleRollNumber("")
      setShowEligibleStudentsModal(false)
      return
    }

    setOccurrenceForm(createOccurrenceFormState())
    setOccurrenceModalMode("create")
    setEligibleStudentSearch("")
    setManualEligibleRollNumber("")
    setShowEligibleStudentsModal(false)
  }

  const handleOccurrenceRowsParsed = (rows) => {
    const nextRollNumbers = normalizeRollNumbers(
      (Array.isArray(rows) ? rows : []).map((row) => row?.rollNumber)
    )

    setOccurrenceForm((current) => ({
      ...current,
      eligibleRows: rows,
      eligibleRollNumbers: nextRollNumbers,
      eligibleStudents: buildEligibleStudentRows(nextRollNumbers, current.eligibleStudents),
      studentListTouched: true,
    }))
  }

  const handleAddEligibleStudent = () => {
    const nextRollNumber = String(manualEligibleRollNumber || "").trim().toUpperCase()
    if (!nextRollNumber) {
      toast.error("Enter a roll number to add.")
      return
    }

    setOccurrenceForm((current) => {
      const nextRollNumbers = normalizeRollNumbers([
        ...(current.eligibleRollNumbers || []),
        nextRollNumber,
      ])

      if (nextRollNumbers.length === (current.eligibleRollNumbers || []).length) {
        return current
      }

      return {
        ...current,
        eligibleRollNumbers: nextRollNumbers,
        eligibleStudents: buildEligibleStudentRows(nextRollNumbers, current.eligibleStudents),
        studentListTouched: true,
      }
    })

    setManualEligibleRollNumber("")
  }

  const handleRemoveEligibleStudent = (rollNumberToRemove) => {
    setOccurrenceForm((current) => {
      const nextRollNumbers = normalizeRollNumbers(current.eligibleRollNumbers).filter(
        (rollNumber) => rollNumber !== String(rollNumberToRemove || "").trim().toUpperCase()
      )

      return {
        ...current,
        eligibleRollNumbers: nextRollNumbers,
        eligibleStudents: buildEligibleStudentRows(nextRollNumbers, current.eligibleStudents),
        studentListTouched: true,
      }
    })
  }

  const handleSaveOccurrence = async () => {
    const rollNumbers = normalizeRollNumbers(occurrenceForm.eligibleRollNumbers)

    if (!occurrenceForm.title.trim()) {
      toast.error("Occurrence title is required")
      return
    }

    if (!occurrenceForm.applyStartAt) {
      toast.error("Application start date is required")
      return
    }

    if (!occurrenceForm.applyEndAt) {
      toast.error("Application end date is required")
      return
    }

    if (new Date(occurrenceForm.applyStartAt) >= new Date(occurrenceForm.applyEndAt)) {
      toast.error("Application start date must be before the end date")
      return
    }

    if (occurrenceModalMode === "create" && rollNumbers.length === 0) {
      toast.error("Upload eligible roll numbers before activating the occurrence")
      return
    }

    if (occurrenceModalMode === "edit" && occurrenceForm.studentListTouched && rollNumbers.length === 0) {
      toast.error("Keep at least one eligible student in the list.")
      return
    }

    try {
      setSavingOccurrence(true)
      const payload = {
        title: occurrenceForm.title.trim(),
        awardYear: Number(occurrenceForm.awardYear || new Date().getFullYear()),
        applyStartAt: new Date(occurrenceForm.applyStartAt).toISOString(),
        applyEndAt: new Date(occurrenceForm.applyEndAt).toISOString(),
        description: occurrenceForm.description.trim(),
        ...(
          occurrenceModalMode === "create" || occurrenceForm.studentListTouched
            ? { eligibleRollNumbers: rollNumbers }
            : {}
        ),
      }

      if (occurrenceModalMode === "edit" && occurrenceDetail?.occurrence?.id) {
        await overallBestPerformerApi.updateOccurrence(occurrenceDetail.occurrence.id, payload)
        toast.success("Occurrence updated")
      } else {
        await overallBestPerformerApi.createOccurrence(payload)
        toast.success("Occurrence activated")
      }

      setShowOccurrenceModal(false)
      setShowEligibleStudentsModal(false)
      const selectorPayload = await loadAdminData()
      const editedOccurrenceId = occurrenceModalMode === "edit" ? occurrenceDetail?.occurrence?.id || "" : ""
      const nextSelectedOccurrenceId = String(
        editedOccurrenceId || getDefaultBestPerformerOccurrenceId(selectorPayload) || selectedOccurrenceId || ""
      )
      setSelectedOccurrenceId(nextSelectedOccurrenceId)
      if (nextSelectedOccurrenceId) {
        await loadAdminOccurrence(nextSelectedOccurrenceId)
      }
    } catch (err) {
      toast.error(err.message || "Failed to save occurrence")
    } finally {
      setSavingOccurrence(false)
    }
  }

  const handleSaveStudentApplication = async () => {
    if (!portalState?.data?.occurrence?.id) {
      toast.error("No occurrence available")
      return
    }

    if (!applicationForm.personalAcademic.declarationAccepted) {
      toast.error("Please accept the undertaking before submitting")
      return
    }

    if (!applicationForm.personalAcademic.isPassingOutStudent) {
      toast.error("Only passing out students are eligible to apply")
      return
    }

    if (!applicationForm.personalAcademic.hasNoDisciplinaryAction) {
      toast.error("Applicants with disciplinary action are not eligible")
      return
    }

    if (!applicationForm.personalAcademic.hasNoFrGrade) {
      toast.error("Applicants must confirm that no FR grade is counted in academics")
      return
    }

    if (Number(applicationForm.coursework.scoreValue || 0) < 6.5) {
      toast.error("Minimum CGPA / CPI required is 6.50")
      return
    }

    if (!hasSelectedProof(applicationForm.coursework)) {
      toast.error("Academic transcript / coursework proof is required.")
      return
    }

    const sectionValidationError =
      validateScoredItems(applicationForm.projectThesis.publicationItems, "Project / thesis publication items") ||
      validateScoredItems(applicationForm.projectThesis.technologyTransferItems, "Technology transfer items") ||
      validateScoredItems(applicationForm.responsibilityItems, "Position of responsibility") ||
      validateScoredItems(applicationForm.awardItems, "Awards and entrepreneurship") ||
      validateScoredItems(applicationForm.culturalItems, "Cultural activities") ||
      validateScoredItems(applicationForm.scienceTechnologyItems, "Science and technology activities") ||
      validateScoredItems(applicationForm.gamesSportsItems, "Games and sports activities") ||
      validateScoredItems(applicationForm.coCurricularItems, "Co-curricular activities")

    if (sectionValidationError) {
      toast.error(sectionValidationError)
      return
    }

    if (applicationForm.projectThesis.track === "btech_project") {
      if (
        applicationForm.projectThesis.btpAwardLevel !== "none" &&
        !hasSelectedProof({
          proofSourceType: applicationForm.projectThesis.btpAwardProofSourceType,
          proofUrl: applicationForm.projectThesis.btpAwardProofUrl,
          proofPorId: applicationForm.projectThesis.btpAwardProofPorId,
        })
      ) {
        toast.error("BTP award proof is required when you add a BTP award entry.")
        return
      }

      if (
        applicationForm.projectThesis.btpAwardLevel !== "none" &&
        !String(applicationForm.projectThesis.btpAwardTitle || "").trim()
      ) {
        toast.error("BTP award title is required when you add a BTP award entry.")
        return
      }

      if (
        applicationForm.projectThesis.projectGrade !== "none" &&
        !hasSelectedProof({
          proofSourceType: applicationForm.projectThesis.projectGradeProofSourceType,
          proofUrl: applicationForm.projectThesis.projectGradeProofUrl,
          proofPorId: applicationForm.projectThesis.projectGradeProofPorId,
        })
      ) {
        toast.error("Project grade proof is required when you add a project grade entry.")
        return
      }

      if (
        applicationForm.projectThesis.projectGrade !== "none" &&
        !String(applicationForm.projectThesis.projectGradeTitle || "").trim()
      ) {
        toast.error("Project grade title is required when you add a project grade entry.")
        return
      }
    }

    try {
      setSavingApplication(true)
      const response = await overallBestPerformerApi.upsertApplication(
        portalState.data.occurrence.id,
        buildPayload(applicationForm)
      )
      clearApplicationDraft()
      toast.success(response?.message || "Application saved")
      await loadStudentData()
    } catch (err) {
      toast.error(err.message || "Failed to save application")
    } finally {
      setSavingApplication(false)
    }
  }

  const handleReviewDecision = async (decision, remarks) => {
    if (!reviewApplication?.id || !canReviewApplications) return

    try {
      setReviewing(true)
      await overallBestPerformerApi.reviewApplication(reviewApplication.id, {
        decision,
        remarks,
      })
      toast.success(decision === "approved" ? "Application approved" : "Application rejected")
      setReviewApplication(null)
      await loadAdminOccurrence(selectedOccurrenceId)
    } catch (err) {
      toast.error(err.message || "Failed to review application")
    } finally {
      setReviewing(false)
    }
  }

  const handleHodVerification = async (action, remarks) => {
    if (!reviewApplication?.id || !canAddHodVerification) return

    const trimmedRemarks = String(remarks || "").trim()
    if (!trimmedRemarks) {
      toast.error("Comments are required.")
      return
    }

    try {
      setReviewing(true)
      await overallBestPerformerApi.addHodVerification(reviewApplication.id, {
        action,
        remarks: trimmedRemarks,
      })
      toast.success(action === "verified" ? "Application verified" : "Comment added")
      setReviewApplication(null)
      await loadAdminOccurrence(selectedOccurrenceId)
    } catch (err) {
      toast.error(err.message || "Failed to save HOD verification")
    } finally {
      setReviewing(false)
    }
  }

  const handleReviewApplicationUpdated = async (updatedApplication = null) => {
    if (updatedApplication) {
      setReviewApplication(updatedApplication)
    }

    if (selectedOccurrenceId) {
      try {
        await loadAdminOccurrence(selectedOccurrenceId)
      } catch (error) {
        toast.error(error?.message || "Updated item, but failed to refresh occurrence data")
      }
    }
  }

  const handleExportOccurrenceCsv = () => {
    const applications = occurrenceDetail?.leaderboard || []
    if (!applications.length) {
      toast.error("No applications available to export.")
      return
    }

    const headers = [
      "rank",
      "occurrence_title",
      "award_year",
      "student_name",
      "student_email",
      "roll_number",
      "department",
      "degree",
      "programme",
      "personal_department",
      "is_passing_out_student",
      "has_no_disciplinary_action",
      "has_no_fr_grade",
      "undertaking_accepted",
      "coursework_mode",
      "coursework_score_value",
      "coursework_notes",
      "coursework_proofs",
      "project_track",
      "btp_award_level",
      "btp_award_title",
      "btp_award_notes",
      "btp_award_proofs",
      "project_grade",
      "project_grade_title",
      "project_grade_notes",
      "project_grade_proofs",
      "publication_items",
      "technology_transfer_items",
      "responsibility_items",
      "award_items",
      "cultural_items",
      "science_technology_items",
      "games_sports_items",
      "co_curricular_items",
      "coursework_points",
      "project_thesis_points",
      "responsibilities_points",
      "awards_points",
      "cultural_points",
      "science_technology_points",
      "games_sports_points",
      "co_curricular_points",
      "calculated_total",
      "review_status",
      "review_remarks",
      "reviewed_by",
      "reviewed_at",
      "final_score",
      "submitted_at",
      "created_at",
      "updated_at",
    ]

    const rows = applications.map((application, index) => {
      const personalAcademic = application?.personalAcademic || {}
      const coursework = application?.coursework || {}
      const projectThesis = application?.projectThesis || {}
      const review = application?.review || {}
      const scoreBreakdown = application?.scoreBreakdown || {}

      return [
        index + 1,
        currentOccurrence?.title || "",
        application?.awardYear || currentOccurrence?.awardYear || "",
        application?.studentName || "",
        application?.studentEmail || "",
        application?.rollNumber || "",
        application?.department || "",
        application?.degree || "",
        personalAcademic?.programme || "",
        personalAcademic?.department || "",
        personalAcademic?.isPassingOutStudent ? "Yes" : "No",
        personalAcademic?.hasNoDisciplinaryAction ? "Yes" : "No",
        personalAcademic?.hasNoFrGrade ? "Yes" : "No",
        personalAcademic?.declarationAccepted ? "Yes" : "No",
        coursework?.evaluationMode || "",
        coursework?.scoreValue ?? "",
        coursework?.notes || "",
        summarizeProofsForExport(coursework?.proofs),
        projectThesis?.track || "",
        projectThesis?.btpAwardLevel || "",
        projectThesis?.btpAwardTitle || "",
        projectThesis?.btpAwardNotes || "",
        summarizeProofsForExport(projectThesis?.btpAwardProofs),
        projectThesis?.projectGrade || "",
        projectThesis?.projectGradeTitle || "",
        projectThesis?.projectGradeNotes || "",
        summarizeProofsForExport(projectThesis?.projectGradeProofs),
        summarizeItemsForExport(projectThesis?.publicationItems),
        summarizeItemsForExport(projectThesis?.technologyTransferItems),
        summarizeItemsForExport(application?.responsibilityItems),
        summarizeItemsForExport(application?.awardItems),
        summarizeItemsForExport(application?.culturalItems),
        summarizeItemsForExport(application?.scienceTechnologyItems),
        summarizeItemsForExport(application?.gamesSportsItems),
        summarizeItemsForExport(application?.coCurricularItems),
        scoreBreakdown?.coursework ?? "",
        scoreBreakdown?.projectThesis ?? "",
        scoreBreakdown?.responsibilities ?? "",
        scoreBreakdown?.awards ?? "",
        scoreBreakdown?.cultural ?? "",
        scoreBreakdown?.scienceTechnology ?? "",
        scoreBreakdown?.gamesSports ?? "",
        scoreBreakdown?.coCurricular ?? "",
        application?.calculatedTotal ?? "",
        review?.status || "",
        review?.remarks || "",
        review?.reviewedBy || "",
        formatExportDateTime(review?.reviewedAt),
        application?.finalScore ?? "",
        formatExportDateTime(application?.submittedAt),
        formatExportDateTime(application?.createdAt),
        formatExportDateTime(application?.updatedAt),
      ]
    })

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n")

    const occurrenceSlug = String(currentOccurrence?.title || "best-performer")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    downloadCsvFile(
      csvContent,
      `${occurrenceSlug || "best-performer"}-${currentOccurrence?.awardYear || "occurrence"}-${new Date().toISOString().split("T")[0]}.csv`
    )
    toast.success("Best Performer export downloaded.")
  }

  const leaderboardRows = useMemo(
    () =>
      (occurrenceDetail?.leaderboard || []).map((application, index) => ({
        ...application,
        leaderboardRank: index + 1,
      })),
    [occurrenceDetail?.leaderboard]
  )

  const leaderboardColumns = useMemo(
    () => [
      {
        header: "Rank",
        key: "leaderboardRank",
        render: (application) => (
          <Badge variant="primary">#{application.leaderboardRank}</Badge>
        ),
      },
      {
        header: "Student",
        key: "studentName",
        render: (application) => (
          <Grid cols={1} gap="4px" style={{ minWidth: 0 }}>
            <Text as="div" color="primary" weight="medium" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {application.studentName || "—"}
            </Text>
            <Text as="div" size="sm" color="muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {application.rollNumber || "—"}
            </Text>
            <Text as="div" size="xs" color="light" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {application.department || "—"}{application.degree ? ` · ${application.degree}` : ""}
            </Text>
          </Grid>
        ),
      },
      {
        header: "Calculated",
        key: "calculatedTotal",
        render: (application) => (
          <Grid cols={1} gap="4px">
            <Text as="div" color="primary" weight="semibold" style={{ whiteSpace: "nowrap" }}>
              {application.calculatedTotal ?? "—"}
            </Text>
            <Text as="div" size="xs" color="muted" style={{ whiteSpace: "nowrap" }}>
              Auto score
            </Text>
          </Grid>
        ),
      },
      {
        header: "Final",
        key: "finalScore",
        render: (application) => (
          <Grid cols={1} gap="4px">
            <div>
              <Badge variant="info">{application.finalScore ?? "—"}</Badge>
            </div>
            <Text as="div" size="xs" color="muted" style={{ whiteSpace: "nowrap" }}>
              Reviewed score
            </Text>
          </Grid>
        ),
      },
      {
        header: "Status",
        key: "status",
        render: (application) => (
          <Badge variant={statusTone(application.review?.status)}>
            {application.review?.status || "submitted"}
          </Badge>
        ),
      },
      {
        header: "Updated",
        key: "updatedAt",
        render: (application) => {
          if (!application.updatedAt) return "—"
          const updatedAt = new Date(application.updatedAt)
          return (
            <Grid cols={1} gap="4px">
              <Text as="div" size="sm" color="primary" weight="medium" style={{ whiteSpace: "nowrap" }}>
                {updatedAt.toLocaleDateString()}
              </Text>
              <Text as="div" size="xs" color="muted" style={{ whiteSpace: "nowrap" }}>
                {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </Grid>
          )
        },
      },
    ],
    []
  )

  if (loading) {
    return <LoadingState message="Loading Overall Best Performer award..." />
  }

  if (error) {
    return <ErrorState title="Overall Best Performer unavailable" message={error} />
  }

  if (!isReviewerView && !portalState?.data?.canAccessPortal) {
    return (
      <VStack gap={4}>
        <PageHeader title="Overall Best Performer" subtitle="Student portal" showDate={false} />
        <Surface padding={6}>
          <EmptyState
            title={
              portalState?.data?.studentStatusAllowed === false
                ? "Best Performer unavailable"
                : portalState?.data?.applicationWindowStatus === "scheduled"
                  ? "Application window not started"
                  : portalState?.data?.applicationWindowStatus === "closed"
                    ? "Application window closed"
                : "No accessible occurrence"
            }
            description={
              portalState?.data?.studentStatusAllowed === false
                ? "Only students with Active or Graduated status can access the Best Performer portal."
                : portalState?.data?.applicationWindowStatus === "scheduled"
                  ? "The Best Performer portal will become visible only after the configured application start date."
                  : portalState?.data?.applicationWindowStatus === "closed"
                    ? "The Best Performer portal is visible to students only between the configured application start and end date."
                    : "There is no active Overall Best Performer occurrence for you right now."
            }
          />
        </Surface>
      </VStack>
    )
  }

  return (
    <div style={{ minHeight: "100%", backgroundColor: "var(--color-bg-page)" }}>
      <PageHeader
        title={isReviewerView ? "Overall Best Performer" : "Overall Best Performer Award"}
        subtitle={isReviewerView ? (canManageOccurrence ? "Annual occurrence control, review, and leaderboard" : "Occurrence leaderboard and application review") : "Apply, upload proofs, and track your score"}
        showDate={false}
      >
        {isReviewerView ? (
          <>
            <div style={{ minWidth: 260 }}>
              <Select
                name="bestPerformerOccurrence"
                value={selectedOccurrenceId}
                onChange={(event) => setSelectedOccurrenceId(event.target.value)}
                placeholder="Select an occurrence"
                options={(selectorData?.occurrences || []).map((occurrence) => ({
                  value: occurrence.id,
                  label: `${occurrence.awardYear} · ${occurrence.title} · ${occurrence.status}`,
                }))}
              />
            </div>
            {canManageOccurrence ? (
              <Button
                onClick={() => {
                  resetOccurrenceForm("create")
                  setShowOccurrenceModal(true)
                }}
              >
                <Plus size={16} /> Start occurrence
              </Button>
            ) : null}
            {canManageOccurrence && occurrenceDetail?.occurrence ? (
              <Button
                variant="secondary"
                onClick={() => {
                  resetOccurrenceForm("edit")
                  setShowOccurrenceModal(true)
                }}
              >
                <Save size={16} /> Edit
              </Button>
            ) : null}
            {canManageOccurrence ? (
              <Button
                variant="secondary"
                onClick={handleExportOccurrenceCsv}
                disabled={!occurrenceDetail?.leaderboard?.length}
              >
                <Download size={16} /> Export CSV
              </Button>
            ) : null}
          </>
        ) : (
          <div style={badgeStyle(currentOccurrence?.applicationWindowStatus === "open" ? "primary" : "default")}>
            <Trophy size={14} />
            {getApplicationWindowLabel(currentOccurrence?.applicationWindowStatus)}
          </div>
        )}
      </PageHeader>

      <div style={{ padding: "var(--spacing-4) var(--spacing-6) var(--spacing-8)", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        {currentOccurrence ? (
          <>
            {isReviewerView ? (
              <StatCards
                columns={5}
                stats={[
                  {
                    title: "Award Year",
                    value: currentOccurrence.awardYear,
                    subtitle: currentOccurrence.title || "Occurrence",
                    icon: <CalendarDays size={18} />,
                    color: "var(--color-primary)",
                  },
                  {
                    title: "Application Starts",
                    value: (
                      <Text as="span" size="sm" leading={1.4} style={{ display: "inline-block" }}>
                        {currentOccurrence.applyStartAt ? new Date(currentOccurrence.applyStartAt).toLocaleString() : "—"}
                      </Text>
                    ),
                    subtitle: "Opening time",
                    icon: <Clock3 size={18} />,
                    color: "var(--color-info)",
                  },
                  {
                    title: "Application Ends",
                    value: (
                      <Text as="span" size="sm" leading={1.4} style={{ display: "inline-block" }}>
                        {currentOccurrence.applyEndAt ? new Date(currentOccurrence.applyEndAt).toLocaleString() : "—"}
                      </Text>
                    ),
                    subtitle: "Closing time",
                    icon: <Clock3 size={18} />,
                    color: "var(--color-warning)",
                  },
                  {
                    title: "Eligible Students",
                    value: currentOccurrence.eligibleStudentCount || 0,
                    subtitle: "Configured list",
                    icon: <Users size={18} />,
                    color: "var(--color-success)",
                  },
                  {
                    title: "Window",
                    value: (
                      <Text as="span" size="sm" leading={1.35} style={{ display: "inline-block", maxWidth: "100%", wordBreak: "break-word" }}>
                        {getApplicationWindowLabel(currentOccurrence.applicationWindowStatus)}
                      </Text>
                    ),
                    subtitle: "Current status",
                    icon: <Trophy size={18} />,
                    color: "var(--color-primary)",
                  },
                ]}
              />
            ) : null}

            {!isReviewerView && currentOccurrence.description ? (
              <Surface bg="brand" padding={4} size="sm" color="body" style={{ whiteSpace: "pre-wrap" }}>
                {currentOccurrence.description}
              </Surface>
            ) : null}
          </>
        ) : null}

        {isReviewerView ? (
          occurrenceDetail ? (
            <>
              {leaderboardRows.length ? (
                <DataTable
                  columns={leaderboardColumns}
                  data={leaderboardRows}
                  loading={false}
                  emptyMessage="No applications yet."
                  onRowClick={setReviewApplication}
                />
              ) : (
                <EmptyState
                  title="No applications yet"
                  description="Students have not submitted applications for this occurrence."
                />
              )}
            </>
          ) : (
            <EmptyState
              title="No occurrence selected"
              description={canManageOccurrence ? "Pick an occurrence from history, or start a new annual round from the header." : "Pick an occurrence from the header to inspect applications and scores."}
            />
          )
        ) : (
          <>
            {/* Active Application Round Details Dashboard */}
            <Grid min={360} gap={4} style={{ marginBottom: "var(--spacing-4)" }}>
              {/* Left Card: Application Period & Eligibility */}
              <Surface
                bg="primary"
                padding={4}
                radius="card"
                border
                shadow
                accent="brand"
                style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", overflow: "hidden" }}
              >
                <HStack align="center" gap={2} color="brand">
                  <CalendarDays size={18} />
                  <Text as="span" size="md" weight="bold" color="heading">
                    Active Application Round
                  </Text>
                </HStack>
                
                <Grid cols={1} gap={2}>
                  <InfoRow label="Submissions Open" value={currentOccurrence?.applyStartAt ? new Date(currentOccurrence.applyStartAt).toLocaleString() : "—"} style={{ padding: "8px 12px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }} />
                  <InfoRow label="Submissions Close" value={currentOccurrence?.applyEndAt ? new Date(currentOccurrence.applyEndAt).toLocaleString() : "—"} style={{ padding: "8px 12px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }} />
                </Grid>

                <HStack gap="6px" wrap style={{ marginTop: "var(--spacing-1)" }}>
                  <Surface as="span" bg="brand" padding="4px 8px" radius="999px" color="brand" size="xs" weight="semibold" style={{ display: "inline-flex" }}>
                    Min CGPA / CPI: 6.50
                  </Surface>
                  <Surface as="span" bg="brand" padding="4px 8px" radius="999px" color="brand" size="xs" weight="semibold" style={{ display: "inline-flex" }}>
                    Passing-out students only
                  </Surface>
                  <Surface as="span" bg="brand" padding="4px 8px" radius="999px" color="brand" size="xs" weight="semibold" style={{ display: "inline-flex" }}>
                    Status: Active / Graduated
                  </Surface>
                </HStack>
              </Surface>

              {/* Right Card: Reference Guide & Marking Scheme */}
              {/* The gradient this used to carry ended on a literal
                  rgba(91, 159, 232, 0.03) — a fixed light-mode blue that stayed
                  put in dark mode. The brand tint is the theme's version of the
                  same wash. */}
              <Surface
                bg="brand"
                padding={4}
                radius="card"
                border
                shadow
                accent="info"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "var(--spacing-3)", overflow: "hidden" }}
              >
                <div>
                  <HStack align="center" gap={2} color="info">
                    <BookOpen size={18} />
                    <Text as="span" size="md" weight="bold" color="heading">
                      Reference & Evaluation
                    </Text>
                  </HStack>
                  <Text as="div" size="sm" color="body" leading={1.6} style={{ marginTop: "var(--spacing-2)" }}>
                    Achievements are mapped to specific point scales. Review the official marking scheme to ensure correct categories and supporting proof documents are uploaded.
                  </Text>
                </div>

                <Button variant="secondary" onClick={() => setShowMarkingSchemeModal(true)} style={{ width: "100%", justifyContent: "center" }}>
                  <FileText size={16} /> View Marking Scheme
                </Button>
              </Surface>
            </Grid>

            <VStack gap={4}>
              {/* Personalized Student Profile & Status card */}
              <Surface
                bg="primary"
                padding={4}
                radius="card"
                border
                shadow
                style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", overflow: "hidden" }}
              >
                <HStack gap={3} align="center" wrap>
                  <ProfileAvatar
                    user={{
                      name: portalState?.data?.student?.name || "Student",
                      profileImage: portalState?.data?.student?.profileImage,
                    }}
                    size="medium"
                  />
                  <div style={{ minWidth: 0 }}>
                    <Text as="div" size="lg" weight="bold" color="heading">
                      {portalState?.data?.student?.name || "Student"}
                    </Text>
                    <HStack gap={2} wrap size="xs" color="muted" style={{ marginTop: "2px" }}>
                      <span>Roll Number: <strong>{portalState?.data?.student?.rollNumber || "—"}</strong></span>
                      <span>•</span>
                      <span>Department: <strong>{portalState?.data?.student?.department || "—"}</strong></span>
                    </HStack>
                  </div>

                  <HStack gap={2} align="center" style={{ marginLeft: "auto" }}>
                    <Text as="span" size="xs" color="muted">Status:</Text>
                    <Badge variant={statusTone(currentApplication?.review?.status)}>
                      {currentApplication?.review?.status || "draft"}
                    </Badge>
                  </HStack>
                </HStack>

                {currentApplication?.review?.status === "rejected" && currentApplication.review?.remarks ? (
                  <div style={{
                    background: "rgba(239, 68, 68, 0.04)",
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    borderLeft: "4px solid var(--color-danger)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--spacing-3) var(--spacing-4)",
                    marginTop: "var(--spacing-1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-1)"
                  }}>
                    <HStack align="center" gap={2} size="xs" weight="bold" color="danger">
                      <XCircle size={14} />
                      Needs Attention / Revise Application
                    </HStack>
                    <Text as="div" size="sm" color="body" leading={1.6} style={{ paddingLeft: "20px" }}>
                      {currentApplication.review.remarks}
                    </Text>
                  </div>
                ) : null}
              </Surface>

              <Panel title="Score Preview">
                <Grid cols={1} gap={4}>
                  <Grid min={220} gap={3}>
                    <SummaryMetric icon={Trophy} label="Current Score" value={studentScorePreview.total} />
                    <SummaryMetric
                      icon={Save}
                      label="Saved Score"
                      value={currentApplication ? currentApplication.calculatedTotal || 0 : "Not saved"}
                    />
                    <SummaryMetric
                      icon={CheckCircle2}
                      label="Final Review Score"
                      value={
                        currentApplication?.review?.status === "approved" ||
                        currentApplication?.review?.status === "rejected"
                          ? currentApplication?.finalScore ?? 0
                          : "Pending review"
                      }
                    />
                  </Grid>

                  <div style={helperTextStyle}>
                    This score preview updates as you edit the form. The saved score is the last submitted calculation, and the final review score appears after admin review.
                  </div>

                  <ScoreBreakdownCard breakdown={studentScorePreview} />
                </Grid>
              </Panel>

              <Panel title="1. Academic achievements">
                <Grid cols={1} gap={4}>
                  <Grid cols={1} gap={2}>
                    <span style={sectionLabelStyle}>Programme Type</span>
                    <HStack gap={2} wrap>
                      {APPLICANT_STAGE_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          variant={applicantStage === option.value ? undefined : "secondary"}
                          onClick={() => syncApplicantStage(option.value)}
                          disabled={!canEditStudentForm}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </HStack>
                  </Grid>
 
                  <Grid cols={1} gap={3}>
                    <div>
                      <label style={fieldLabelStyle}>
                        {applicantStage === "ug" ? "CGPA" : "CPI"}
                      </label>
                      <Input
                        type="number"
                        value={applicationForm.coursework.scoreValue}
                        onChange={(event) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, scoreValue: event.target.value },
                          }))
                        }
                        disabled={!canEditStudentForm}
                      />
                      <div style={helperTextStyle}>Minimum eligible value is 6.50.</div>
                    </div>
 
                    <div>
                      <label style={fieldLabelStyle}>Brief note</label>
                      <textarea
                        value={applicationForm.coursework.notes}
                        disabled={!canEditStudentForm}
                        onChange={(event) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, notes: event.target.value },
                          }))
                        }
                        style={textareaStyle}
                        placeholder="Mention any coursework context if needed."
                      />
                    </div>
 
                    <div>
                      <SupportingProofField
                        label="Supporting document"
                        proofSourceType={applicationForm.coursework.proofSourceType}
                        proofUrl={applicationForm.coursework.proofUrl}
                        proofPorId={applicationForm.coursework.proofPorId}
                        onChange={(proofState) =>
                          setApplicationForm((current) => ({
                            ...current,
                            coursework: { ...current.coursework, ...proofState },
                          }))
                        }
                        verifiedPors={verifiedPors}
                        disabled={!canEditStudentForm}
                        uploadedText="Academic proof uploaded"
                        viewerTitle="Academic transcript / coursework proof"
                      />
                    </div>
                  </Grid>
                </Grid>
              </Panel>
 
              <Panel title="2. Project / thesis work">
                <Grid cols={1} gap={4}>
                  <Grid cols={1} gap={2}>
                    <span style={sectionLabelStyle}>Project Track</span>
                    <HStack gap={2} wrap>
                      {APPLICANT_STAGE_OPTIONS.map((option) => (
                        <Button
                          key={`project-${option.value}`}
                          variant={applicantStage === option.value ? undefined : "secondary"}
                          onClick={() => syncApplicantStage(option.value)}
                          disabled={!canEditStudentForm}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </HStack>
                  </Grid>

                  {applicantStage === "ug" ? (
                    <>
                      <SingleSelectionAchievementEditor
                        heading="BTP award"
                        value={applicationForm.projectThesis.btpAwardLevel}
                        options={BTP_AWARD_OPTIONS}
                        titleValue={applicationForm.projectThesis.btpAwardTitle}
                        notesValue={applicationForm.projectThesis.btpAwardNotes}
                        proofSourceType={applicationForm.projectThesis.btpAwardProofSourceType}
                        proofUrl={applicationForm.projectThesis.btpAwardProofUrl}
                        proofPorId={applicationForm.projectThesis.btpAwardProofPorId}
                        onValueChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              btpAwardLevel: value,
                              ...(value === "none"
                                ? {
                                    btpAwardTitle: "",
                                    btpAwardNotes: "",
                                    btpAwardProofSourceType: "upload",
                                    btpAwardProofUrl: "",
                                    btpAwardProofPorId: "",
                                  }
                                : {}),
                            },
                          }))
                        }
                        onTitleChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, btpAwardTitle: value },
                          }))
                        }
                        onNotesChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, btpAwardNotes: value },
                          }))
                        }
                        onProofChange={(proofState) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              btpAwardProofSourceType: proofState.proofSourceType,
                              btpAwardProofUrl: proofState.proofUrl,
                              btpAwardProofPorId: proofState.proofPorId,
                            },
                          }))
                        }
                        verifiedPors={verifiedPors}
                        disabled={!canEditStudentForm}
                        titleLabel="Project title"
                        titlePlaceholder="Enter the BTP title"
                        descriptionLabel="Short description"
                        descriptionPlaceholder="Add any necessary context for this BTP award."
                      />

                      <SingleSelectionAchievementEditor
                        heading="Project grade"
                        value={applicationForm.projectThesis.projectGrade}
                        options={PROJECT_GRADE_OPTIONS}
                        titleValue={applicationForm.projectThesis.projectGradeTitle}
                        notesValue={applicationForm.projectThesis.projectGradeNotes}
                        proofSourceType={applicationForm.projectThesis.projectGradeProofSourceType}
                        proofUrl={applicationForm.projectThesis.projectGradeProofUrl}
                        proofPorId={applicationForm.projectThesis.projectGradeProofPorId}
                        onValueChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              projectGrade: value,
                              ...(value === "none"
                                ? {
                                    projectGradeTitle: "",
                                    projectGradeNotes: "",
                                    projectGradeProofSourceType: "upload",
                                    projectGradeProofUrl: "",
                                    projectGradeProofPorId: "",
                                  }
                                : {}),
                            },
                          }))
                        }
                        onTitleChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, projectGradeTitle: value },
                          }))
                        }
                        onNotesChange={(value) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: { ...current.projectThesis, projectGradeNotes: value },
                          }))
                        }
                        onProofChange={(proofState) =>
                          setApplicationForm((current) => ({
                            ...current,
                            projectThesis: {
                              ...current.projectThesis,
                              projectGradeProofSourceType: proofState.proofSourceType,
                              projectGradeProofUrl: proofState.proofUrl,
                              projectGradeProofPorId: proofState.proofPorId,
                            },
                          }))
                        }
                        verifiedPors={verifiedPors}
                        disabled={!canEditStudentForm}
                        titleLabel="Project title"
                        titlePlaceholder="Enter the project title"
                        descriptionLabel="Short description"
                        descriptionPlaceholder="Add any necessary context for the awarded grade."
                      />
                    </>
                  ) : null}

                  <MinimalScoredItemsEditor
                    step={applicantStage === "ug" ? "2" : "2"}
                    title={applicantStage === "ug" ? "Project publications / patents" : "Thesis publications / patents"}
                    subtitle="Add only the relevant publications or patents and attach the required supporting proof."
                    items={applicationForm.projectThesis.publicationItems}
                    onChange={(items) =>
                      setApplicationForm((current) => ({
                        ...current,
                        projectThesis: { ...current.projectThesis, publicationItems: items },
                      }))
                    }
                    options={PUBLICATION_OPTIONS}
                    verifiedPors={verifiedPors}
                    disabled={!canEditStudentForm}
                    uploadLabel="Supporting document"
                    titleLabel="Achievement title"
                    titlePlaceholder="Enter publication / patent title"
                    descriptionLabel="Short description"
                    descriptionPlaceholder="Mention the publication, patent, or conference context."
                    embedded
                  />

                  {applicantStage === "pg" ? (
                    <MinimalScoredItemsEditor
                      step="2"
                      title="Technology transfer"
                      subtitle="Add only the relevant technology transfer achievements for the PG / PhD thesis track."
                      items={applicationForm.projectThesis.technologyTransferItems}
                      onChange={(items) =>
                        setApplicationForm((current) => ({
                          ...current,
                          projectThesis: { ...current.projectThesis, technologyTransferItems: items },
                        }))
                      }
                      options={TECH_TRANSFER_OPTIONS}
                      verifiedPors={verifiedPors}
                      disabled={!canEditStudentForm}
                      uploadLabel="Supporting document"
                      titleLabel="Transfer / work title"
                      titlePlaceholder="Enter the technology transfer title"
                      descriptionLabel="Short description"
                      descriptionPlaceholder="Mention the role, work, or transfer context."
                      embedded
                    />
                  ) : null}
                </Grid>
              </Panel>

              <MinimalScoredItemsEditor
                step="3"
                title="Position of responsibility"
                subtitle="Choose the exact POR marking category, add the title, a short description, and attach the supporting proof."
                items={applicationForm.responsibilityItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, responsibilityItems: items }))}
                options={RESPONSIBILITY_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Position title"
                titlePlaceholder="Enter the POR title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the responsibility briefly."
              />

              <MinimalScoredItemsEditor
                step="4"
                title="Awards / entrepreneurship / social work"
                subtitle="Add only the relevant awards, incubation, entrepreneurship, or social-work achievements."
                items={applicationForm.awardItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, awardItems: items }))}
                options={AWARD_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the award or achievement title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the achievement briefly."
              />

              <MinimalScoredItemsEditor
                step="5"
                title="Cultural activities"
                subtitle="Add only the relevant cultural achievements and select the correct marking category."
                items={applicationForm.culturalItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, culturalItems: items }))}
                options={ACTIVITY_LEVEL_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the cultural activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity or result briefly."
              />

              <MinimalScoredItemsEditor
                step="6"
                title="Science and technology activities"
                subtitle="Add only the relevant science and technology activities with the correct scoring category."
                items={applicationForm.scienceTechnologyItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, scienceTechnologyItems: items }))}
                options={ACTIVITY_LEVEL_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the science / technology activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity or result briefly."
              />

              <MinimalScoredItemsEditor
                step="7"
                title="Games and sports activities"
                subtitle="Add only the relevant sports achievements and match them to the correct marking category."
                items={applicationForm.gamesSportsItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, gamesSportsItems: items }))}
                options={ACTIVITY_LEVEL_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the sports activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity or result briefly."
              />

              <MinimalScoredItemsEditor
                step="8"
                title="Co-curricular / extra-curricular activities"
                subtitle="Add only the relevant co-curricular or extra-curricular achievements."
                items={applicationForm.coCurricularItems}
                onChange={(items) => setApplicationForm((current) => ({ ...current, coCurricularItems: items }))}
                options={CO_CURRICULAR_OPTIONS}
                verifiedPors={verifiedPors}
                disabled={!canEditStudentForm}
                uploadLabel="Supporting document"
                titleLabel="Achievement title"
                titlePlaceholder="Enter the activity title"
                descriptionLabel="Short description"
                descriptionPlaceholder="Describe the activity briefly."
              />

              <Panel title="Final Declaration">
                <VStack gap={3} color="body">
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.isPassingOutStudent}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("isPassingOutStudent", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <Text as="span" size="sm" leading={1.7}>
                      I confirm that I am a passing out student and eligible to apply for this award.
                    </Text>
                  </label>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.hasNoDisciplinaryAction}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("hasNoDisciplinaryAction", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <Text as="span" size="sm" leading={1.7}>
                      I confirm that I have not been subjected to any disciplinary action.
                    </Text>
                  </label>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.hasNoFrGrade}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("hasNoFrGrade", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <Text as="span" size="sm" leading={1.7}>
                      I confirm that no FR grade is accounted in my academics for this application.
                    </Text>
                  </label>
                  <label style={checklistItemStyle}>
                    <input
                      type="checkbox"
                      checked={applicationForm.personalAcademic.declarationAccepted}
                      disabled={!canEditStudentForm}
                      onChange={(event) => updatePersonalAcademicField("declarationAccepted", event.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <Text as="span" size="sm" leading={1.7}>
                      I hereby declare that the information provided by me is true and correct to the best of my knowledge and belief. If any of the information is found to be false or misleading, I authorize the Institute to take appropriate action against me as deemed fit.
                    </Text>
                  </label>

                  <Grid cols={1} gap={3} style={{ ...infoBoxStyle }}>
                    <span style={sectionLabelStyle}>Submission Action</span>
                    <Button onClick={handleSaveStudentApplication} loading={savingApplication} disabled={!canEditStudentForm}>
                      <Save size={16} /> Save application
                    </Button>
                    {!canEditStudentForm ? (
                      <Text as="div" color="muted" size="sm" leading={1.6}>
                        This application is read-only because the deadline has passed or the submission has already been reviewed.
                      </Text>
                    ) : null}
                  </Grid>
                </VStack>
              </Panel>
            </VStack>
          </>
        )}
      </div>

      <MarkingSchemeModal
        open={showMarkingSchemeModal}
        onClose={() => setShowMarkingSchemeModal(false)}
      />

      {showOccurrenceModal ? (
        <Modal
          title={occurrenceModalMode === "edit" ? "Edit occurrence" : "Start Overall Best Performer occurrence"}
          onClose={() => {
            setShowOccurrenceModal(false)
            setShowEligibleStudentsModal(false)
          }}
          width={980}
          fullHeight={true}
        >
          <VStack gap={4}>
            <Grid cols={2} gap={3}>
              <div>
                <label style={fieldLabelStyle}>Occurrence title</label>
                <input value={occurrenceForm.title} onChange={(event) => setOccurrenceForm((current) => ({ ...current, title: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Award year</label>
                <input value={occurrenceForm.awardYear} onChange={(event) => setOccurrenceForm((current) => ({ ...current, awardYear: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Application start date</label>
                <input type="datetime-local" value={occurrenceForm.applyStartAt} onChange={(event) => setOccurrenceForm((current) => ({ ...current, applyStartAt: event.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Application end date</label>
                <input type="datetime-local" value={occurrenceForm.applyEndAt} onChange={(event) => setOccurrenceForm((current) => ({ ...current, applyEndAt: event.target.value }))} style={inputStyle} />
              </div>
              <HStack align="end" gap="none" color="muted">
                {occurrenceModalMode === "edit"
                  ? `${occurrenceForm.eligibleRollNumbers.length || 0} eligible students currently configured`
                  : (occurrenceForm.eligibleRows || []).length
                    ? `${occurrenceForm.eligibleRows.length} CSV rows loaded`
                    : "CSV upload required when activating a new occurrence"}
              </HStack>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabelStyle}>Description / instructions</label>
                <textarea value={occurrenceForm.description} onChange={(event) => setOccurrenceForm((current) => ({ ...current, description: event.target.value }))} style={textareaStyle} />
              </div>
            </Grid>

            {occurrenceModalMode === "edit" ? (
              <Panel
                title="Eligible students"
                subtitle="Review and update the student list without reuploading unless you want to replace it."
                actions={(
                  <Button variant="secondary" onClick={() => setShowEligibleStudentsModal(true)}>
                    <Eye size={16} /> View Students
                  </Button>
                )}
              >
                <Grid cols={1} gap={3}>
                  <div style={fieldClusterStyle}>
                    <span style={sectionLabelStyle}>Current list</span>
                    <Grid cols={1} gap="6px" style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                      <div>{occurrenceForm.eligibleRollNumbers.length || 0} eligible students configured for this occurrence.</div>
                      <Text as="div" color="muted">
                        Editing this list will not remove or delete already submitted applications for this occurrence.
                      </Text>
                    </Grid>
                  </div>
                </Grid>
              </Panel>
            ) : (
              <Panel
                title="Eligible students CSV"
                subtitle="Upload a CSV with a single required column: rollNumber"
              >
                <CsvUploader
                  onDataParsed={handleOccurrenceRowsParsed}
                  requiredFields={["rollNumber"]}
                  templateFileName="overall_best_performer_eligible_students.csv"
                  templateHeaders={["rollNumber"]}
                  maxRecords={5000}
                  instructionText="Upload the exact roll numbers allowed to apply in this occurrence."
                />
              </Panel>
            )}

            <HStack gap={2} justify="end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowOccurrenceModal(false)
                  setShowEligibleStudentsModal(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveOccurrence} loading={savingOccurrence}>
                <Upload size={16} /> {occurrenceModalMode === "edit" ? "Save changes" : "Activate occurrence"}
              </Button>
            </HStack>
          </VStack>
        </Modal>
      ) : null}

      {showEligibleStudentsModal ? (
        <Modal
          title="Manage Eligible Students"
          onClose={() => setShowEligibleStudentsModal(false)}
          width={1080}
          minHeight="60vh"
        >
          <Grid cols={1} gap={4}>
            <div style={fieldClusterStyle}>
              <span style={sectionLabelStyle}>Important</span>
              <Text as="div" color="body" size="sm" leading={1.6}>
                Changing this list affects future eligibility for this occurrence, but it does not remove or delete already submitted applications.
              </Text>
            </div>

            <Grid cols="minmax(0,1fr) auto" gap={3} align="end">
              <div>
                <label style={fieldLabelStyle}>Search students</label>
                <Input
                  value={eligibleStudentSearch}
                  onChange={(event) => setEligibleStudentSearch(event.target.value)}
                  placeholder="Search by roll number, name, email, department..."
                />
              </div>
              <div style={{ minWidth: 220 }}>
                <label style={fieldLabelStyle}>Add by roll number</label>
                <Grid cols="minmax(0,1fr) auto" gap={2}>
                  <Input
                    value={manualEligibleRollNumber}
                    onChange={(event) => setManualEligibleRollNumber(event.target.value.toUpperCase())}
                    placeholder="e.g. 22CS10001"
                  />
                  <Button onClick={handleAddEligibleStudent}>
                    <Plus size={16} /> Add
                  </Button>
                </Grid>
              </div>
            </Grid>

            <Panel
              title="Replace entire list"
              subtitle="Upload a new CSV to overwrite the current eligible student list for this occurrence."
            >
              <CsvUploader
                onDataParsed={handleOccurrenceRowsParsed}
                requiredFields={["rollNumber"]}
                templateFileName="overall_best_performer_eligible_students.csv"
                templateHeaders={["rollNumber"]}
                maxRecords={5000}
                instructionText="Uploading here replaces the current list inside this edit session. Save the occurrence to apply the changes."
              />
            </Panel>

            <Panel
              title="Eligible students"
              subtitle={`${occurrenceForm.eligibleRollNumbers.length || 0} students currently in this edit list.`}
            >
              <Grid cols={1} gap={2} style={{ maxHeight: "42vh", overflowY: "auto" }}>
                {filteredEligibleStudents.length > 0 ? (
                  filteredEligibleStudents.map((student) => (
                    <Grid cols="minmax(0,1.2fr) minmax(0,1fr) auto" gap={3} align="center" style={{ padding: "var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)" }} key={student.rollNumber}>
                      <div style={{ minWidth: 0 }}>
                        <Text as="div" size="sm" weight="semibold" color="primary">
                          {student.name || "Student record will be validated on save"}
                        </Text>
                        <Text as="div" size="xs" color="muted" style={{ marginTop: "4px" }}>
                          {student.rollNumber}
                        </Text>
                      </div>
                      <Text as="div" size="xs" color="muted" leading={1.5} style={{ minWidth: 0 }}>
                        <div>{student.email || "Name/email not loaded yet"}</div>
                        <div>
                          {[student.department, student.degree].filter(Boolean).join(" · ") || "Profile details unavailable"}
                        </div>
                      </Text>
                      <Button
                        variant="secondary"
                        onClick={() => handleRemoveEligibleStudent(student.rollNumber)}
                      >
                        <XCircle size={16} /> Remove
                      </Button>
                    </Grid>
                  ))
                ) : (
                  <Text as="div" color="muted" size="sm">
                    No students match the current search.
                  </Text>
                )}
              </Grid>
            </Panel>

            <HStack gap={2} justify="end">
              <Button variant="ghost" onClick={() => setShowEligibleStudentsModal(false)}>
                Done
              </Button>
            </HStack>
          </Grid>
        </Modal>
      ) : null}

      <ReviewModal
        application={reviewApplication}
        open={Boolean(reviewApplication)}
        onClose={() => setReviewApplication(null)}
        onDecision={canReviewApplications ? handleReviewDecision : handleHodVerification}
        onApplicationUpdated={handleReviewApplicationUpdated}
        deciding={reviewing}
        reviewMode={canReviewApplications ? "admin" : canAddHodVerification ? "hod" : "readonly"}
      />
    </div>
  )
}

export default OverallBestPerformerPage
