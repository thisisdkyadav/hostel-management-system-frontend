import { useEffect, useState } from "react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import {
  POST_STUDENT_AFFAIRS_STAGE_OPTIONS,
  buildNextApproversPayload,
  createEmptyNextApproverSelection,
  getNextApproverSelectionCount,
} from "@/components/gymkhana/events-page/shared"

const buildEmptyApproverOptions = () =>
  POST_STUDENT_AFFAIRS_STAGE_OPTIONS.reduce((options, stage) => {
    options[stage] = []
    return options
  }, {})

export const useCalendarApproval = ({
  toast,
  calendar,
  selectedYear,
  isAdminLevel,
  canApproveEventsCapability,
  canApprove,
  requiresCalendarNextApprovalSelection,
  fetchCalendar,
  fetchYears,
  setSubmitting,
}) => {
  const [approvalComments, setApprovalComments] = useState("")
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [calendarNextApproversByStage, setCalendarNextApproversByStage] = useState(
    createEmptyNextApproverSelection
  )
  const [postStudentAffairsApproverOptionsByStage, setPostStudentAffairsApproverOptionsByStage] =
    useState(buildEmptyApproverOptions)

  const refreshPostStudentAffairsApproverOptions = async () => {
    try {
      const response = await gymkhanaEventsApi.getPostStudentAffairsApprovers()
      const approversByStage = response?.approversByStage || {}

      const nextOptions = POST_STUDENT_AFFAIRS_STAGE_OPTIONS.reduce((options, stage) => {
        const stageApprovers = Array.isArray(approversByStage?.[stage])
          ? approversByStage[stage]
          : []

        options[stage] = stageApprovers.map((approver) => ({
          value: approver?.value || approver?.userId || approver?._id || "",
          label:
            approver?.label ||
            (approver?.email
              ? `${approver?.name || "User"} (${approver.email})`
              : approver?.name || stage),
        })).filter((option) => Boolean(option.value))
        return options
      }, {})

      setPostStudentAffairsApproverOptionsByStage(nextOptions)
    } catch {
      setPostStudentAffairsApproverOptionsByStage(buildEmptyApproverOptions())
    }
  }

  useEffect(() => {
    if (!canApproveEventsCapability || !isAdminLevel) return
    refreshPostStudentAffairsApproverOptions()
  }, [canApproveEventsCapability, isAdminLevel])

  const setCalendarNextApproverForStage = (stage, userId) => {
    setCalendarNextApproversByStage((current) => ({
      ...current,
      [stage]: userId,
    }))
  }

  const openApprovalModal = () => {
    setApprovalComments("")
    setCalendarNextApproversByStage(createEmptyNextApproverSelection())
    setShowApprovalModal(true)
  }

  const handleApprove = async () => {
    if (!canApprove) {
      toast.error("You do not have permission to approve calendar")
      return
    }

    const nextApprovers = buildNextApproversPayload(calendarNextApproversByStage)
    const normalizedApprovalComments = String(approvalComments || "").trim()

    if (requiresCalendarNextApprovalSelection && getNextApproverSelectionCount(calendarNextApproversByStage) === 0) {
      toast.error("Select at least one next recommender")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveCalendar(
        calendar._id,
        normalizedApprovalComments,
        [],
        requiresCalendarNextApprovalSelection ? nextApprovers : [],
        false
      )
      toast.success(
        requiresCalendarNextApprovalSelection
          ? "Calendar recommended successfully"
          : "Calendar approved successfully"
      )
      setCalendarNextApproversByStage(createEmptyNextApproverSelection())
      setShowApprovalModal(false)
      setApprovalComments("")
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to approve calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDirectApprove = async () => {
    if (!canApprove) {
      toast.error("You do not have permission to approve calendar")
      return
    }

    if (!calendar?._id) return

    if (
      requiresCalendarNextApprovalSelection &&
      getNextApproverSelectionCount(calendarNextApproversByStage) > 0
    ) {
      toast.error("Clear all next recommenders before approving directly")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveCalendar(
        calendar._id,
        String(approvalComments || "").trim(),
        [],
        [],
        true
      )
      toast.success("Calendar approved successfully")
      setCalendarNextApproversByStage(createEmptyNextApproverSelection())
      setShowApprovalModal(false)
      setApprovalComments("")
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to approve calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!canApprove) {
      toast.error("You do not have permission to reject calendar")
      return
    }

    const normalizedApprovalComments = String(approvalComments || "").trim()

    if (normalizedApprovalComments.length < 10) {
      toast.error("Please provide a rejection reason (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectCalendar(calendar._id, normalizedApprovalComments)
      toast.success("Calendar rejected")
      setShowApprovalModal(false)
      setApprovalComments("")
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to reject calendar")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    approvalComments,
    setApprovalComments,
    showApprovalModal,
    setShowApprovalModal,
    calendarNextApproversByStage,
    setCalendarNextApproversByStage,
    setCalendarNextApproverForStage,
    postStudentAffairsApproverOptionsByStage,
    openApprovalModal,
    handleApprove,
    handleDirectApprove,
    handleReject,
  }
}

export default useCalendarApproval
