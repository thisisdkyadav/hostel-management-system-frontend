import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import {
  formatDateKey,
  getCalendarCategoryDefinitions,
  normalizeEvent,
  toBudgetCapsForm,
  toGymkhanaDisplayEvent,
} from "@/components/gymkhana/events-page/shared"
import { queryKeys } from "@/lib/query/queryKeys"

export const buildCalendarSettingsForm = (calendarData = null) => {
  const nextCategoryDefinitions = getCalendarCategoryDefinitions(calendarData)
  return {
    allowProposalBeforeApproval: Boolean(calendarData?.allowProposalBeforeApproval),
    overallBudget:
      calendarData?.overallBudget === null ||
      calendarData?.overallBudget === undefined ||
      calendarData?.overallBudget === ""
        ? ""
        : String(calendarData.overallBudget),
    categoryDefinitions: nextCategoryDefinitions,
    budgetCaps: toBudgetCapsForm(calendarData?.budgetCaps, nextCategoryDefinitions),
  }
}

const extractResponseData = (response) => response?.data || response || {}

const fetchYearsList = async () => {
  const response = await gymkhanaEventsApi.getAcademicYears()
  return response.data?.years || response.years || []
}

const fetchCalendarBundle = async (year) => {
  const response = await gymkhanaEventsApi.getCalendarByYear(year)
  const calendarData = response.data?.calendar || response.calendar || null
  if (!calendarData) return null

  const normalizedEvents = (calendarData.events || []).map(normalizeEvent)

  // GymkhanaEvent collection is the single source of truth for calendar events;
  // fall back to the embedded events when the collection isn't reachable.
  let mergedEvents = normalizedEvents
  try {
    const firstPageResponse = await gymkhanaEventsApi.getEvents({
      calendarId: calendarData._id,
      limit: 100,
      page: 1,
    })
    const firstPageData = extractResponseData(firstPageResponse)
    const totalPages = firstPageData.pagination?.pages || 1

    let gymkhanaEvents = [...(firstPageData.events || [])]
    if (totalPages > 1) {
      const remainingResponses = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          gymkhanaEventsApi.getEvents({
            calendarId: calendarData._id,
            limit: 100,
            page: index + 2,
          })
        )
      )
      for (const remainingResponse of remainingResponses) {
        gymkhanaEvents = gymkhanaEvents.concat(extractResponseData(remainingResponse).events || [])
      }
    }
    mergedEvents = gymkhanaEvents.map(toGymkhanaDisplayEvent)
  } catch {
    mergedEvents = normalizedEvents
  }

  return { calendarData, events: mergedEvents }
}

export const useCalendarData = ({ user, canViewEventsCapability }) => {
  const queryClient = useQueryClient()
  // Explicit user pick; null means "follow the newest known year".
  const [yearPick, setYearPick] = useState(null)
  const [viewMode, setViewMode] = useState("list")
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [calendarSettingsForm, setCalendarSettingsForm] = useState(() =>
    buildCalendarSettingsForm()
  )
  const [settingsSource, setSettingsSource] = useState(undefined)

  const userKey = `${user?.role}|${user?.subRole}`

  const yearsQuery = useQuery({
    queryKey: [...queryKeys.gymkhana.years(), userKey],
    queryFn: fetchYearsList,
    enabled: canViewEventsCapability,
  })

  const years = useMemo(
    () => (canViewEventsCapability ? yearsQuery.data || [] : []),
    [canViewEventsCapability, yearsQuery.data]
  )

  // Derived selection: keep the explicit pick while it still exists,
  // otherwise fall back to the newest known year (old loader behaviour).
  const selectedYear =
    yearPick !== null && years.some((year) => year.academicYear === yearPick)
      ? yearPick
      : years[0]?.academicYear || null

  const calendarQuery = useQuery({
    queryKey: queryKeys.gymkhana.calendar(selectedYear),
    queryFn: () => fetchCalendarBundle(selectedYear),
    enabled: Boolean(canViewEventsCapability && selectedYear),
  })

  const calendarBundle = calendarQuery.data ?? null

  const calendar = useMemo(() => {
    if (!calendarBundle) return null
    const isProposalCreationAllowedForCalendar =
      calendarBundle.calendarData.status === "approved" ||
      Boolean(calendarBundle.calendarData.allowProposalBeforeApproval)
    return {
      ...calendarBundle.calendarData,
      events: calendarBundle.events.map((event) => ({
        ...event,
        proposalCreationAllowed: isProposalCreationAllowedForCalendar,
      })),
    }
  }, [calendarBundle])

  const events = useMemo(() => calendar?.events || [], [calendar])

  // Mirror the loaded calendar into the settings form, resetting when there is
  // no calendar. Adjusted during render (not in an effect) so the form can
  // never render from a stale source bundle.
  if (settingsSource !== calendarBundle) {
    setSettingsSource(calendarBundle)
    setCalendarSettingsForm(
      calendarBundle
        ? buildCalendarSettingsForm(calendarBundle.calendarData)
        : buildCalendarSettingsForm()
    )
  }

  // Invalidate the whole domain — post-mutation callers used fetchYears +
  // fetchCalendar back-to-back, which is exactly what this expresses.
  const refetchDomain = (options = {}) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.gymkhana.all, ...options })

  // Month-view holidays are only relevant in calendar mode.
  const monthRange = useMemo(() => {
    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
    return {
      key: [formatDateKey(monthStart), formatDateKey(monthEnd)],
      range: { startDate: formatDateKey(monthStart), endDate: formatDateKey(monthEnd) },
    }
  }, [calendarMonth])

  const holidaysQuery = useQuery({
    queryKey: queryKeys.gymkhana.monthView(...monthRange.key),
    queryFn: async () => {
      const response = await gymkhanaEventsApi.getCalendarView(monthRange.range)
      const data = extractResponseData(response)
      return Array.isArray(data.holidays) ? data.holidays : []
    },
    enabled: Boolean(calendar?._id && viewMode === "calendar"),
  })
  const calendarHolidays = viewMode === "calendar" ? holidaysQuery.data || [] : []

  const yearsSettled = yearsQuery.isSuccess || yearsQuery.isError
  const calendarSettled = calendarQuery.isSuccess || calendarQuery.isError
  const loading = canViewEventsCapability && calendarQuery.fetchStatus === "fetching"
  const hasAttemptedCalendarLoad =
    !canViewEventsCapability ||
    (yearsSettled && (!selectedYear || calendarSettled))

  const calendarLoadFailed =
    calendarQuery.error instanceof Object &&
    calendarQuery.error.status !== 404 &&
    typeof calendarQuery.error.message === "string"

  const error = canViewEventsCapability
    ? yearsQuery.error?.message ||
      (calendarLoadFailed ? calendarQuery.error.message : null)
    : null

  return {
    loading,
    setLoading: () => {},
    error,
    years,
    selectedYear,
    setSelectedYear: setYearPick,
    calendar,
    events,
    hasAttemptedCalendarLoad,
    calendarHolidays,
    viewMode,
    setViewMode,
    calendarMonth,
    setCalendarMonth,
    calendarSettingsForm,
    setCalendarSettingsForm,
    fetchYears: () => refetchDomain(),
    fetchCalendar: () => refetchDomain(),
  }
}

export default useCalendarData
