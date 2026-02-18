import { useEffect, useMemo, useState } from "react"
import { Tabs, Button, DataTable, Modal, Input } from "czero/react"
import { Eye, Plus, Search, X } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import PageFooter from "../../components/common/PageFooter"
import PdfUploadField from "../../components/common/pdf/PdfUploadField"
import PdfViewerModal from "../../components/common/pdf/PdfViewerModal"
import { Badge, Pagination, Textarea, useToast } from "@/components/ui"
import { discoApi, studentApi, uploadApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"

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

const getStageLabel = (stage) => {
  switch (stage) {
    case "step2_collection":
      return "Step 2 - Student Statements and Documents"
    case "step3_email":
      return "Step 3 - Committee Email"
    case "step4_minutes":
      return "Step 4 - Committee Minutes"
    case "step5_final":
      return "Step 5 - Final Decision"
    case "closed_final":
      return "Closed - Final Decision Recorded"
    default:
      return "In Progress"
  }
}

const cardStyle = {
  border: "var(--border-1) solid var(--color-border-primary)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-primary)",
  padding: "var(--spacing-4)",
}

const sectionTitleStyle = {
  margin: 0,
  color: "var(--color-text-primary)",
  fontSize: "var(--font-size-lg)",
  fontWeight: "var(--font-weight-semibold)",
}

const DisciplinaryProcessPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  const isAdmin = ["Admin", "Super Admin"].includes(user?.role)

  const [pdfViewer, setPdfViewer] = useState({
    open: false,
    url: "",
    title: "Document",
    fileName: "document.pdf",
  })

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createComplaintPdfUrl, setCreateComplaintPdfUrl] = useState("")
  const [createComplaintPdfName, setCreateComplaintPdfName] = useState("")
  const [creatingCase, setCreatingCase] = useState(false)

  const [adminCases, setAdminCases] = useState([])
  const [adminCasesLoading, setAdminCasesLoading] = useState(false)
  const [adminStatusFilter, setAdminStatusFilter] = useState("all")
  const [adminSearchTerm, setAdminSearchTerm] = useState("")
  const [adminPage, setAdminPage] = useState(1)
  const [adminTotalPages, setAdminTotalPages] = useState(1)
  const [adminTotalCount, setAdminTotalCount] = useState(0)

  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [adminModalLoading, setAdminModalLoading] = useState(false)
  const [selectedAdminCase, setSelectedAdminCase] = useState(null)

  const [studentSearchRoll, setStudentSearchRoll] = useState("")
  const [studentSearchLoading, setStudentSearchLoading] = useState(false)
  const [studentSearchResults, setStudentSearchResults] = useState([])

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

  const [minutesPdfUrl, setMinutesPdfUrl] = useState("")
  const [minutesPdfName, setMinutesPdfName] = useState("")
  const [minutesSubmitting, setMinutesSubmitting] = useState(false)

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

  const refreshAdminData = async () => {
    await fetchAdminCases()
    if (selectedAdminCase?.id) {
      await fetchAdminCaseById(selectedAdminCase.id)
    }
  }

  useEffect(() => {
    if (isAdmin) fetchAdminCases()
  }, [isAdmin, adminPage, adminStatusFilter])

  useEffect(() => {
    if (!selectedAdminCase?.id) return

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

  const adminColumns = [
    {
      key: "id",
      header: "Case ID",
      render: (item) => (
        <span style={{ fontFamily: "monospace", color: "var(--color-text-secondary)" }}>
          #{item.id?.slice(-6)}
        </span>
      ),
    },
    {
      key: "startedBy",
      header: "Started By",
      render: (item) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-medium)" }}>
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
      header: "Case Status",
      render: (item) => (
        <Badge variant={getStatusVariant(item.caseStatus)}>
          {formatStatusLabel(item.caseStatus)}
        </Badge>
      ),
    },
    {
      key: "currentStep",
      header: "Current Step",
      render: (item) => getStageLabel(deriveAdminStage(item)),
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (item) => new Date(item.updatedAt).toLocaleString(),
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
      { label: "All", value: "all" },
      { label: "Under Process", value: "under_process" },
      { label: "Final Rejected", value: "final_rejected" },
      { label: "Finalized", value: "finalized_with_action" },
    ],
    []
  )

  if (!isAdmin) {
    return (
      <div className="flex-1">
        <PageHeader title="Disciplinary Process" subtitle="Access denied" />
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <PageHeader
        title="Disciplinary Process"
        subtitle="Admin-initiated case workflow with statements, evidence, committee communication, and final action"
      >
        <Button variant="primary" size="md" onClick={() => setCreateModalOpen(true)}>
          <Plus size={14} /> Start New Case
        </Button>
      </PageHeader>

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-6) var(--spacing-8)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="w-full lg:w-[420px] lg:max-w-[420px]">
            <Input
              type="text"
              icon={<Search size={16} />}
              value={adminSearchTerm}
              placeholder="Search by case ID, starter name, or email..."
              onChange={(event) => setAdminSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: "var(--spacing-4)" }}>
          <DataTable
            columns={adminColumns}
            data={filteredAdminCases}
            loading={adminCasesLoading}
            emptyMessage="No disciplinary cases match your current filters"
            onRowClick={openAdminCase}
          />
        </div>
      </div>

      <PageFooter
        leftContent={[
          <span key="count" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Showing{" "}
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
              {adminCasesLoading ? 0 : filteredAdminCases.length}
            </span>{" "}
            of{" "}
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
              {adminCasesLoading ? 0 : adminTotalCount}
            </span>{" "}
            cases
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

      <Modal
        title="Start Disciplinary Case"
        onClose={() => setCreateModalOpen(false)}
        width={700}
        isOpen={createModalOpen}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <PdfUploadField
            label="Complaint PDF"
            value={createComplaintPdfUrl}
            onChange={setCreateComplaintPdfUrl}
            onUpload={async (file) => {
              setCreateComplaintPdfName(file.name)
              return uploadDiscoProcessPdf(file)
            }}
            viewerTitle="Complaint PDF"
            viewerSubtitle="Case Complaint"
            downloadFileName={createComplaintPdfName || "complaint.pdf"}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={creatingCase} onClick={handleCreateCase}>
              Create Case
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          selectedAdminCase
            ? `Case #${selectedAdminCase.id?.slice(-6)} - ${getStageLabel(adminCurrentStage)}`
            : "Case Details"
        }
        onClose={() => setAdminModalOpen(false)}
        width={1080}
        isOpen={adminModalOpen}
      >
        {adminModalLoading ? (
          <div style={{ color: "var(--color-text-muted)" }}>Loading case details...</div>
        ) : !selectedAdminCase ? (
          <div style={{ color: "var(--color-text-muted)" }}>Case details unavailable</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div style={{ ...cardStyle, padding: "var(--spacing-3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-semibold)" }}>
                    Started by {selectedAdminCase.startedBy?.name || "Unknown"}
                  </div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    {selectedAdminCase.startedBy?.email || ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                  <Badge variant={getStatusVariant(selectedAdminCase.caseStatus)}>
                    {formatStatusLabel(selectedAdminCase.caseStatus)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      showPdf(
                        selectedAdminCase.complaintPdfUrl,
                        "Complaint PDF",
                        selectedAdminCase.complaintPdfName || "complaint.pdf"
                      )
                    }
                  >
                    <Eye size={14} /> Complaint PDF
                  </Button>
                </div>
              </div>
            </div>

            {adminCurrentStage === "step2_collection" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                <h4 style={sectionTitleStyle}>Step 2: Statement Collection and Document Setup</h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--spacing-2)" }}>
                  <Input
                    placeholder="Search student by roll number"
                    value={studentSearchRoll}
                    onChange={(event) => setStudentSearchRoll(event.target.value)}
                  />
                  <Button
                    variant="secondary"
                    loading={studentSearchLoading}
                    onClick={() => searchStudents(studentSearchRoll)}
                  >
                    Search
                  </Button>
                </div>

                {studentSearchResults.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                    {studentSearchResults.map((student) => (
                      <div
                        key={student.userId}
                        style={{
                          border: "var(--border-1) solid var(--color-border-primary)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--spacing-2)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "var(--spacing-2)",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-medium)" }}>
                            {student.rollNumber} - {student.name}
                          </div>
                          <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                            {student.email || "No email"}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addStudentToGroup(student, "accusing")}
                          >
                            Add as Accusing
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addStudentToGroup(student, "accused")}
                          >
                            Add as Accused
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "var(--spacing-3)",
                  }}
                >
                  <div style={{ ...cardStyle, padding: "var(--spacing-3)" }}>
                    <div style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-semibold)" }}>
                      Accusing Students (Optional)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", marginTop: "var(--spacing-2)" }}>
                      {stage2AccusingStudents.length === 0 ? (
                        <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                          No accusing students selected
                        </div>
                      ) : (
                        stage2AccusingStudents.map((student) => (
                          <div
                            key={student.userId}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "var(--spacing-2)",
                              border: "var(--border-1) solid var(--color-border-primary)",
                              borderRadius: "var(--radius-md)",
                              padding: "var(--spacing-2)",
                            }}
                          >
                            <div>
                              <div style={{ color: "var(--color-text-primary)" }}>{student.name}</div>
                              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                                {student.email || "No email"}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeStudentFromGroup(student.userId, "accusing")}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ ...cardStyle, padding: "var(--spacing-3)" }}>
                    <div style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-semibold)" }}>
                      Accused Students (Required)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", marginTop: "var(--spacing-2)" }}>
                      {stage2AccusedStudents.length === 0 ? (
                        <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                          No accused students selected
                        </div>
                      ) : (
                        stage2AccusedStudents.map((student) => (
                          <div
                            key={student.userId}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "var(--spacing-2)",
                              border: "var(--border-1) solid var(--color-border-primary)",
                              borderRadius: "var(--radius-md)",
                              padding: "var(--spacing-2)",
                            }}
                          >
                            <div>
                              <div style={{ color: "var(--color-text-primary)" }}>{student.name}</div>
                              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                                {student.email || "No email"}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeStudentFromGroup(student.userId, "accused")}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: "var(--spacing-3)" }}>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-semibold)", marginBottom: "var(--spacing-2)" }}>
                    Student Statements (One PDF per selected student)
                  </div>

                  {allStage2Students.length === 0 ? (
                    <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                      Select students first to upload statements
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
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
                              border: "var(--border-1) solid var(--color-border-primary)",
                              borderRadius: "var(--radius-md)",
                              padding: "var(--spacing-3)",
                            }}
                          >
                            <div style={{ marginBottom: "var(--spacing-2)" }}>
                              <div style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-medium)" }}>
                                {student.name}
                              </div>
                              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                                {getStatementRoleLabel(role)} student
                              </div>
                            </div>
                            <PdfUploadField
                              label={`${getStatementRoleLabel(role)} Statement PDF`}
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
                        )
                      })}
                    </div>
                  )}
                </div>

                <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-semibold)" }}>
                    Evidence Documents
                  </div>

                  <PdfUploadField
                    label="Evidence PDF"
                    value={stage2EvidenceDraftUrl}
                    onChange={setStage2EvidenceDraftUrl}
                    onUpload={async (file) => {
                      setStage2EvidenceDraftName(file.name)
                      return uploadDiscoProcessPdf(file)
                    }}
                    viewerTitle="Evidence Document"
                    downloadFileName={stage2EvidenceDraftName || "evidence.pdf"}
                  />

                  <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                    <Button variant="secondary" size="sm" onClick={handleAddEvidenceDocument}>
                      Add Evidence
                    </Button>
                    {stage2EvidenceDocuments.map((document, index) => (
                      <div
                        key={document.id || `${document.pdfUrl}-${index}`}
                        style={{
                          border: "var(--border-1) solid var(--color-border-primary)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--spacing-1) var(--spacing-2)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--spacing-1)",
                        }}
                      >
                        <button
                          type="button"
                          style={{ color: "var(--color-primary)", background: "transparent", border: "none", cursor: "pointer" }}
                          onClick={() =>
                            showPdf(
                              document.pdfUrl,
                              "Evidence Document",
                              document.pdfName || "evidence.pdf"
                            )
                          }
                        >
                          {document.pdfName || "evidence.pdf"}
                        </button>
                        <button
                          type="button"
                          style={{ color: "var(--color-danger)", background: "transparent", border: "none", cursor: "pointer" }}
                          onClick={() =>
                            setStage2EvidenceDocuments((prev) =>
                              prev.filter((_, docIndex) => docIndex !== index)
                            )
                          }
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-semibold)" }}>
                    Extra Documents
                  </div>

                  <PdfUploadField
                    label="Extra Document PDF"
                    value={stage2ExtraDraftUrl}
                    onChange={setStage2ExtraDraftUrl}
                    onUpload={async (file) => {
                      setStage2ExtraDraftName(file.name)
                      return uploadDiscoProcessPdf(file)
                    }}
                    viewerTitle="Extra Document"
                    downloadFileName={stage2ExtraDraftName || "extra-document.pdf"}
                  />

                  <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                    <Button variant="secondary" size="sm" onClick={handleAddExtraDocument}>
                      Add Extra Document
                    </Button>
                    {stage2ExtraDocuments.map((document, index) => (
                      <div
                        key={document.id || `${document.pdfUrl}-${index}`}
                        style={{
                          border: "var(--border-1) solid var(--color-border-primary)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--spacing-1) var(--spacing-2)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--spacing-1)",
                        }}
                      >
                        <button
                          type="button"
                          style={{ color: "var(--color-primary)", background: "transparent", border: "none", cursor: "pointer" }}
                          onClick={() =>
                            showPdf(
                              document.pdfUrl,
                              "Extra Document",
                              document.pdfName || "extra-document.pdf"
                            )
                          }
                        >
                          {document.pdfName || "extra-document.pdf"}
                        </button>
                        <button
                          type="button"
                          style={{ color: "var(--color-danger)", background: "transparent", border: "none", cursor: "pointer" }}
                          onClick={() =>
                            setStage2ExtraDocuments((prev) =>
                              prev.filter((_, docIndex) => docIndex !== index)
                            )
                          }
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="primary" loading={stage2Saving} onClick={handleSaveStageTwo}>
                    Save Step 2 and Move Ahead
                  </Button>
                </div>
              </div>
            )}

            {adminCurrentStage === "step3_email" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <h4 style={sectionTitleStyle}>Step 3: Committee Email</h4>

                <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                    Quick Select Recipients (from selected students)
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                    {allStage2Students.map((student) => {
                      const isSelected = Boolean(selectedRecipientStudentIds[student.userId])

                      return (
                        <button
                          key={student.userId}
                          type="button"
                          onClick={() => toggleRecipientStudent(student)}
                          style={{
                            border: isSelected
                              ? "var(--border-1) solid var(--color-primary)"
                              : "var(--border-1) solid var(--color-border-primary)",
                            borderRadius: "var(--radius-md)",
                            padding: "var(--spacing-2)",
                            backgroundColor: isSelected
                              ? "var(--color-primary-bg)"
                              : "var(--color-bg-secondary)",
                            cursor: "pointer",
                          }}
                        >
                          {student.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Textarea
                  placeholder="Recipient email IDs (comma/new-line separated)"
                  rows={2}
                  value={emailTo}
                  onChange={(event) => setEmailTo(event.target.value)}
                />
                <Input
                  placeholder="Email subject"
                  value={emailSubject}
                  onChange={(event) => setEmailSubject(event.target.value)}
                />
                <Textarea
                  placeholder="Email body"
                  rows={4}
                  value={emailBody}
                  onChange={(event) => setEmailBody(event.target.value)}
                />

                <label style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={includeInitialComplaint}
                    onChange={(event) => setIncludeInitialComplaint(event.target.checked)}
                  />
                  Attach initial complaint PDF
                </label>

                <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                    Statement Attachments
                  </div>
                  {(selectedAdminCase.statements || []).map((statement) => (
                    <label key={statement.id} style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedStatementAttachmentIds[statement.id])}
                        onChange={(event) =>
                          setSelectedStatementAttachmentIds((prev) => ({
                            ...prev,
                            [statement.id]: event.target.checked,
                          }))
                        }
                      />
                      {statement.student?.name || "Unknown"} ({getStatementRoleLabel(statement.studentRole)}) -{" "}
                      {statement.statementPdfName || "statement.pdf"}
                    </label>
                  ))}
                </div>

                <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                    Evidence Attachments
                  </div>
                  {(selectedAdminCase.evidenceDocuments || []).map((document) => (
                    <label key={document.id} style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedEvidenceAttachmentIds[document.id])}
                        onChange={(event) =>
                          setSelectedEvidenceAttachmentIds((prev) => ({
                            ...prev,
                            [document.id]: event.target.checked,
                          }))
                        }
                      />
                      {document.pdfName || "evidence.pdf"}
                    </label>
                  ))}
                </div>

                <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                    Extra Document Attachments
                  </div>
                  {(selectedAdminCase.extraDocuments || []).map((document) => (
                    <label key={document.id} style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(selectedExtraDocumentAttachmentIds[document.id])}
                        onChange={(event) =>
                          setSelectedExtraDocumentAttachmentIds((prev) => ({
                            ...prev,
                            [document.id]: event.target.checked,
                          }))
                        }
                      />
                      {document.pdfName || "extra-document.pdf"}
                    </label>
                  ))}
                </div>

                <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                  <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                    Add New Attachment (Optional)
                  </div>
                  <PdfUploadField
                    label="Extra Attachment PDF"
                    value={emailExtraDraftUrl}
                    onChange={setEmailExtraDraftUrl}
                    onUpload={async (file) => {
                      setEmailExtraDraftName(file.name)
                      return uploadDiscoProcessPdf(file)
                    }}
                  />
                  <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                    <Button variant="secondary" size="sm" onClick={handleAddEmailExtraAttachment}>
                      Add Attachment
                    </Button>
                    {emailExtraAttachments.map((item, index) => (
                      <Badge key={`${item.url}-${index}`} variant="primary">
                        {item.fileName}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="primary" loading={emailSubmitting} onClick={handleSendEmail}>
                  Send Email and Move Ahead
                </Button>
              </div>
            )}

            {adminCurrentStage === "step4_minutes" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <h4 style={sectionTitleStyle}>Step 4: Committee Minutes</h4>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Committee email has been sent. Upload committee meeting minutes PDF.
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
                <Button variant="primary" loading={minutesSubmitting} onClick={handleSaveMinutes}>
                  Save Minutes and Move Ahead
                </Button>
              </div>
            )}

            {adminCurrentStage === "step5_final" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <h4 style={sectionTitleStyle}>Step 5: Final Decision</h4>

                {selectedAdminCase.committeeMeetingMinutes?.pdfUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      showPdf(
                        selectedAdminCase.committeeMeetingMinutes.pdfUrl,
                        "Committee Minutes",
                        selectedAdminCase.committeeMeetingMinutes.pdfName || "committee-minutes.pdf"
                      )
                    }
                  >
                    <Eye size={14} /> View Committee Minutes
                  </Button>
                ) : null}

                <div style={{ display: "flex", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                    <input
                      type="radio"
                      checked={finalDecisionMode === "action"}
                      onChange={() => setFinalDecisionMode("action")}
                    />
                    Action Against Students
                  </label>
                  <label style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                    <input
                      type="radio"
                      checked={finalDecisionMode === "reject"}
                      onChange={() => setFinalDecisionMode("reject")}
                    />
                    Reject Case
                  </label>
                </div>

                <Textarea
                  placeholder="Final decision description"
                  rows={3}
                  value={finalDecisionDescription}
                  onChange={(event) => setFinalDecisionDescription(event.target.value)}
                />

                {finalDecisionMode === "action" && (
                  <>
                    <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                      Select Disciplined Students (from accused group)
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
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
                              border: selected
                                ? "var(--border-1) solid var(--color-primary)"
                                : "var(--border-1) solid var(--color-border-primary)",
                              borderRadius: "var(--radius-md)",
                              padding: "var(--spacing-2)",
                              backgroundColor: selected
                                ? "var(--color-primary-bg)"
                                : "var(--color-bg-secondary)",
                              cursor: "pointer",
                            }}
                          >
                            {student.name}
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-1)" }}>
                      {selectedDisciplinedStudents.map((student) => (
                        <Badge key={student.userId} variant="primary">
                          {student.name}
                        </Badge>
                      ))}
                    </div>

                    <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                      Action Entry Mode
                    </div>
                    <div style={{ display: "flex", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                      <label style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                        <input
                          type="radio"
                          checked={finalActionEntryMode === "common"}
                          onChange={() => setFinalActionEntryMode("common")}
                        />
                        Common for all selected students
                      </label>
                      <label style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                        <input
                          type="radio"
                          checked={finalActionEntryMode === "per_student"}
                          onChange={() => setFinalActionEntryMode("per_student")}
                        />
                        Fill separately per student
                      </label>
                    </div>

                    {finalActionEntryMode === "common" ? (
                      <>
                        <Input
                          placeholder="Reason (common for all selected students)"
                          value={finalReason}
                          onChange={(event) => setFinalReason(event.target.value)}
                        />
                        <Input
                          placeholder="Action Taken (common for all selected students)"
                          value={finalActionTaken}
                          onChange={(event) => setFinalActionTaken(event.target.value)}
                        />
                        <Input
                          type="date"
                          value={finalDate}
                          onChange={(event) => setFinalDate(event.target.value)}
                        />
                        <Textarea
                          placeholder="Remarks (optional)"
                          rows={2}
                          value={finalRemarks}
                          onChange={(event) => setFinalRemarks(event.target.value)}
                        />

                        <div style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                          <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                            Reminder Items (optional)
                          </div>
                          {finalReminderItems.length === 0 ? (
                            <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                              No reminder items added
                            </div>
                          ) : (
                            finalReminderItems.map((item, index) => (
                              <div
                                key={`final-reminder-${index}`}
                                style={{ display: "grid", gridTemplateColumns: "1fr 180px auto", gap: "var(--spacing-2)", alignItems: "center" }}
                              >
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
                                  <X size={14} />
                                </Button>
                              </div>
                            ))
                          )}
                          <div>
                            <Button size="sm" variant="secondary" onClick={addFinalReminderItem}>
                              Add Reminder Item
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                        {selectedDisciplinedStudents.length === 0 ? (
                          <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                            Select disciplined students first
                          </div>
                        ) : (
                          selectedDisciplinedStudents.map((student) => {
                            const studentAction = finalStudentActionMap[student.userId] || createStudentActionDraft()

                            return (
                              <div
                                key={`student-action-${student.userId}`}
                                style={{ ...cardStyle, padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}
                              >
                                <div style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-semibold)" }}>
                                  {student.name}
                                </div>
                                <Input
                                  placeholder={`Reason for ${student.name}`}
                                  value={studentAction.reason}
                                  onChange={(event) => updateStudentActionField(student.userId, "reason", event.target.value)}
                                />
                                <Input
                                  placeholder={`Action taken for ${student.name}`}
                                  value={studentAction.actionTaken}
                                  onChange={(event) => updateStudentActionField(student.userId, "actionTaken", event.target.value)}
                                />
                                <Input
                                  type="date"
                                  value={studentAction.date || ""}
                                  onChange={(event) => updateStudentActionField(student.userId, "date", event.target.value)}
                                />
                                <Textarea
                                  placeholder="Remarks (optional)"
                                  rows={2}
                                  value={studentAction.remarks || ""}
                                  onChange={(event) => updateStudentActionField(student.userId, "remarks", event.target.value)}
                                />

                                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                                  <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                                    Reminder Items (optional)
                                  </div>
                                  {(studentAction.reminderItems || []).length === 0 ? (
                                    <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                                      No reminder items added
                                    </div>
                                  ) : (
                                    (studentAction.reminderItems || []).map((item, index) => (
                                      <div
                                        key={`student-${student.userId}-reminder-${index}`}
                                        style={{ display: "grid", gridTemplateColumns: "1fr 180px auto", gap: "var(--spacing-2)", alignItems: "center" }}
                                      >
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
                                          <X size={14} />
                                        </Button>
                                      </div>
                                    ))
                                  )}
                                  <div>
                                    <Button size="sm" variant="secondary" onClick={() => addStudentReminderItem(student.userId)}>
                                      Add Reminder Item
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </>
                )}

                <Button
                  variant={finalDecisionMode === "reject" ? "danger" : "success"}
                  loading={finalDecisionSubmitting}
                  onClick={handleFinalizeCase}
                >
                  {finalDecisionMode === "reject"
                    ? "Reject Case"
                    : "Finalize and Create Disciplinary Actions"}
                </Button>
              </div>
            )}

            {adminCurrentStage === "closed_final" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                <h4 style={sectionTitleStyle}>Case Closed</h4>
                <Badge
                  variant={
                    selectedAdminCase.finalDecision?.status === "action_taken"
                      ? "success"
                      : "danger"
                  }
                >
                  Final Status: {formatStatusLabel(selectedAdminCase.finalDecision?.status || "closed")}
                </Badge>
                <div style={{ color: "var(--color-text-body)" }}>
                  {selectedAdminCase.finalDecision?.decisionDescription || "No final description provided"}
                </div>
                {selectedAdminCase.finalDecision?.createdDisCoActionIds?.length > 0 && (
                  <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    Created DisCo action IDs:{" "}
                    {selectedAdminCase.finalDecision.createdDisCoActionIds.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

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
