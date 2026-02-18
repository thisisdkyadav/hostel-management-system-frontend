import { useEffect, useMemo, useState } from "react"
import { Tabs, Button, DataTable, Modal, Input } from "czero/react"
import {
  Eye,
  Plus,
  Search,
  X,
  FileText,
  Upload,
  Mail,
  ClipboardList,
  Gavel,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
} from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import PageFooter from "../../components/common/PageFooter"
import PdfUploadField from "../../components/common/pdf/PdfUploadField"
import PdfViewerModal from "../../components/common/pdf/PdfViewerModal"
import { Badge, Pagination, Textarea, useToast, Checkbox, Radio, StatCards } from "@/components/ui"
import StepIndicator from "@/components/ui/navigation/StepIndicator"
import CompactStudentTag, { StudentTagGroup } from "@/components/ui/data-display/CompactStudentTag"
import CaseSummaryView from "../../components/common/disco/CaseSummaryView"
import { discoApi, studentApi, uploadApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"

// ============================================================================
// UTILITY FUNCTIONS (unchanged logic)
// ============================================================================

const formatStatusLabel = (value = "") =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())

const getStatusVariant = (status = "") => {
  switch (status) {
    case "action_taken":
    case "finalized_with_action":
      return "success"
    case "rejected":
    case "final_rejected":
      return "danger"
    case "under_process":
      return "info"
    default:
      return "warning"
  }
}

const getFilenameFromUrl = (url, fallback = "document.pdf") => {
  if (!url || typeof url !== "string") return fallback
  const cleaned = url.split("?")[0]
  const chunks = cleaned.split("/")
  return chunks[chunks.length - 1] || fallback
}

const parseRecipients = (value) =>
  value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)

const todayDateInput = () => new Date().toISOString().split("T")[0]

const createReminderDraft = () => ({
  action: "",
  dueDate: "",
})

const createStudentActionDraft = () => ({
  reason: "",
  actionTaken: "",
  date: todayDateInput(),
  remarks: "",
  reminderItems: [],
})

const toIdString = (value) => {
  if (!value) return ""
  if (typeof value === "string") return value
  if (value.id) return String(value.id)
  if (value._id) return String(value._id)
  return String(value)
}

const getStatementRoleLabel = (value) => {
  if (value === "accused") return "Accused"
  if (value === "accusing") return "Accusing"
  return "Student"
}

const dedupeStudents = (items = []) => {
  const map = new Map()
  items.forEach((item) => {
    const id = toIdString(item.userId || item.id || item._id)
    if (!id) return
    map.set(id, {
      userId: id,
      name: item.name || "Unknown",
      email: item.email || "",
      rollNumber: item.rollNumber || "",
    })
  })
  return Array.from(map.values())
}

const isStageTwoComplete = (caseData) => {
  if (!caseData) return false

  const accusingIds = (caseData.selectedStudents?.accusing || []).map((student) => toIdString(student.id))
  const accusedIds = (caseData.selectedStudents?.accused || []).map((student) => toIdString(student.id))
  const selected = new Set([...accusingIds, ...accusedIds].filter(Boolean))

  if (selected.size === 0) return false
  if (accusedIds.length === 0) return false

  const statementCountByStudent = new Map()
  ;(caseData.statements || []).forEach((statement) => {
    const studentId = toIdString(statement.student?.id)
    if (!selected.has(studentId)) return

    const currentCount = statementCountByStudent.get(studentId) || 0
    statementCountByStudent.set(studentId, currentCount + 1)
  })

  if (statementCountByStudent.size !== selected.size) return false
  return Array.from(statementCountByStudent.values()).every((count) => count === 1)
}

const deriveAdminStage = (caseData) => {
  if (!caseData) return "step2_collection"

  if (caseData.finalDecision?.status && caseData.finalDecision.status !== "pending") {
    return "closed_final"
  }

  if (!isStageTwoComplete(caseData)) return "step2_collection"
  if ((caseData.emailLogs || []).length === 0) return "step3_email"
  if (!caseData.committeeMeetingMinutes?.pdfUrl) return "step4_minutes"

  return "step5_final"
}

const STEP_DEFINITIONS = [
  { id: "step2_collection", label: "Collection", sublabel: "Students & Docs", icon: ClipboardList },
  { id: "step3_email", label: "Email", sublabel: "Committee", icon: Mail },
  { id: "step4_minutes", label: "Minutes", sublabel: "Upload", icon: FileText },
  { id: "step5_final", label: "Decision", sublabel: "Finalize", icon: Gavel },
]

const getStepLabel = (stage) => {
  const step = STEP_DEFINITIONS.find((s) => s.id === stage)
  if (step) return step.label
  if (stage === "closed_final") return "Closed"
  return "In Progress"
}

const getStepIndex = (stage) => {
  const index = STEP_DEFINITIONS.findIndex((s) => s.id === stage)
  return index >= 0 ? index : 0
}

// ============================================================================
// STYLES
// ============================================================================

const cardStyle = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-primary)",
  padding: "var(--spacing-3)",
}

const sectionLabelStyle = {
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "var(--spacing-2)",
}

const compactInputRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "var(--spacing-2)",
  alignItems: "center",
}

const documentChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 8px",
  backgroundColor: "var(--color-bg-tertiary)",
  borderRadius: "var(--radius-badge)",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-primary)",
  cursor: "pointer",
  border: "1px solid var(--color-border-primary)",
  transition: "all 0.15s ease",
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DisciplinaryProcessPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  const isAdmin = ["Admin", "Super Admin"].includes(user?.role)

  // PDF Viewer state
  const [pdfViewer, setPdfViewer] = useState({
    open: false,
    url: "",
    title: "Document",
    fileName: "document.pdf",
  })

  // Create Case Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createComplaintPdfUrl, setCreateComplaintPdfUrl] = useState("")
  const [createComplaintPdfName, setCreateComplaintPdfName] = useState("")
  const [creatingCase, setCreatingCase] = useState(false)

  // Admin Cases List state
  const [adminCases, setAdminCases] = useState([])
  const [adminCasesLoading, setAdminCasesLoading] = useState(false)
  const [adminStatusFilter, setAdminStatusFilter] = useState("all")
  const [adminSearchTerm, setAdminSearchTerm] = useState("")
  const [adminPage, setAdminPage] = useState(1)
  const [adminTotalPages, setAdminTotalPages] = useState(1)
  const [adminTotalCount, setAdminTotalCount] = useState(0)
  const [adminCaseCounts, setAdminCaseCounts] = useState({
    all: 0,
    under_process: 0,
    final_rejected: 0,
    finalized_with_action: 0,
  })
  const [adminCaseCountsLoading, setAdminCaseCountsLoading] = useState(false)

  // Admin Case Detail Modal state
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [adminModalLoading, setAdminModalLoading] = useState(false)
  const [selectedAdminCase, setSelectedAdminCase] = useState(null)
  const [viewingHistoryStep, setViewingHistoryStep] = useState(null)

  // Student Search state
  const [studentSearchRoll, setStudentSearchRoll] = useState("")
  const [studentSearchLoading, setStudentSearchLoading] = useState(false)
  const [studentSearchResults, setStudentSearchResults] = useState([])

  // Stage 2 state
  const [stage2AccusingStudents, setStage2AccusingStudents] = useState([])
  const [stage2AccusedStudents, setStage2AccusedStudents] = useState([])
  const [stage2StatementsByStudentId, setStage2StatementsByStudentId] = useState({})
  const [stage2EvidenceDocuments, setStage2EvidenceDocuments] = useState([])
  const [stage2ExtraDocuments, setStage2ExtraDocuments] = useState([])
  const [stage2EvidenceDraftUrl, setStage2EvidenceDraftUrl] = useState("")
  const [stage2EvidenceDraftName, setStage2EvidenceDraftName] = useState("")
  const [stage2ExtraDraftUrl, setStage2ExtraDraftUrl] = useState("")
  const [stage2ExtraDraftName, setStage2ExtraDraftName] = useState("")
  const [stage2Saving, setStage2Saving] = useState(false)

  // Stage 3 state
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [includeInitialComplaint, setIncludeInitialComplaint] = useState(true)
  const [selectedStatementAttachmentIds, setSelectedStatementAttachmentIds] = useState({})
  const [selectedEvidenceAttachmentIds, setSelectedEvidenceAttachmentIds] = useState({})
  const [selectedExtraDocumentAttachmentIds, setSelectedExtraDocumentAttachmentIds] = useState({})
  const [selectedRecipientStudentIds, setSelectedRecipientStudentIds] = useState({})
  const [emailExtraDraftUrl, setEmailExtraDraftUrl] = useState("")
  const [emailExtraDraftName, setEmailExtraDraftName] = useState("")
  const [emailExtraAttachments, setEmailExtraAttachments] = useState([])
  const [emailSubmitting, setEmailSubmitting] = useState(false)

  // Stage 4 state
  const [minutesPdfUrl, setMinutesPdfUrl] = useState("")
  const [minutesPdfName, setMinutesPdfName] = useState("")
  const [minutesSubmitting, setMinutesSubmitting] = useState(false)

  // Stage 5 state
  const [finalDecisionMode, setFinalDecisionMode] = useState("action")
  const [finalDecisionDescription, setFinalDecisionDescription] = useState("")
  const [finalReason, setFinalReason] = useState("")
  const [finalActionTaken, setFinalActionTaken] = useState("")
  const [finalDate, setFinalDate] = useState(todayDateInput())
  const [finalRemarks, setFinalRemarks] = useState("")
  const [finalActionEntryMode, setFinalActionEntryMode] = useState("common")
  const [finalReminderItems, setFinalReminderItems] = useState([])
  const [finalStudentActionMap, setFinalStudentActionMap] = useState({})
  const [selectedDisciplinedStudents, setSelectedDisciplinedStudents] = useState([])
  const [finalDecisionSubmitting, setFinalDecisionSubmitting] = useState(false)

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const uploadDiscoProcessPdf = async (file) => {
    const formData = new FormData()
    formData.append("discoPdf", file)
    return uploadApi.uploadDiscoProcessPDF(formData)
  }

  const showPdf = (url, title = "Document", fileName = "document.pdf") => {
    setPdfViewer({
      open: true,
      url,
      title,
      fileName,
    })
  }

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const fetchAdminCases = async () => {
    try {
      setAdminCasesLoading(true)
      const response = await discoApi.getProcessCases({
        page: adminPage,
        limit: 10,
        caseStatus: adminStatusFilter !== "all" ? adminStatusFilter : undefined,
      })
      setAdminCases(response.items || [])
      setAdminTotalPages(response.pagination?.totalPages || 1)
      setAdminTotalCount(response.pagination?.total || 0)
    } catch (error) {
      toast.error(error.message || "Failed to fetch disciplinary cases")
    } finally {
      setAdminCasesLoading(false)
    }
  }

  const fetchAdminCaseById = async (caseId) => {
    try {
      setAdminModalLoading(true)
      const response = await discoApi.getProcessCaseById(caseId)
      const caseData = response.case
      setSelectedAdminCase(caseData || null)

      if (caseData) {
        setMinutesPdfUrl(caseData.committeeMeetingMinutes?.pdfUrl || "")
        setMinutesPdfName(caseData.committeeMeetingMinutes?.pdfName || "")
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch case details")
      setSelectedAdminCase(null)
    } finally {
      setAdminModalLoading(false)
    }
  }

  const fetchAdminCaseCounts = async () => {
    try {
      setAdminCaseCountsLoading(true)
      const [allRes, underProcessRes, rejectedRes, finalizedRes] = await Promise.all([
        discoApi.getProcessCases({ page: 1, limit: 1 }),
        discoApi.getProcessCases({ page: 1, limit: 1, caseStatus: "under_process" }),
        discoApi.getProcessCases({ page: 1, limit: 1, caseStatus: "final_rejected" }),
        discoApi.getProcessCases({ page: 1, limit: 1, caseStatus: "finalized_with_action" }),
      ])

      const extractTotal = (response) => response?.pagination?.total || response?.items?.length || 0
      setAdminCaseCounts({
        all: extractTotal(allRes),
        under_process: extractTotal(underProcessRes),
        final_rejected: extractTotal(rejectedRes),
        finalized_with_action: extractTotal(finalizedRes),
      })
    } catch {
      // Keep counts silent on failure; main table fetch already reports errors.
    } finally {
      setAdminCaseCountsLoading(false)
    }
  }

  const refreshAdminData = async () => {
    await Promise.all([fetchAdminCases(), fetchAdminCaseCounts()])
    if (selectedAdminCase?.id) {
      await fetchAdminCaseById(selectedAdminCase.id)
    }
  }

  useEffect(() => {
    if (isAdmin) fetchAdminCases()
  }, [isAdmin, adminPage, adminStatusFilter])

  useEffect(() => {
    if (isAdmin) fetchAdminCaseCounts()
  }, [isAdmin])

  useEffect(() => {
    if (!selectedAdminCase?.id) return

    // Reset viewing history when case changes
    setViewingHistoryStep(null)

    const accusingStudents = dedupeStudents(
      (selectedAdminCase.selectedStudents?.accusing || []).map((student) => ({
        userId: student.id,
        name: student.name,
        email: student.email,
      }))
    )
    const accusedStudents = dedupeStudents(
      (selectedAdminCase.selectedStudents?.accused || []).map((student) => ({
        userId: student.id,
        name: student.name,
        email: student.email,
      }))
    )

    setStage2AccusingStudents(accusingStudents)
    setStage2AccusedStudents(accusedStudents)

    const statementMap = {}
    ;(selectedAdminCase.statements || []).forEach((statement) => {
      const studentId = toIdString(statement.student?.id)
      if (!studentId) return

      statementMap[studentId] = {
        studentRole: statement.studentRole,
        pdfUrl: statement.statementPdfUrl || "",
        pdfName: statement.statementPdfName || "statement.pdf",
      }
    })
    setStage2StatementsByStudentId(statementMap)

    setStage2EvidenceDocuments(selectedAdminCase.evidenceDocuments || [])
    setStage2ExtraDocuments(selectedAdminCase.extraDocuments || [])
    setStage2EvidenceDraftName("")
    setStage2EvidenceDraftUrl("")
    setStage2ExtraDraftName("")
    setStage2ExtraDraftUrl("")

    const defaultStatementAttachments = {}
    ;(selectedAdminCase.statements || []).forEach((statement) => {
      defaultStatementAttachments[statement.id] = true
    })
    setSelectedStatementAttachmentIds(defaultStatementAttachments)

    const defaultEvidenceAttachments = {}
    ;(selectedAdminCase.evidenceDocuments || []).forEach((document) => {
      defaultEvidenceAttachments[document.id] = true
    })
    setSelectedEvidenceAttachmentIds(defaultEvidenceAttachments)

    const defaultExtraAttachments = {}
    ;(selectedAdminCase.extraDocuments || []).forEach((document) => {
      defaultExtraAttachments[document.id] = true
    })
    setSelectedExtraDocumentAttachmentIds(defaultExtraAttachments)

    setEmailTo("")
    setEmailSubject("")
    setEmailBody("")
    setIncludeInitialComplaint(true)
    setSelectedRecipientStudentIds({})
    setEmailExtraDraftName("")
    setEmailExtraDraftUrl("")
    setEmailExtraAttachments([])

    setStudentSearchRoll("")
    setStudentSearchResults([])

    setFinalDecisionMode("action")
    setFinalDecisionDescription("")
    setFinalReason("")
    setFinalActionTaken("")
    setFinalDate(todayDateInput())
    setFinalRemarks("")
    setFinalActionEntryMode("common")
    setFinalReminderItems([])
    setFinalStudentActionMap({})
    setSelectedDisciplinedStudents([])
  }, [selectedAdminCase])

  const adminCurrentStage = useMemo(
    () => deriveAdminStage(selectedAdminCase),
    [selectedAdminCase]
  )

  const allStage2Students = useMemo(
    () => dedupeStudents([...stage2AccusedStudents, ...stage2AccusingStudents]),
    [stage2AccusedStudents, stage2AccusingStudents]
  )

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const searchStudents = async (roll) => {
    const keyword = roll.trim()
    if (!keyword) {
      setStudentSearchResults([])
      return
    }

    try {
      setStudentSearchLoading(true)
      const response = await studentApi.getStudents({
        page: 1,
        limit: 10,
        rollNumber: keyword,
      })
      setStudentSearchResults(response.data || [])
    } catch (error) {
      toast.error(error.message || "Student search failed")
      setStudentSearchResults([])
    } finally {
      setStudentSearchLoading(false)
    }
  }

  const handleCreateCase = async () => {
    if (!createComplaintPdfUrl) {
      toast.error("Please upload complaint PDF")
      return
    }

    try {
      setCreatingCase(true)
      const createCaseFn =
        discoApi.createProcessCase || discoApi.submitProcessCase
      if (typeof createCaseFn !== "function") {
        throw new Error("Disciplinary case API is not available")
      }

      await createCaseFn({
        complaintPdfUrl: createComplaintPdfUrl,
        complaintPdfName:
          createComplaintPdfName ||
          getFilenameFromUrl(createComplaintPdfUrl, "complaint.pdf"),
      })

      toast.success("Disciplinary case started")
      setCreateComplaintPdfUrl("")
      setCreateComplaintPdfName("")
      setCreateModalOpen(false)
      await fetchAdminCases()
    } catch (error) {
      toast.error(error.message || "Failed to start case")
    } finally {
      setCreatingCase(false)
    }
  }

  const openAdminCase = async (row) => {
    setAdminModalOpen(true)
    await fetchAdminCaseById(row.id)
  }

  const addStudentToGroup = (student, group) => {
    const normalizedStudent = {
      userId: toIdString(student.userId),
      name: student.name,
      email: student.email || "",
      rollNumber: student.rollNumber || "",
    }

    if (!normalizedStudent.userId) return

    if (group === "accused") {
      setStage2AccusedStudents((prev) => dedupeStudents([...prev, normalizedStudent]))
      setStage2AccusingStudents((prev) => prev.filter((item) => item.userId !== normalizedStudent.userId))
      setStage2StatementsByStudentId((prev) => ({
        ...prev,
        [normalizedStudent.userId]: {
          ...(prev[normalizedStudent.userId] || {}),
          studentRole: "accused",
        },
      }))
      return
    }

    setStage2AccusingStudents((prev) => dedupeStudents([...prev, normalizedStudent]))
    setStage2AccusedStudents((prev) => prev.filter((item) => item.userId !== normalizedStudent.userId))
    setStage2StatementsByStudentId((prev) => ({
      ...prev,
      [normalizedStudent.userId]: {
        ...(prev[normalizedStudent.userId] || {}),
        studentRole: "accusing",
      },
    }))
  }

  const removeStudentFromGroup = (studentId, group) => {
    if (group === "accused") {
      setStage2AccusedStudents((prev) => prev.filter((item) => item.userId !== studentId))
    } else {
      setStage2AccusingStudents((prev) => prev.filter((item) => item.userId !== studentId))
    }

    setStage2StatementsByStudentId((prev) => {
      const next = { ...prev }
      delete next[studentId]
      return next
    })
  }

  const handleAddEvidenceDocument = () => {
    if (!stage2EvidenceDraftUrl) {
      toast.error("Upload evidence PDF first")
      return
    }

    setStage2EvidenceDocuments((prev) => [
      ...prev,
      {
        id: `local-evidence-${Date.now()}`,
        pdfUrl: stage2EvidenceDraftUrl,
        pdfName:
          stage2EvidenceDraftName ||
          getFilenameFromUrl(stage2EvidenceDraftUrl, "evidence.pdf"),
      },
    ])
    setStage2EvidenceDraftUrl("")
    setStage2EvidenceDraftName("")
  }

  const handleAddExtraDocument = () => {
    if (!stage2ExtraDraftUrl) {
      toast.error("Upload extra document PDF first")
      return
    }

    setStage2ExtraDocuments((prev) => [
      ...prev,
      {
        id: `local-extra-${Date.now()}`,
        pdfUrl: stage2ExtraDraftUrl,
        pdfName:
          stage2ExtraDraftName ||
          getFilenameFromUrl(stage2ExtraDraftUrl, "extra-document.pdf"),
      },
    ])
    setStage2ExtraDraftUrl("")
    setStage2ExtraDraftName("")
  }

  const handleSaveStageTwo = async () => {
    if (!selectedAdminCase?.id) return

    if (stage2AccusedStudents.length === 0) {
      toast.error("Select at least one accused student")
      return
    }

    const selectedStudents = dedupeStudents([...stage2AccusingStudents, ...stage2AccusedStudents])
    if (selectedStudents.length === 0) {
      toast.error("Select at least one student")
      return
    }

    const missingStatement = selectedStudents.find(
      (student) => !stage2StatementsByStudentId[student.userId]?.pdfUrl
    )
    if (missingStatement) {
      toast.error(`Upload statement PDF for ${missingStatement.name}`)
      return
    }

    const accusedSet = new Set(stage2AccusedStudents.map((item) => item.userId))

    const statements = selectedStudents.map((student) => ({
      studentUserId: student.userId,
      studentRole: accusedSet.has(student.userId) ? "accused" : "accusing",
      statementPdfUrl: stage2StatementsByStudentId[student.userId]?.pdfUrl,
      statementPdfName:
        stage2StatementsByStudentId[student.userId]?.pdfName ||
        getFilenameFromUrl(stage2StatementsByStudentId[student.userId]?.pdfUrl, "statement.pdf"),
    }))

    try {
      setStage2Saving(true)
      const saveStageTwoFn =
        discoApi.saveCaseStageTwo || discoApi.addCaseStatement
      if (typeof saveStageTwoFn !== "function") {
        throw new Error("Stage 2 save API is not available")
      }

      await saveStageTwoFn(selectedAdminCase.id, {
        accusingStudentIds: stage2AccusingStudents.map((student) => student.userId),
        accusedStudentIds: stage2AccusedStudents.map((student) => student.userId),
        statements,
        evidenceDocuments: stage2EvidenceDocuments.map((document) => ({
          pdfUrl: document.pdfUrl,
          pdfName: document.pdfName,
        })),
        extraDocuments: stage2ExtraDocuments.map((document) => ({
          pdfUrl: document.pdfUrl,
          pdfName: document.pdfName,
        })),
      })

      toast.success("Stage 2 saved")
      await refreshAdminData()
    } catch (error) {
      toast.error(error.message || "Failed to save stage 2")
    } finally {
      setStage2Saving(false)
    }
  }

  const toggleRecipientStudent = (student) => {
    if (!student?.userId) return

    setSelectedRecipientStudentIds((prev) => {
      const next = { ...prev }
      const isSelected = Boolean(next[student.userId])

      if (isSelected) {
        delete next[student.userId]
      } else {
        next[student.userId] = true
      }

      const recipients = new Set(parseRecipients(emailTo))
      if (student.email) {
        if (isSelected) {
          recipients.delete(student.email)
        } else {
          recipients.add(student.email)
        }
      }

      setEmailTo(Array.from(recipients).join(", "))
      return next
    })
  }

  const handleAddEmailExtraAttachment = () => {
    if (!emailExtraDraftUrl) {
      toast.error("Upload PDF first")
      return
    }

    setEmailExtraAttachments((prev) => [
      ...prev,
      {
        url: emailExtraDraftUrl,
        fileName:
          emailExtraDraftName ||
          getFilenameFromUrl(emailExtraDraftUrl, "attachment.pdf"),
      },
    ])
    setEmailExtraDraftUrl("")
    setEmailExtraDraftName("")
  }

  const handleSendEmail = async () => {
    if (!selectedAdminCase?.id) return

    const recipients = parseRecipients(emailTo)
    if (recipients.length === 0) {
      toast.error("Please provide recipient email IDs")
      return
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Subject and body are required")
      return
    }

    const statementIds = Object.keys(selectedStatementAttachmentIds).filter(
      (statementId) => selectedStatementAttachmentIds[statementId]
    )
    const evidenceIds = Object.keys(selectedEvidenceAttachmentIds).filter(
      (documentId) => selectedEvidenceAttachmentIds[documentId]
    )
    const extraDocumentIds = Object.keys(selectedExtraDocumentAttachmentIds).filter(
      (documentId) => selectedExtraDocumentAttachmentIds[documentId]
    )

    try {
      setEmailSubmitting(true)
      await discoApi.sendCaseEmail(selectedAdminCase.id, {
        to: recipients,
        subject: emailSubject.trim(),
        body: emailBody.trim(),
        includeInitialComplaint,
        statementIds,
        evidenceIds,
        extraDocumentIds,
        extraAttachments: emailExtraAttachments,
      })

      toast.success("Committee email sent")
      await refreshAdminData()
    } catch (error) {
      toast.error(error.message || "Failed to send email")
    } finally {
      setEmailSubmitting(false)
    }
  }

  const handleSaveMinutes = async () => {
    if (!selectedAdminCase?.id) return
    if (!minutesPdfUrl) {
      toast.error("Upload committee minutes PDF")
      return
    }

    try {
      setMinutesSubmitting(true)
      await discoApi.uploadCommitteeMinutes(selectedAdminCase.id, {
        pdfUrl: minutesPdfUrl,
        pdfName: minutesPdfName || getFilenameFromUrl(minutesPdfUrl, "committee-minutes.pdf"),
      })
      toast.success("Committee minutes saved")
      await refreshAdminData()
    } catch (error) {
      toast.error(error.message || "Failed to save minutes")
    } finally {
      setMinutesSubmitting(false)
    }
  }

  const getReminderValidationError = (items = []) =>
    items.find(
      (item) =>
        (item.action?.trim() && !item.dueDate) ||
        (!item.action?.trim() && item.dueDate)
    )
      ? "Each reminder item needs both action text and due date"
      : ""

  const buildReminderPayload = (items = []) =>
    items
      .filter((item) => item.action?.trim() && item.dueDate)
      .map((item) => ({
        action: item.action.trim(),
        dueDate: item.dueDate,
      }))

  const addFinalReminderItem = () => {
    setFinalReminderItems((prev) => [...prev, createReminderDraft()])
  }

  const updateFinalReminderItem = (index, field, value) => {
    setFinalReminderItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    )
  }

  const removeFinalReminderItem = (index) => {
    setFinalReminderItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const updateStudentActionField = (studentId, field, value) => {
    setFinalStudentActionMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || createStudentActionDraft()),
        [field]: value,
      },
    }))
  }

  const addStudentReminderItem = (studentId) => {
    setFinalStudentActionMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || createStudentActionDraft()),
        reminderItems: [
          ...((prev[studentId] || createStudentActionDraft()).reminderItems || []),
          createReminderDraft(),
        ],
      },
    }))
  }

  const updateStudentReminderItem = (studentId, index, field, value) => {
    setFinalStudentActionMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || createStudentActionDraft()),
        reminderItems: ((prev[studentId] || createStudentActionDraft()).reminderItems || []).map(
          (item, itemIndex) =>
            itemIndex === index ? { ...item, [field]: value } : item
        ),
      },
    }))
  }

  const removeStudentReminderItem = (studentId, index) => {
    setFinalStudentActionMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || createStudentActionDraft()),
        reminderItems: ((prev[studentId] || createStudentActionDraft()).reminderItems || []).filter(
          (_, itemIndex) => itemIndex !== index
        ),
      },
    }))
  }

  const toggleDisciplinedStudent = (student) => {
    setSelectedDisciplinedStudents((prev) => {
      const exists = prev.some((item) => item.userId === student.userId)
      if (exists) {
        setFinalStudentActionMap((previousMap) => {
          const nextMap = { ...previousMap }
          delete nextMap[student.userId]
          return nextMap
        })
        return prev.filter((item) => item.userId !== student.userId)
      }
      setFinalStudentActionMap((previousMap) => ({
        ...previousMap,
        [student.userId]:
          previousMap[student.userId] || {
            ...createStudentActionDraft(),
          },
      }))
      return [...prev, student]
    })
  }

  const handleFinalizeCase = async () => {
    if (!selectedAdminCase?.id) return

    if (finalDecisionMode === "reject") {
      if (!finalDecisionDescription.trim()) {
        toast.error("Please add final rejection description")
        return
      }

      try {
        setFinalDecisionSubmitting(true)
        await discoApi.finalizeProcessCase(selectedAdminCase.id, {
          decision: "reject",
          decisionDescription: finalDecisionDescription.trim(),
        })
        toast.success("Case rejected")
        await refreshAdminData()
      } catch (error) {
        toast.error(error.message || "Failed to finalize case")
      } finally {
        setFinalDecisionSubmitting(false)
      }
      return
    }

    if (selectedDisciplinedStudents.length === 0) {
      toast.error("Select at least one disciplined student")
      return
    }

    if (finalActionEntryMode === "common") {
      if (!finalReason.trim() || !finalActionTaken.trim()) {
        toast.error("Reason and action taken are required")
        return
      }

      const reminderError = getReminderValidationError(finalReminderItems)
      if (reminderError) {
        toast.error(reminderError)
        return
      }
    } else {
      for (const student of selectedDisciplinedStudents) {
        const studentAction = finalStudentActionMap[student.userId]
        if (!studentAction?.reason?.trim() || !studentAction?.actionTaken?.trim()) {
          toast.error(`Add reason and action for ${student.name}`)
          return
        }

        const reminderError = getReminderValidationError(studentAction.reminderItems || [])
        if (reminderError) {
          toast.error(`Fix reminder items for ${student.name}`)
          return
        }
      }
    }

    try {
      setFinalDecisionSubmitting(true)

      const payload =
        finalActionEntryMode === "common"
          ? {
            decision: "action",
            actionMode: "common",
            decisionDescription: finalDecisionDescription.trim(),
            studentUserIds: selectedDisciplinedStudents.map((item) => item.userId),
            reason: finalReason.trim(),
            actionTaken: finalActionTaken.trim(),
            date: finalDate || null,
            remarks: finalRemarks.trim(),
            reminderItems: buildReminderPayload(finalReminderItems),
          }
          : {
            decision: "action",
            actionMode: "per_student",
            decisionDescription: finalDecisionDescription.trim(),
            studentActions: selectedDisciplinedStudents.map((student) => {
              const studentAction = finalStudentActionMap[student.userId] || createStudentActionDraft()
              return {
                studentUserId: student.userId,
                reason: studentAction.reason.trim(),
                actionTaken: studentAction.actionTaken.trim(),
                date: studentAction.date || null,
                remarks: (studentAction.remarks || "").trim(),
                reminderItems: buildReminderPayload(studentAction.reminderItems || []),
              }
            }),
          }

      await discoApi.finalizeProcessCase(selectedAdminCase.id, {
        ...payload,
      })
      toast.success("Disciplinary actions created")
      await refreshAdminData()
    } catch (error) {
      toast.error(error.message || "Failed to finalize case")
    } finally {
      setFinalDecisionSubmitting(false)
    }
  }

  // ============================================================================
  // TABLE COLUMNS
  // ============================================================================

  const adminColumns = [
    {
      key: "id",
      header: "Case ID",
      render: (item) => (
        <span style={{ fontFamily: "monospace", color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
          #{item.id?.slice(-6)}
        </span>
      ),
    },
    {
      key: "startedBy",
      header: "Started By",
      render: (item) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>
            {item.startedBy?.name || "Unknown"}
          </span>
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
            {item.startedBy?.email || ""}
          </span>
        </div>
      ),
    },
    {
      key: "caseStatus",
      header: "Status",
      render: (item) => (
        <Badge variant={getStatusVariant(item.caseStatus)}>
          {formatStatusLabel(item.caseStatus)}
        </Badge>
      ),
    },
    {
      key: "currentStep",
      header: "Current Step",
      render: (item) => (
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
          {getStepLabel(deriveAdminStage(item))}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (item) => (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  const filteredAdminCases = useMemo(() => {
    const searchTerm = adminSearchTerm.trim().toLowerCase()
    if (!searchTerm) return adminCases

    return adminCases.filter((item) => {
      const caseId = String(item.id || "").toLowerCase()
      const shortCaseId = String(item.id || "").slice(-6).toLowerCase()
      const starterName = String(item.startedBy?.name || "").toLowerCase()
      const starterEmail = String(item.startedBy?.email || "").toLowerCase()

      return (
        caseId.includes(searchTerm) ||
        shortCaseId.includes(searchTerm) ||
        starterName.includes(searchTerm) ||
        starterEmail.includes(searchTerm)
      )
    })
  }, [adminCases, adminSearchTerm])

  const adminStatusTabs = useMemo(
    () => [
      { label: "All", value: "all", count: adminCaseCounts.all },
      { label: "Under Process", value: "under_process", count: adminCaseCounts.under_process },
      { label: "Rejected", value: "final_rejected", count: adminCaseCounts.final_rejected },
      { label: "Finalized", value: "finalized_with_action", count: adminCaseCounts.finalized_with_action },
    ],
    [adminCaseCounts]
  )
  const adminCaseStats = useMemo(
    () => [
      {
        title: "Total Cases",
        value: adminCaseCounts.all,
        subtitle: "All disciplinary cases",
        icon: <ClipboardList size={16} />,
        color: "var(--color-primary)",
      },
      {
        title: "Under Process",
        value: adminCaseCounts.under_process,
        subtitle: "In active workflow",
        icon: <AlertTriangle size={16} />,
        color: "var(--color-info)",
        tintBackground: true,
      },
      {
        title: "Finalized",
        value: adminCaseCounts.finalized_with_action,
        subtitle: "Action finalized",
        icon: <Gavel size={16} />,
        color: "var(--color-success)",
        tintBackground: true,
      },
      {
        title: "Rejected",
        value: adminCaseCounts.final_rejected,
        subtitle: "Closed as rejected",
        icon: <X size={16} />,
        color: "var(--color-danger)",
        tintBackground: true,
      },
    ],
    [adminCaseCounts]
  )

  // Step navigation for history viewing
  const canViewPreviousStep = viewingHistoryStep !== null
    ? getStepIndex(viewingHistoryStep) > 0
    : adminCurrentStage !== "closed_final" && getStepIndex(adminCurrentStage) > 0

  const canViewNextStep = viewingHistoryStep !== null
    ? getStepIndex(viewingHistoryStep) < getStepIndex(adminCurrentStage) - 1
    : false

  const navigateStep = (direction) => {
    const currentViewingIndex = viewingHistoryStep !== null
      ? getStepIndex(viewingHistoryStep)
      : getStepIndex(adminCurrentStage)

    if (direction === "prev" && currentViewingIndex > 0) {
      setViewingHistoryStep(STEP_DEFINITIONS[currentViewingIndex - 1].id)
    } else if (direction === "next") {
      const nextIndex = currentViewingIndex + 1
      if (nextIndex >= getStepIndex(adminCurrentStage)) {
        setViewingHistoryStep(null)
      } else {
        setViewingHistoryStep(STEP_DEFINITIONS[nextIndex].id)
      }
    }
  }

  const exitHistoryView = () => {
    setViewingHistoryStep(null)
  }

  // Determine which step content to render
  const displayedStep = viewingHistoryStep || adminCurrentStage

  if (!isAdmin) {
    return (
      <div className="flex-1">
        <PageHeader title="Disciplinary Process" subtitle="Access denied" />
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PageHeader
        title="Disciplinary Process"
        subtitle="Admin-initiated case workflow"
      >
        <Button variant="primary" size="md" onClick={() => setCreateModalOpen(true)}>
          <Plus size={14} /> New Case
        </Button>
      </PageHeader>

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-4) var(--spacing-6)" }}>
        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <StatCards
            stats={adminCaseStats}
            columns={4}
            loading={adminCaseCountsLoading}
            loadingCount={4}
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Tabs
              variant="pills"
              tabs={adminStatusTabs}
              activeTab={adminStatusFilter}
              setActiveTab={(value) => {
                setAdminStatusFilter(value)
                setAdminPage(1)
              }}
            />
          </div>

          <div className="w-full lg:w-90 lg:max-w-90">
            <Input
              type="text"
              icon={<Search size={14} />}
              value={adminSearchTerm}
              placeholder="Search cases..."
              onChange={(event) => setAdminSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: "var(--spacing-3)" }}>
          <DataTable
            columns={adminColumns}
            data={filteredAdminCases}
            loading={adminCasesLoading}
            emptyMessage="No disciplinary cases found"
            onRowClick={openAdminCase}
          />
        </div>
      </div>

      <PageFooter
        leftContent={[
          <span key="count" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
              {adminCasesLoading ? 0 : filteredAdminCases.length}
            </span>
            {" / "}
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
              {adminCasesLoading ? 0 : adminTotalCount}
            </span>
            {" cases"}
          </span>,
        ]}
        rightContent={[
          <Pagination
            key="pagination"
            currentPage={adminPage}
            totalPages={adminTotalPages}
            paginate={setAdminPage}
            compact
            showPageInfo={false}
          />,
        ]}
      />

      {/* Create Case Modal */}
      <Modal
        title="Start New Case"
        onClose={() => setCreateModalOpen(false)}
        width={480}
        isOpen={createModalOpen}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <div style={sectionLabelStyle}>
            <FileText size={12} style={{ display: "inline", marginRight: 4 }} />
            Complaint Document
          </div>
          
          <PdfUploadField
            label="Upload Complaint PDF"
            value={createComplaintPdfUrl}
            onChange={setCreateComplaintPdfUrl}
            onUpload={async (file) => {
              setCreateComplaintPdfName(file.name)
              return uploadDiscoProcessPdf(file)
            }}
            viewerTitle="Complaint PDF"
            viewerSubtitle="Initial Complaint"
            downloadFileName={createComplaintPdfName || "complaint.pdf"}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)", marginTop: "var(--spacing-2)" }}>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={creatingCase} onClick={handleCreateCase}>
              <Plus size={14} /> Create Case
            </Button>
          </div>
        </div>
      </Modal>

      {/* Case Detail Modal */}
      <Modal
        title={
          selectedAdminCase
            ? `Case #${selectedAdminCase.id?.slice(-6)}`
            : "Case Details"
        }
        onClose={() => setAdminModalOpen(false)}
        width={900}
        isOpen={adminModalOpen}
        footer={
          adminCurrentStage !== "closed_final" && selectedAdminCase && !adminModalLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {(canViewPreviousStep || viewingHistoryStep) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canViewPreviousStep}
                      onClick={() => navigateStep("prev")}
                    >
                      <ChevronLeft size={14} /> Previous
                    </Button>
                    {viewingHistoryStep && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exitHistoryView}
                      >
                        Back to Current
                      </Button>
                    )}
                    {canViewNextStep && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateStep("next")}
                      >
                        Next <ChevronRight size={14} />
                      </Button>
                    )}
                  </>
                )}
              </div>
              <StepIndicator
                steps={STEP_DEFINITIONS}
                currentStep={adminCurrentStage}
                compact
                onStepClick={(stepId) => setViewingHistoryStep(stepId)}
              />
            </div>
          ) : null
        }
      >
        {adminModalLoading ? (
          <div style={{ padding: "var(--spacing-8)", textAlign: "center", color: "var(--color-text-muted)" }}>
            Loading case details...
          </div>
        ) : !selectedAdminCase ? (
          <div style={{ padding: "var(--spacing-8)", textAlign: "center", color: "var(--color-text-muted)" }}>
            Case details unavailable
          </div>
        ) : adminCurrentStage === "closed_final" ? (
          <CaseSummaryView caseData={selectedAdminCase} onViewPdf={showPdf} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            {/* Case Header - always visible */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--spacing-2) var(--spacing-3)",
                backgroundColor: "var(--color-bg-secondary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                  Started by <strong>{selectedAdminCase.startedBy?.name || "Unknown"}</strong>
                </span>
                <Badge variant={getStatusVariant(selectedAdminCase.caseStatus)}>
                  {formatStatusLabel(selectedAdminCase.caseStatus)}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  showPdf(
                    selectedAdminCase.complaintPdfUrl,
                    "Complaint PDF",
                    selectedAdminCase.complaintPdfName || "complaint.pdf"
                  )
                }
              >
                <Eye size={12} /> Complaint
              </Button>
            </div>

            {/* History Mode Banner */}
            {viewingHistoryStep && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "var(--spacing-2) var(--spacing-3)",
                  backgroundColor: "var(--color-info-bg-light)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-info-bg)",
                }}
              >
                <AlertTriangle size={14} style={{ color: "var(--color-info)" }} />
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-info-text)" }}>
                  Viewing history: {getStepLabel(viewingHistoryStep)} (read-only)
                </span>
              </div>
            )}

            {/* Step 2: Collection */}
            {displayedStep === "step2_collection" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={sectionLabelStyle}>
                    <ClipboardList size={12} style={{ display: "inline", marginRight: 4 }} />
                    Student & Document Collection
                  </div>
                </div>

                {/* Student Search */}
                <div style={compactInputRowStyle}>
                  <Input
                    placeholder="Search by roll number"
                    value={studentSearchRoll}
                    onChange={(event) => setStudentSearchRoll(event.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchStudents(studentSearchRoll)}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={studentSearchLoading}
                    onClick={() => searchStudents(studentSearchRoll)}
                  >
                    <Search size={12} />
                  </Button>
                </div>

                {/* Search Results */}
                {studentSearchResults.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
                    {studentSearchResults.map((student) => (
                      <div
                        key={student.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 8px",
                          backgroundColor: "var(--color-bg-primary)",
                          borderRadius: "var(--radius-badge)",
                          border: "1px solid var(--color-border-primary)",
                          fontSize: "var(--font-size-xs)",
                        }}
                      >
                        <User size={12} style={{ color: "var(--color-text-muted)" }} />
                        <span style={{ fontWeight: "var(--font-weight-medium)" }}>{student.rollNumber}</span>
                        <span style={{ color: "var(--color-text-muted)" }}>{student.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          style={{ padding: "2px 4px", fontSize: "var(--font-size-2xs)" }}
                          onClick={() => addStudentToGroup(student, "accusing")}
                        >
                          +Accusing
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          style={{ padding: "2px 4px", fontSize: "var(--font-size-2xs)", color: "var(--color-danger)" }}
                          onClick={() => addStudentToGroup(student, "accused")}
                        >
                          +Accused
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Students */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
                  <StudentTagGroup
                    label="Accused (Required)"
                    students={stage2AccusedStudents}
                    role="accused"
                    onRemove={(id) => removeStudentFromGroup(id, "accused")}
                    emptyText="None selected"
                  />
                  <StudentTagGroup
                    label="Accusing (Optional)"
                    students={stage2AccusingStudents}
                    role="accusing"
                    onRemove={(id) => removeStudentFromGroup(id, "accusing")}
                    emptyText="None selected"
                  />
                </div>

                {/* Statements Section */}
                {allStage2Students.length > 0 && (
                  <div>
                    <div style={sectionLabelStyle}>
                      <FileText size={12} style={{ display: "inline", marginRight: 4 }} />
                      Statements (One PDF per student)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                      {allStage2Students.map((student) => {
                        const isAccused = stage2AccusedStudents.some((item) => item.userId === student.userId)
                        const role = isAccused ? "accused" : "accusing"
                        const statement = stage2StatementsByStudentId[student.userId] || {
                          studentRole: role,
                          pdfUrl: "",
                          pdfName: "",
                        }

                        return (
                          <div
                            key={student.userId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--spacing-2)",
                              padding: "var(--spacing-2)",
                              backgroundColor: "var(--color-bg-secondary)",
                              borderRadius: "var(--radius-md)",
                              border: `1px solid ${statement.pdfUrl ? "var(--color-success-bg)" : "var(--color-border-primary)"}`,
                            }}
                          >
                            <CompactStudentTag
                              name={student.name}
                              rollNumber={student.rollNumber}
                              role={role}
                            />
                            <div style={{ flex: 1 }}>
                              <PdfUploadField
                                label=""
                                compact
                                value={statement.pdfUrl}
                                onChange={(url) =>
                                  setStage2StatementsByStudentId((prev) => ({
                                    ...prev,
                                    [student.userId]: {
                                      ...(prev[student.userId] || {}),
                                      studentRole: role,
                                      pdfUrl: url,
                                      pdfName:
                                        url === ""
                                          ? ""
                                          : prev[student.userId]?.pdfName ||
                                            getFilenameFromUrl(url, "statement.pdf"),
                                    },
                                  }))
                                }
                                onUpload={async (file) => {
                                  setStage2StatementsByStudentId((prev) => ({
                                    ...prev,
                                    [student.userId]: {
                                      ...(prev[student.userId] || {}),
                                      studentRole: role,
                                      pdfName: file.name,
                                    },
                                  }))
                                  return uploadDiscoProcessPdf(file)
                                }}
                                viewerTitle={`${student.name} - Statement`}
                                viewerSubtitle={getStatementRoleLabel(role)}
                                downloadFileName={statement.pdfName || "statement.pdf"}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Evidence & Extra Documents */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
                  <div>
                    <div style={sectionLabelStyle}>Evidence Documents</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <PdfUploadField
                        label=""
                        compact
                        value={stage2EvidenceDraftUrl}
                        onChange={setStage2EvidenceDraftUrl}
                        onUpload={async (file) => {
                          setStage2EvidenceDraftName(file.name)
                          return uploadDiscoProcessPdf(file)
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={handleAddEvidenceDocument}>
                        <Plus size={12} /> Add
                      </Button>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {stage2EvidenceDocuments.map((doc, index) => (
                          <button
                            key={doc.id || index}
                            type="button"
                            style={documentChipStyle}
                            onClick={() => showPdf(doc.pdfUrl, "Evidence", doc.pdfName)}
                          >
                            <FileText size={10} />
                            {doc.pdfName?.slice(0, 20) || "Evidence"}
                            <X
                              size={10}
                              style={{ marginLeft: 4, color: "var(--color-danger)" }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setStage2EvidenceDocuments((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={sectionLabelStyle}>Extra Documents</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <PdfUploadField
                        label=""
                        compact
                        value={stage2ExtraDraftUrl}
                        onChange={setStage2ExtraDraftUrl}
                        onUpload={async (file) => {
                          setStage2ExtraDraftName(file.name)
                          return uploadDiscoProcessPdf(file)
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={handleAddExtraDocument}>
                        <Plus size={12} /> Add
                      </Button>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {stage2ExtraDocuments.map((doc, index) => (
                          <button
                            key={doc.id || index}
                            type="button"
                            style={documentChipStyle}
                            onClick={() => showPdf(doc.pdfUrl, "Extra Document", doc.pdfName)}
                          >
                            <FileText size={10} />
                            {doc.pdfName?.slice(0, 20) || "Document"}
                            <X
                              size={10}
                              style={{ marginLeft: 4, color: "var(--color-danger)" }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setStage2ExtraDocuments((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {!viewingHistoryStep && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="primary" size="sm" loading={stage2Saving} onClick={handleSaveStageTwo}>
                      Save & Continue <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Committee Email */}
            {displayedStep === "step3_email" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <div style={sectionLabelStyle}>
                  <Mail size={12} style={{ display: "inline", marginRight: 4 }} />
                  Committee Email
                </div>

                {/* Quick Recipients */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {allStage2Students.map((student) => (
                    <button
                      key={student.userId}
                      type="button"
                      onClick={() => toggleRecipientStudent(student)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "var(--radius-badge)",
                        border: selectedRecipientStudentIds[student.userId]
                          ? "1px solid var(--color-primary)"
                          : "1px solid var(--color-border-primary)",
                        backgroundColor: selectedRecipientStudentIds[student.userId]
                          ? "var(--color-primary-bg)"
                          : "var(--color-bg-secondary)",
                        fontSize: "var(--font-size-xs)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {student.name}
                    </button>
                  ))}
                </div>

                <Textarea
                  placeholder="Recipients (comma/newline separated)"
                  rows={2}
                  value={emailTo}
                  onChange={(event) => setEmailTo(event.target.value)}
                />

                <Input
                  placeholder="Subject"
                  value={emailSubject}
                  onChange={(event) => setEmailSubject(event.target.value)}
                />

                <Textarea
                  placeholder="Email body"
                  rows={4}
                  value={emailBody}
                  onChange={(event) => setEmailBody(event.target.value)}
                />

                {/* Attachments */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--spacing-2)" }}>
                  <div style={{ padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
                    <Checkbox
                      checked={includeInitialComplaint}
                      onChange={(e) => setIncludeInitialComplaint(e.target.checked)}
                      label="Include Complaint PDF"
                      size="small"
                    />
                  </div>

                  {(selectedAdminCase.statements || []).map((statement) => (
                    <div
                      key={statement.id}
                      style={{ padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}
                    >
                      <Checkbox
                        checked={Boolean(selectedStatementAttachmentIds[statement.id])}
                        onChange={(e) =>
                          setSelectedStatementAttachmentIds((prev) => ({
                            ...prev,
                            [statement.id]: e.target.checked,
                          }))
                        }
                        label={`${statement.student?.name || "Student"} (${getStatementRoleLabel(statement.studentRole)})`}
                        size="small"
                      />
                    </div>
                  ))}

                  {(selectedAdminCase.evidenceDocuments || []).map((doc) => (
                    <div
                      key={doc.id}
                      style={{ padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}
                    >
                      <Checkbox
                        checked={Boolean(selectedEvidenceAttachmentIds[doc.id])}
                        onChange={(e) =>
                          setSelectedEvidenceAttachmentIds((prev) => ({
                            ...prev,
                            [doc.id]: e.target.checked,
                          }))
                        }
                        label={doc.pdfName || "Evidence"}
                        size="small"
                      />
                    </div>
                  ))}

                  {(selectedAdminCase.extraDocuments || []).map((doc) => (
                    <div
                      key={doc.id}
                      style={{ padding: "var(--spacing-2)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}
                    >
                      <Checkbox
                        checked={Boolean(selectedExtraDocumentAttachmentIds[doc.id])}
                        onChange={(e) =>
                          setSelectedExtraDocumentAttachmentIds((prev) => ({
                            ...prev,
                            [doc.id]: e.target.checked,
                          }))
                        }
                        label={doc.pdfName || "Extra Document"}
                        size="small"
                      />
                    </div>
                  ))}
                </div>

                {/* Extra Attachment Upload */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                  <PdfUploadField
                    label=""
                    compact
                    value={emailExtraDraftUrl}
                    onChange={setEmailExtraDraftUrl}
                    onUpload={async (file) => {
                      setEmailExtraDraftName(file.name)
                      return uploadDiscoProcessPdf(file)
                    }}
                  />
                  <Button variant="outline" size="sm" onClick={handleAddEmailExtraAttachment}>
                    <Plus size={12} /> Add
                  </Button>
                  {emailExtraAttachments.map((item, index) => (
                    <Badge key={`${item.url}-${index}`} variant="primary">
                      {item.fileName}
                    </Badge>
                  ))}
                </div>

                {!viewingHistoryStep && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="primary" size="sm" loading={emailSubmitting} onClick={handleSendEmail}>
                      <Mail size={14} /> Send & Continue
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Committee Minutes */}
            {displayedStep === "step4_minutes" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <div style={sectionLabelStyle}>
                  <FileText size={12} style={{ display: "inline", marginRight: 4 }} />
                  Committee Minutes
                </div>

                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  Email sent to committee. Upload the meeting minutes to proceed.
                </div>

                <PdfUploadField
                  label="Committee Minutes PDF"
                  value={minutesPdfUrl}
                  onChange={setMinutesPdfUrl}
                  onUpload={async (file) => {
                    setMinutesPdfName(file.name)
                    return uploadDiscoProcessPdf(file)
                  }}
                />

                {!viewingHistoryStep && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="primary" size="sm" loading={minutesSubmitting} onClick={handleSaveMinutes}>
                      Save & Continue <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Final Decision */}
            {displayedStep === "step5_final" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={sectionLabelStyle}>
                    <Gavel size={12} style={{ display: "inline", marginRight: 4 }} />
                    Final Decision
                  </div>
                  {selectedAdminCase.committeeMeetingMinutes?.pdfUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        showPdf(
                          selectedAdminCase.committeeMeetingMinutes.pdfUrl,
                          "Committee Minutes",
                          selectedAdminCase.committeeMeetingMinutes.pdfName
                        )
                      }
                    >
                      <Eye size={12} /> Minutes
                    </Button>
                  )}
                </div>

                {/* Decision Mode */}
                <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
                  <Radio
                    checked={finalDecisionMode === "action"}
                    onChange={() => setFinalDecisionMode("action")}
                    label="Take Action"
                    name="decisionMode"
                  />
                  <Radio
                    checked={finalDecisionMode === "reject"}
                    onChange={() => setFinalDecisionMode("reject")}
                    label="Reject Case"
                    name="decisionMode"
                  />
                </div>

                <Textarea
                  placeholder="Final decision description"
                  rows={2}
                  value={finalDecisionDescription}
                  onChange={(event) => setFinalDecisionDescription(event.target.value)}
                />

                {finalDecisionMode === "action" && (
                  <>
                    {/* Select Disciplined Students */}
                    <div>
                      <div style={sectionLabelStyle}>Select Disciplined Students</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {stage2AccusedStudents.map((student) => {
                          const selected = selectedDisciplinedStudents.some(
                            (item) => item.userId === student.userId
                          )
                          return (
                            <button
                              key={student.userId}
                              type="button"
                              onClick={() => toggleDisciplinedStudent(student)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "var(--radius-badge)",
                                border: selected
                                  ? "1px solid var(--color-danger)"
                                  : "1px solid var(--color-border-primary)",
                                backgroundColor: selected
                                  ? "var(--color-danger-bg)"
                                  : "var(--color-bg-secondary)",
                                fontSize: "var(--font-size-xs)",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {student.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Action Entry Mode */}
                    <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
                      <Radio
                        checked={finalActionEntryMode === "common"}
                        onChange={() => setFinalActionEntryMode("common")}
                        label="Common action for all"
                        name="actionEntryMode"
                      />
                      <Radio
                        checked={finalActionEntryMode === "per_student"}
                        onChange={() => setFinalActionEntryMode("per_student")}
                        label="Per-student action"
                        name="actionEntryMode"
                      />
                    </div>

                    {finalActionEntryMode === "common" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                        <Input
                          placeholder="Reason"
                          value={finalReason}
                          onChange={(event) => setFinalReason(event.target.value)}
                        />
                        <Input
                          placeholder="Action Taken"
                          value={finalActionTaken}
                          onChange={(event) => setFinalActionTaken(event.target.value)}
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
                          <Input
                            type="date"
                            value={finalDate}
                            onChange={(event) => setFinalDate(event.target.value)}
                          />
                          <Input
                            placeholder="Remarks (optional)"
                            value={finalRemarks}
                            onChange={(event) => setFinalRemarks(event.target.value)}
                          />
                        </div>

                        {/* Reminder Items */}
                        <div style={sectionLabelStyle}>Reminder Items (Optional)</div>
                        {finalReminderItems.map((item, index) => (
                          <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 140px auto", gap: "var(--spacing-2)", alignItems: "center" }}>
                            <Input
                              placeholder="Reminder action"
                              value={item.action}
                              onChange={(event) => updateFinalReminderItem(index, "action", event.target.value)}
                            />
                            <Input
                              type="date"
                              value={item.dueDate}
                              onChange={(event) => updateFinalReminderItem(index, "dueDate", event.target.value)}
                            />
                            <Button size="sm" variant="ghost" onClick={() => removeFinalReminderItem(index)}>
                              <X size={12} />
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" onClick={addFinalReminderItem}>
                          <Plus size={12} /> Add Reminder
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                        {selectedDisciplinedStudents.length === 0 ? (
                          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                            Select students first
                          </div>
                        ) : (
                          selectedDisciplinedStudents.map((student) => {
                            const studentAction = finalStudentActionMap[student.userId] || createStudentActionDraft()
                            return (
                              <div
                                key={student.userId}
                                style={{
                                  padding: "var(--spacing-3)",
                                  backgroundColor: "var(--color-bg-secondary)",
                                  borderRadius: "var(--radius-md)",
                                  border: "1px solid var(--color-border-primary)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "var(--spacing-2)",
                                }}
                              >
                                <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", fontSize: "var(--font-size-sm)" }}>
                                  {student.name}
                                </div>
                                <Input
                                  placeholder="Reason"
                                  value={studentAction.reason}
                                  onChange={(event) => updateStudentActionField(student.userId, "reason", event.target.value)}
                                />
                                <Input
                                  placeholder="Action Taken"
                                  value={studentAction.actionTaken}
                                  onChange={(event) => updateStudentActionField(student.userId, "actionTaken", event.target.value)}
                                />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
                                  <Input
                                    type="date"
                                    value={studentAction.date || ""}
                                    onChange={(event) => updateStudentActionField(student.userId, "date", event.target.value)}
                                  />
                                  <Input
                                    placeholder="Remarks"
                                    value={studentAction.remarks || ""}
                                    onChange={(event) => updateStudentActionField(student.userId, "remarks", event.target.value)}
                                  />
                                </div>

                                {/* Student Reminder Items */}
                                {(studentAction.reminderItems || []).map((item, index) => (
                                  <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 140px auto", gap: "var(--spacing-2)", alignItems: "center" }}>
                                    <Input
                                      placeholder="Reminder action"
                                      value={item.action}
                                      onChange={(event) => updateStudentReminderItem(student.userId, index, "action", event.target.value)}
                                    />
                                    <Input
                                      type="date"
                                      value={item.dueDate}
                                      onChange={(event) => updateStudentReminderItem(student.userId, index, "dueDate", event.target.value)}
                                    />
                                    <Button size="sm" variant="ghost" onClick={() => removeStudentReminderItem(student.userId, index)}>
                                      <X size={12} />
                                    </Button>
                                  </div>
                                ))}
                                <Button size="sm" variant="outline" onClick={() => addStudentReminderItem(student.userId)}>
                                  <Plus size={12} /> Add Reminder
                                </Button>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </>
                )}

                {!viewingHistoryStep && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant={finalDecisionMode === "reject" ? "danger" : "success"}
                      size="sm"
                      loading={finalDecisionSubmitting}
                      onClick={handleFinalizeCase}
                    >
                      {finalDecisionMode === "reject" ? (
                        <>
                          <X size={14} /> Reject Case
                        </>
                      ) : (
                        <>
                          <Gavel size={14} /> Finalize & Create Actions
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={pdfViewer.open}
        onClose={() =>
          setPdfViewer({ open: false, url: "", title: "Document", fileName: "document.pdf" })
        }
        documentUrl={pdfViewer.url}
        title={pdfViewer.title}
        downloadFileName={pdfViewer.fileName}
      />
    </div>
  )
}

export default DisciplinaryProcessPage
