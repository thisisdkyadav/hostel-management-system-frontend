import { useEffect, useMemo, useState } from "react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import uploadApi from "@/service/modules/upload.api"
import {
  PROPOSAL_STATUS_TO_APPROVER,
  calculateTotalExpectedIncomeFromDetails,
  createDefaultProposalDetails,
  createDefaultProposalForm,
  generateExternalGuestsDetailsFromDetails,
  generateProposalTextFromDetails,
  getProposalDueDate,
  hasRequiredDetailedProposalFields,
  isProposalWindowOpen,
  normalizeEventId,
  setNestedValue,
  toNumericValue,
  toProposalForm,
  buildProposalPayload,
} from "@/components/gymkhana/events-page/shared"

export const useGymkhanaProposalActions = ({
  user,
  isGS,
  isPresident,
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
  const [proposalsForApproval, setProposalsForApproval] = useState([])
  const [proposalEvent, setProposalEvent] = useState(null)
  const [proposalData, setProposalData] = useState(null)
  const [proposalForm, setProposalForm] = useState(createDefaultProposalForm)
  const [proposalActionComments, setProposalActionComments] = useState("")
  const [proposalNextApprovalStages, setProposalNextApprovalStages] = useState([])
  const [proposalLoading, setProposalLoading] = useState(false)
  const [proposalHistoryRefreshKey, setProposalHistoryRefreshKey] = useState(0)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [showProposalDetailsModal, setShowProposalDetailsModal] = useState(false)
  const [showPendingProposalModal, setShowPendingProposalModal] = useState(false)

  const refreshProposalsForApproval = async () => {
    if (!user?.subRole) {
      setProposalsForApproval([])
      return []
    }

    try {
      const response = await gymkhanaEventsApi.getProposalsForApproval()
      const approvals = response.data?.proposals || response.proposals || []
      setProposalsForApproval(approvals)
      return approvals
    } catch {
      setProposalsForApproval([])
      return []
    }
  }

  useEffect(() => {
    refreshProposalsForApproval()
  }, [user?.subRole])

  const pendingProposalsForSelectedCalendar = useMemo(
    () =>
      proposalsForApproval.filter((proposal) =>
        selectedCalendarEventIds.has(normalizeEventId(proposal?.eventId?._id))
      ),
    [proposalsForApproval, selectedCalendarEventIds]
  )

  const isProposalEditableByCurrentUser = useMemo(() => {
    if (!proposalData) return false
    if (isGS) {
      return proposalData.status === "revision_requested" || proposalData.status === "rejected"
    }
    if (isPresident) return proposalData.status === "pending_president"
    return false
  }, [proposalData, isGS, isPresident])

  const canCreateProposalForSelectedEvent = useMemo(() => {
    if (!proposalEvent) return false
    return (
      isGS &&
      canCreateEventsCapability &&
      proposalEvent.proposalCreationAllowed !== false &&
      isProposalWindowOpen(proposalEvent) &&
      !proposalData &&
      proposalEvent.gymkhanaEventId
    )
  }, [proposalEvent, isGS, canCreateEventsCapability, proposalData])

  const isProposalWithinApprovalLimit = useMemo(
    () =>
      maxApprovalAmount === null ||
      Number(proposalData?.totalExpenditure || 0) <= maxApprovalAmount,
    [maxApprovalAmount, proposalData?.totalExpenditure]
  )

  const canCurrentUserReviewProposal = useMemo(() => {
    if (!canApproveEventsCapability) return false
    if (!proposalData?.status || !user?.subRole) return false
    if (!isProposalWithinApprovalLimit) return false
    return PROPOSAL_STATUS_TO_APPROVER[proposalData.status] === user.subRole
  }, [
    proposalData?.status,
    canApproveEventsCapability,
    isProposalWithinApprovalLimit,
    user?.subRole,
  ])

  const requiresProposalNextApprovalSelection = useMemo(
    () =>
      Boolean(
        canCurrentUserReviewProposal &&
          user?.subRole === "Student Affairs" &&
          (proposalData?.status === "pending_student_affairs" ||
            proposalData?.status === "pending")
      ),
    [canCurrentUserReviewProposal, proposalData?.status, user?.subRole]
  )

  const proposalDeflection = useMemo(() => {
    if (!proposalEvent) return 0
    return Number(proposalForm.totalExpenditure || 0) - Number(proposalEvent.estimatedBudget || 0)
  }, [proposalForm.totalExpenditure, proposalEvent])

  const computedTotalExpectedIncome = useMemo(
    () => calculateTotalExpectedIncomeFromDetails(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )

  const detailedProposalPreviewText = useMemo(
    () => generateProposalTextFromDetails(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )

  const detailedExternalGuestsText = useMemo(
    () => generateExternalGuestsDetailsFromDetails(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )

  const isDetailedProposalComplete = useMemo(
    () => hasRequiredDetailedProposalFields(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )

  const isProposalFormValid = Boolean(
    isDetailedProposalComplete &&
      Number(computedTotalExpectedIncome) >= 0 &&
      Number(proposalForm.totalExpenditure || 0) >= 0
  )

  const canEditProposalForm = canCreateProposalForSelectedEvent || isProposalEditableByCurrentUser

  const fetchProposalForEvent = async (event) => {
    if (!event?.gymkhanaEventId) {
      setProposalData(null)
      setProposalForm(createDefaultProposalForm())
      return
    }

    try {
      setProposalLoading(true)
      const response = await gymkhanaEventsApi.getProposalByEvent(event.gymkhanaEventId)
      const proposal = response.data?.proposal || response.proposal || null
      setProposalData(proposal)
      setProposalForm(proposal ? toProposalForm(proposal) : createDefaultProposalForm())
    } catch (err) {
      if (err.status === 404) {
        setProposalData(null)
        setProposalForm(createDefaultProposalForm())
      } else {
        toast.error(err.message || "Failed to load proposal")
      }
    } finally {
      setProposalLoading(false)
    }
  }

  const openProposalModal = async (event) => {
    if (!canViewEventsCapability) {
      toast.error("You do not have permission to view event proposals")
      return
    }

    setProposalEvent(event)
    setShowProposalDetailsModal(false)
    setProposalActionComments("")
    setProposalNextApprovalStages([])
    setProposalHistoryRefreshKey((prev) => prev + 1)
    setShowProposalModal(true)
    await fetchProposalForEvent(event)
  }

  const closeProposalModal = () => {
    setShowProposalModal(false)
    setShowProposalDetailsModal(false)
    setProposalEvent(null)
    setProposalData(null)
    setProposalForm(createDefaultProposalForm())
    setProposalActionComments("")
    setProposalNextApprovalStages([])
  }

  const handleProposalFormChange = (field, value) => {
    setProposalForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleProposalDetailsChange = (path, value) => {
    setProposalForm((prev) => ({
      ...prev,
      proposalDetails: setNestedValue(
        prev.proposalDetails || createDefaultProposalDetails(),
        path,
        value
      ),
    }))
  }

  const handleProposalRegistrationDetailChange = (categoryKey, field, value) => {
    handleProposalDetailsChange(["registrationDetails", categoryKey, field], value)
  }

  const uploadProposalDocument = async (file) => {
    const formData = new FormData()
    formData.append("proposalPdf", file)
    return uploadApi.uploadEventProposalPDF(formData)
  }

  const uploadScheduleAnnexureDocument = async (file) => {
    const formData = new FormData()
    formData.append("proposalPdf", file)
    return uploadApi.uploadEventProposalPDF(formData)
  }

  const uploadChiefGuestDocument = async (file) => {
    const formData = new FormData()
    formData.append("chiefGuestPdf", file)
    return uploadApi.uploadEventChiefGuestPDF(formData)
  }

  const handleCreateOrUpdateProposal = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit proposals")
      return
    }

    if (!proposalEvent?.gymkhanaEventId) {
      toast.error("Linked event record not found")
      return
    }

    if (!isProposalFormValid) {
      toast.error("Please complete all required proposal fields")
      return
    }

    const payload = buildProposalPayload(proposalForm)

    try {
      setSubmitting(true)

      if (proposalData?._id) {
        await gymkhanaEventsApi.updateProposal(proposalData._id, payload)
        toast.success("Proposal updated successfully")
      } else {
        await gymkhanaEventsApi.createProposal(proposalEvent.gymkhanaEventId, payload)
        toast.success("Proposal submitted successfully")
      }

      await fetchProposalForEvent(proposalEvent)
      setProposalHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await refreshProposalsForApproval()
    } catch (err) {
      toast.error(err.message || "Failed to save proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveProposal = async () => {
    if (!canCurrentUserReviewProposal) {
      toast.error("You do not have permission to review this proposal")
      return
    }

    if (!proposalData?._id) return
    if (!isProposalWithinApprovalLimit && maxApprovalAmount !== null) {
      toast.error(`Proposal amount exceeds your approval limit of ${maxApprovalAmount}`)
      return
    }
    if (requiresProposalNextApprovalSelection && proposalNextApprovalStages.length === 0) {
      toast.error("Select at least one next approval stage")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveProposal(
        proposalData._id,
        proposalActionComments,
        requiresProposalNextApprovalSelection ? proposalNextApprovalStages : []
      )
      toast.success("Proposal approved")
      setProposalActionComments("")
      await fetchProposalForEvent(proposalEvent)
      setProposalHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await refreshProposalsForApproval()
    } catch (err) {
      toast.error(err.message || "Failed to approve proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectProposal = async () => {
    if (!canCurrentUserReviewProposal) {
      toast.error("You do not have permission to review this proposal")
      return
    }

    if (!proposalData?._id) return
    if (!proposalActionComments || proposalActionComments.length < 10) {
      toast.error("Please provide a rejection reason (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectProposal(proposalData._id, proposalActionComments)
      toast.success("Proposal rejected")
      setProposalActionComments("")
      await fetchProposalForEvent(proposalEvent)
      setProposalHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await refreshProposalsForApproval()
    } catch (err) {
      toast.error(err.message || "Failed to reject proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestProposalRevision = async () => {
    if (!canCurrentUserReviewProposal) {
      toast.error("You do not have permission to review this proposal")
      return
    }

    if (!proposalData?._id) return
    if (!proposalActionComments || proposalActionComments.length < 10) {
      toast.error("Please provide revision notes (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.requestRevision(proposalData._id, proposalActionComments)
      toast.success("Revision requested")
      setProposalActionComments("")
      await fetchProposalForEvent(proposalEvent)
      setProposalHistoryRefreshKey((prev) => prev + 1)
      await fetchCalendar(selectedYear)
      await refreshProposalsForApproval()
    } catch (err) {
      toast.error(err.message || "Failed to request revision")
    } finally {
      setSubmitting(false)
    }
  }

  const openPendingProposalReview = async (proposal) => {
    const eventEntity = proposal?.eventId
    if (!eventEntity?._id) {
      toast.error("Linked event not found for this proposal")
      return
    }

    await openProposalModal({
      title: eventEntity.title || "Proposal",
      gymkhanaEventId: eventEntity._id,
      estimatedBudget:
        Number(proposal?.eventBudgetAtSubmission || 0) || Number(eventEntity?.estimatedBudget || 0),
      startDate: eventEntity?.scheduledStartDate || null,
      endDate: eventEntity?.scheduledEndDate || null,
      proposalSubmitted: true,
    })
  }

  return {
    pendingProposalsForSelectedCalendar,
    proposalEvent,
    proposalData,
    proposalForm,
    proposalActionComments,
    proposalNextApprovalStages,
    proposalLoading,
    proposalHistoryRefreshKey,
    showProposalModal,
    showProposalDetailsModal,
    showPendingProposalModal,
    canCreateProposalForSelectedEvent,
    canCurrentUserReviewProposal,
    canEditProposalForm,
    computedTotalExpectedIncome,
    detailedExternalGuestsText,
    detailedProposalPreviewText,
    getProposalDueDate,
    isDetailedProposalComplete,
    isProposalFormValid,
    proposalDeflection,
    requiresProposalNextApprovalSelection,
    setProposalActionComments,
    setProposalNextApprovalStages,
    setShowPendingProposalModal,
    setShowProposalDetailsModal,
    toNumericValue,
    refreshProposalsForApproval,
    closeProposalModal,
    handleApproveProposal,
    handleCreateOrUpdateProposal,
    handleProposalDetailsChange,
    handleProposalFormChange,
    handleProposalRegistrationDetailChange,
    handleRejectProposal,
    handleRequestProposalRevision,
    openPendingProposalReview,
    openProposalModal,
    uploadChiefGuestDocument,
    uploadProposalDocument,
    uploadScheduleAnnexureDocument,
  }
}
