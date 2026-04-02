import { Button, DataTable, Tabs } from "czero/react"
import PageHeader from "@/components/common/PageHeader"
import { EmptyState, LoadingState } from "@/components/ui/feedback"
import { StatCards } from "@/components/ui/data-display"
import { ToggleButtonGroup } from "@/components/ui"
import {
  AlertTriangle,
  Bell,
  CalendarDays,
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
import {
  CALENDAR_WEEKDAY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  formatDateRange,
} from "@/components/gymkhana/events-page/shared"

const viewOptions = [
  { value: "list", label: "List", icon: <List size={14} /> },
  { value: "calendar", label: "Calendar", icon: <CalendarDays size={14} /> },
]

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
              columns={5}
              loading={loading || !calendar}
              loadingCount={5}
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
            <div
              style={{
                backgroundColor: "var(--color-bg-primary)",
                borderRadius: "var(--radius-card)",
                border: "var(--border-1) solid var(--color-border-primary)",
                padding: "var(--spacing-6)",
              }}
            >
              <LoadingState message={`Loading calendar for ${selectedYear || "selected year"}...`} />
            </div>
          ) : !calendar ? null : (
            <div
              style={{
                backgroundColor: "var(--color-bg-primary)",
                borderRadius: "var(--radius-card)",
                border: "var(--border-1) solid var(--color-border-primary)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--spacing-3) var(--spacing-4)",
                  backgroundColor: "var(--color-bg-secondary)",
                  borderBottom: "var(--border-1) solid var(--color-border-primary)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-1)" }}>
                  <button
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1)
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-sm)",
                      border: "var(--border-1) solid var(--color-border-primary)",
                      backgroundColor: "var(--color-bg-primary)",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1)
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-sm)",
                      border: "var(--border-1) solid var(--color-border-primary)",
                      backgroundColor: "var(--color-bg-primary)",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <span
                  style={{
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-heading)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {calendarMonth.toLocaleString("default", { month: "long" })}{" "}
                  <span
                    style={{
                      color: "var(--color-text-muted)",
                      fontWeight: "var(--font-weight-normal)",
                    }}
                  >
                    {calendarMonth.getFullYear()}
                  </span>
                </span>

                <button
                  onClick={() => setCalendarMonth(new Date())}
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-medium)",
                    padding: "var(--spacing-1) var(--spacing-2)",
                    borderRadius: "var(--radius-sm)",
                    border: "var(--border-1) solid var(--color-border-primary)",
                    backgroundColor: "var(--color-bg-primary)",
                    cursor: "pointer",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Today
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-4)",
                  padding: "var(--spacing-2) var(--spacing-4)",
                  borderBottom: "var(--border-1) solid var(--color-border-primary)",
                  flexWrap: "wrap",
                  backgroundColor: "var(--color-bg-primary)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-muted)",
                    fontWeight: "var(--font-weight-medium)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Legend
                </span>
                {CATEGORY_ORDER.map((category) => (
                  <span
                    key={category}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--spacing-1)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: CATEGORY_COLORS[category],
                        flexShrink: 0,
                      }}
                    />
                    {CATEGORY_LABELS[category]}
                  </span>
                ))}
                <span
                  style={{
                    width: 1,
                    height: 12,
                    backgroundColor: "var(--color-border-primary)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--spacing-1)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      backgroundColor: "var(--color-warning)",
                      flexShrink: 0,
                    }}
                  />
                  Holiday
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--spacing-1)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  />
                  Today
                </span>
              </div>

              <div style={{ padding: "var(--spacing-3)" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 1,
                    marginBottom: "var(--spacing-1)",
                  }}
                >
                  {CALENDAR_WEEKDAY_LABELS.map((day, index) => (
                    <div
                      key={day}
                      style={{
                        textAlign: "center",
                        padding: "var(--spacing-1) 0",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: "var(--font-weight-semibold)",
                        color:
                          index === 5
                            ? "var(--color-primary)"
                            : index === 6
                              ? "var(--color-danger)"
                              : "var(--color-text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
                  {getDaysInMonth(calendarMonth).map((date, index) => {
                    const dayEvents = date ? getEventsForDate(date) : []
                    const dayHolidays = date ? getHolidaysForDate(date) : []
                    const isToday = date?.toDateString() === new Date().toDateString()
                    const weekday = date?.getDay()
                    const isSaturday = weekday === 6
                    const isSunday = weekday === 0
                    const isHoliday = dayHolidays.length > 0
                    const shownEvents = dayEvents.slice(0, isHoliday ? 1 : 2)
                    const remainingEventCount = dayEvents.length - shownEvents.length

                    return (
                      <div
                        key={index}
                        style={{
                          minHeight: 88,
                          padding: "var(--spacing-1)",
                          backgroundColor: !date
                            ? "transparent"
                            : isSunday
                              ? "rgba(239,68,68,0.07)"
                              : isSaturday
                                ? "rgba(59,130,246,0.07)"
                                : "var(--color-bg-primary)",
                          border: "var(--border-1) solid",
                          borderColor: !date
                            ? "transparent"
                            : isToday
                              ? "var(--color-primary)"
                              : "var(--color-border-primary)",
                          borderRadius: "var(--radius-sm)",
                          position: "relative",
                        }}
                      >
                        {date && (
                          <>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                marginBottom: "var(--spacing-0-5)",
                              }}
                            >
                              {isHoliday && (
                                <span
                                  title={dayHolidays[0].title}
                                  style={{
                                    flex: 1,
                                    fontSize: 9,
                                    fontWeight: "var(--font-weight-medium)",
                                    color: "#92400e",
                                    backgroundColor: "#fef3c7",
                                    padding: "1px var(--spacing-1)",
                                    borderRadius: "var(--radius-xs)",
                                    marginRight: "var(--spacing-1)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {dayHolidays[0].title}
                                </span>
                              )}
                              <span
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: "var(--radius-full)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  fontSize: "var(--font-size-xs)",
                                  fontWeight: isToday
                                    ? "var(--font-weight-bold)"
                                    : "var(--font-weight-normal)",
                                  color: isToday
                                    ? "white"
                                    : isSunday
                                      ? "var(--color-danger)"
                                      : isSaturday
                                        ? "var(--color-primary)"
                                        : "var(--color-text-body)",
                                  backgroundColor: isToday ? "var(--color-primary)" : "transparent",
                                }}
                              >
                                {date.getDate()}
                              </span>
                            </div>

                            {shownEvents.map((event, eventIndex) => (
                              <div
                                key={eventIndex}
                                onClick={() => handleEventClick(event)}
                                title={event.title}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 10,
                                  padding: "2px var(--spacing-1)",
                                  marginBottom: 2,
                                  backgroundColor: `${CATEGORY_COLORS[event.category]}15`,
                                  borderLeft: `2.5px solid ${CATEGORY_COLORS[event.category]}`,
                                  borderRadius: "0 var(--radius-xs) var(--radius-xs) 0",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                  color: "var(--color-text-body)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                {event.title}
                              </div>
                            ))}

                            {remainingEventCount > 0 && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "var(--color-text-muted)",
                                  fontWeight: "var(--font-weight-medium)",
                                  paddingLeft: "var(--spacing-1)",
                                }}
                              >
                                +{remainingEventCount} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
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
