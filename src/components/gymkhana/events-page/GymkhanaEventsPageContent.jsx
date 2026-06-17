import { Button, DataTable, Tabs } from "czero/react"
import PageHeader from "@/components/common/PageHeader"
import { EmptyState, LoadingState } from "@/components/ui/feedback"
import { StatCards } from "@/components/ui/data-display"
import { ToggleButtonGroup } from "@/components/ui"
import {
  AlertTriangle,
  Bell,
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
  X,
} from "lucide-react"
import { GymkhanaCalendarFooterTabs } from "@/components/gymkhana/events-page"
import { CALENDAR_WEEKDAY_LABELS, formatDateRange, getCategoryColor } from "@/components/gymkhana/events-page/shared"

const viewOptions = [
  { value: "list", label: "List", icon: <List size={14} /> },
  { value: "calendar", label: "Month", icon: <CalendarDays size={14} /> },
  { value: "year", label: "Year", icon: <CalendarRange size={14} /> },
]

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
  const hoverNav = (node, on) => {
    node.currentTarget.style.borderColor = on ? "var(--color-primary)" : "var(--color-border-primary)"
    node.currentTarget.style.color = on ? "var(--color-primary)" : "var(--color-text-muted)"
    node.currentTarget.style.backgroundColor = on ? "var(--color-primary-bg)" : "var(--color-bg-primary)"
  }

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
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-2-5)" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-text-heading)",
              letterSpacing: "-0.02em",
            }}
          >
            {calendarMonth.toLocaleString("default", { month: "long" })}{" "}
            <span style={{ color: "var(--color-text-muted)", fontWeight: "var(--font-weight-normal)" }}>
              {calendarMonth.getFullYear()}
            </span>
          </h3>
          {monthEventCount > 0 && (
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-primary)",
                backgroundColor: "var(--color-primary-bg)",
                borderRadius: "var(--radius-full)",
                padding: "2px 10px",
                whiteSpace: "nowrap",
              }}
            >
              {monthEventCount} event{monthEventCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-1-5)" }}>
          <button
            onClick={() => goMonth(-1)}
            style={navBtnStyle}
            aria-label="Previous month"
            onMouseEnter={(node) => hoverNav(node, true)}
            onMouseLeave={(node) => hoverNav(node, false)}
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
            onMouseEnter={(node) => hoverNav(node, true)}
            onMouseLeave={(node) => hoverNav(node, false)}
          >
            Today
          </button>
          <button
            onClick={() => goMonth(1)}
            style={navBtnStyle}
            aria-label="Next month"
            onMouseEnter={(node) => hoverNav(node, true)}
            onMouseLeave={(node) => hoverNav(node, false)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
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
                backgroundColor: getCategoryColor(category),
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

      <div style={{ padding: "var(--spacing-3)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "var(--spacing-1)",
            marginBottom: "var(--spacing-1)",
          }}
        >
          {CALENDAR_WEEKDAY_LABELS.map((day, index) => {
            const isSat = index === 5
            const isSun = index === 6
            return (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  padding: "var(--spacing-1) 0",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: isSun
                    ? "var(--color-danger)"
                    : isSat
                      ? "var(--color-info)"
                      : "var(--color-text-muted)",
                  backgroundColor: isSun
                    ? "var(--color-danger-bg)"
                    : isSat
                      ? "var(--color-info-bg)"
                      : "transparent",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {day}
              </div>
            )
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "var(--spacing-1)" }}>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                  <span
                    style={{
                      minWidth: 22,
                      height: 22,
                      padding: "0 6px",
                      borderRadius: "var(--radius-full)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--font-size-xs)",
                      fontWeight:
                        isToday || isHoliday || weekday === 0 || weekday === 6
                          ? "var(--font-weight-bold)"
                          : "var(--font-weight-medium)",
                      color: tone.num,
                      backgroundColor: isToday ? "var(--color-primary)" : "transparent",
                    }}
                  >
                    {date.getDate()}
                  </span>
                  {isHoliday && (
                    <span
                      title={dayHolidays.map((holiday) => holiday.title).join(", ")}
                      style={{
                        fontSize: 9,
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--color-warning-text)",
                        backgroundColor: tint("var(--color-warning)", 20),
                        padding: "1px 6px",
                        borderRadius: "var(--radius-full)",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "70%",
                      }}
                    >
                      {dayHolidays[0].title}
                    </span>
                  )}
                </div>

                {shown.map((event, eventIndex) => (
                  <button
                    key={eventIndex}
                    onClick={() => onEventClick(event)}
                    title={event.title}
                    onMouseEnter={(node) => {
                      node.currentTarget.style.backgroundColor = solidTint(getCategoryColor(event.category), 30)
                      node.currentTarget.style.transform = "translateX(2px)"
                    }}
                    onMouseLeave={(node) => {
                      node.currentTarget.style.backgroundColor = solidTint(getCategoryColor(event.category), 16)
                      node.currentTarget.style.transform = "none"
                    }}
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
                      backgroundColor: solidTint(getCategoryColor(event.category), 16),
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
                        backgroundColor: getCategoryColor(event.category),
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {event.title}
                    </span>
                  </button>
                ))}

                {extra > 0 && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      fontSize: 10,
                      color: "var(--color-text-muted)",
                      fontWeight: "var(--font-weight-semibold)",
                      padding: "1px 6px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--color-bg-secondary)",
                    }}
                  >
                    +{extra} more
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function YearCalendarView({
  months,
  getDaysInMonth,
  getEventsForDate,
  getHolidaysForDate,
  filteredEvents,
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
        gap: "var(--spacing-3)",
      }}
    >
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
            onMouseEnter={(node) => {
              node.currentTarget.style.borderColor = "var(--color-primary)"
              node.currentTarget.style.transform = "translateY(-2px)"
              node.currentTarget.style.boxShadow = "var(--shadow-sm)"
            }}
            onMouseLeave={(node) => {
              node.currentTarget.style.borderColor = isCurrentMonth
                ? "var(--color-primary)"
                : "var(--color-border-primary)"
              node.currentTarget.style.transform = "none"
              node.currentTarget.style.boxShadow = isCurrentMonth
                ? "inset 0 0 0 1px var(--color-primary)"
                : "var(--shadow-xs)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--spacing-2)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text-heading)",
                }}
              >
                {monthDate.toLocaleString("default", { month: "short" })}{" "}
                <span style={{ color: "var(--color-text-muted)", fontWeight: "var(--font-weight-normal)" }}>
                  &rsquo;{String(monthDate.getFullYear()).slice(2)}
                </span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)" }}>
                {isCurrentMonth && (
                  <span
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--color-white)",
                      backgroundColor: "var(--color-primary)",
                      borderRadius: "var(--radius-full)",
                      padding: "1px 7px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Now
                  </span>
                )}
                {count > 0 && (
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--color-primary)",
                      backgroundColor: "var(--color-primary-bg)",
                      borderRadius: "var(--radius-full)",
                      padding: "1px 7px",
                    }}
                  >
                    {count}
                  </span>
                )}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 3 }}>
              {CALENDAR_WEEKDAY_LABELS.map((day, index) => (
                <span
                  key={day}
                  style={{
                    textAlign: "center",
                    fontSize: 8.5,
                    fontWeight: "var(--font-weight-semibold)",
                    color:
                      index === 6
                        ? "var(--color-danger)"
                        : index === 5
                          ? "var(--color-info)"
                          : "var(--color-text-light)",
                  }}
                >
                  {day[0]}
                </span>
              ))}
            </div>

            <div style={{ position: "relative" }}>
              {/* Full-height Saturday / Sunday column strips behind the day numbers */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 2,
                  pointerEvents: "none",
                }}
              >
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
              </div>

              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {grid.map((date, index) => {
                  if (!date) return <span key={index} />
                  const dayEvents = getEventsForDate(date)
                  const dayHolidays = getHolidaysForDate(date)
                  const isToday = date.toDateString() === todayStr
                  const weekday = date.getDay()
                  const isHoliday = dayHolidays.length > 0
                  const hasEvents = dayEvents.length > 0
                  const isWeekend = weekday === 0 || weekday === 6
                  const color = hasEvents ? getCategoryColor(dayEvents[0].category) : null

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
              </div>
            </div>
          </button>
        )
      })}
    </div>
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
            <div
              style={{
                marginBottom: "var(--spacing-3)",
                padding: "var(--spacing-3)",
                backgroundColor: "var(--color-warning-bg)",
                border: "var(--border-1) solid var(--color-warning)",
                borderRadius: "var(--radius-card-sm)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--spacing-2)",
                  flexWrap: "wrap",
                  marginBottom: "var(--spacing-2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                  <Bell size={14} style={{ color: "var(--color-warning)" }} />
                  <span
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)",
                      color: "var(--color-text-heading)",
                    }}
                  >
                    {pendingProposalReminders.length} event(s) in proposal window
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
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
                    onMouseEnter={(eventNode) => {
                      eventNode.currentTarget.style.borderColor = "var(--color-warning)"
                    }}
                    onMouseLeave={(eventNode) => {
                      eventNode.currentTarget.style.borderColor = "var(--color-border-primary)"
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--font-size-xs)",
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--color-text-heading)",
                      }}
                    >
                      {event.title}
                    </span>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {formatDateRange(event.startDate, event.endDate)}
                    </span>
                    <FileText size={12} style={{ color: "var(--color-warning)" }} />
                  </div>
                ))}
              </div>
            </div>
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
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              <AlertTriangle size={14} style={{ color: "var(--color-info)" }} />
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <strong>{pendingProposalsForSelectedCalendar.length}</strong> pending proposal approval(s)
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowPendingProposalModal(true)}>
              View Proposals
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
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                <Receipt size={14} style={{ color: "var(--color-info)" }} />
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                  <strong>{pendingExpenseApprovalsForSelectedCalendar.length}</strong> pending bill approval(s)
                </span>
              </div>
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
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              <AlertTriangle size={14} style={{ color: "var(--color-warning)" }} />
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                <strong>{dateConflicts.length}</strong> date overlap(s) detected
              </span>
            </div>
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
              <DataTable
                data={filteredEvents}
                columns={eventTableColumns}
                onRowClick={handleEventRowClick}
                getRowId={(event) =>
                  event?._id ||
                  `${event?.title || "event"}-${event?.category || "na"}-${event?.startDate || "na"}-${event?.endDate || "na"}`
                }
              />
            )}
          </>
        )}

        {viewMode === "calendar" &&
          (loading ? (
            <div style={calendarCardStyle}>
              <div style={{ padding: "var(--spacing-6)" }}>
                <LoadingState message={`Loading calendar for ${selectedYear || "selected year"}...`} />
              </div>
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
              <div style={{ padding: "var(--spacing-6)" }}>
                <LoadingState message={`Loading calendar for ${selectedYear || "selected year"}...`} />
              </div>
            </div>
          ) : !calendar ? null : (
            <YearCalendarView
              months={yearMonths}
              getDaysInMonth={getDaysInMonth}
              getEventsForDate={getEventsForDate}
              getHolidaysForDate={getHolidaysForDate}
              filteredEvents={filteredEvents}
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
