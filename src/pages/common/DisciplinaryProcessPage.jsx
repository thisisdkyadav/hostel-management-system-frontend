import { useEffect, useMemo, useState } from "react"
import { Button, DataTable, Modal } from "czero/react"
import { Eye, Plus, Search } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import PageFooter from "../../components/common/PageFooter"
import PdfUploadField from "../../components/common/pdf/PdfUploadField"
import PdfViewerModal from "../../components/common/pdf/PdfViewerModal"
import { Badge, Input, Pagination, Tabs, Textarea, useToast } from "@/components/ui"
import { discoApi, studentApi, uploadApi } from "../../service"
import { useAuth } from "../../contexts/AuthProvider"

const formatStatusLabel = (value = "") =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())

const getStatusVariant = (status = "") => {
  switch (status) {
    case "processed":
    case "action_taken":
    case "finalized_with_action":
      return "success"
    case "rejected":
    case "initial_rejected":
    case "final_rejected":
      return "danger"
    case "under_process":
    case "step3_email":
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

const deriveAdminStage = (caseData) => {
  if (!caseData) return "step1_review"

  if (caseData.initialReview?.status === "pending") return "step1_review"
  if (caseData.initialReview?.status === "rejected") return "closed_initial_rejected"
  if (caseData.finalDecision?.status && caseData.finalDecision.status !== "pending") return "closed_final"

  const statementsCount = (caseData.statements || []).length
  const emailLogsCount = (caseData.emailLogs || []).length
  const hasMinutes = Boolean(caseData.committeeMeetingMinutes?.pdfUrl)

  if (statementsCount === 0) return "step2_statements"
  if (emailLogsCount === 0) return "step3_email"
  if (!hasMinutes) return "step4_minutes"
  return "step5_final"
}

const getStageLabel = (stage) => {
  switch (stage) {
    case "step1_review":
      return "Step 1 - Initial Review"
    case "step2_statements":
      return "Step 2 - Collect Statements"
    case "step3_email":
      return "Step 3 - Send Email"
    case "step4_minutes":
      return "Step 4 - Committee Minutes"
    case "step5_final":
      return "Step 5 - Final Decision"
    case "closed_initial_rejected":
      return "Closed - Rejected in Step 1"
    case "closed_final":
      return "Closed - Final Decision Recorded"
    default:
      return "In Progress"
  }
}

const STUDENT_PAGE_SIZE = 10

const getStudentListStatus = (caseData) => {
  const initialStatus = caseData.initialReview?.status || "pending"
  const finalStatus = caseData.finalDecision?.status || "pending"

  if (initialStatus === "rejected" || finalStatus === "rejected") return "rejected"
  if (finalStatus === "action_taken" || finalStatus === "finalized_with_action") return "closed"
  if (initialStatus === "processed" && finalStatus === "pending") return "in_process"
  return "pending"
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

  const isStudent = user?.role === "Student"
  const isAdmin = ["Admin", "Super Admin"].includes(user?.role)

  const [pdfViewer, setPdfViewer] = useState({
    open: false,
    url: "",
    title: "Document",
    fileName: "document.pdf",
  })

  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [studentCases, setStudentCases] = useState([])
  const [studentCasesLoading, setStudentCasesLoading] = useState(false)
  const [studentStatusFilter, setStudentStatusFilter] = useState("all")
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [studentPage, setStudentPage] = useState(1)
  const [selectedStudentCase, setSelectedStudentCase] = useState(null)
  const [studentDetailModalOpen, setStudentDetailModalOpen] = useState(false)
  const [submitComplaintPdfUrl, setSubmitComplaintPdfUrl] = useState("")
  const [submitComplaintPdfName, setSubmitComplaintPdfName] = useState("")
  const [studentSubmitting, setStudentSubmitting] = useState(false)

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

  const [initialDecisionDescription, setInitialDecisionDescription] = useState("")
  const [initialReviewSubmitting, setInitialReviewSubmitting] = useState(false)

  const [statementRoll, setStatementRoll] = useState("")
  const [statementSearchLoading, setStatementSearchLoading] = useState(false)
  const [statementSearchResults, setStatementSearchResults] = useState([])
  const [statementType, setStatementType] = useState("accused")
  const [selectedStatementStudent, setSelectedStatementStudent] = useState(null)
  const [statementPdfUrl, setStatementPdfUrl] = useState("")
  const [statementPdfName, setStatementPdfName] = useState("")
  const [statementSubmitting, setStatementSubmitting] = useState(false)

  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [includeInitialComplaint, setIncludeInitialComplaint] = useState(true)
  const [selectedStatementAttachmentIds, setSelectedStatementAttachmentIds] = useState({})
  const [extraAttachmentDraftUrl, setExtraAttachmentDraftUrl] = useState("")
  const [extraAttachmentDraftName, setExtraAttachmentDraftName] = useState("")
  const [extraAttachments, setExtraAttachments] = useState([])
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
  const [finalRoll, setFinalRoll] = useState("")
  const [finalSearchResults, setFinalSearchResults] = useState([])
  const [finalSearchLoading, setFinalSearchLoading] = useState(false)
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

  const fetchStudentCases = async () => {
    try {
      setStudentCasesLoading(true)
      const response = await discoApi.getMyProcessCases()
      setStudentCases(response.cases || [])
    } catch (error) {
      toast.error(error.message || "Failed to fetch disciplinary cases")
    } finally {
      setStudentCasesLoading(false)
    }
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
        setInitialDecisionDescription(caseData.initialReview?.decisionDescription || "")
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
    if (isStudent) fetchStudentCases()
  }, [isStudent])

  useEffect(() => {
    if (isAdmin) fetchAdminCases()
  }, [isAdmin, adminPage, adminStatusFilter])

  useEffect(() => {
    if (!selectedAdminCase?.id) return

    const defaultStatementAttachments = {}
    ;(selectedAdminCase.statements || []).forEach((statement) => {
      defaultStatementAttachments[statement.id] = true
    })
    setSelectedStatementAttachmentIds(defaultStatementAttachments)
    setExtraAttachments([])
    setExtraAttachmentDraftName("")
    setExtraAttachmentDraftUrl("")
    setEmailTo("")
    setEmailSubject("")
    setEmailBody("")
    setIncludeInitialComplaint(true)
    setStatementRoll("")
    setStatementSearchResults([])
    setSelectedStatementStudent(null)
    setStatementPdfUrl("")
    setStatementPdfName("")
    setFinalDecisionDescription("")
    setFinalDecisionMode("action")
    setFinalReason("")
    setFinalActionTaken("")
    setFinalDate(todayDateInput())
    setFinalRemarks("")
    setFinalRoll("")
    setFinalSearchResults([])
    setSelectedDisciplinedStudents([])
  }, [selectedAdminCase?.id])

  const adminCurrentStage = useMemo(
    () => deriveAdminStage(selectedAdminCase),
    [selectedAdminCase]
  )

  const statementStudents = useMemo(() => {
    const map = new Map()
    ;(selectedAdminCase?.statements || []).forEach((statement) => {
      const studentId = statement.student?.id
      if (!studentId) return
      if (!map.has(studentId)) {
        map.set(studentId, {
          userId: studentId,
          name: statement.student.name || "Unknown",
          email: statement.student.email || "",
        })
      }
    })
    return Array.from(map.values())
  }, [selectedAdminCase?.statements])

  const searchStudents = async (roll, setLoading, setResults) => {
    const keyword = roll.trim()
    if (!keyword) {
      setResults([])
      return
    }
    try {
      setLoading(true)
      const response = await studentApi.getStudents({
        page: 1,
        limit: 10,
        rollNumber: keyword,
      })
      setResults(response.data || [])
    } catch (error) {
      toast.error(error.message || "Student search failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitStudentCase = async () => {
    if (!submitComplaintPdfUrl) {
      toast.error("Please upload complaint PDF")
      return
    }
    try {
      setStudentSubmitting(true)
      await discoApi.submitProcessCase({
        complaintPdfUrl: submitComplaintPdfUrl,
        complaintPdfName:
          submitComplaintPdfName ||
          getFilenameFromUrl(submitComplaintPdfUrl, "complaint.pdf"),
      })
      setSubmitComplaintPdfUrl("")
      setSubmitComplaintPdfName("")
      setSubmitModalOpen(false)
      toast.success("Complaint submitted successfully")
      fetchStudentCases()
    } catch (error) {
      toast.error(error.message || "Failed to submit complaint")
    } finally {
      setStudentSubmitting(false)
    }
  }

  const openStudentCaseDetail = async (row) => {
    try {
      const response = await discoApi.getProcessCaseById(row.id)
      setSelectedStudentCase(response.case || row)
      setStudentDetailModalOpen(true)
    } catch {
      setSelectedStudentCase(row)
      setStudentDetailModalOpen(true)
    }
  }

  const openAdminCase = async (row) => {
    setAdminModalOpen(true)
    await fetchAdminCaseById(row.id)
  }

  const handleInitialReview = async (decision) => {
    if (!selectedAdminCase?.id) return
    if (!initialDecisionDescription.trim()) {
      toast.error("Please add review description")
      return
    }

    if (decision === "reject" && !window.confirm("Reject this complaint in Step 1?")) return
    if (decision === "process" && !window.confirm("Process this complaint and move to next step?")) return

    try {
      setInitialReviewSubmitting(true)
      await discoApi.reviewProcessCase(selectedAdminCase.id, {
        decision,
        description: initialDecisionDescription.trim(),
      })
      toast.success("Step 1 updated")
      await refreshAdminData()
    } catch (error) {
      toast.error(error.message || "Failed to update review")
    } finally {
      setInitialReviewSubmitting(false)
    }
  }

  const handleAddStatement = async () => {
    if (!selectedAdminCase?.id) return
    if (!selectedStatementStudent?.userId) {
      toast.error("Select a student from roll-number search")
      return
    }
    if (!statementPdfUrl) {
      toast.error("Upload statement PDF")
      return
    }
    try {
      setStatementSubmitting(true)
      await discoApi.addCaseStatement(selectedAdminCase.id, {
        studentUserId: selectedStatementStudent.userId,
        statementType,
        statementPdfUrl: statementPdfUrl,
        statementPdfName: statementPdfName || getFilenameFromUrl(statementPdfUrl, "statement.pdf"),
      })
      toast.success("Statement added")
      await refreshAdminData()
      setStatementRoll("")
      setStatementSearchResults([])
      setSelectedStatementStudent(null)
      setStatementPdfUrl("")
      setStatementPdfName("")
    } catch (error) {
      toast.error(error.message || "Failed to add statement")
    } finally {
      setStatementSubmitting(false)
    }
  }

  const handleAddExtraAttachment = () => {
    if (!extraAttachmentDraftUrl) {
      toast.error("Upload an extra PDF first")
      return
    }
    setExtraAttachments((prev) => [
      ...prev,
      {
        url: extraAttachmentDraftUrl,
        fileName:
          extraAttachmentDraftName ||
          getFilenameFromUrl(extraAttachmentDraftUrl, "attachment.pdf"),
      },
    ])
    setExtraAttachmentDraftUrl("")
    setExtraAttachmentDraftName("")
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

    try {
      setEmailSubmitting(true)
      await discoApi.sendCaseEmail(selectedAdminCase.id, {
        to: recipients,
        subject: emailSubject.trim(),
        body: emailBody.trim(),
        includeInitialComplaint,
        statementIds,
        extraAttachments,
      })
      toast.success("Email sent")
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

  const toggleDisciplinedStudent = (student) => {
    setSelectedDisciplinedStudents((prev) => {
      const exists = prev.some((item) => item.userId === student.userId)
      if (exists) return prev.filter((item) => item.userId !== student.userId)
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
        toast.success("Complaint rejected at final stage")
        await refreshAdminData()
      } catch (error) {
        toast.error(error.message || "Failed to finalize case")
      } finally {
        setFinalDecisionSubmitting(false)
      }
      return
    }

    if (!finalReason.trim() || !finalActionTaken.trim()) {
      toast.error("Reason and action taken are required")
      return
    }
    if (selectedDisciplinedStudents.length === 0) {
      toast.error("Select at least one disciplined student")
      return
    }

    try {
      setFinalDecisionSubmitting(true)
      await discoApi.finalizeProcessCase(selectedAdminCase.id, {
        decision: "action",
        decisionDescription: finalDecisionDescription.trim(),
        studentUserIds: selectedDisciplinedStudents.map((item) => item.userId),
        reason: finalReason.trim(),
        actionTaken: finalActionTaken.trim(),
        date: finalDate || null,
        remarks: finalRemarks.trim(),
      })
      toast.success("Disciplinary actions created")
      await refreshAdminData()
    } catch (error) {
      toast.error(error.message || "Failed to finalize case")
    } finally {
      setFinalDecisionSubmitting(false)
    }
  }

  const studentColumns = [
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
      key: "createdAt",
      header: "Submitted",
      render: (item) => new Date(item.createdAt).toLocaleString(),
    },
    {
      key: "initialStatus",
      header: "Stage 1",
      render: (item) => (
        <Badge variant={getStatusVariant(item.initialReview?.status)}>
          {formatStatusLabel(item.initialReview?.status || "pending")}
        </Badge>
      ),
    },
    {
      key: "finalStatus",
      header: "Stage 2",
      render: (item) => (
        <Badge variant={getStatusVariant(item.finalDecision?.status)}>
          {formatStatusLabel(item.finalDecision?.status || "pending")}
        </Badge>
      ),
    },
  ]

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
      key: "student",
      header: "Student",
      render: (item) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-medium)" }}>
            {item.submittedBy?.name || "Unknown"}
          </span>
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
            {item.submittedBy?.email || ""}
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

  const statementColumns = [
    {
      key: "student",
      header: "Student",
      render: (statement) => statement.student?.name || "Unknown",
    },
    {
      key: "type",
      header: "Category",
      render: (statement) => formatStatusLabel(statement.statementType),
    },
    {
      key: "doc",
      header: "Statement PDF",
      render: (statement) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation()
            showPdf(
              statement.statementPdfUrl,
              `${statement.student?.name || "Student"} Statement`,
              statement.statementPdfName || "statement.pdf"
            )
          }}
        >
          <Eye size={14} /> View
        </Button>
      ),
    },
  ]

  const studentStatusTabs = useMemo(() => {
    const counts = studentCases.reduce(
      (acc, item) => {
        const status = getStudentListStatus(item)
        acc.all += 1
        acc[status] += 1
        return acc
      },
      { all: 0, pending: 0, in_process: 0, rejected: 0, closed: 0 }
    )

    return [
      { label: "All", value: "all", count: counts.all },
      { label: "Pending", value: "pending", count: counts.pending },
      { label: "In Process", value: "in_process", count: counts.in_process },
      { label: "Rejected", value: "rejected", count: counts.rejected },
      { label: "Closed", value: "closed", count: counts.closed },
    ]
  }, [studentCases])

  const adminStatusTabs = useMemo(
    () => [
      { label: "All", value: "all" },
      { label: "Submitted", value: "submitted" },
      { label: "Under Process", value: "under_process" },
      { label: "Initial Rejected", value: "initial_rejected" },
      { label: "Final Rejected", value: "final_rejected" },
      { label: "Finalized", value: "finalized_with_action" },
    ],
    []
  )

  const filteredStudentCases = useMemo(() => {
    const searchTerm = studentSearchTerm.trim().toLowerCase()
    return studentCases.filter((item) => {
      const matchesStatus =
        studentStatusFilter === "all" || getStudentListStatus(item) === studentStatusFilter
      if (!matchesStatus) return false

      if (!searchTerm) return true
      const caseId = String(item.id || "").toLowerCase()
      const shortCaseId = String(item.id || "").slice(-6).toLowerCase()
      return caseId.includes(searchTerm) || shortCaseId.includes(searchTerm)
    })
  }, [studentCases, studentStatusFilter, studentSearchTerm])

  const studentTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredStudentCases.length / STUDENT_PAGE_SIZE)),
    [filteredStudentCases.length]
  )

  const paginatedStudentCases = useMemo(() => {
    const startIndex = (studentPage - 1) * STUDENT_PAGE_SIZE
    return filteredStudentCases.slice(startIndex, startIndex + STUDENT_PAGE_SIZE)
  }, [filteredStudentCases, studentPage])

  const filteredAdminCases = useMemo(() => {
    const searchTerm = adminSearchTerm.trim().toLowerCase()
    if (!searchTerm) return adminCases

    return adminCases.filter((item) => {
      const caseId = String(item.id || "").toLowerCase()
      const shortCaseId = String(item.id || "").slice(-6).toLowerCase()
      const studentName = String(item.submittedBy?.name || "").toLowerCase()
      const studentEmail = String(item.submittedBy?.email || "").toLowerCase()
      return (
        caseId.includes(searchTerm) ||
        shortCaseId.includes(searchTerm) ||
        studentName.includes(searchTerm) ||
        studentEmail.includes(searchTerm)
      )
    })
  }, [adminCases, adminSearchTerm])

  useEffect(() => {
    if (studentPage > studentTotalPages) {
      setStudentPage(studentTotalPages)
    }
  }, [studentPage, studentTotalPages])

  if (!isStudent && !isAdmin) {
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
        subtitle={
          isStudent
            ? "Submit disciplinary complaint PDF and track decisions"
            : "Review and process disciplinary cases step-by-step"
        }
      >
        {isStudent ? (
          <Button variant="primary" size="md" onClick={() => setSubmitModalOpen(true)}>
            <Plus size={14} /> Submit Case
          </Button>
        ) : null}
      </PageHeader>

      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-6) var(--spacing-8)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Tabs
              tabs={isStudent ? studentStatusTabs : adminStatusTabs}
              activeTab={isStudent ? studentStatusFilter : adminStatusFilter}
              setActiveTab={(value) => {
                if (isStudent) {
                  setStudentStatusFilter(value)
                  setStudentPage(1)
                  return
                }
                setAdminStatusFilter(value)
                setAdminPage(1)
              }}
            />
          </div>

          <div className="w-full lg:w-[420px] lg:max-w-[420px]">
            <Input
              type="text"
              icon={<Search size={16} />}
              value={isStudent ? studentSearchTerm : adminSearchTerm}
              placeholder={
                isStudent
                  ? "Search by case ID..."
                  : "Search by case ID, student name, or email..."
              }
              onChange={(event) => {
                if (isStudent) {
                  setStudentSearchTerm(event.target.value)
                  setStudentPage(1)
                  return
                }
                setAdminSearchTerm(event.target.value)
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "var(--spacing-4)" }}>
          <DataTable
            columns={isStudent ? studentColumns : adminColumns}
            data={isStudent ? paginatedStudentCases : filteredAdminCases}
            loading={isStudent ? studentCasesLoading : adminCasesLoading}
            emptyMessage={
              isStudent
                ? "No disciplinary cases match your current filters"
                : "No disciplinary cases match your current filters"
            }
            onRowClick={isStudent ? openStudentCaseDetail : openAdminCase}
          />
        </div>
      </div>

      <PageFooter
        leftContent={[
          <span key="count" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            {isStudent ? (
              <>
                Showing{" "}
                <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  {studentCasesLoading ? 0 : paginatedStudentCases.length}
                </span>{" "}
                of{" "}
                <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  {studentCasesLoading ? 0 : filteredStudentCases.length}
                </span>{" "}
                cases
              </>
            ) : (
              <>
                Showing{" "}
                <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  {adminCasesLoading ? 0 : filteredAdminCases.length}
                </span>{" "}
                of{" "}
                <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  {adminCasesLoading ? 0 : adminTotalCount}
                </span>{" "}
                cases
              </>
            )}
          </span>,
        ]}
        rightContent={[
          <Pagination
            key="pagination"
            currentPage={isStudent ? studentPage : adminPage}
            totalPages={isStudent ? studentTotalPages : adminTotalPages}
            paginate={isStudent ? setStudentPage : setAdminPage}
            compact
            showPageInfo={false}
          />,
        ]}
      />

      <Modal title="Submit Disciplinary Complaint" onClose={() => setSubmitModalOpen(false)} width={700} isOpen={submitModalOpen}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <PdfUploadField
            label="Complaint PDF"
            value={submitComplaintPdfUrl}
            onChange={setSubmitComplaintPdfUrl}
            onUpload={async (file) => {
              setSubmitComplaintPdfName(file.name)
              return uploadDiscoProcessPdf(file)
            }}
            viewerTitle="Complaint PDF"
            viewerSubtitle="Submitted Complaint"
            downloadFileName={submitComplaintPdfName || "complaint.pdf"}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
            <Button variant="outline" onClick={() => setSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={studentSubmitting} onClick={handleSubmitStudentCase}>
              Submit Case
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title={selectedStudentCase ? `Case #${selectedStudentCase.id?.slice(-6)}` : "Case Details"}
        onClose={() => setStudentDetailModalOpen(false)}
        width={760}
        isOpen={studentDetailModalOpen}
      >
        {selectedStudentCase ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
              <Badge variant={getStatusVariant(selectedStudentCase.initialReview?.status)}>
                Stage 1: {formatStatusLabel(selectedStudentCase.initialReview?.status || "pending")}
              </Badge>
              <Badge variant={getStatusVariant(selectedStudentCase.finalDecision?.status)}>
                Stage 2: {formatStatusLabel(selectedStudentCase.finalDecision?.status || "pending")}
              </Badge>
            </div>
            <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              Submitted on {new Date(selectedStudentCase.createdAt).toLocaleString()}
            </div>

            <div style={{ ...cardStyle, padding: "var(--spacing-3)" }}>
              <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                Stage 1 Decision
              </div>
              <div style={{ marginTop: "var(--spacing-1)", color: "var(--color-text-body)" }}>
                {selectedStudentCase.initialReview?.decisionDescription || "Pending"}
              </div>
            </div>

            <div style={{ ...cardStyle, padding: "var(--spacing-3)" }}>
              <div style={{ color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                Stage 2 Decision
              </div>
              <div style={{ marginTop: "var(--spacing-1)", color: "var(--color-text-body)" }}>
                {selectedStudentCase.finalDecision?.decisionDescription || "Pending"}
              </div>
            </div>

            <div>
              <Button
                variant="outline"
                onClick={() =>
                  showPdf(
                    selectedStudentCase.complaintPdfUrl,
                    "Complaint PDF",
                    selectedStudentCase.complaintPdfName || "complaint.pdf"
                  )
                }
              >
                <Eye size={14} /> View Complaint PDF
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title={
          selectedAdminCase
            ? `Case #${selectedAdminCase.id?.slice(-6)} - ${getStageLabel(adminCurrentStage)}`
            : "Case Details"
        }
        onClose={() => setAdminModalOpen(false)}
        width={980}
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
                    {selectedAdminCase.submittedBy?.name || "Unknown Student"}
                  </div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                    {selectedAdminCase.submittedBy?.email || ""}
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

            {adminCurrentStage === "step1_review" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <h4 style={sectionTitleStyle}>Step 1: Accept or Reject Complaint</h4>
                <Textarea
                  placeholder="Review description (required)"
                  rows={4}
                  value={initialDecisionDescription}
                  onChange={(event) => setInitialDecisionDescription(event.target.value)}
                />
                <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                  <Button variant="success" loading={initialReviewSubmitting} onClick={() => handleInitialReview("process")}>
                    Accept and Process
                  </Button>
                  <Button variant="danger" loading={initialReviewSubmitting} onClick={() => handleInitialReview("reject")}>
                    Reject Complaint
                  </Button>
                </div>
              </div>
            )}

            {adminCurrentStage === "step2_statements" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <h4 style={sectionTitleStyle}>Step 2: Approval Description + Statement Submission</h4>
                <div style={{ color: "var(--color-text-body)" }}>
                  <strong>Approval Description:</strong>{" "}
                  {selectedAdminCase.initialReview?.decisionDescription || "N/A"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--spacing-2)" }}>
                  <Input
                    placeholder="Search student by roll number"
                    value={statementRoll}
                    onChange={(event) => setStatementRoll(event.target.value)}
                  />
                  <Button
                    variant="secondary"
                    loading={statementSearchLoading}
                    onClick={() =>
                      searchStudents(statementRoll, setStatementSearchLoading, setStatementSearchResults)
                    }
                  >
                    Search
                  </Button>
                </div>

                {statementSearchResults.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                    {statementSearchResults.map((student) => (
                      <button
                        key={student.userId}
                        type="button"
                        onClick={() => setSelectedStatementStudent(student)}
                        style={{
                          border:
                            selectedStatementStudent?.userId === student.userId
                              ? "var(--border-1) solid var(--color-primary)"
                              : "var(--border-1) solid var(--color-border-primary)",
                          backgroundColor:
                            selectedStatementStudent?.userId === student.userId
                              ? "var(--color-primary-bg)"
                              : "var(--color-bg-secondary)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--spacing-2)",
                          cursor: "pointer",
                        }}
                      >
                        {student.rollNumber} - {student.name}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                    <input
                      type="radio"
                      name="statementType"
                      checked={statementType === "accused"}
                      onChange={() => setStatementType("accused")}
                    />
                    Accused Student
                  </label>
                  <label style={{ display: "inline-flex", gap: "var(--spacing-1)", alignItems: "center" }}>
                    <input
                      type="radio"
                      name="statementType"
                      checked={statementType === "related"}
                      onChange={() => setStatementType("related")}
                    />
                    Complainant/Related Student
                  </label>
                </div>

                <PdfUploadField
                  label="Statement PDF"
                  value={statementPdfUrl}
                  onChange={setStatementPdfUrl}
                  onUpload={async (file) => {
                    setStatementPdfName(file.name)
                    return uploadDiscoProcessPdf(file)
                  }}
                />

                <Button variant="primary" loading={statementSubmitting} onClick={handleAddStatement}>
                  Add Statement and Move Ahead
                </Button>
              </div>
            )}

            {adminCurrentStage === "step3_email" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <h4 style={sectionTitleStyle}>Step 3: View Statements and Send Email</h4>
                <div style={{ color: "var(--color-text-body)" }}>
                  <strong>Approved Description:</strong>{" "}
                  {selectedAdminCase.initialReview?.decisionDescription || "N/A"}
                </div>

                <div>
                  <div style={{ marginBottom: "var(--spacing-2)", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                    Statements (view-only in this step)
                  </div>
                  <DataTable
                    columns={statementColumns}
                    data={selectedAdminCase.statements || []}
                    emptyMessage="No statements found"
                  />
                </div>

                <div>
                  <div style={{ marginBottom: "var(--spacing-2)", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
                    Students Involved
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-1)" }}>
                    {statementStudents.map((student) => (
                      <Badge key={student.userId} variant="info">
                        {student.name}
                      </Badge>
                    ))}
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

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
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
                      {statement.student?.name || "Unknown"} - {statement.statementPdfName || "statement.pdf"}
                    </label>
                  ))}
                </div>

                <PdfUploadField
                  label="Extra PDF Attachment"
                  value={extraAttachmentDraftUrl}
                  onChange={setExtraAttachmentDraftUrl}
                  onUpload={async (file) => {
                    setExtraAttachmentDraftName(file.name)
                    return uploadDiscoProcessPdf(file)
                  }}
                />
                <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                  <Button variant="secondary" size="sm" onClick={handleAddExtraAttachment}>
                    Add Extra Attachment
                  </Button>
                  {extraAttachments.map((item, index) => (
                    <Badge key={`${item.url}-${index}`} variant="primary">
                      {item.fileName}
                    </Badge>
                  ))}
                </div>

                <Button variant="primary" loading={emailSubmitting} onClick={handleSendEmail}>
                  Send Email and Move Ahead
                </Button>
              </div>
            )}

            {adminCurrentStage === "step4_minutes" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <h4 style={sectionTitleStyle}>Step 4: Upload Committee Minutes</h4>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  Email already sent. Now upload committee meeting minutes PDF.
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
                    Reject Complaint
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
                      Quick Select (from statement students)
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                      {statementStudents.map((student) => {
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--spacing-2)" }}>
                      <Input
                        placeholder="Add more students by roll number"
                        value={finalRoll}
                        onChange={(event) => setFinalRoll(event.target.value)}
                      />
                      <Button
                        variant="secondary"
                        loading={finalSearchLoading}
                        onClick={() =>
                          searchStudents(finalRoll, setFinalSearchLoading, setFinalSearchResults)
                        }
                      >
                        Search
                      </Button>
                    </div>

                    {finalSearchResults.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                        {finalSearchResults.map((student) => (
                          <Button
                            key={student.userId}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleDisciplinedStudent({
                                userId: student.userId,
                                name: student.name,
                                email: student.email,
                              })
                            }
                          >
                            {student.rollNumber} - {student.name}
                          </Button>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-1)" }}>
                      {selectedDisciplinedStudents.map((student) => (
                        <Badge key={student.userId} variant="primary">
                          {student.name}
                        </Badge>
                      ))}
                    </div>

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
                  </>
                )}

                <Button
                  variant={finalDecisionMode === "reject" ? "danger" : "success"}
                  loading={finalDecisionSubmitting}
                  onClick={handleFinalizeCase}
                >
                  {finalDecisionMode === "reject"
                    ? "Reject Complaint"
                    : "Finalize and Create Disciplinary Actions"}
                </Button>
              </div>
            )}

            {adminCurrentStage === "closed_initial_rejected" && (
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                <h4 style={sectionTitleStyle}>Case Closed</h4>
                <Badge variant="danger">Rejected in Step 1</Badge>
                <div style={{ color: "var(--color-text-body)" }}>
                  {selectedAdminCase.initialReview?.decisionDescription || "No description provided"}
                </div>
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
        onClose={() => setPdfViewer({ open: false, url: "", title: "Document", fileName: "document.pdf" })}
        documentUrl={pdfViewer.url}
        title={pdfViewer.title}
        downloadFileName={pdfViewer.fileName}
      />
    </div>
  )
}

export default DisciplinaryProcessPage
