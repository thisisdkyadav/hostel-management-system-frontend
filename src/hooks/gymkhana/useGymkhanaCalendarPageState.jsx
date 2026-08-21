import { useCalendarPermissions } from "./calendar/useCalendarPermissions"
import { useCalendarAccess } from "./calendar/useCalendarAccess"
import { useCalendarData } from "./calendar/useCalendarData"
import { useEventOverlapCheck } from "./calendar/useEventOverlapCheck"
import { useCalendarEventForms } from "./calendar/useCalendarEventForms"
import { useCalendarEventActions } from "./calendar/useCalendarEventActions"
import { useCalendarApproval } from "./calendar/useCalendarApproval"
import { useCalendarLifecycle } from "./calendar/useCalendarLifecycle"
import { useCalendarSettings } from "./calendar/useCalendarSettings"
import { useCalendarDisplayData } from "./calendar/useCalendarDisplayData"
import { useState } from "react"
import {
  formatDateRange,
  getDaysInMonth,
  getEventStatusVariant,
  getEventsForDate,
  getHolidaysForDate,
} from "@/components/gymkhana/events-page/shared"

export const useGymkhanaCalendarPageState = ({ user, toast }) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all")
  const [submitting, setSubmitting] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const permissions = useCalendarPermissions({ user })

  const data = useCalendarData({
    user,
    canViewEventsCapability: permissions.canViewEventsCapability,
  })
  const {
    calendar,
    events,
    calendarSettingsForm,
    setCalendarSettingsForm,
  } = data

  const access = useCalendarAccess({
    user,
    calendar,
    events,
    isGS: permissions.isGS,
    isPresident: permissions.isPresident,
    isAdminLevel: permissions.isAdminLevel,
    canCreateEventsCapability: permissions.canCreateEventsCapability,
    canApproveEventsCapability: permissions.canApproveEventsCapability,
  })

  const overlap = useEventOverlapCheck({ calendar })

  const display = useCalendarDisplayData({
    calendar,
    events,
    years: data.years,
    selectedYear: data.selectedYear,
    loading: data.loading,
    activeCategoryFilter,
    calendarHolidays: data.calendarHolidays,
  })

  const forms = useCalendarEventForms({
    toast,
    calendar,
    categoryDefinitions: display.categoryDefinitions,
    canCreateEventsCapability: permissions.canCreateEventsCapability,
    submitting,
    dateOverlapInfo: overlap.dateOverlapInfo,
    resetDateOverlapInfo: overlap.resetDateOverlapInfo,
    checkDateOverlap: overlap.checkDateOverlap,
  })

  const eventActions = useCalendarEventActions({
    toast,
    calendar,
    events,
    selectedYear: data.selectedYear,
    categoryDefinitions: display.categoryDefinitions,
    canCreateEventsCapability: permissions.canCreateEventsCapability,
    eventForm: forms.eventForm,
    selectedEvent: forms.selectedEvent,
    amendmentReason: forms.amendmentReason,
    overlapCheckCompletedForCurrentDates: forms.overlapCheckCompletedForCurrentDates,
    fetchCalendar: data.fetchCalendar,
    setSubmitting,
    setShowAddEventModal: forms.setShowAddEventModal,
    setShowAmendmentModal: forms.setShowAmendmentModal,
    setSelectedEvent: forms.setSelectedEvent,
    resetDateOverlapInfo: overlap.resetDateOverlapInfo,
  })

  const approval = useCalendarApproval({
    toast,
    calendar,
    selectedYear: data.selectedYear,
    isAdminLevel: permissions.isAdminLevel,
    canApproveEventsCapability: permissions.canApproveEventsCapability,
    canApprove: access.canApprove,
    requiresCalendarNextApprovalSelection: access.requiresCalendarNextApprovalSelection,
    fetchCalendar: data.fetchCalendar,
    fetchYears: data.fetchYears,
    setSubmitting,
  })

  const lifecycle = useCalendarLifecycle({
    toast,
    calendar,
    selectedYear: data.selectedYear,
    canCreateEventsCapability: permissions.canCreateEventsCapability,
    canCreateCalendar: access.canCreateCalendar,
    canManageCalendarLock: access.canManageCalendarLock,
    fetchCalendar: data.fetchCalendar,
    fetchYears: data.fetchYears,
    setSelectedYear: data.setSelectedYear,
    setSubmitting,
  })

  const settings = useCalendarSettings({
    toast,
    calendar,
    events,
    selectedYear: data.selectedYear,
    canManageCalendarLock: access.canManageCalendarLock,
    showSettingsModal,
    setShowSettingsModal,
    calendarSettingsForm,
    setCalendarSettingsForm,
    fetchCalendar: data.fetchCalendar,
    fetchYears: data.fetchYears,
    setSubmitting,
  })

  const getEventsForCurrentDate = (date) => getEventsForDate(date, display.filteredEvents)
  const getHolidaysForCurrentDate = (date) => getHolidaysForDate(date, display.holidaysByDate)

  return {
    activeCategoryFilter,
    amendmentReason: forms.amendmentReason,
    approvalComments: approval.approvalComments,
    availableYearsForCreation: display.availableYearsForCreation,
    budgetStats: display.budgetStats,
    budgetSummary: display.budgetSummary,
    calendar,
    calendarSettingsForm,
    calendarMonth: data.calendarMonth,
    calendarNextApproversByStage: approval.calendarNextApproversByStage,
    canApprove: access.canApprove,
    canApproveEventsCapability: permissions.canApproveEventsCapability,
    canCreateCalendar: access.canCreateCalendar,
    canCreateEventsCapability: permissions.canCreateEventsCapability,
    canEdit: access.canEdit,
    canManageCalendarLock: access.canManageCalendarLock,
    canSaveEventInModal: forms.canSaveEventInModal,
    canSubmitAmendmentInModal: forms.canSubmitAmendmentInModal,
    canSubmitCalendar: access.canSubmitCalendar,
    canViewEventsCapability: permissions.canViewEventsCapability,
    categoryFilterTabs: display.categoryFilterTabs,
    categoryDefinitions: display.categoryDefinitions,
    categoryLabels: display.categoryLabels,
    categoryOptions: display.categoryOptions,
    categoryOrder: display.categoryOrder,
    dateConflicts: display.dateConflicts,
    dateOverlapInfo: overlap.dateOverlapInfo,
    error: data.error,
    eventForm: forms.eventForm,
    events,
    eventTableColumns: display.eventTableColumns,
    fetchCalendar: data.fetchCalendar,
    fetchYears: data.fetchYears,
    filteredEvents: display.filteredEvents,
    eventTimelineSections: display.eventTimelineSections,
    formatDateRange,
    getDaysInMonth,
    getCategoryBadgeStyle: display.badgeStyleForCategory,
    getEventStatusVariant,
    getEventsForDate: getEventsForCurrentDate,
    getHolidaysForDate: getHolidaysForCurrentDate,
    handleAddEvent: forms.handleAddEvent,
    handleApprove: approval.handleApprove,
    handleDirectApprove: approval.handleDirectApprove,
    handleConfirmSubmitWithOverlap: lifecycle.handleConfirmSubmitWithOverlap,
    handleCreateCalendar: lifecycle.handleCreateCalendar,
    handleEditEvent: forms.handleEditEvent,
    handleEventClick: forms.handleEventClick,
    handleEventFormChange: forms.handleEventFormChange,
    handleEventRowClick: forms.handleEventRowClick,
    handleCalendarBudgetCapChange: settings.handleCalendarBudgetCapChange,
    handleCalendarSettingsFieldChange: settings.handleCalendarSettingsFieldChange,
    handleLockCalendar: lifecycle.handleLockCalendar,
    handleReject: approval.handleReject,
    handleSaveCalendarSettings: settings.handleSaveCalendarSettings,
    handleSaveEvent: eventActions.handleSaveEvent,
    handleSubmitAmendment: eventActions.handleSubmitAmendment,
    handleSubmitCalendar: lifecycle.handleSubmitCalendar,
    handleUnlockCalendar: lifecycle.handleUnlockCalendar,
    hasAttemptedCalendarLoad: data.hasAttemptedCalendarLoad,
    headerSubtitle: display.headerSubtitle,
    headerTitle: display.headerTitle,
    isAdminLevel: permissions.isAdminLevel,
    isBaseEventFormValid: forms.isBaseEventFormValid,
    isDateRangeOrdered: forms.isDateRangeOrdered,
    isGS: permissions.isGS,
    isGymkhanaRole: permissions.isGymkhanaRole,
    isPresident: permissions.isPresident,
    isSuperAdmin: permissions.isSuperAdmin,
    loading: data.loading,
    maxApprovalAmount: permissions.maxApprovalAmount,
    newAcademicYear: lifecycle.newAcademicYear,
    openAmendmentModal: forms.openAmendmentModal,
    openApprovalModal: approval.openApprovalModal,
    overlapCheckCompletedForCurrentDates: forms.overlapCheckCompletedForCurrentDates,
    overlapCheckInProgressForCurrentDates: forms.overlapCheckInProgressForCurrentDates,
    overlapCheckKey: forms.overlapCheckKey,
    pendingProposalReminders: display.pendingProposalReminders,
    requiresCalendarNextApprovalSelection: access.requiresCalendarNextApprovalSelection,
    resetDateOverlapInfo: overlap.resetDateOverlapInfo,
    retryDateOverlapCheck: forms.retryDateOverlapCheck,
    selectedCalendarEventIds: display.selectedCalendarEventIds,
    selectedEvent: forms.selectedEvent,
    selectedYear: data.selectedYear,
    setActiveCategoryFilter,
    setAmendmentReason: forms.setAmendmentReason,
    setApprovalComments: approval.setApprovalComments,
    setCalendarMonth: data.setCalendarMonth,
    setCalendarNextApproversByStage: approval.setCalendarNextApproversByStage,
    setCalendarNextApproverForStage: approval.setCalendarNextApproverForStage,
    setDateOverlapInfo: overlap.setDateOverlapInfo,
    setNewAcademicYear: lifecycle.setNewAcademicYear,
    setSubmitting,
    setSelectedEvent: forms.setSelectedEvent,
    setSelectedYear: data.setSelectedYear,
    setShowAddEventModal: forms.setShowAddEventModal,
    setShowApprovalModal: approval.setShowApprovalModal,
    setShowCreateCalendarModal: lifecycle.setShowCreateCalendarModal,
    setSubmitOverlapInfo: lifecycle.setSubmitOverlapInfo,
    setShowEventModal: forms.setShowEventModal,
    setShowHistoryModal: forms.setShowHistoryModal,
    setShowOverlapConfirmModal: lifecycle.setShowOverlapConfirmModal,
    setShowOverlapDetailsModal: forms.setShowOverlapDetailsModal,
    setShowSettingsModal,
    showAddEventModal: forms.showAddEventModal,
    showAmendmentModal: forms.showAmendmentModal,
    showApprovalModal: approval.showApprovalModal,
    showCreateCalendarModal: lifecycle.showCreateCalendarModal,
    showEventModal: forms.showEventModal,
    showHistoryModal: forms.showHistoryModal,
    showOverlapConfirmModal: lifecycle.showOverlapConfirmModal,
    showOverlapDetailsModal: forms.showOverlapDetailsModal,
    showSettingsModal,
    submitCalendarLabel: access.submitCalendarLabel,
    submitOverlapInfo: lifecycle.submitOverlapInfo,
    postStudentAffairsApproverOptionsByStage: approval.postStudentAffairsApproverOptionsByStage,
    submitting,
    viewMode: data.viewMode,
    years: data.years,
    setViewMode: data.setViewMode,
    closeAddEventModal: forms.closeAddEventModal,
    closeAmendmentModal: forms.closeAmendmentModal,
    closeEventModal: forms.closeEventModal,
  }
}

export default useGymkhanaCalendarPageState
