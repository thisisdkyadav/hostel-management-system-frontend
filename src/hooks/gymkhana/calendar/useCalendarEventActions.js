import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import { formatINR } from "@/utils/formatters"
import {
  buildEventPayload,
  toCalendarEventPayload,
  validateCategoryBudgetCaps,
} from "@/components/gymkhana/events-page/shared"
import { queryKeys, useOptimisticMutation } from "@/lib/query"

export const useCalendarEventActions = ({
  toast,
  calendar,
  events,
  selectedYear,
  categoryDefinitions,
  canCreateEventsCapability,
  eventForm,
  selectedEvent,
  amendmentReason,
  overlapCheckCompletedForCurrentDates,
  fetchCalendar,
  setSubmitting,
  setShowAddEventModal,
  setShowAmendmentModal,
  setSelectedEvent,
  resetDateOverlapInfo,
}) => {
  // Optimistically swap the cached event list so the calendar reflects the
  // save instantly; the settle invalidation then reconciles with the server.
  const saveEventMutation = useOptimisticMutation({
    queryKey: queryKeys.gymkhana.calendar(selectedYear),
    mutationFn: async ({ updatedEvents }) => {
      await gymkhanaEventsApi.updateCalendar(calendar._id, {
        events: updatedEvents.map(toCalendarEventPayload),
      })
    },
    updateFn: (previous, { updatedEvents }) =>
      previous && Array.isArray(previous.events)
        ? { ...previous, events: updatedEvents }
        : undefined,
    onError: (err) => {
      toast.error(err.message || "Failed to save event")
    },
    onSettled: () => setSubmitting(false),
  })

  const handleSaveEvent = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to update events")
      return
    }

    const payload = buildEventPayload(eventForm)

    if (!payload.title || !payload.startDate || !payload.endDate || !payload.category) {
      toast.error("Title, category, start date and end date are required")
      return
    }

    if (new Date(payload.endDate) < new Date(payload.startDate)) {
      toast.error("End date cannot be before start date")
      return
    }

    if (!overlapCheckCompletedForCurrentDates) {
      toast.error("Please wait for date overlap check result before saving the event")
      return
    }

    let updatedEvents = []
    if (selectedEvent && events.find((event) => event._id === selectedEvent._id)) {
      updatedEvents = events.map((event) =>
        event._id === selectedEvent._id ? { ...event, ...payload } : event
      )
    } else {
      updatedEvents = [...events, { ...payload, _id: `temp-${Date.now()}` }]
    }

    const budgetCapValidation = validateCategoryBudgetCaps(
      updatedEvents,
      calendar?.budgetCaps || {},
      categoryDefinitions
    )
    if (!budgetCapValidation.isValid) {
      toast.error(
        `${budgetCapValidation.label} category budget would become ${formatINR(budgetCapValidation.total)} which exceeds the configured cap of ${formatINR(budgetCapValidation.cap)}. Reduce the budget or ask Admin to increase the limit.`
      )
      return
    }

    try {
      setSubmitting(true)
      await saveEventMutation.mutateAsync({ updatedEvents })
      toast.success("Event saved successfully")
      setShowAddEventModal(false)
      setSelectedEvent(null)
      resetDateOverlapInfo()
      await fetchCalendar()
    } catch {
      // error already surfaced by the mutation's onError
    }
  }

  const handleSubmitAmendment = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit amendments")
      return
    }

    const payload = buildEventPayload(eventForm)

    if (!payload.title || !payload.startDate || !payload.endDate || !payload.category) {
      toast.error("Title, category, start date and end date are required")
      return
    }

    if (new Date(payload.endDate) < new Date(payload.startDate)) {
      toast.error("End date cannot be before start date")
      return
    }

    if (!overlapCheckCompletedForCurrentDates) {
      toast.error("Please wait for date overlap check result before submitting")
      return
    }

    if (!amendmentReason || amendmentReason.length < 10) {
      toast.error("Please provide a detailed reason (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.createAmendment({
        calendarId: calendar._id,
        type: selectedEvent ? "edit" : "new_event",
        eventId: selectedEvent?._id,
        proposedChanges: payload,
        reason: amendmentReason,
      })
      toast.success("Amendment request submitted")
      setShowAmendmentModal(false)
      setSelectedEvent(null)
      resetDateOverlapInfo()
    } catch (err) {
      toast.error(err.message || "Failed to submit amendment")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    handleSaveEvent,
    handleSubmitAmendment,
  }
}

export default useCalendarEventActions
