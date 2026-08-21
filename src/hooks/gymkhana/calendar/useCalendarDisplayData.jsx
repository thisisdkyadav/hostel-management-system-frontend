import { useCallback, useMemo } from "react"
import { formatINR } from "@/utils/formatters"
import {
  buildAvailableYearsForCreation,
  buildEventTimelineSections,
  formatDateKey,
  formatDateRange,
  getBudgetSummary,
  getCategoryBadgeStyle,
  getCategoryColor,
  getCategoryLabelsMap,
  getCategoryOptions,
  getCategoryOrder,
  getDateConflicts,
  getCalendarCategoryDefinitions,
  isProposalWindowOpen,
  normalizeEventId,
} from "@/components/gymkhana/events-page/shared"
import { CalendarDays, FileText } from "lucide-react"
import { Badge, Text } from "hzero"

export const useCalendarDisplayData = ({
  calendar,
  events,
  years,
  selectedYear,
  loading,
  activeCategoryFilter,
  calendarHolidays,
}) => {
  const categoryDefinitions = useMemo(() => getCalendarCategoryDefinitions(calendar), [calendar])
  const categoryOptions = useMemo(() => getCategoryOptions(categoryDefinitions), [categoryDefinitions])
  const categoryLabels = useMemo(() => getCategoryLabelsMap(categoryDefinitions), [categoryDefinitions])
  const categoryOrder = useMemo(() => getCategoryOrder(categoryDefinitions), [categoryDefinitions])

  // A category's colour is its position in this calendar's list, so the two
  // helpers that need that position get bound to it here — the components
  // rendering a badge keep asking for one by category alone.
  const badgeStyleForCategory = useCallback(
    (category) => getCategoryBadgeStyle(category, categoryOrder),
    [categoryOrder]
  )

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
  // The list reads as three sections by when an event happens. Built here so
  // "now" is fixed once per change to the list rather than per render.
  const eventTimelineSections = useMemo(() => buildEventTimelineSections(filteredEvents), [filteredEvents])
  // Fixed percentage widths so the three timeline tables (this month / later /
  // past) share the same column geometry regardless of cell content length.
  const eventTableColumns = useMemo(
    () => [
      {
        key: "title",
        header: "Event",
        width: "40%",
        render: (event) => (
          <Text as="span" weight="medium">{event.title}</Text>
        ),
      },
      {
        key: "category",
        header: "Category",
        width: "18%",
        render: (event) => (
          <Badge style={badgeStyleForCategory(event.category)}>
            {categoryLabels[event.category] || event.category}
          </Badge>
        ),
      },
      {
        key: "dateRange",
        header: "Date Range",
        width: "27%",
        render: (event) => formatDateRange(event.startDate, event.endDate),
      },
      {
        key: "estimatedBudget",
        header: "Budget",
        width: "15%",
        align: "right",
        render: (event) => formatINR(event.estimatedBudget),
      },
    ],
    [categoryLabels, badgeStyleForCategory]
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
    const capLabel = cap === null || cap === undefined ? "No cap" : `Cap ${formatINR(cap)}`
    return `${budgetSummary.counts[category] || 0} event(s) · ${capLabel}`
  }

  const budgetStats = useMemo(
    () => [
      ...categoryDefinitions.map((definition) => ({
        title: `${definition.label} Budget`,
        value: formatINR(budgetSummary.byCategory[definition.key]),
        subtitle: getBudgetStatSubtitle(definition.key),
        icon: <CalendarDays size={16} />,
        color: getCategoryColor(definition.key, categoryOrder),
        tintBackground: true,
      })),
      {
        title: "Total Budget",
        value: formatINR(budgetSummary.total),
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

  return {
    categoryDefinitions,
    categoryOptions,
    categoryLabels,
    categoryOrder,
    badgeStyleForCategory,
    budgetSummary,
    categoryFilterTabs,
    filteredEvents,
    eventTimelineSections,
    eventTableColumns,
    holidaysByDate,
    budgetStats,
    dateConflicts,
    pendingProposalReminders,
    selectedCalendarEventIds,
    availableYearsForCreation,
    headerTitle,
    headerSubtitle,
  }
}

export default useCalendarDisplayData
