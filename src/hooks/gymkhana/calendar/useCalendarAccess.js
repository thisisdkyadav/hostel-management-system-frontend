import {
  CALENDAR_STATUS_TO_APPROVER,
  normalizeEventId,
} from "@/components/gymkhana/events-page/shared"

const SUBMITTABLE_CALENDAR_STATUSES = [
  "draft",
  "rejected",
  "pending_president",
  "pending_student_affairs",
  "pending_officer",
  "pending_associate_dean",
  "pending_dean",
  "approved",
]

export const useCalendarAccess = ({
  user,
  calendar,
  events,
  isGS,
  isPresident,
  isAdminLevel,
  canCreateEventsCapability,
  canApproveEventsCapability,
}) => {
  const canEditGS =
    calendar &&
    !calendar.isLocked &&
    isGS &&
    canCreateEventsCapability
  const canEditPresident =
    calendar &&
    !calendar.isLocked &&
    isPresident &&
    canCreateEventsCapability
  const canEdit = canEditGS || canEditPresident
  const canSubmitCalendar = Boolean(
    calendar &&
      !calendar.isLocked &&
      isPresident &&
      canCreateEventsCapability &&
      SUBMITTABLE_CALENDAR_STATUSES.includes(calendar.status) &&
      events.length > 0
  )
  const submitCalendarLabel = calendar?.status === "draft" ? "Submit for Approval" : "Resubmit for Approval"
  const canApprove = Boolean(
    calendar?.status &&
      canApproveEventsCapability &&
      user?.subRole &&
      CALENDAR_STATUS_TO_APPROVER[calendar.status] === user.subRole &&
      (!normalizeEventId(calendar?.currentApproverUser) ||
        normalizeEventId(calendar?.currentApproverUser) === normalizeEventId(user?._id))
  )
  const requiresCalendarNextApprovalSelection = Boolean(
    canApprove &&
      user?.subRole === "Student Affairs" &&
      calendar?.status === "pending_student_affairs"
  )
  const canManageCalendarLock = isAdminLevel && canApproveEventsCapability && Boolean(calendar?._id)
  const canCreateCalendar = isAdminLevel && canCreateEventsCapability

  return {
    canEdit,
    canSubmitCalendar,
    submitCalendarLabel,
    canApprove,
    requiresCalendarNextApprovalSelection,
    canManageCalendarLock,
    canCreateCalendar,
  }
}

export default useCalendarAccess
