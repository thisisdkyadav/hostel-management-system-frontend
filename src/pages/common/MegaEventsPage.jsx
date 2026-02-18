import { useEffect, useMemo, useState } from "react"
import { Button, Modal, Input } from "czero/react"
import PageHeader from "@/components/common/PageHeader"
import { Card, CardContent } from "@/components/ui/layout"
import { Textarea, Checkbox } from "@/components/ui/form"
import { LoadingState, ErrorState, EmptyState, Alert, useToast } from "@/components/ui/feedback"
import { Badge } from "@/components/ui/data-display"
import { CalendarDays, History, Plus, FileText, Receipt } from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import uploadApi from "@/service/modules/upload.api"
import ApprovalHistory from "@/components/gymkhana/ApprovalHistory"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"

const EXPENSE_STATUS_TO_APPROVER = {
  pending: "Student Affairs",
  pending_student_affairs: "Student Affairs",
  pending_joint_registrar: "Joint Registrar SA",
  pending_associate_dean: "Associate Dean SA",
  pending_dean: "Dean SA",
}

const PROPOSAL_STATUS_TO_APPROVER = {
  pending_president: "President Gymkhana",
  pending_student_affairs: "Student Affairs",
  pending_joint_registrar: "Joint Registrar SA",
  pending_associate_dean: "Associate Dean SA",
  pending_dean: "Dean SA",
}

const POST_STUDENT_AFFAIRS_STAGE_OPTIONS = [
  "Joint Registrar SA",
  "Associate Dean SA",
  "Dean SA",
]

const footerTabStyles = {
  tabsBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--color-bg-tertiary)",
    borderTop: "var(--border-1) solid var(--color-border-primary)",
    padding: 0,
    flexShrink: 0,
    minHeight: "42px",
    overflowX: "auto",
    overflowY: "hidden",
  },
  tabsList: {
    display: "flex",
    alignItems: "stretch",
    height: "100%",
    gap: 0,
  },
  tab: {
    display: "flex",
    alignItems: "center",
    padding: "0 var(--spacing-4)",
    minHeight: "42px",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-muted)",
    backgroundColor: "transparent",
    border: "none",
    borderRight: "var(--border-1) solid var(--color-border-primary)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "var(--transition-colors)",
    minWidth: "120px",
    justifyContent: "center",
    gap: "var(--spacing-2)",
  },
  tabActive: {
    backgroundColor: "var(--color-bg-primary)",
    color: "var(--color-primary)",
    borderBottom: "var(--border-2) solid var(--color-primary)",
    fontWeight: "var(--font-weight-semibold)",
  },
  addTab: {
    backgroundColor: "var(--color-primary-bg)",
    color: "var(--color-primary)",
  },
}

const createDefaultSeriesForm = () => ({
  name: "",
  description: "",
})

const createDefaultOccurrenceForm = () => ({
  startDate: "",
  endDate: "",
})

const createDefaultProposalForm = () => ({
  proposalText: "",
  proposalDocumentUrl: "",
  externalGuestsDetails: "",
  chiefGuestDocumentUrl: "",
  accommodationRequired: false,
  hasRegistrationFee: false,
  registrationFeeAmount: "",
  totalExpectedIncome: "",
  totalExpenditure: "",
})

const createDefaultBill = () => ({
  description: "",
  amount: "",
  billNumber: "",
  billDate: "",
  vendor: "",
  attachmentUrl: "",
})

const createDefaultExpenseForm = () => ({
  bills: [createDefaultBill()],
  eventReportDocumentUrl: "",
  notes: "",
})

const toProposalForm = (proposal) => ({
  proposalText: proposal?.proposalText || "",
  proposalDocumentUrl: proposal?.proposalDocumentUrl || "",
  externalGuestsDetails: proposal?.externalGuestsDetails || "",
  chiefGuestDocumentUrl: proposal?.chiefGuestDocumentUrl || "",
  accommodationRequired: Boolean(proposal?.accommodationRequired),
  hasRegistrationFee: Boolean(proposal?.hasRegistrationFee),
  registrationFeeAmount:
    proposal?.registrationFeeAmount === null || proposal?.registrationFeeAmount === undefined
      ? ""
      : String(proposal.registrationFeeAmount),
  totalExpectedIncome:
    proposal?.totalExpectedIncome === null || proposal?.totalExpectedIncome === undefined
      ? ""
      : String(proposal.totalExpectedIncome),
  totalExpenditure:
    proposal?.totalExpenditure === null || proposal?.totalExpenditure === undefined
      ? ""
      : String(proposal.totalExpenditure),
})

const buildProposalPayload = (proposalForm) => ({
  proposalText: proposalForm.proposalText?.trim(),
  proposalDocumentUrl: proposalForm.proposalDocumentUrl?.trim() || "",
  externalGuestsDetails: proposalForm.externalGuestsDetails?.trim() || "",
  chiefGuestDocumentUrl: proposalForm.chiefGuestDocumentUrl?.trim() || "",
  accommodationRequired: Boolean(proposalForm.accommodationRequired),
  hasRegistrationFee: Boolean(proposalForm.hasRegistrationFee),
  registrationFeeAmount: proposalForm.hasRegistrationFee
    ? Number(proposalForm.registrationFeeAmount || 0)
    : 0,
  totalExpectedIncome: Number(proposalForm.totalExpectedIncome || 0),
  totalExpenditure: Number(proposalForm.totalExpenditure || 0),
})

const toExpenseForm = (expense) => ({
  bills:
    Array.isArray(expense?.bills) && expense.bills.length > 0
      ? expense.bills.map((bill) => ({
        description: bill.description || "",
        amount: bill.amount === null || bill.amount === undefined ? "" : String(bill.amount),
        billNumber: bill.billNumber || "",
        billDate: bill.billDate ? new Date(bill.billDate).toISOString().slice(0, 10) : "",
        vendor: bill.vendor || "",
        attachmentUrl: bill.attachments?.[0]?.url || "",
      }))
      : [createDefaultBill()],
  eventReportDocumentUrl: expense?.eventReportDocumentUrl || "",
  notes: expense?.notes || "",
})

const buildExpensePayload = (expenseForm) => ({
  bills: (expenseForm.bills || []).map((bill) => ({
    description: bill.description?.trim(),
    amount: Number(bill.amount || 0),
    billNumber: bill.billNumber?.trim() || "",
    billDate: bill.billDate || undefined,
    vendor: bill.vendor?.trim() || "",
    attachments: [{ filename: "bill.pdf", url: bill.attachmentUrl }],
  })),
  eventReportDocumentUrl: expenseForm.eventReportDocumentUrl?.trim() || "",
  notes: expenseForm.notes?.trim() || "",
})

const toDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const sortOccurrencesByDateDesc = (occurrences = []) =>
  [...occurrences].sort((left, right) => {
    const leftStart = toDate(left?.scheduledStartDate)?.getTime() || 0
    const rightStart = toDate(right?.scheduledStartDate)?.getTime() || 0
    if (rightStart !== leftStart) return rightStart - leftStart

    const leftEnd = toDate(left?.scheduledEndDate)?.getTime() || 0
    const rightEnd = toDate(right?.scheduledEndDate)?.getTime() || 0
    if (rightEnd !== leftEnd) return rightEnd - leftEnd

    const leftCreated = toDate(left?.createdAt)?.getTime() || 0
    const rightCreated = toDate(right?.createdAt)?.getTime() || 0
    return rightCreated - leftCreated
  })

const formatDateRange = (start, end) => {
  const startDate = toDate(start)
  const endDate = toDate(end)
  if (!startDate) return "Date not set"
  if (!endDate) return startDate.toLocaleDateString()
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
}

const getRequiredApproverForProposal = (proposalStatus) => PROPOSAL_STATUS_TO_APPROVER[proposalStatus] || null
const getRequiredApproverForExpense = (expenseStatus) => EXPENSE_STATUS_TO_APPROVER[expenseStatus] || null

const MegaEventsPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  const isAdminLevel = user?.role === "Admin" || user?.role === "Super Admin"
  const isGymkhana = user?.role === "Gymkhana"
  const isPresident = isGymkhana && user?.subRole === "President Gymkhana"
  const isGS = isGymkhana && user?.subRole === "GS Gymkhana"

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [series, setSeries] = useState([])
  const [selectedSeriesId, setSelectedSeriesId] = useState("")
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [occurrences, setOccurrences] = useState([])
  const [latestOccurrence, setLatestOccurrence] = useState(null)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState("")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const [proposalData, setProposalData] = useState(null)
  const [expenseData, setExpenseData] = useState(null)
  const [proposalHistoryRefreshKey, setProposalHistoryRefreshKey] = useState(0)
  const [expenseHistoryRefreshKey, setExpenseHistoryRefreshKey] = useState(0)

  const [isCreateSeriesOpen, setIsCreateSeriesOpen] = useState(false)
  const [isCreateOccurrenceOpen, setIsCreateOccurrenceOpen] = useState(false)
  const [isProposalOpen, setIsProposalOpen] = useState(false)
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)

  const [seriesForm, setSeriesForm] = useState(createDefaultSeriesForm)
  const [occurrenceForm, setOccurrenceForm] = useState(createDefaultOccurrenceForm)
  const [proposalForm, setProposalForm] = useState(createDefaultProposalForm)
  const [expenseForm, setExpenseForm] = useState(createDefaultExpenseForm)
  const [proposalComments, setProposalComments] = useState("")
  const [expenseComments, setExpenseComments] = useState("")
  const [proposalNextApprovalStages, setProposalNextApprovalStages] = useState([])
  const [expenseNextApprovalStages, setExpenseNextApprovalStages] = useState([])

  const [submitting, setSubmitting] = useState(false)

  const selectedOccurrence = useMemo(
    () => occurrences.find((entry) => entry._id === selectedOccurrenceId) || latestOccurrence,
    [occurrences, selectedOccurrenceId, latestOccurrence]
  )

  const canCreateSeries = isAdminLevel
  const canCreateOccurrence = isAdminLevel && Boolean(selectedSeries?._id)
  const canCreateOrEditProposal = isPresident && Boolean(selectedOccurrence?._id)
  const canCreateOrEditExpense = isGS && selectedOccurrence?.status === "proposal_approved"

  const canReviewProposal = useMemo(() => {
    if (!proposalData?.status || !isAdminLevel) return false
    const requiredApprover = getRequiredApproverForProposal(proposalData.status)
    if (!requiredApprover) return false
    if (user?.role === "Super Admin") return true
    return user?.subRole === requiredApprover
  }, [proposalData?.status, isAdminLevel, user?.role, user?.subRole])

  const canReviewExpense = useMemo(() => {
    if (!expenseData?.approvalStatus || !isAdminLevel) return false
    const requiredApprover = getRequiredApproverForExpense(expenseData.approvalStatus)
    if (!requiredApprover) return false
    if (user?.role === "Super Admin") return true
    return user?.subRole === requiredApprover
  }, [expenseData?.approvalStatus, isAdminLevel, user?.role, user?.subRole])

  const requiresProposalStageSelection = proposalData?.status === "pending_student_affairs"
  const requiresExpenseStageSelection =
    expenseData?.approvalStatus === "pending_student_affairs" || expenseData?.approvalStatus === "pending"

  const isProposalFormValid = Boolean(
    proposalForm.proposalText?.trim() &&
    Number(proposalForm.totalExpectedIncome || 0) >= 0 &&
    Number(proposalForm.totalExpenditure || 0) >= 0 &&
    (!proposalForm.hasRegistrationFee || Number(proposalForm.registrationFeeAmount || 0) >= 0)
  )

  const isExpenseFormValid = useMemo(() => {
    if (!Array.isArray(expenseForm.bills) || expenseForm.bills.length === 0) return false
    const validBills = expenseForm.bills.every((bill) =>
      bill.description?.trim() &&
      Number(bill.amount || 0) > 0 &&
      bill.attachmentUrl?.trim()
    )
    return validBills && Boolean(expenseForm.eventReportDocumentUrl?.trim())
  }, [expenseForm.bills, expenseForm.eventReportDocumentUrl])

  const loadSeries = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await gymkhanaEventsApi.getMegaSeries()
      const loadedSeries = response.data?.series || response.series || []
      setSeries(loadedSeries)

      const nextSelectedId = selectedSeriesId && loadedSeries.some((item) => item._id === selectedSeriesId)
        ? selectedSeriesId
        : loadedSeries[0]?._id || ""
      setSelectedSeriesId(nextSelectedId)
    } catch (err) {
      setError(err.message || "Failed to load mega event series")
    } finally {
      setLoading(false)
    }
  }

  const loadSeriesDetails = async (seriesId) => {
    if (!seriesId) {
      setSelectedSeries(null)
      setOccurrences([])
      setLatestOccurrence(null)
      setSelectedOccurrenceId("")
      return
    }

    try {
      const response = await gymkhanaEventsApi.getMegaSeriesById(seriesId)
      const seriesData = response.data?.series || response.series || null
      const responseOccurrences = response.data?.occurrences || response.occurrences || []
      const orderedOccurrences = sortOccurrencesByDateDesc(responseOccurrences)
      setSelectedSeries(seriesData)
      setOccurrences(orderedOccurrences)

      const latest = orderedOccurrences[0] || null
      setLatestOccurrence(latest)
      setSelectedOccurrenceId(latest?._id || "")
      setIsHistoryOpen(false)
    } catch (err) {
      setError(err.message || "Failed to load mega event details")
    }
  }

  const loadProposalAndExpense = async (occurrence) => {
    if (!occurrence?._id) {
      setProposalData(null)
      setExpenseData(null)
      return
    }

    try {
      const [proposalResponse, expenseResponse] = await Promise.all([
        gymkhanaEventsApi.getProposalByEvent(occurrence._id).catch(() => null),
        gymkhanaEventsApi.getExpenseByEvent(occurrence._id).catch(() => null),
      ])

      const loadedProposal = proposalResponse?.data?.proposal || proposalResponse?.proposal || null
      const loadedExpense = expenseResponse?.data?.expense || expenseResponse?.expense || null
      setProposalData(loadedProposal)
      setExpenseData(loadedExpense)
      setProposalForm(loadedProposal ? toProposalForm(loadedProposal) : createDefaultProposalForm())
      setExpenseForm(loadedExpense ? toExpenseForm(loadedExpense) : createDefaultExpenseForm())
      setProposalComments("")
      setExpenseComments("")
      setProposalNextApprovalStages([])
      setExpenseNextApprovalStages([])
    } catch {
      setProposalData(null)
      setExpenseData(null)
    }
  }

  useEffect(() => {
    loadSeries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadSeriesDetails(selectedSeriesId)
  }, [selectedSeriesId])

  useEffect(() => {
    loadProposalAndExpense(selectedOccurrence)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOccurrence?._id])

  const toggleStageSelection = (stage, currentValues, setter) => {
    if (currentValues.includes(stage)) {
      setter(currentValues.filter((entry) => entry !== stage))
      return
    }
    setter([...currentValues, stage])
  }

  const uploadProposalPdf = async (file) => {
    const formData = new FormData()
    formData.append("proposalPdf", file)
    return uploadApi.uploadEventProposalPDF(formData)
  }

  const uploadChiefGuestPdf = async (file) => {
    const formData = new FormData()
    formData.append("chiefGuestPdf", file)
    return uploadApi.uploadEventChiefGuestPDF(formData)
  }

  const uploadBillPdf = async (file) => {
    const formData = new FormData()
    formData.append("billPdf", file)
    return uploadApi.uploadEventBillPDF(formData)
  }

  const uploadEventReportPdf = async (file) => {
    const formData = new FormData()
    formData.append("eventReportPdf", file)
    return uploadApi.uploadEventReportPDF(formData)
  }

  const handleCreateSeries = async () => {
    if (!seriesForm.name.trim()) {
      toast.error("Series name is required")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.createMegaSeries({
        name: seriesForm.name.trim(),
        description: seriesForm.description.trim(),
      })
      toast.success("Mega event series created")
      setIsCreateSeriesOpen(false)
      setSeriesForm(createDefaultSeriesForm())
      await loadSeries()
    } catch (err) {
      toast.error(err.message || "Failed to create mega event series")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateOccurrence = async () => {
    if (!selectedSeries?._id) return

    if (!occurrenceForm.startDate || !occurrenceForm.endDate) {
      toast.error("Please select start and end dates")
      return
    }
    if (new Date(occurrenceForm.endDate) < new Date(occurrenceForm.startDate)) {
      toast.error("End date cannot be before start date")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.createMegaOccurrence(selectedSeries._id, {
        startDate: occurrenceForm.startDate,
        endDate: occurrenceForm.endDate,
      })
      toast.success("Occurrence created")
      setIsCreateOccurrenceOpen(false)
      setOccurrenceForm(createDefaultOccurrenceForm())
      await loadSeriesDetails(selectedSeries._id)
      await loadSeries()
    } catch (err) {
      toast.error(err.message || "Failed to create occurrence")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveProposal = async () => {
    if (!selectedOccurrence?._id) return
    if (!isProposalFormValid) {
      toast.error("Please complete required proposal fields")
      return
    }

    const payload = buildProposalPayload(proposalForm)

    try {
      setSubmitting(true)
      if (proposalData?._id) {
        await gymkhanaEventsApi.updateProposal(proposalData._id, payload)
      } else {
        await gymkhanaEventsApi.createProposal(selectedOccurrence._id, payload)
      }
      toast.success("Proposal saved")
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to save proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveProposal = async () => {
    if (!proposalData?._id) return
    if (requiresProposalStageSelection && proposalNextApprovalStages.length === 0) {
      toast.error("Select at least one next approval stage")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveProposal(
        proposalData._id,
        proposalComments,
        requiresProposalStageSelection ? proposalNextApprovalStages : []
      )
      toast.success("Proposal decision saved")
      setProposalHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to approve proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectProposal = async () => {
    if (!proposalData?._id) return
    if (!proposalComments || proposalComments.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectProposal(proposalData._id, proposalComments.trim())
      toast.success("Proposal rejected")
      setProposalHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to reject proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestProposalRevision = async () => {
    if (!proposalData?._id) return
    if (!proposalComments || proposalComments.trim().length < 10) {
      toast.error("Revision comments must be at least 10 characters")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.requestRevision(proposalData._id, proposalComments.trim())
      toast.success("Revision requested")
      setProposalHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to request revision")
    } finally {
      setSubmitting(false)
    }
  }

  const updateBillField = (index, key, value) => {
    setExpenseForm((prev) => {
      const nextBills = [...prev.bills]
      nextBills[index] = {
        ...nextBills[index],
        [key]: value,
      }
      return { ...prev, bills: nextBills }
    })
  }

  const handleSaveExpense = async () => {
    if (!selectedOccurrence?._id) return
    if (!isExpenseFormValid) {
      toast.error("Please complete required bill and report fields")
      return
    }

    const payload = buildExpensePayload(expenseForm)
    try {
      setSubmitting(true)
      if (expenseData?._id) {
        await gymkhanaEventsApi.updateExpense(expenseData._id, payload)
      } else {
        await gymkhanaEventsApi.submitExpense(selectedOccurrence._id, payload)
      }
      toast.success("Expense saved")
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to save expense")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveExpense = async () => {
    if (!expenseData?._id) return
    if (requiresExpenseStageSelection && expenseNextApprovalStages.length === 0) {
      toast.error("Select at least one next approval stage")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveExpense(
        expenseData._id,
        expenseComments,
        requiresExpenseStageSelection ? expenseNextApprovalStages : []
      )
      toast.success("Expense decision saved")
      setExpenseHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to approve expense")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectExpense = async () => {
    if (!expenseData?._id) return
    if (!expenseComments || expenseComments.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters")
      return
    }
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectExpense(expenseData._id, expenseComments.trim())
      toast.success("Expense rejected")
      setExpenseHistoryRefreshKey((value) => value + 1)
      await loadProposalAndExpense(selectedOccurrence)
      await loadSeriesDetails(selectedSeriesId)
    } catch (err) {
      toast.error(err.message || "Failed to reject expense")
    } finally {
      setSubmitting(false)
    }
  }

  const statusBadgeVariant = (status) => {
    if (!status) return "default"
    if (["approved", "completed", "proposal_approved"].includes(status)) return "success"
    if (status.includes("rejected")) return "danger"
    if (status.includes("pending")) return "warning"
    if (status.includes("submitted")) return "info"
    return "default"
  }

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {selectedSeries && occurrences.length > 0 && (
        <Button size="md" variant="secondary" onClick={() => setIsHistoryOpen(true)}>
          <History size={16} /> History
        </Button>
      )}
      {canCreateOccurrence && (
        <Button size="md" onClick={() => setIsCreateOccurrenceOpen(true)}>
          <Plus size={16} /> Add Occurrence
        </Button>
      )}
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <PageHeader
        title="Mega Events"
        subtitle="Recurring flagship events with date-based latest view and full occurrence history."
      >
        {headerActions}
      </PageHeader>

      <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-6)" }}>
        {loading ? (
          <LoadingState message="Loading mega events..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadSeries} />
        ) : series.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                title="No Mega Event Series"
                message={canCreateSeries
                  ? "Create your first mega event series from the footer to get started."
                  : "No mega event series available yet."}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {selectedSeries && (
              <Card style={{ height: "100%" }}>
                <CardContent style={{ height: "100%", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                  {!selectedOccurrence ? (
                    <Alert type="info" title="No occurrence yet">
                      Create a new occurrence for this mega event series.
                    </Alert>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--spacing-2)",
                        }}
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--color-text-heading)]">{selectedSeries.name}</h3>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {formatDateRange(selectedOccurrence.scheduledStartDate, selectedOccurrence.scheduledEndDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              selectedOccurrence?._id && selectedOccurrence._id === latestOccurrence?._id
                                ? "success"
                                : "default"
                            }
                          >
                            {selectedOccurrence?._id && selectedOccurrence._id === latestOccurrence?._id
                              ? "Present"
                              : "Past"}
                          </Badge>
                          <Badge variant={statusBadgeVariant(selectedOccurrence.status)}>
                            {(selectedOccurrence.status || "unknown").replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>

                      <div
                        className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4"
                        style={{ flex: 1 }}
                      >
                        <h4 className="text-base font-semibold text-[var(--color-text-heading)]">{selectedOccurrence.title}</h4>
                        {selectedOccurrence.description ? (
                          <p className="mt-3 text-sm text-[var(--color-text-body)]">{selectedOccurrence.description}</p>
                        ) : (
                          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                            Description will be available after proposal details are added.
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2">
                          {canCreateOrEditProposal && (
                            <Button size="sm" onClick={() => setIsProposalOpen(true)}>
                              <FileText size={14} /> {proposalData ? "Edit Proposal" : "Submit Proposal"}
                            </Button>
                          )}
                          {(proposalData || canReviewProposal) && (
                            <Button size="sm" variant="secondary" onClick={() => setIsProposalOpen(true)}>
                              <History size={14} /> Proposal Review
                            </Button>
                          )}
                          {(expenseData || canCreateOrEditExpense || canReviewExpense) && (
                            <Button size="sm" variant="secondary" onClick={() => setIsExpenseOpen(true)}>
                              <Receipt size={14} /> Expense Flow
                            </Button>
                          )}
                        </div>
                        {!canCreateOrEditProposal && !canCreateOrEditExpense && !canReviewProposal && !canReviewExpense && (
                          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                            You have read-only access for this occurrence.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <div style={footerTabStyles.tabsBar}>
        <div style={footerTabStyles.tabsList}>
          {series.map((entry) => (
            <button
              key={entry._id}
              type="button"
              onClick={() => setSelectedSeriesId(entry._id)}
              style={{
                ...footerTabStyles.tab,
                ...(selectedSeriesId === entry._id ? footerTabStyles.tabActive : {}),
              }}
            >
              <CalendarDays size={14} />
              {entry.name}
            </button>
          ))}
          {canCreateSeries && (
            <button
              type="button"
              onClick={() => setIsCreateSeriesOpen(true)}
              style={{ ...footerTabStyles.tab, ...footerTabStyles.addTab }}
            >
              <Plus size={14} />
              Add Event
            </button>
          )}
        </div>
      </div>

      <Modal
        title="Create Mega Event Series"
        isOpen={isCreateSeriesOpen}
        onClose={() => setIsCreateSeriesOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateSeriesOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSeries} loading={submitting}>Create</Button>
          </div>
        )}
      >
        <div className="space-y-3">
          <Input
            value={seriesForm.name}
            onChange={(event) => setSeriesForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Event name (e.g., Flux, IPL Fest, Alumni Summit)"
          />
          <Textarea
            value={seriesForm.description}
            onChange={(event) => setSeriesForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Optional description"
            rows={4}
          />
        </div>
      </Modal>

      <Modal
        title="Create Mega Event Occurrence"
        isOpen={isCreateOccurrenceOpen}
        onClose={() => setIsCreateOccurrenceOpen(false)}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateOccurrenceOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOccurrence} loading={submitting}>Create Occurrence</Button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            Select the date range for this occurrence. Proposal details will be added in the proposal flow.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              type="date"
              value={occurrenceForm.startDate}
              onChange={(event) => setOccurrenceForm((prev) => ({ ...prev, startDate: event.target.value }))}
            />
            <Input
              type="date"
              value={occurrenceForm.endDate}
              onChange={(event) => setOccurrenceForm((prev) => ({ ...prev, endDate: event.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title={`${selectedSeries?.name || "Mega Event"} Occurrences`}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      >
        <div className="space-y-2">
          {occurrences.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No occurrences available.</p>
          ) : (
            occurrences.map((entry) => {
              const isSelected = selectedOccurrenceId === entry._id
              const isPresent = latestOccurrence?._id === entry._id
              return (
                <button
                  key={entry._id}
                  type="button"
                  onClick={() => {
                    setSelectedOccurrenceId(entry._id)
                    setIsHistoryOpen(false)
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)]"
                      : "border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {entry.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={isPresent ? "success" : "default"}>
                        {isPresent ? "Present" : "Past"}
                      </Badge>
                      <Badge variant={statusBadgeVariant(entry.status)}>
                        {(entry.status || "unknown").replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {formatDateRange(entry.scheduledStartDate, entry.scheduledEndDate)}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </Modal>

      <Modal
        title="Mega Event Proposal"
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        width={960}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsProposalOpen(false)}>Close</Button>
            {canCreateOrEditProposal && (
              <Button onClick={handleSaveProposal} loading={submitting}>
                {proposalData ? "Update Proposal" : "Submit Proposal"}
              </Button>
            )}
            {canReviewProposal && (
              <>
                <Button variant="outline" onClick={handleRequestProposalRevision} loading={submitting}>
                  Request Revision
                </Button>
                <Button variant="danger" onClick={handleRejectProposal} loading={submitting}>Reject</Button>
                <Button variant="success" onClick={handleApproveProposal} loading={submitting}>Approve</Button>
              </>
            )}
          </div>
        )}
      >
        <div className="space-y-4">
          {proposalData && (
            <Alert type="info" title="Current proposal status">
              {(proposalData.status || "draft").replace(/_/g, " ")}
            </Alert>
          )}

          <Textarea
            value={proposalForm.proposalText}
            onChange={(event) => setProposalForm((prev) => ({ ...prev, proposalText: event.target.value }))}
            rows={5}
            placeholder="Proposal details"
            disabled={!canCreateOrEditProposal}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              type="number"
              min={0}
              value={proposalForm.totalExpectedIncome}
              onChange={(event) => setProposalForm((prev) => ({ ...prev, totalExpectedIncome: event.target.value }))}
              placeholder="Total expected income"
              disabled={!canCreateOrEditProposal}
            />
            <Input
              type="number"
              min={0}
              value={proposalForm.totalExpenditure}
              onChange={(event) => setProposalForm((prev) => ({ ...prev, totalExpenditure: event.target.value }))}
              placeholder="Total expenditure"
              disabled={!canCreateOrEditProposal}
            />
          </div>
          <Checkbox
            checked={proposalForm.hasRegistrationFee}
            onChange={(event) => setProposalForm((prev) => ({ ...prev, hasRegistrationFee: event.target.checked }))}
            label="Has registration fee"
            disabled={!canCreateOrEditProposal}
          />
          {proposalForm.hasRegistrationFee && (
            <Input
              type="number"
              min={0}
              value={proposalForm.registrationFeeAmount}
              onChange={(event) => setProposalForm((prev) => ({ ...prev, registrationFeeAmount: event.target.value }))}
              placeholder="Registration fee amount"
              disabled={!canCreateOrEditProposal}
            />
          )}
          <Checkbox
            checked={proposalForm.accommodationRequired}
            onChange={(event) => setProposalForm((prev) => ({ ...prev, accommodationRequired: event.target.checked }))}
            label="Accommodation required"
            disabled={!canCreateOrEditProposal}
          />
          <Textarea
            value={proposalForm.externalGuestsDetails}
            onChange={(event) => setProposalForm((prev) => ({ ...prev, externalGuestsDetails: event.target.value }))}
            rows={3}
            placeholder="External guests details"
            disabled={!canCreateOrEditProposal}
          />
          <PdfUploadField
            label="Proposal PDF"
            value={proposalForm.proposalDocumentUrl}
            onChange={(value) => setProposalForm((prev) => ({ ...prev, proposalDocumentUrl: value }))}
            onUpload={uploadProposalPdf}
            disabled={!canCreateOrEditProposal}
            viewerTitle="Proposal Document"
          />
          <PdfUploadField
            label="Chief Guest PDF"
            value={proposalForm.chiefGuestDocumentUrl}
            onChange={(value) => setProposalForm((prev) => ({ ...prev, chiefGuestDocumentUrl: value }))}
            onUpload={uploadChiefGuestPdf}
            disabled={!canCreateOrEditProposal}
            viewerTitle="Chief Guest Document"
          />

          {canReviewProposal && (
            <>
              {requiresProposalStageSelection && (
                <div className="space-y-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Select next approval stage(s)
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {POST_STUDENT_AFFAIRS_STAGE_OPTIONS.map((stage) => (
                      <Checkbox
                        key={stage}
                        checked={proposalNextApprovalStages.includes(stage)}
                        onChange={() =>
                          toggleStageSelection(stage, proposalNextApprovalStages, setProposalNextApprovalStages)}
                        label={stage}
                      />
                    ))}
                  </div>
                </div>
              )}
              <Textarea
                value={proposalComments}
                onChange={(event) => setProposalComments(event.target.value)}
                rows={3}
                placeholder="Review comments"
              />
            </>
          )}

          {proposalData?._id && (
            <Card>
              <CardContent>
                <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-secondary)]">Approval History</h4>
                <ApprovalHistory key={`proposal-${proposalData._id}-${proposalHistoryRefreshKey}`} proposalId={proposalData._id} />
              </CardContent>
            </Card>
          )}
        </div>
      </Modal>

      <Modal
        title="Mega Event Expenses"
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        width={960}
        footer={(
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsExpenseOpen(false)}>Close</Button>
            {canCreateOrEditExpense && (
              <Button onClick={handleSaveExpense} loading={submitting}>
                {expenseData ? "Update Expense" : "Submit Expense"}
              </Button>
            )}
            {canReviewExpense && (
              <>
                <Button variant="danger" onClick={handleRejectExpense} loading={submitting}>Reject</Button>
                <Button variant="success" onClick={handleApproveExpense} loading={submitting}>Approve</Button>
              </>
            )}
          </div>
        )}
      >
        <div className="space-y-4">
          {expenseData && (
            <Alert type="info" title="Current expense status">
              {(expenseData.approvalStatus || "pending").replace(/_/g, " ")}
            </Alert>
          )}

          {(expenseForm.bills || []).map((bill, index) => (
            <div key={`bill-${index}`} className="space-y-3 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Bill {index + 1}</p>
                {canCreateOrEditExpense && expenseForm.bills.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setExpenseForm((prev) => ({
                        ...prev,
                        bills: prev.bills.filter((_, billIndex) => billIndex !== index),
                      }))
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <Input
                value={bill.description}
                onChange={(event) => updateBillField(index, "description", event.target.value)}
                placeholder="Bill description"
                disabled={!canCreateOrEditExpense}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  type="number"
                  min={0}
                  value={bill.amount}
                  onChange={(event) => updateBillField(index, "amount", event.target.value)}
                  placeholder="Amount"
                  disabled={!canCreateOrEditExpense}
                />
                <Input
                  type="date"
                  value={bill.billDate}
                  onChange={(event) => updateBillField(index, "billDate", event.target.value)}
                  disabled={!canCreateOrEditExpense}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={bill.billNumber}
                  onChange={(event) => updateBillField(index, "billNumber", event.target.value)}
                  placeholder="Bill number"
                  disabled={!canCreateOrEditExpense}
                />
                <Input
                  value={bill.vendor}
                  onChange={(event) => updateBillField(index, "vendor", event.target.value)}
                  placeholder="Vendor"
                  disabled={!canCreateOrEditExpense}
                />
              </div>

              <PdfUploadField
                label="Bill PDF"
                value={bill.attachmentUrl}
                onChange={(value) => updateBillField(index, "attachmentUrl", value)}
                onUpload={uploadBillPdf}
                disabled={!canCreateOrEditExpense}
                viewerTitle="Bill Document"
              />
            </div>
          ))}

          {canCreateOrEditExpense && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExpenseForm((prev) => ({ ...prev, bills: [...prev.bills, createDefaultBill()] }))}
            >
              <Plus size={14} /> Add Bill
            </Button>
          )}

          <PdfUploadField
            label="Event Report PDF"
            value={expenseForm.eventReportDocumentUrl}
            onChange={(value) => setExpenseForm((prev) => ({ ...prev, eventReportDocumentUrl: value }))}
            onUpload={uploadEventReportPdf}
            disabled={!canCreateOrEditExpense}
            viewerTitle="Event Report Document"
          />

          <Textarea
            value={expenseForm.notes}
            onChange={(event) => setExpenseForm((prev) => ({ ...prev, notes: event.target.value }))}
            rows={3}
            placeholder="Notes"
            disabled={!canCreateOrEditExpense}
          />

          {canReviewExpense && (
            <>
              {requiresExpenseStageSelection && (
                <div className="space-y-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Select next approval stage(s)
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {POST_STUDENT_AFFAIRS_STAGE_OPTIONS.map((stage) => (
                      <Checkbox
                        key={stage}
                        checked={expenseNextApprovalStages.includes(stage)}
                        onChange={() =>
                          toggleStageSelection(stage, expenseNextApprovalStages, setExpenseNextApprovalStages)}
                        label={stage}
                      />
                    ))}
                  </div>
                </div>
              )}
              <Textarea
                value={expenseComments}
                onChange={(event) => setExpenseComments(event.target.value)}
                rows={3}
                placeholder="Review comments"
              />
            </>
          )}

          {expenseData?._id && (
            <Card>
              <CardContent>
                <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-secondary)]">Approval History</h4>
                <ApprovalHistory key={`expense-${expenseData._id}-${expenseHistoryRefreshKey}`} expenseId={expenseData._id} />
              </CardContent>
            </Card>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default MegaEventsPage
