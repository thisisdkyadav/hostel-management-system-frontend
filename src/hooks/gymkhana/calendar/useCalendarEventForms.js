import { useMemo, useState } from "react"
import {
  createDefaultEventForm,
  toFormModel,
} from "@/components/gymkhana/events-page/shared"

export const useCalendarEventForms = ({
  toast,
  calendar,
  categoryDefinitions,
  canCreateEventsCapability,
  submitting,
  dateOverlapInfo,
  resetDateOverlapInfo,
  checkDateOverlap,
}) => {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventForm, setEventForm] = useState(() => createDefaultEventForm())
  const [amendmentReason, setAmendmentReason] = useState("")
  const [showEventModal, setShowEventModal] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [showAmendmentModal, setShowAmendmentModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showOverlapDetailsModal, setShowOverlapDetailsModal] = useState(false)

  const isDateRangeOrdered = useMemo(() => {
    if (!eventForm.startDate || !eventForm.endDate) return true
    return new Date(eventForm.endDate) >= new Date(eventForm.startDate)
  }, [eventForm.startDate, eventForm.endDate])

  const overlapCheckKey = useMemo(() => {
    if (!calendar?._id || !eventForm.startDate || !eventForm.endDate || !isDateRangeOrdered) {
      return null
    }
    return `${calendar._id}:${selectedEvent?._id || "new"}:${eventForm.startDate}:${eventForm.endDate}`
  }, [calendar?._id, eventForm.startDate, eventForm.endDate, isDateRangeOrdered, selectedEvent?._id])

  const overlapCheckCompletedForCurrentDates = Boolean(
    overlapCheckKey && dateOverlapInfo.status === "checked" && dateOverlapInfo.checkedKey === overlapCheckKey
  )

  const overlapCheckInProgressForCurrentDates = Boolean(
    overlapCheckKey && dateOverlapInfo.status === "pending" && dateOverlapInfo.checkingKey === overlapCheckKey
  )

  const isBaseEventFormValid = Boolean(
    eventForm.title?.trim() &&
      eventForm.category &&
      eventForm.startDate &&
      eventForm.endDate &&
      isDateRangeOrdered
  )

  const canSaveEventInModal = isBaseEventFormValid && overlapCheckCompletedForCurrentDates && !submitting
  const canSubmitAmendmentInModal = canSaveEventInModal && amendmentReason.length >= 10

  const retryDateOverlapCheck = () => {
    checkDateOverlap(eventForm, selectedEvent?._id)
  }

  const handleEventFormChange = (field, value) => {
    setEventForm((previous) => {
      const next = { ...previous, [field]: value }
      if (field === "startDate" || field === "endDate") {
        checkDateOverlap(next, selectedEvent?._id)
      }
      return next
    })
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleEditEvent = (event) => {
    setShowEventModal(false)
    setSelectedEvent(event)
    resetDateOverlapInfo()
    const formModel = toFormModel(event)
    setEventForm(formModel)
    setShowAddEventModal(true)
    if (formModel.startDate && formModel.endDate) {
      checkDateOverlap(formModel, event?._id)
    }
  }

  const openAmendmentModal = (event = null) => {
    setShowEventModal(false)
    setSelectedEvent(event)
    setAmendmentReason("")
    resetDateOverlapInfo()

    if (event) {
      const formModel = toFormModel(event)
      setEventForm(formModel)
      if (formModel.startDate && formModel.endDate) {
        checkDateOverlap(formModel, event?._id)
      }
    } else {
      setEventForm(createDefaultEventForm(categoryDefinitions))
    }

    setShowAmendmentModal(true)
  }

  const handleEventRowClick = (event) => {
    handleEventClick(event)
  }

  const handleAddEvent = () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to create events")
      return
    }

    setSelectedEvent(null)
    resetDateOverlapInfo()
    setEventForm(createDefaultEventForm(categoryDefinitions))
    setShowAddEventModal(true)
  }

  const closeEventModal = () => {
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  const closeAddEventModal = () => {
    setShowAddEventModal(false)
    setSelectedEvent(null)
    resetDateOverlapInfo()
  }

  const closeAmendmentModal = () => {
    setShowAmendmentModal(false)
    setSelectedEvent(null)
    resetDateOverlapInfo()
  }

  return {
    selectedEvent,
    setSelectedEvent,
    eventForm,
    amendmentReason,
    setAmendmentReason,
    showEventModal,
    setShowEventModal,
    showAddEventModal,
    setShowAddEventModal,
    showAmendmentModal,
    setShowAmendmentModal,
    showHistoryModal,
    setShowHistoryModal,
    showOverlapDetailsModal,
    setShowOverlapDetailsModal,
    isDateRangeOrdered,
    overlapCheckKey,
    overlapCheckCompletedForCurrentDates,
    overlapCheckInProgressForCurrentDates,
    isBaseEventFormValid,
    canSaveEventInModal,
    canSubmitAmendmentInModal,
    retryDateOverlapCheck,
    handleEventFormChange,
    handleEventClick,
    handleEditEvent,
    openAmendmentModal,
    handleEventRowClick,
    handleAddEvent,
    closeEventModal,
    closeAddEventModal,
    closeAmendmentModal,
  }
}

export default useCalendarEventForms
