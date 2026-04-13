import { useEffect, useMemo, useRef, useState } from "react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import authzApi from "@/service/modules/authz.api"
import {
  CALENDAR_STATUS_TO_APPROVER,
  buildAvailableYearsForCreation,
  buildBudgetCapsPayload,
  buildNextApproversPayload,
  createDefaultOverlapState,
  createDefaultEventForm,
  createEmptyNextApproverSelection,
  createEmptyBudgetCaps,
  formatDateKey,
  formatDateRange,
  getCalendarCategoryDefinitions,
  getBudgetSummary,
  getCategoryBadgeStyle,
  getCategoryColor,
  getCategoryLabelsMap,
  getCategoryOptions,
  getCategoryOrder,
  getDateConflicts,
  getDaysInMonth,
  getEventStatusVariant,
  getEventsForDate,
  getHolidaysForDate,
  isProposalWindowOpen,
  mergeCalendarEventsWithGymkhanaEvents,
  getNextApproverSelectionCount,
  normalizeEvent,
  normalizeEventId,
  toBudgetCapsForm,
  toFormModel,
  toGymkhanaDisplayEvent,
  buildEventPayload,
  toCalendarEventPayload,
  validateCategoryBudgetCaps,
  POST_STUDENT_AFFAIRS_STAGE_OPTIONS,
} from "@/components/gymkhana/events-page/shared"
import { CalendarDays, FileText } from "lucide-react"
import { Badge } from "@/components/ui/data-display"

export const useGymkhanaCalendarPageState = ({ user, toast }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [events, setEvents] = useState([])
  const [hasAttemptedCalendarLoad, setHasAttemptedCalendarLoad] = useState(false)
  const [viewMode, setViewMode] = useState("list")
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all")
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [calendarHolidays, setCalendarHolidays] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [showAmendmentModal, setShowAmendmentModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showOverlapConfirmModal, setShowOverlapConfirmModal] = useState(false)
  const [showOverlapDetailsModal, setShowOverlapDetailsModal] = useState(false)
  const [showCreateCalendarModal, setShowCreateCalendarModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [calendarSettingsForm, setCalendarSettingsForm] = useState(() => ({
    allowProposalBeforeApproval: false,
    categoryDefinitions: getCalendarCategoryDefinitions(),
    budgetCaps: createEmptyBudgetCaps(getCalendarCategoryDefinitions()),
  }))
  const [eventForm, setEventForm] = useState(() => createDefaultEventForm())
  const [amendmentReason, setAmendmentReason] = useState("")
  const [newAcademicYear, setNewAcademicYear] = useState("")
  const [approvalComments, setApprovalComments] = useState("")
  const [calendarNextApproversByStage, setCalendarNextApproversByStage] = useState(createEmptyNextApproverSelection)
  const [postStudentAffairsApproverOptionsByStage, setPostStudentAffairsApproverOptionsByStage] = useState(() =>
    POST_STUDENT_AFFAIRS_STAGE_OPTIONS.reduce((options, stage) => {
      options[stage] = []
      return options
    }, {})
  )
  const [submitting, setSubmitting] = useState(false)
  const [dateOverlapInfo, setDateOverlapInfo] = useState(createDefaultOverlapState)
  const [submitOverlapInfo, setSubmitOverlapInfo] = useState(null)

  const overlapCheckRequestRef = useRef(0)
  const calendarRequestRef = useRef(0)

  const refreshPostStudentAffairsApproverOptions = async () => {
    try {
      const response = await authzApi.getUsersByRole("Admin", { limit: 100 })
      const responseBody = response.data || response || {}
      const usersPayload = responseBody.data || {}
      const adminUsers = usersPayload.data || responseBody.users || []

      const nextOptions = POST_STUDENT_AFFAIRS_STAGE_OPTIONS.reduce((options, stage) => {
        options[stage] = adminUsers
          .filter((adminUser) => adminUser?.subRole === stage)
          .map((adminUser) => ({
            value: adminUser._id,
            label: adminUser.email
              ? `${adminUser.name} (${adminUser.email})`
              : adminUser.name || stage,
          }))
        return options
      }, {})

      setPostStudentAffairsApproverOptionsByStage(nextOptions)
    } catch {
      setPostStudentAffairsApproverOptionsByStage(
        POST_STUDENT_AFFAIRS_STAGE_OPTIONS.reduce((options, stage) => {
          options[stage] = []
          return options
        }, {})
      )
    }
  }

  const isGymkhanaRole = user?.role === "Gymkhana"
  const isAdminLevel = user?.role === "Admin" || user?.role === "Super Admin"
  const isSuperAdmin = user?.role === "Super Admin"
  const isGS = user?.subRole === "GS Gymkhana"
  const isPresident = user?.subRole === "President Gymkhana"
  const canViewEventsCapability = true
  const canCreateEventsCapability = true
  const canApproveEventsCapability = true
  const maxApprovalAmount = null
  const submittableCalendarStatuses = [
    "draft",
    "rejected",
    "pending_president",
    "pending_student_affairs",
    "pending_joint_registrar",
    "pending_associate_dean",
    "pending_dean",
    "approved",
  ]

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
      submittableCalendarStatuses.includes(calendar.status) &&
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

  const categoryDefinitions = useMemo(() => getCalendarCategoryDefinitions(calendar), [calendar])
  const categoryOptions = useMemo(() => getCategoryOptions(categoryDefinitions), [categoryDefinitions])
  const categoryLabels = useMemo(() => getCategoryLabelsMap(categoryDefinitions), [categoryDefinitions])
  const categoryOrder = useMemo(() => getCategoryOrder(categoryDefinitions), [categoryDefinitions])

  function buildCalendarSettingsForm(calendarData = null) {
    const nextCategoryDefinitions = getCalendarCategoryDefinitions(calendarData)
    return {
      allowProposalBeforeApproval: Boolean(calendarData?.allowProposalBeforeApproval),
      categoryDefinitions: nextCategoryDefinitions,
      budgetCaps: toBudgetCapsForm(calendarData?.budgetCaps, nextCategoryDefinitions),
    }
  }

  useEffect(() => {
    if (!showSettingsModal) return
    setCalendarSettingsForm(buildCalendarSettingsForm(calendar))
  }, [calendar, showSettingsModal])

  useEffect(() => {
    if (!canApproveEventsCapability || !isAdminLevel) return
    refreshPostStudentAffairsApproverOptions()
  }, [canApproveEventsCapability, isAdminLevel])

  const budgetSummary = useMemo(
    () => getBudgetSummary(events, categoryDefinitions),
    [events, categoryDefinitions]
  )
  const categoryFilterTabs = useMemo(
    () => [
      { label: "All", value: "all", count: events.length },
      ...categoryOptions.map((category) => ({
        label: category.label,
        value: category.value,
        count: budgetSummary.counts[category.value] || 0,
      })),
    ],
    [categoryOptions, events.length, budgetSummary.counts]
  )
  const filteredEvents = useMemo(() => {
    if (activeCategoryFilter === "all") return events
    return events.filter((event) => event.category === activeCategoryFilter)
  }, [events, activeCategoryFilter])
  const eventTableColumns = useMemo(
    () => [
      {
        key: "title",
        header: "Event",
        render: (event) => (
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>{event.title}</span>
        ),
      },
      {
        key: "category",
        header: "Category",
        render: (event) => (
          <Badge style={getCategoryBadgeStyle(event.category)}>
            {categoryLabels[event.category] || event.category}
          </Badge>
        ),
      },
      {
        key: "dateRange",
        header: "Date Range",
        render: (event) => formatDateRange(event.startDate, event.endDate),
      },
      {
        key: "estimatedBudget",
        header: "Budget",
        render: (event) => `₹${Number(event.estimatedBudget || 0).toLocaleString()}`,
      },
    ],
    [categoryLabels]
  )
  const holidaysByDate = useMemo(() => {
    const map = new Map()
    for (const holiday of calendarHolidays || []) {
      const dateKey = formatDateKey(holiday?.date)
      if (!dateKey) continue
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey).push({
        title: holiday?.title || "Holiday",
        date: dateKey,
      })
    }
    return map
  }, [calendarHolidays])
  const getBudgetStatSubtitle = (category) => {
    const cap = calendar?.budgetCaps?.[category]
    const capLabel = cap === null || cap === undefined ? "No cap" : `Cap ₹${Number(cap).toLocaleString()}`
    return `${budgetSummary.counts[category] || 0} event(s) · ${capLabel}`
  }

  const budgetStats = useMemo(
    () => [
      ...categoryDefinitions.map((definition) => ({
        title: `${definition.label} Budget`,
        value: `₹${(budgetSummary.byCategory[definition.key] || 0).toLocaleString()}`,
        subtitle: getBudgetStatSubtitle(definition.key),
        icon: <CalendarDays size={16} />,
        color: getCategoryColor(definition.key),
        tintBackground: true,
      })),
      {
        title: "Total Budget",
        value: `₹${budgetSummary.total.toLocaleString()}`,
        subtitle: `${events.length} event(s)`,
        icon: <FileText size={16} />,
        color: "var(--color-primary)",
      },
    ],
    [budgetSummary, categoryDefinitions, events.length, calendar?.budgetCaps]
  )
  const dateConflicts = useMemo(() => getDateConflicts(events), [events])
  const pendingProposalReminders = useMemo(
    () =>
      events.filter(
        (event) =>
          event.gymkhanaEventId &&
          event.proposalCreationAllowed !== false &&
          isProposalWindowOpen(event)
      ),
    [events]
  )
  const selectedCalendarEventIds = useMemo(() => {
    const ids = new Set()
    for (const event of events) {
      const linkedEventId = normalizeEventId(event.gymkhanaEventId) || normalizeEventId(event._id)
      if (linkedEventId) ids.add(linkedEventId)
    }
    return ids
  }, [events])
  const availableYearsForCreation = useMemo(() => buildAvailableYearsForCreation(years), [years])

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
  const calendarStatusLabel = calendar?.status ? calendar.status.replace(/_/g, " ") : ""
  const headerTitle = calendar?.academicYear
    ? `Activity Calendar ${calendar.academicYear}`
    : selectedYear
      ? `Activity Calendar ${selectedYear}`
      : "Events Calendar"
  const headerSubtitle = loading
    ? "Loading selected academic year..."
    : calendarStatusLabel
      ? `Status: ${calendarStatusLabel}`
      : selectedYear
        ? `No active calendar for ${selectedYear}`
        : "No active calendar"

  const fetchYears = async () => {
    if (!canViewEventsCapability) {
      setYears([])
      setSelectedYear(null)
      setCalendar(null)
      setEvents([])
      setCalendarSettingsForm(buildCalendarSettingsForm())
      setHasAttemptedCalendarLoad(true)
      setLoading(false)
      return
    }

    try {
      setHasAttemptedCalendarLoad(false)
      const response = await gymkhanaEventsApi.getAcademicYears()
      const yearsList = response.data?.years || response.years || []

      setYears(yearsList)
      setSelectedYear((previousYear) => {
        if (previousYear && yearsList.some((year) => year.academicYear === previousYear)) {
          return previousYear
        }
        return yearsList[0]?.academicYear || null
      })

      if (yearsList.length === 0) {
        setCalendar(null)
        setEvents([])
        setCalendarSettingsForm(buildCalendarSettingsForm())
        setHasAttemptedCalendarLoad(true)
      }
    } catch (err) {
      setError(err.message || "Failed to load academic years")
      setHasAttemptedCalendarLoad(true)
    }
  }

  const fetchCalendar = async (year, { resetData = false, showLoader = resetData } = {}) => {
    if (!canViewEventsCapability) {
      setCalendar(null)
      setEvents([])
      setCalendarHolidays([])
      setCalendarSettingsForm(buildCalendarSettingsForm())
      setHasAttemptedCalendarLoad(true)
      return
    }

    const requestId = ++calendarRequestRef.current
    try {
      if (showLoader) {
        setLoading(true)
      }
      setError(null)
      setHasAttemptedCalendarLoad(false)
      if (resetData) {
        setCalendar(null)
        setEvents([])
        setCalendarHolidays([])
      }
      const response = await gymkhanaEventsApi.getCalendarByYear(year)
      if (requestId !== calendarRequestRef.current) return
      const calendarData = response.data?.calendar || response.calendar || null

      if (!calendarData) {
        setCalendar(null)
        setEvents([])
        setCalendarSettingsForm(buildCalendarSettingsForm())
        setHasAttemptedCalendarLoad(true)
        return
      }

      const normalizedEvents = (calendarData.events || []).map(normalizeEvent)
      const isProposalCreationAllowedForCalendar =
        calendarData.status === "approved" || Boolean(calendarData.allowProposalBeforeApproval)
      setCalendarSettingsForm(buildCalendarSettingsForm(calendarData))
      let mergedEvents = normalizedEvents

      try {
        const firstPageResponse = await gymkhanaEventsApi.getEvents({
          calendarId: calendarData._id,
          limit: 100,
          page: 1,
        })
        if (requestId !== calendarRequestRef.current) return
        const firstPageData = firstPageResponse.data || firstPageResponse || {}
        const firstPageEvents = firstPageData.events || []
        const totalPages = firstPageData.pagination?.pages || 1

        let gymkhanaEvents = [...firstPageEvents]
        if (totalPages > 1) {
          const remainingPageRequests = []
          for (let page = 2; page <= totalPages; page += 1) {
            remainingPageRequests.push(
              gymkhanaEventsApi.getEvents({
                calendarId: calendarData._id,
                limit: 100,
                page,
              })
            )
          }

          const remainingResponses = await Promise.all(remainingPageRequests)
          if (requestId !== calendarRequestRef.current) return
          for (const remainingResponse of remainingResponses) {
            const responseData = remainingResponse.data || remainingResponse || {}
            gymkhanaEvents = gymkhanaEvents.concat(responseData.events || [])
          }
        }

        if (calendarData.status === "approved" && gymkhanaEvents.length > 0) {
          mergedEvents = gymkhanaEvents.map(toGymkhanaDisplayEvent)
        } else {
          mergedEvents = mergeCalendarEventsWithGymkhanaEvents(normalizedEvents, gymkhanaEvents)
        }
      } catch {
        mergedEvents = normalizedEvents
      }

      mergedEvents = mergedEvents.map((event) => ({
        ...event,
        proposalCreationAllowed: isProposalCreationAllowedForCalendar,
      }))

      setCalendar({ ...calendarData, events: mergedEvents })
      setEvents(mergedEvents)
      setHasAttemptedCalendarLoad(true)
    } catch (err) {
      if (requestId !== calendarRequestRef.current) return
      if (err.status === 404) {
        setCalendar(null)
        setEvents([])
        setCalendarSettingsForm(buildCalendarSettingsForm())
        setHasAttemptedCalendarLoad(true)
      } else {
        setError(err.message || "Failed to load calendar")
      }
    } finally {
      if (showLoader && requestId === calendarRequestRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchYears()
  }, [user?.role, user?.subRole])

  useEffect(() => {
    if (selectedYear) {
      fetchCalendar(selectedYear, { resetData: true })
    }
  }, [selectedYear])

  useEffect(() => {
    if (!calendar?._id || viewMode !== "calendar") {
      setCalendarHolidays([])
      return
    }

    const loadCalendarMonthView = async () => {
      try {
        const monthStart = new Date(
          calendarMonth.getFullYear(),
          calendarMonth.getMonth(),
          1
        )
        const monthEnd = new Date(
          calendarMonth.getFullYear(),
          calendarMonth.getMonth() + 1,
          0
        )

        const response = await gymkhanaEventsApi.getCalendarView({
          startDate: formatDateKey(monthStart),
          endDate: formatDateKey(monthEnd),
        })
        const data = response.data || response || {}
        setCalendarHolidays(Array.isArray(data.holidays) ? data.holidays : [])
      } catch {
        setCalendarHolidays([])
      }
    }

    loadCalendarMonthView()
  }, [calendar?._id, calendarMonth, viewMode])

  const setCalendarNextApproverForStage = (stage, userId) => {
    setCalendarNextApproversByStage((current) => ({
      ...current,
      [stage]: userId,
    }))
  }

  const getEventsForCurrentDate = (date) => getEventsForDate(date, filteredEvents)
  const getHolidaysForCurrentDate = (date) => getHolidaysForDate(date, holidaysByDate)

  const resetDateOverlapInfo = () => {
    overlapCheckRequestRef.current += 1
    setDateOverlapInfo(createDefaultOverlapState())
  }

  const checkDateOverlap = async (candidateForm, eventId = null) => {
    if (!calendar?._id || !candidateForm.startDate || !candidateForm.endDate) {
      resetDateOverlapInfo()
      return
    }

    if (new Date(candidateForm.endDate) < new Date(candidateForm.startDate)) {
      resetDateOverlapInfo()
      return
    }

    const normalizedEventId = normalizeEventId(eventId)
    const checkKey = `${calendar._id}:${normalizedEventId || "new"}:${candidateForm.startDate}:${candidateForm.endDate}`
    const requestId = overlapCheckRequestRef.current + 1
    overlapCheckRequestRef.current = requestId

    setDateOverlapInfo((previous) => ({
      ...previous,
      status: "pending",
      checkingKey: checkKey,
      errorMessage: "",
    }))

    try {
      const overlapRequestPayload = {
        startDate: candidateForm.startDate,
        endDate: candidateForm.endDate,
        ...(normalizedEventId ? { eventId: normalizedEventId } : {}),
      }
      const response = await gymkhanaEventsApi.checkDateOverlap(calendar._id, overlapRequestPayload)
      if (requestId !== overlapCheckRequestRef.current) return
      const data = response.data || response || {}
      setDateOverlapInfo({
        status: "checked",
        hasOverlap: Boolean(data.hasOverlap),
        overlaps: data.overlaps || [],
        checkedKey: checkKey,
        checkingKey: null,
        errorMessage: "",
      })
    } catch {
      if (requestId !== overlapCheckRequestRef.current) return
      setDateOverlapInfo({
        status: "error",
        hasOverlap: false,
        overlaps: [],
        checkedKey: null,
        checkingKey: null,
        errorMessage: "Could not verify date overlap. Please retry.",
      })
    }
  }

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

    try {
      setSubmitting(true)

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
          `${budgetCapValidation.label} category budget would become ₹${budgetCapValidation.total.toLocaleString()} which exceeds the configured cap of ₹${budgetCapValidation.cap.toLocaleString()}. Reduce the budget or ask Admin to increase the limit.`
        )
        return
      }

      await gymkhanaEventsApi.updateCalendar(calendar._id, {
        events: updatedEvents.map(toCalendarEventPayload),
      })
      toast.success("Event saved successfully")
      setShowAddEventModal(false)
      setSelectedEvent(null)
      resetDateOverlapInfo()
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to save event")
    } finally {
      setSubmitting(false)
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

  const handleSubmitCalendar = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit calendar")
      return
    }

    try {
      setSubmitting(true)
      const response = await gymkhanaEventsApi.submitCalendar(calendar._id, false)
      const data = response.data || response || {}

      if (data.requiresOverlapConfirmation) {
        setSubmitOverlapInfo(data)
        setShowOverlapConfirmModal(true)
        setSubmitting(false)
        return
      }

      toast.success("Calendar submitted for approval")
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to submit calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmSubmitWithOverlap = async () => {
    if (!canCreateEventsCapability) {
      toast.error("You do not have permission to submit calendar")
      return
    }

    if (!calendar?._id) return

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.submitCalendar(calendar._id, true)
      toast.success("Calendar submitted with overlap warning")
      setShowOverlapConfirmModal(false)
      setSubmitOverlapInfo(null)
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to submit calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!canApprove) {
      toast.error("You do not have permission to approve calendar")
      return
    }

    const nextApprovers = buildNextApproversPayload(calendarNextApproversByStage)

    if (requiresCalendarNextApprovalSelection && getNextApproverSelectionCount(calendarNextApproversByStage) === 0) {
      toast.error("Select at least one next approver")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.approveCalendar(
        calendar._id,
        approvalComments,
        [],
        requiresCalendarNextApprovalSelection ? nextApprovers : []
      )
      toast.success("Calendar approved successfully")
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

    if (!approvalComments || approvalComments.length < 10) {
      toast.error("Please provide a rejection reason (min 10 characters)")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.rejectCalendar(calendar._id, approvalComments)
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

  const handleCreateCalendar = async () => {
    if (!canCreateCalendar) {
      toast.error("You do not have permission to create calendar")
      return
    }

    if (!newAcademicYear) {
      toast.error("Please select an academic year")
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.createCalendar({ academicYear: newAcademicYear })
      toast.success("Calendar created successfully")
      setShowCreateCalendarModal(false)
      setNewAcademicYear("")
      await fetchYears()
      setSelectedYear(newAcademicYear)
    } catch (err) {
      toast.error(err.message || "Failed to create calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLockCalendar = async () => {
    if (!canManageCalendarLock) {
      toast.error("You do not have permission to manage calendar lock")
      return
    }

    if (!calendar?._id) return
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.lockCalendar(calendar._id)
      toast.success("Calendar locked")
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to lock calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnlockCalendar = async () => {
    if (!canManageCalendarLock) {
      toast.error("You do not have permission to manage calendar lock")
      return
    }

    if (!calendar?._id) return
    try {
      setSubmitting(true)
      await gymkhanaEventsApi.unlockCalendar(calendar._id)
      toast.success("Calendar unlocked")
      await fetchCalendar(selectedYear)
    } catch (err) {
      toast.error(err.message || "Failed to unlock calendar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCalendarSettingsFieldChange = (field, value) => {
    setCalendarSettingsForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCalendarBudgetCapChange = (category, value) => {
    setCalendarSettingsForm((current) => ({
      ...current,
      budgetCaps: {
        ...current.budgetCaps,
        [category]: value,
      },
    }))
  }

  const handleSaveCalendarSettings = async () => {
    if (!canManageCalendarLock) {
      toast.error("You do not have permission to manage calendar settings")
      return
    }

    if (!calendar?._id) return

    const nextBudgetCaps = buildBudgetCapsPayload(
      calendarSettingsForm.budgetCaps,
      calendarSettingsForm.categoryDefinitions
    )
    const budgetCapValidation = validateCategoryBudgetCaps(
      events,
      nextBudgetCaps,
      calendarSettingsForm.categoryDefinitions
    )
    if (!budgetCapValidation.isValid) {
      toast.error(
        `Cannot set the ${budgetCapValidation.label} cap below the current allocated budget of ₹${budgetCapValidation.total.toLocaleString()}. Increase the cap or reduce events in that category first.`
      )
      return
    }

    try {
      setSubmitting(true)
      await gymkhanaEventsApi.updateCalendarSettings(calendar._id, {
        allowProposalBeforeApproval: Boolean(calendarSettingsForm.allowProposalBeforeApproval),
        budgetCaps: nextBudgetCaps,
      })
      toast.success("Calendar settings updated")
      setShowSettingsModal(false)
      await fetchCalendar(selectedYear)
      await fetchYears()
    } catch (err) {
      toast.error(err.message || "Failed to update calendar settings")
    } finally {
      setSubmitting(false)
    }
  }

  const openApprovalModal = () => {
    setApprovalComments("")
    setCalendarNextApproversByStage(createEmptyNextApproverSelection())
    setShowApprovalModal(true)
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
    activeCategoryFilter,
    amendmentReason,
    approvalComments,
    availableYearsForCreation,
    budgetStats,
    budgetSummary,
    calendar,
    calendarSettingsForm,
    calendarMonth,
    calendarNextApproversByStage,
    canApprove,
    canApproveEventsCapability,
    canCreateCalendar,
    canCreateEventsCapability,
    canEdit,
    canManageCalendarLock,
    canSaveEventInModal,
    canSubmitAmendmentInModal,
    canSubmitCalendar,
    canViewEventsCapability,
    categoryFilterTabs,
    categoryDefinitions,
    categoryLabels,
    categoryOptions,
    categoryOrder,
    dateConflicts,
    dateOverlapInfo,
    error,
    eventForm,
    events,
    eventTableColumns,
    fetchCalendar,
    fetchYears,
    filteredEvents,
    formatDateRange,
    getDaysInMonth,
    getCategoryBadgeStyle,
    getEventStatusVariant,
    getEventsForDate: getEventsForCurrentDate,
    getHolidaysForDate: getHolidaysForCurrentDate,
    handleAddEvent,
    handleApprove,
    handleConfirmSubmitWithOverlap,
    handleCreateCalendar,
    handleEditEvent,
    handleEventClick,
    handleEventFormChange,
    handleEventRowClick,
    handleCalendarBudgetCapChange,
    handleCalendarSettingsFieldChange,
    handleLockCalendar,
    handleReject,
    handleSaveCalendarSettings,
    handleSaveEvent,
    handleSubmitAmendment,
    handleSubmitCalendar,
    handleUnlockCalendar,
    hasAttemptedCalendarLoad,
    headerSubtitle,
    headerTitle,
    isAdminLevel,
    isBaseEventFormValid,
    isDateRangeOrdered,
    isGS,
    isGymkhanaRole,
    isPresident,
    isSuperAdmin,
    loading,
    maxApprovalAmount,
    newAcademicYear,
    openAmendmentModal,
    openApprovalModal,
    overlapCheckCompletedForCurrentDates,
    overlapCheckInProgressForCurrentDates,
    overlapCheckKey,
    pendingProposalReminders,
    requiresCalendarNextApprovalSelection,
    resetDateOverlapInfo,
    retryDateOverlapCheck,
    selectedCalendarEventIds,
    selectedEvent,
    selectedYear,
    setActiveCategoryFilter,
    setAmendmentReason,
    setApprovalComments,
    setCalendarMonth,
    setCalendarNextApproversByStage,
    setCalendarNextApproverForStage,
    setDateOverlapInfo,
    setNewAcademicYear,
    setSubmitting,
    setSelectedEvent,
    setSelectedYear,
    setShowAddEventModal,
    setShowApprovalModal,
    setShowCreateCalendarModal,
    setSubmitOverlapInfo,
    setShowEventModal,
    setShowHistoryModal,
    setShowOverlapConfirmModal,
    setShowOverlapDetailsModal,
    setShowSettingsModal,
    showAddEventModal,
    showAmendmentModal,
    showApprovalModal,
    showCreateCalendarModal,
    showEventModal,
    showHistoryModal,
    showOverlapConfirmModal,
    showOverlapDetailsModal,
    showSettingsModal,
    submitCalendarLabel,
    submitOverlapInfo,
    postStudentAffairsApproverOptionsByStage,
    submitting,
    viewMode,
    years,
    setViewMode,
    closeAddEventModal,
    closeAmendmentModal,
    closeEventModal,
  }
}
