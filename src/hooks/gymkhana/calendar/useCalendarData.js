import { useEffect, useRef, useState } from "react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import {
  formatDateKey,
  getCalendarCategoryDefinitions,
  normalizeEvent,
  toBudgetCapsForm,
  toGymkhanaDisplayEvent,
} from "@/components/gymkhana/events-page/shared"

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

export const useCalendarData = ({ user, canViewEventsCapability }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [events, setEvents] = useState([])
  const [hasAttemptedCalendarLoad, setHasAttemptedCalendarLoad] = useState(false)
  const [calendarHolidays, setCalendarHolidays] = useState([])
  const [viewMode, setViewMode] = useState("list")
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [calendarSettingsForm, setCalendarSettingsForm] = useState(() =>
    buildCalendarSettingsForm()
  )

  const calendarRequestRef = useRef(0)

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

        // GymkhanaEvent collection is the single source of truth for calendar events.
        mergedEvents = gymkhanaEvents.map(toGymkhanaDisplayEvent)
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

  return {
    loading,
    setLoading,
    error,
    years,
    selectedYear,
    setSelectedYear,
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
    fetchYears,
    fetchCalendar,
  }
}

export default useCalendarData
