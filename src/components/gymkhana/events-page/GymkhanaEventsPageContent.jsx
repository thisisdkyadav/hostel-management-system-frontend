import { Button, DataTable, EmptyState, Grid, Heading, HStack, LoadingState, Panel, StatCards, Surface, Tabs, Text, ToggleButtonGroup, VStack } from "hzero"
import PageHeader from "@/components/common/PageHeader"
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  List,
  Plus,
  Receipt,
  Send,
  Settings,
  Trash2,
  X,
} from "lucide-react"
import { GymkhanaCalendarFooterTabs } from "@/components/gymkhana/events-page"
import { CALENDAR_WEEKDAY_LABELS, formatDateRange, getCategoryColor } from "@/components/gymkhana/events-page/shared"

const viewOptions = [
  { value: "list", label: "List", icon: <List size={14} /> },
  { value: "calendar", label: "Month", icon: <CalendarDays size={14} /> },
  { value: "year", label: "Year", icon: <CalendarRange size={14} /> },
]

// Which section a heading belongs to is shared.js's call; what it looks like
// is this file's. Keyed rather than inlined so the two cannot drift.
const SECTION_ICONS = {
  current: CalendarClock,
  upcoming: CalendarRange,
  past: History,
}

const getEventRowId = (event) =>
  event?._id ||
  `${event?.title || "event"}-${event?.category || "na"}-${event?.startDate || "na"}-${event?.endDate || "na"}`

const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
// Opaque tint (mixed with the surface) — stays legible when layered over a colored cell strip.
const solidTint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, var(--color-bg-primary))`

const calendarCardStyle = {
  backgroundColor: "var(--color-bg-primary)",
  borderRadius: "var(--radius-card)",
  border: "var(--border-1) solid var(--color-border-primary)",
  overflow: "hidden",
  boxShadow: "var(--shadow-xs)",
}

// The nav buttons' hover, as one class instead of a helper that wrote three
// style properties on every pointer crossing.
const NAV_HOVER =
  "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)]"

const navBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 30,
  minWidth: 30,
  borderRadius: "var(--radius-md)",
  border: "var(--border-1) solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-primary)",
  cursor: "pointer",
  color: "var(--color-text-muted)",
  transition: "var(--transition-colors)",
}

const legendItemStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--spacing-1)",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-muted)",
}

// Distinct visual treatment per day type. Precedence: today > holiday > sunday > saturday > normal.
// Weekends / holidays get a full tinted fill (a "strip") so they stand apart from event boxes.
const DAY_TONES = {
  today: { bg: "var(--color-primary-bg)", accent: "var(--color-primary)", num: "var(--color-white)" },
  holiday: { bg: tint("var(--color-warning)", 15), accent: "var(--color-warning)", num: "var(--color-warning-text)" },
  sunday: { bg: tint("var(--color-danger)", 14), accent: "var(--color-danger)", num: "var(--color-danger-text)" },
  saturday: { bg: tint("var(--color-info)", 14), accent: "var(--color-info)", num: "var(--color-info-text)" },
  normal: { bg: "var(--color-bg-primary)", accent: "transparent", num: "var(--color-text-body)" },
}

const getDayTone = ({ isToday, isHoliday, weekday }) => {
  if (isToday) return DAY_TONES.today
  if (isHoliday) return DAY_TONES.holiday
  if (weekday === 0) return DAY_TONES.sunday
  if (weekday === 6) return DAY_TONES.saturday
  return DAY_TONES.normal
}

// Build the 12 months of an academic year ("2026-27" → Jul 2026 … Jun 2027).
function buildAcademicYearMonths(yearStr, fallbackDate) {
  const match = /(\d{4})\s*[-/]\s*(\d{2,4})/.exec(String(yearStr || ""))
  const startYear = match
    ? parseInt(match[1], 10)
    : fallbackDate?.getFullYear() || new Date().getFullYear()
  return Array.from({ length: 12 }, (_, i) => new Date(startYear, 6 + i, 1))
}

function MonthCalendarView({
  calendarMonth,
  setCalendarMonth,
  getDaysInMonth,
  getEventsForDate,
  getHolidaysForDate,
  categoryOrder,
  categoryLabels,
  onEventClick,
}) {
  const days = getDaysInMonth(calendarMonth)
  const todayStr = new Date().toDateString()
  const goMonth = (delta) =>
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1))
  const monthEventCount = days.reduce(
    (total, date) => (date ? total + getEventsForDate(date).length : total),
    0,
  )
  return (
    <div style={calendarCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--spacing-2)",
          padding: "var(--spacing-4)",
          borderBottom: "var(--border-1) solid var(--color-border-primary)",
        }}
      >
        <HStack gap="var(--spacing-2-5)" align="baseline">
          <Heading as="h3" size="xl" weight="bold" color="heading" style={{ margin: 0, letterSpacing: "-0.02em" }}>
            {calendarMonth.toLocaleString("en-IN", { month: "long" })}{" "}
            <Text as="span" color="muted" weight="normal">
              {calendarMonth.getFullYear()}
            </Text>
          </Heading>
          {monthEventCount > 0 && (
            <Surface as="span" bg="brand" padding="2px 10px" radius="full" color="brand" size="xs" weight="semibold" style={{ whiteSpace: "nowrap" }}>
              {monthEventCount} event{monthEventCount === 1 ? "" : "s"}
            </Surface>
          )}
        </HStack>
        <HStack gap="var(--spacing-1-5)" align="center">
          <button
            onClick={() => goMonth(-1)}
            style={navBtnStyle}
            className={NAV_HOVER}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCalendarMonth(new Date())}
            style={{
              ...navBtnStyle,
              padding: "0 var(--spacing-3)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
            }}
            className={NAV_HOVER}
          >
            Today
          </button>
          <button
            onClick={() => goMonth(1)}
            style={navBtnStyle}
            className={NAV_HOVER}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </HStack>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-3)",
          padding: "var(--spacing-2) var(--spacing-4)",
          borderBottom: "var(--border-1) solid var(--color-border-primary)",
          flexWrap: "wrap",
          backgroundColor: "var(--color-bg-secondary)",
        }}
      >
        {categoryOrder.map((category) => (
          <span key={category} style={legendItemStyle}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                backgroundColor: getCategoryColor(category, categoryOrder),
                flexShrink: 0,
              }}
            />
            {categoryLabels[category] || category}
          </span>
        ))}
        <span style={{ width: 1, height: 14, backgroundColor: "var(--color-border-primary)", flexShrink: 0 }} />
        <span style={legendItemStyle}>
          <span style={{ width: 9, height: 9, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary)" }} />
          Today
        </span>
        <span style={legendItemStyle}>
          <span style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: "var(--color-warning)" }} />
          Holiday
        </span>
        <span style={legendItemStyle}>
          <span style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: "var(--color-info)" }} />
          Saturday
        </span>
        <span style={legendItemStyle}>
          <span style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: "var(--color-danger)" }} />
          Sunday
        </span>
      </div>

      <Surface padding={3}>
        <Grid cols={7} gap={1} style={{ marginBottom: "var(--spacing-1)" }}>
          {CALENDAR_WEEKDAY_LABELS.map((day, index) => {
            const isSat = index === 5
            const isSun = index === 6
            return (
              <Surface bg={isSun
                    ? "var(--color-danger-bg)"
                    : isSat
                      ? "var(--color-info-bg)"
                      : "transparent"} padding="var(--spacing-1) 0" radius="sm" color={isSun
                    ? "var(--color-danger)"
                    : isSat
                      ? "var(--color-info)"
                      : "var(--color-text-muted)"} size="xs" weight="semibold" align="center" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }} key={day}>
                {day}
              </Surface>
            )
          })}
        </Grid>

        <Grid cols={7} gap={1}>
          {days.map((date, index) => {
            if (!date) return <div key={index} />
            const dayEvents = getEventsForDate(date)
            const dayHolidays = getHolidaysForDate(date)
            const isToday = date.toDateString() === todayStr
            const weekday = date.getDay()
            const isHoliday = dayHolidays.length > 0
            const tone = getDayTone({ isToday, isHoliday, weekday })
            const shown = dayEvents.slice(0, 3)
            const extra = dayEvents.length - shown.length

            return (
              <div
                key={index}
                style={{
                  minHeight: 104,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  padding: "var(--spacing-1-5)",
                  borderRadius: "var(--radius-md)",
                  border: `var(--border-1) solid ${
                    isToday ? "var(--color-primary)" : "var(--color-border-light)"
                  }`,
                  backgroundColor: tone.bg,
                  boxShadow: isToday
                    ? "inset 0 0 0 1px var(--color-primary)"
                    : tone.accent !== "transparent"
                      ? `inset 3px 0 0 0 ${tone.accent}`
                      : "none",
                }}
              >
                <HStack gap={4} align="center" justify="between">
                  <Surface as="span" bg={isToday ? "var(--color-primary)" : "transparent"} padding="0 6px" radius="full" color={tone.num} size="xs" weight={isToday || isHoliday || weekday === 0 || weekday === 6
                          ? "var(--font-weight-bold)"
                          : "var(--font-weight-medium)"} style={{ minWidth: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    {date.getDate()}
                  </Surface>
                  {isHoliday && (
                    <Surface as="span" bg={tint("var(--color-warning)", 20)} padding="1px 6px" radius="full" color="warning-text" size={9} weight="bold" style={{ textTransform: "uppercase", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }} title={dayHolidays.map((holiday) => holiday.title).join(", ")}>
                      {dayHolidays[0].title}
                    </Surface>
                  )}
                </HStack>

                {shown.map((event, eventIndex) => (
                  <button
                    key={eventIndex}
                    onClick={() => onEventClick(event)}
                    title={event.title}
                    className="hover:bg-[var(--evt-tint-hover)] hover:translate-x-[2px]"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      width: "100%",
                      textAlign: "left",
                      fontSize: 10.5,
                      lineHeight: 1.25,
                      padding: "3px 6px",
                      borderRadius: "var(--radius-sm)",
                      // Per-event data, so the hover tint rides in as a custom
                      // property and the :hover rule stays in CSS.
                      "--evt-tint-hover": solidTint(getCategoryColor(event.category, categoryOrder), 30),
                      backgroundColor: solidTint(getCategoryColor(event.category, categoryOrder), 16),
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-body)",
                      fontWeight: "var(--font-weight-medium)",
                      overflow: "hidden",
                      transition: "var(--transition-all)",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "var(--radius-full)",
                        backgroundColor: getCategoryColor(event.category, categoryOrder),
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {event.title}
                    </span>
                  </button>
                ))}

                {extra > 0 && (
                  <Text as="span" size={10} color="muted" weight="semibold" style={{ alignSelf: "flex-start", padding: "1px 6px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-bg-secondary)" }}>
                    +{extra} more
                  </Text>
                )}
              </div>
            )
          })}
        </Grid>
      </Surface>
    </div>
  )
}

function YearCalendarView({
  months,
  getDaysInMonth,
  getEventsForDate,
  getHolidaysForDate,
  filteredEvents,
  categoryOrder,
  onSelectMonth,
}) {
  const todayStr = new Date().toDateString()
  const monthEventCount = (monthDate) =>
    filteredEvents.filter((event) => {
      const start = new Date(event.startDate)
      return (
        start.getFullYear() === monthDate.getFullYear() && start.getMonth() === monthDate.getMonth()
      )
    }).length

  return (
    <Grid cols="repeat(auto-fill, minmax(230px, 1fr))" gap={3}>
      {months.map((monthDate) => {
        const grid = getDaysInMonth(monthDate)
        const count = monthEventCount(monthDate)
        const now = new Date()
        const isCurrentMonth =
          monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() === now.getMonth()

        return (
          <button
            key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
            onClick={() => onSelectMonth(monthDate)}
            style={{
              textAlign: "left",
              cursor: "pointer",
              padding: "var(--spacing-3)",
              borderRadius: "var(--radius-card-sm)",
              border: `var(--border-1) solid ${
                isCurrentMonth ? "var(--color-primary)" : "var(--color-border-primary)"
              }`,
              backgroundColor: "var(--color-bg-primary)",
              transition: "var(--transition-all)",
              boxShadow: isCurrentMonth ? "inset 0 0 0 1px var(--color-primary)" : "var(--shadow-xs)",
            }}
            className="hover:border-[var(--color-primary)] hover:-translate-y-[2px] hover:shadow-[var(--shadow-sm)]"
          >
            <HStack gap="none" align="center" justify="between" style={{ marginBottom: "var(--spacing-2)" }}>
              <Text as="span" size="sm" weight="bold" color="heading">
                {monthDate.toLocaleString("en-IN", { month: "short" })}{" "}
                <Text as="span" color="muted" weight="normal">
                  &rsquo;{String(monthDate.getFullYear()).slice(2)}
                </Text>
              </Text>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)" }}>
                {isCurrentMonth && (
                  <Surface as="span" bg="var(--color-primary)" padding="1px 7px" radius="full" color="var(--color-white)" size="0.5625rem" weight="bold" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Now
                  </Surface>
                )}
                {count > 0 && (
                  <Surface as="span" bg="brand" padding="1px 7px" radius="full" color="brand" size="0.625rem" weight="bold">
                    {count}
                  </Surface>
                )}
              </span>
            </HStack>

            <Grid cols={7} gap={2} style={{ marginBottom: 3 }}>
              {CALENDAR_WEEKDAY_LABELS.map((day, index) => (
                <Text as="span" align="center" size={8.5} weight="semibold" color={index === 6
                        ? "var(--color-danger)"
                        : index === 5
                          ? "var(--color-info)"
                          : "var(--color-text-light)"} key={day}>
                  {day[0]}
                </Text>
              ))}
            </Grid>

            <div style={{ position: "relative" }}>
              {/* Full-height Saturday / Sunday column strips behind the day numbers */}
              <Grid cols={7} gap={2} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {Array.from({ length: 7 }, (_, col) => (
                  <span
                    key={col}
                    style={{
                      borderRadius: "var(--radius-sm)",
                      backgroundColor:
                        col === 5
                          ? DAY_TONES.saturday.bg
                          : col === 6
                            ? DAY_TONES.sunday.bg
                            : "transparent",
                    }}
                  />
                ))}
              </Grid>

              <Grid cols={7} gap={2} style={{ position: "relative" }}>
                {grid.map((date, index) => {
                  if (!date) return <span key={index} />
                  const dayEvents = getEventsForDate(date)
                  const dayHolidays = getHolidaysForDate(date)
                  const isToday = date.toDateString() === todayStr
                  const weekday = date.getDay()
                  const isHoliday = dayHolidays.length > 0
                  const hasEvents = dayEvents.length > 0
                  const isWeekend = weekday === 0 || weekday === 6
                  const color = hasEvents ? getCategoryColor(dayEvents[0].category, categoryOrder) : null

                  return (
                    <span
                      key={index}
                      title={
                        hasEvents
                          ? `${dayEvents.length} event(s)`
                          : isHoliday
                            ? dayHolidays[0].title
                            : undefined
                      }
                      style={{
                        aspectRatio: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9.5,
                        borderRadius: "var(--radius-sm)",
                        fontWeight:
                          isToday || hasEvents || isHoliday || isWeekend
                            ? "var(--font-weight-bold)"
                            : "var(--font-weight-normal)",
                        color: isToday
                          ? "var(--color-white)"
                          : hasEvents
                            ? "var(--color-text-heading)"
                            : isHoliday
                              ? "var(--color-warning-text)"
                              : weekday === 0
                                ? "var(--color-danger-text)"
                                : weekday === 6
                                  ? "var(--color-info-text)"
                                  : "var(--color-text-muted)",
                        backgroundColor: isToday
                          ? "var(--color-primary)"
                          : hasEvents
                            ? solidTint(color, 24)
                            : isHoliday
                              ? solidTint("var(--color-warning)", 18)
                              : "transparent",
                        boxShadow: !isToday && hasEvents ? `inset 0 0 0 1px ${tint(color, 45)}` : "none",
                      }}
                    >
                      {date.getDate()}
                    </span>
                  )
                })}
              </Grid>
            </div>
          </button>
        )
      })}
    </Grid>
  )
}

export default function GymkhanaEventsPageContent({
  activeCategoryFilter,
  budgetStats,
  calendar,
  calendarMonth,
  canApprove,
  canApproveEventsCapability,
  canCreateCalendar,
  canCreateEventsCapability,
  canEdit,
  canManageCalendarLock,
  canSubmitCalendar,
  categoryLabels,
  categoryOrder,
  categoryFilterTabs,
  dateConflicts,
  eventTableColumns,
  eventTimelineSections,
  filteredEvents,
  getDaysInMonth,
  getEventsForDate,
  getHolidaysForDate,
  handleAddEvent,
  handleEventClick,
  handleEventRowClick,
  handleSubmitCalendar,
  hasAttemptedCalendarLoad,
  headerSubtitle,
  headerTitle,
  isAdminLevel,
  onOpenDeletedItems,
  isGS,
  isPresident,
  loading,
  openAmendmentModal,
  openProposalModal,
  pendingExpenseApprovalsForSelectedCalendar,
  pendingProposalReminders,
  pendingProposalsForSelectedCalendar,
  selectedYear,
  setActiveCategoryFilter,
  setCalendarMonth,
  setSelectedYear,
  openApprovalModal,
  setShowCreateCalendarModal,
  setShowHistoryModal,
  setShowOverlapDetailsModal,
  setShowPendingBillsModal,
  setShowPendingProposalModal,
  setShowSettingsModal,
  submitCalendarLabel,
  submitting,
  years,
  viewMode,
  setViewMode,
}) {
  const yearMonths = buildAcademicYearMonths(selectedYear || calendar?.academicYear, calendarMonth)

  return (
    <>
      <PageHeader title={headerTitle} subtitle={headerSubtitle} showDate={false}>
        <ToggleButtonGroup
          options={viewOptions}
          value={viewMode}
          onChange={setViewMode}
          size="medium"
          variant="muted"
        />
        {canEdit && (
          <Button size="md" variant="secondary" onClick={handleAddEvent}>
            <Plus size={16} /> Add Event
          </Button>
        )}
        {canSubmitCalendar && (
          <Button size="md" onClick={handleSubmitCalendar} loading={submitting}>
            <Send size={16} /> {submitCalendarLabel}
          </Button>
        )}
        {calendar?.isLocked && isGS && canCreateEventsCapability && (
          <Button size="md" variant="secondary" onClick={() => openAmendmentModal(null)}>
            <FileText size={16} /> Request New Event
          </Button>
        )}
        {canApprove && (
          <>
            <Button size="md" variant="success" onClick={openApprovalModal}>
              <Check size={16} /> Approve
            </Button>
            <Button size="md" variant="danger" onClick={openApprovalModal}>
              <X size={16} /> Reject
            </Button>
          </>
        )}
        {calendar && (
          <Button size="md" variant="ghost" onClick={() => setShowHistoryModal(true)}>
            <History size={16} /> History
          </Button>
        )}
        {calendar && canManageCalendarLock && (
          <Button size="md" variant="ghost" onClick={() => setShowSettingsModal(true)}>
            <Settings size={16} /> Settings
          </Button>
        )}
        {isAdminLevel && onOpenDeletedItems && (
          <Button size="md" variant="ghost" onClick={onOpenDeletedItems}>
            <Trash2 size={16} /> Deleted items
          </Button>
        )}
      </PageHeader>

      <div style={{ flex: 1, overflow: "auto", padding: "var(--spacing-6)" }}>
        {(loading || calendar) && (
          <div style={{ marginBottom: "var(--spacing-4)" }}>
            <StatCards
              stats={budgetStats}
              columns={Math.min(Math.max(budgetStats.length, 1), 7)}
              loading={loading || !calendar}
              loadingCount={Math.min(Math.max(budgetStats.length, 1), 7)}
              valueSize="sm"
            />
          </div>
        )}

        {!loading &&
          calendar &&
          canCreateEventsCapability &&
          (isGS || isPresident) &&
          pendingProposalReminders.length > 0 && (
            <Surface bg="warning" padding={3} radius="card-sm" border="var(--border-1) solid var(--color-warning)" style={{ marginBottom: "var(--spacing-3)" }}>
              <HStack gap={2} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-2)" }}>
                <HStack gap={2} align="center">
                  <Bell size={14} style={{ color: "var(--color-warning)" }} />
                  <Text as="span" size="sm" weight="medium" color="heading">
                    {pendingProposalReminders.length} programme{pendingProposalReminders.length === 1 ? "" : "s"} waiting for a proposal
                  </Text>
                </HStack>
              </HStack>
              <HStack gap={2} wrap>
                {pendingProposalReminders.slice(0, 5).map((event) => (
                  <div
                    key={`proposal-reminder-${event._id || event.title}`}
                    onClick={() => openProposalModal(event)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--spacing-2)",
                      padding: "var(--spacing-1-5) var(--spacing-2-5)",
                      borderRadius: "var(--radius-badge)",
                      backgroundColor: "var(--color-bg-primary)",
                      border: "var(--border-1) solid var(--color-border-primary)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    className="hover:border-[var(--color-warning)]"
                  >
                    <Text as="span" size="xs" weight="medium" color="heading">
                      {event.title}
                    </Text>
                    <Text as="span" size="xs" color="muted">
                      {formatDateRange(event.startDate, event.endDate)}
                    </Text>
                    <FileText size={12} style={{ color: "var(--color-warning)" }} />
                  </div>
                ))}
              </HStack>
            </Surface>
          )}

        {!loading && calendar && pendingProposalsForSelectedCalendar.length > 0 && (
          <div
            style={{
              marginBottom: "var(--spacing-3)",
              padding: "var(--spacing-2) var(--spacing-3)",
              border: "var(--border-1) solid var(--color-info)",
              borderRadius: "var(--radius-card-sm)",
              backgroundColor: "var(--color-info-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-2)",
              flexWrap: "wrap",
            }}
          >
            <HStack gap={2} align="center">
              <AlertTriangle size={14} style={{ color: "var(--color-info)" }} />
              <Text as="span" size="sm" color="body">
                <strong>{pendingProposalsForSelectedCalendar.length}</strong> proposal{pendingProposalsForSelectedCalendar.length === 1 ? "" : "s"} waiting for a yes
              </Text>
            </HStack>
            <Button size="sm" variant="ghost" onClick={() => setShowPendingProposalModal(true)}>
              Read them
            </Button>
          </div>
        )}

        {!loading &&
          calendar &&
          canApproveEventsCapability &&
          isAdminLevel &&
          pendingExpenseApprovalsForSelectedCalendar.length > 0 && (
            <div
              style={{
                marginBottom: "var(--spacing-3)",
                padding: "var(--spacing-2) var(--spacing-3)",
                border: "var(--border-1) solid var(--color-info)",
                borderRadius: "var(--radius-card-sm)",
                backgroundColor: "var(--color-info-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--spacing-2)",
                flexWrap: "wrap",
              }}
            >
              <HStack gap={2} align="center">
                <Receipt size={14} style={{ color: "var(--color-info)" }} />
                <Text as="span" size="sm" color="body">
                  <strong>{pendingExpenseApprovalsForSelectedCalendar.length}</strong> pending bill approval(s)
                </Text>
              </HStack>
              <Button size="sm" variant="ghost" onClick={() => setShowPendingBillsModal(true)}>
                View Bills
              </Button>
            </div>
          )}

        {calendar && calendar.status !== "approved" && dateConflicts.length > 0 && (
          <div
            style={{
              marginBottom: "var(--spacing-3)",
              padding: "var(--spacing-2) var(--spacing-3)",
              border: "var(--border-1) solid var(--color-warning)",
              borderRadius: "var(--radius-card-sm)",
              backgroundColor: "var(--color-warning-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-2)",
              flexWrap: "wrap",
            }}
          >
            <HStack gap={2} align="center">
              <AlertTriangle size={14} style={{ color: "var(--color-warning)" }} />
              <Text as="span" size="sm" color="body">
                <strong>{dateConflicts.length}</strong> date overlap(s) detected
              </Text>
            </HStack>
            <Button size="sm" variant="ghost" onClick={() => setShowOverlapDetailsModal(true)}>
              View Details
            </Button>
          </div>
        )}

        {!loading && !calendar && hasAttemptedCalendarLoad && (
          <EmptyState
            icon={CalendarDays}
            title="No Calendar Found"
            message={
              canCreateCalendar
                ? "No activity calendar exists yet. Create one using the New Calendar action."
                : `No activity calendar exists for ${selectedYear || "this year"}. Contact Admin to create one.`
            }
          />
        )}

        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <Tabs
            variant="pills"
            tabs={categoryFilterTabs}
            activeTab={activeCategoryFilter}
            setActiveTab={setActiveCategoryFilter}
          />
        </div>

        {viewMode === "list" && (
          <>
            {loading ? (
              <DataTable
                data={[]}
                columns={eventTableColumns}
                loading
                emptyMessage="No events available"
                className="gymkhana-event-timeline-table"
              />
            ) : !calendar ? null : filteredEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title={activeCategoryFilter === "all" ? "No Events Yet" : "No Events In This Category"}
                message={
                  activeCategoryFilter === "all"
                    ? canEdit
                      ? "Add events to the calendar to get started."
                      : "No events have been added to this calendar yet."
                    : "Try another category filter."
                }
              />
            ) : (
              <VStack gap="var(--gap-md)">
                {/* A section with nothing in it is a heading that says nothing —
                    hidden, not rendered empty. The partition is total, so the
                    ones shown always account for every event. */}
                {eventTimelineSections
                  .filter((section) => section.events.length > 0)
                  .map((section) => (
                    <Panel
                      key={section.key}
                      title={section.title}
                      icon={SECTION_ICONS[section.key]}
                      accent={section.tone}
                      count={section.events.length}
                      padded={false}
                    >
                      <DataTable
                        data={section.events}
                        columns={eventTableColumns}
                        onRowClick={handleEventRowClick}
                        getRowId={getEventRowId}
                        className="gymkhana-event-timeline-table"
                        style={{ width: "100%" }}
                      />
                    </Panel>
                  ))}
              </VStack>
            )}
          </>
        )}

        {viewMode === "calendar" &&
          (loading ? (
            <div style={calendarCardStyle}>
              <Surface padding={6}>
                <LoadingState message={`Loading calendar for ${selectedYear || "selected year"}...`} />
              </Surface>
            </div>
          ) : !calendar ? null : (
            <MonthCalendarView
              calendarMonth={calendarMonth}
              setCalendarMonth={setCalendarMonth}
              getDaysInMonth={getDaysInMonth}
              getEventsForDate={getEventsForDate}
              getHolidaysForDate={getHolidaysForDate}
              categoryOrder={categoryOrder}
              categoryLabels={categoryLabels}
              onEventClick={handleEventClick}
            />
          ))}

        {viewMode === "year" &&
          (loading ? (
            <div style={calendarCardStyle}>
              <Surface padding={6}>
                <LoadingState message={`Loading calendar for ${selectedYear || "selected year"}...`} />
              </Surface>
            </div>
          ) : !calendar ? null : (
            <YearCalendarView
              months={yearMonths}
              getDaysInMonth={getDaysInMonth}
              getEventsForDate={getEventsForDate}
              getHolidaysForDate={getHolidaysForDate}
              filteredEvents={filteredEvents}
              categoryOrder={categoryOrder}
              onSelectMonth={(month) => {
                setCalendarMonth(month)
                setViewMode("calendar")
              }}
            />
          ))}
      </div>

      <GymkhanaCalendarFooterTabs
        years={years}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        canCreateCalendar={canCreateCalendar}
        onCreateCalendar={() => setShowCreateCalendarModal(true)}
      />
    </>
  )
}
