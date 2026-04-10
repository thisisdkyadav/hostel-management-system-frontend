import { useEffect, useMemo, useState } from "react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import uploadApi from "@/service/modules/upload.api"
import {
  createDefaultExpenseForm,
  createEmptyBill,
  getFilenameFromUrl,
  normalizeEventId,
  toExpenseForm,
  buildExpensePayload,
  buildNextApproversPayload,
  createEmptyNextApproverSelection,
  getNextApproverSelectionCount,
} from "@/components/gymkhana/events-page/shared"

export const useGymkhanaExpenseActions = ({
  user,
  isGS,
  isAdminLevel,
  isSuperAdmin,
  canViewEventsCapability,
  canCreateEventsCapability,
  canApproveEventsCapability,
  maxApprovalAmount,
  selectedYear,
  selectedCalendarEventIds,
  toast,
  fetchCalendar,
  setSubmitting,
}) => {
  const [pendingExpenseApprovals, setPendingExpenseApprovals] = useState([])
  const [expenseEvent, setExpenseEvent] = useState(null)
  const [expenseData, setExpenseData] = useState(null)
  const [expenseForm, setExpenseForm] = useState(createDefaultExpenseForm)
  const [expenseLoading, setExpenseLoading] = useState(false)
  const [expenseApprovalComments, setExpenseApprovalComments] = useState("")
  const [expenseNextApproversByStage, setExpenseNextApproversByStage] = useState(createEmptyNextApproverSelection)
  const [expenseHistoryRefreshKey, setExpenseHistoryRefreshKey] = useState(0)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showPendingBillsModal, setShowPendingBillsModal] = useState(false)

  const getPendingExpenseApprovals = async () => {
    if (!isAdminLevel) return []

    try {
      const firstPageResponse = await gymkhanaEventsApi.getAllExpenses({
        page: 1,
        limit: 100,
      })
      const firstPageData = firstPageResponse.data || firstPageResponse || {}
      const firstPageExpenses = firstPageData.expenses || []
      const totalPages = firstPageData.pagination?.pages || 1

      let expenses = [...firstPageExpenses]
      if (totalPages > 1) {
        const remainingPageRequests = []
        for (let page = 2; page <= totalPages; page += 1) {
          remainingPageRequests.push(
            gymkhanaEventsApi.getAllExpenses({
              page,
              limit: 100,
            })
          )
        }

        const remainingResponses = await Promise.all(remainingPageRequests)
        for (const response of remainingResponses) {
          const responseData = response.data || response || {}
          expenses = expenses.concat(responseData.expenses || [])
        }
      }

      return expenses.filter((expense) =>
        String(expense?.approvalStatus || "").startsWith("pending")
      )
    } catch {
      return []
    }
  }

  const refreshPendingExpenseApprovals = async () => {
    const pendingExpenses = await getPendingExpenseApprovals()
    setPendingExpenseApprovals(pendingExpenses || [])
    return pendingExpenses
  }

  useEffect(() => {
    if (!isAdminLevel) {
      setPendingExpenseApprovals([])
      return
    }

    refreshPendingExpenseApprovals()
  }, [isAdminLevel, user?.subRole])

  const pendingExpenseApprovalsForSelectedCalendar = useMemo(
    () =>
      pendingExpenseApprovals.filter((expense) =>
        selectedCalendarEventIds.has(normalizeEventId(expense?.eventId?._id))
      ),
    [pendingExpenseApprovals, selectedCalendarEventIds]
  )

  const assignedExpenseBudget = useMemo(
    () => Number(expenseData?.estimatedBudget || expenseEvent?.estimatedBudget || 0),
    [expenseData?.estimatedBudget, expenseEvent?.estimatedBudget]
  )

  const expenseTotal = useMemo(
    () =>
      (expenseForm.bills || []).reduce(
        (total, bill) => total + Number(bill?.amount || 0),
        0
      ),
    [expenseForm.bills]
  )

  const expenseVariance = useMemo(
    () => expenseTotal - assignedExpenseBudget,
    [expenseTotal, assignedExpenseBudget]
  )

  const isExpenseFormValid = useMemo(() => {
    if (!Array.isArray(expenseForm.bills) || expenseForm.bills.length === 0) {
      return false
    }

    const areBillsValid = expenseForm.bills.every(
      (bill) =>
        bill.description?.trim() &&
        Number(bill.amount || 0) >= 0 &&
        Boolean(bill.documentUrl?.trim())
    )

    return areBillsValid && Boolean(expenseForm.eventReportDocumentUrl?.trim())
  }, [expenseForm.bills, expenseForm.eventReportDocumentUrl])

  const isExpenseSubmissionAllowedForSelectedEvent = useMemo(() => {
    if (!expenseEvent?.gymkhanaEventId) return false
    return expenseEvent.eventStatus === "proposal_approved"
  }, [expenseEvent])

  const canEditExpenseForm = useMemo(
    () =>
      isGS &&
      canCreateEventsCapability &&
      isExpenseSubmissionAllowedForSelectedEvent &&
      expenseData?.approvalStatus !== "approved",
    [
      isGS,
      canCreateEventsCapability,
      isExpenseSubmissionAllowedForSelectedEvent,
      expenseData?.approvalStatus,
    ]
  )

  const canApproveExpense = useMemo(() => {
    if (!canApproveEventsCapability) return false
    if (!isAdminLevel || !expenseData?._id) return false
    if (!expenseData?.approvalStatus || expenseData.approvalStatus === "approved") return false
    if (!expenseData.approvalStatus.startsWith("pending")) return false
    if (
      maxApprovalAmount !== null &&
      Number(expenseData.totalExpenditure || 0) > maxApprovalAmount
    ) {
      return false
    }
    if (isSuperAdmin) return true

    const assignedApproverUserId = normalizeEventId(expenseData?.currentApproverUser)
    if (assignedApproverUserId && assignedApproverUserId !== normalizeEventId(user?._id)) {
      return false
    }

    const expenseStatusBySubRole = {
      "Student Affairs": "pending_student_affairs",
      "Joint Registrar SA": "pending_joint_registrar",
      "Associate Dean SA": "pending_associate_dean",
      "Dean SA": "pending_dean",
    }

    if (user?.subRole === "Student Affairs") {
      return (
        expenseData.approvalStatus === "pending" ||
        expenseData.approvalStatus === expenseStatusBySubRole[user.subRole]
      )
    }

    return expenseStatusBySubRole[user?.subRole] === expenseData.approvalStatus
  }, [
    canApproveEventsCapability,
    expenseData?._id,
    expenseData?.approvalStatus,
    expenseData?.totalExpenditure,
    isAdminLevel,
    isSuperAdmin,
    maxApprovalAmount,
    user?.subRole,
  ])

  const requiresExpenseNextApprovalSelection = useMemo(
    () =>
      Boolean(
        canApproveExpense &&
          (expenseData?.approvalStatus === "pending_student_affairs" ||
            expenseData?.approvalStatus === "pending")
      ),
    [canApproveExpense, expenseData?.approvalStatus]
  )

  const fetchExpenseForEvent = async (event) => {
    if (!event?.gymkhanaEventId) {
      setExpenseData(null)
      setExpenseForm(createDefaultExpenseForm())
      return
    }

    try {
      setExpenseLoading(true)
      const response = await gymkhanaEventsApi.getExpenseByEvent(event.gymkhanaEventId)
      const expense = response.data?.expense || response.expense || null
      setExpenseData(expense)
      setExpenseForm(expense ? toExpenseForm(expense) : createDefaultExpenseForm())
    } catch (err) {
      if (err.status === 404) {
        setExpenseData(null)
        setExpenseForm(createDefaultExpenseForm())
      } else {
        toast.error(err.message || "Failed to load bills")
      }
    } finally {
      setExpenseLoading(false)
    }
  }

  const openExpenseModal = async (event) => {
    if (!canViewEventsCapability) {
      toast.error("You do not have permission to view event expenses")
      return
    }

    setExpenseEvent(event)
    setExpenseApprovalComments("")
    setExpenseNextApproversByStage(createEmptyNextApproverSelection())
    setExpenseHistoryRefreshKey((prev) => prev + 1)
    setShowExpenseModal(true)
    await fetchExpenseForEvent(event)
  }

  const setExpenseNextApproverForStage = (stage, userId) => {
    setExpenseNextApproversByStage((current) => ({
      ...current,
      [stage]: userId,
    }))
  }

  const closeExpenseModal = () => {
    setShowExpenseModal(false)
    setExpenseEvent(null)
    setExpenseData(null)
    setExpenseForm(createDefaultExpenseForm())
    setExpenseApprovalComments("")
    setExpenseNextApproversByStage(createEmptyNextApproverSelection())
  }

  const handleExpenseFormChange = (field, value) => {
    setExpenseForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBillFieldChange = (localId, field, value) => {
    setExpenseForm((prev) => ({
      ...prev,
      bills: (prev.bills || []).map((bill) =>
        bill.localId === localId ? { ...bill, [field]: value } : bill
      ),
    }))
  }

  const handleAddBillRow = () => {
    setExpenseForm((prev) => ({
      ...prev,
      bills: [...(prev.bills || []), createEmptyBill()],
    }))
  }

  const handleRemoveBillRow = (localId) => {
    setExpenseForm((prev) => {
      const nextBills = (prev.bills || []).filter((bill) => bill.localId !== localId)
      return {
        ...prev,
        bills: nextBills.length > 0 ? nextBills : [createEmptyBill()],
      }
    })
  }

  const uploadBillDocument = async (file) => {
    const formData = new FormData()
    formData.append("billPdf", file)
    return uploadApi.uploadEventBillPDF(formData)
  }

  const uploadEventReportDocument = async (file) => {
    const formData = new FormData()
    formData.append("eventReportPdf", file)
    return uploadApi.uploadEventReportPDF(formData)
  }

  const handleCreateOrUpdateExpense = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit event expenses")
      return
    }

    if (!expenseEvent?.gymkhanaEventId) {
      toast.error("Linked event record not found")
      return
    }

    if (!isExpenseSubmissionAllowedForSelectedEvent) {
      toast.error("Bills can be submitted only after proposal approval")
      return
    }

    if (!isExpenseFormValid) {
      toast.error("Each bill needs description, amount, and PDF, and event report PDF is required")
      return
    }

    const payload = buildExpensePayload(expenseForm)
    try {
      setSubmitting(true)
      if (expenseData?._id) {
        await gymkhanaEventsApi.updateExpense(expenseData._id, payload)
        toast.success("Bills updated successfully")
      } else {
        await gymkhanaEventsApi.submitExpense(expenseEvent.gymkhanaEventId, payload)
        toast.success("Bills submitted successfully")
      }

      await fetchExpenseForEvent(expenseEvent)
      setExpenseHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await refreshPendingExpenseApprovals()
    } catch (err) {
      toast.error(err.message || "Failed to save bills")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveExpense = async () => {
    if (!canApproveExpense) {
      toast.error("You do not have permission to review this expense")
      return
    }

    if (!expenseData?._id) return
    if (
      maxApprovalAmount !== null &&
      Number(expenseData.totalExpenditure || 0) > maxApprovalAmount
    ) {
      toast.error(`Expense amount exceeds your approval limit of ${maxApprovalAmount}`)
      return
    }
    const nextApprovers = buildNextApproversPayload(expenseNextApproversByStage)

    if (requiresExpenseNextApprovalSelection && getNextApproverSelectionCount(expenseNextApproversByStage) === 0) {
      toast.error("Select at least one next approver")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveExpense(
        expenseData._id,
        expenseApprovalComments,
        [],
        requiresExpenseNextApprovalSelection ? nextApprovers : []
      )
      toast.success("Bills approved")
      setExpenseApprovalComments("")
      await fetchExpenseForEvent(expenseEvent)
      setExpenseHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await refreshPendingExpenseApprovals()
    } catch (err) {
      toast.error(err.message || "Failed to approve bills")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectExpense = async () => {
    if (!canApproveExpense) {
      toast.error("You do not have permission to review this expense")
      return
    }

    if (!expenseData?._id) return
    if (!expenseApprovalComments || expenseApprovalComments.trim().length < 10) {
      toast.error("Please provide a rejection reason (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectExpense(expenseData._id, expenseApprovalComments)
      toast.success("Bills rejected")
      setExpenseApprovalComments("")
      await fetchExpenseForEvent(expenseEvent)
      setExpenseHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await refreshPendingExpenseApprovals()
    } catch (err) {
      toast.error(err.message || "Failed to reject bills")
    } finally {
      setSubmitting(false)
    }
  }

  const openPendingExpenseReview = async (expense) => {
    const eventEntity = expense?.eventId
    if (!eventEntity?._id) {
      toast.error("Linked event not found for this expense")
      return
    }

    await openExpenseModal({
      title: eventEntity.title || "Event Bills",
      gymkhanaEventId: eventEntity._id,
      estimatedBudget: Number(expense?.estimatedBudget || 0),
      startDate: eventEntity?.scheduledStartDate || null,
      endDate: eventEntity?.scheduledEndDate || null,
      eventStatus: "proposal_approved",
    })
  }

  return {
    assignedExpenseBudget,
    canApproveExpense,
    canEditExpenseForm,
    expenseApprovalComments,
    expenseData,
    expenseEvent,
    expenseForm,
    expenseHistoryRefreshKey,
    expenseLoading,
    expenseNextApproversByStage,
    expenseTotal,
    expenseVariance,
    getFilenameFromUrl,
    isExpenseFormValid,
    isExpenseSubmissionAllowedForSelectedEvent,
    pendingExpenseApprovalsForSelectedCalendar,
    requiresExpenseNextApprovalSelection,
    showExpenseModal,
    showPendingBillsModal,
    setExpenseApprovalComments,
    setExpenseNextApproverForStage,
    setExpenseNextApproversByStage,
    setShowPendingBillsModal,
    closeExpenseModal,
    handleAddBillRow,
    handleApproveExpense,
    handleBillFieldChange,
    handleCreateOrUpdateExpense,
    handleExpenseFormChange,
    handleRejectExpense,
    handleRemoveBillRow,
    openExpenseModal,
    openPendingExpenseReview,
    refreshPendingExpenseApprovals,
    uploadBillDocument,
    uploadEventReportDocument,
  }
}
