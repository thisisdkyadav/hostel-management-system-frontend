import { createElement } from "react"
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Grid,
  HStack,
  Input,
  Modal,
  Select,
  Surface,
  Text,
  VStack,
} from "hzero"
import { formatINR, formatIndianDate } from "@/utils/formatters"
import { isProposalWindowOpen } from "@/components/gymkhana/events-page/shared"
import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileText,
  History,
  Lock,
  NotebookText,
  Pencil,
  Plus,
  Receipt,
  Unlock,
} from "lucide-react"
import ApprovalHistory from "@/components/gymkhana/ApprovalHistory"
import {
  EventDetailSectionCard,
  EventFormFields,
  footerTabStyles,
  formLabelStyles,
} from "@/components/gymkhana/events-page/sharedPrimitives"

const kickerStyle = {
  letterSpacing: "0.12em",
  textTransform: "uppercase",
}

const iconWellStyle = {
  width: "var(--spacing-10)",
  height: "var(--spacing-10)",
  borderRadius: "var(--radius-lg)",
  backgroundColor: "var(--color-primary-bg)",
  color: "var(--color-primary)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}

const EventIconWell = ({ icon }) => (
  <div style={iconWellStyle} aria-hidden="true">
    {icon ? createElement(icon, { size: 18 }) : null}
  </div>
)

const EventFact = ({ icon, label, value, hint = null }) => (
  <Surface bg="secondary" padding={3} radius="card-sm">
    <HStack gap={2} align="center">
      {icon ? createElement(icon, {
        size: 14,
        style: { color: "var(--color-primary)", flexShrink: 0 },
        "aria-hidden": true,
      }) : null}
      <Text as="span" size="2xs" weight="semibold" color="muted" style={kickerStyle}>
        {label}
      </Text>
    </HStack>
    <Text
      as="div"
      size="sm"
      weight="semibold"
      color={value ? "heading" : "muted"}
      italic={!value}
      style={{ marginTop: "var(--spacing-1-5)" }}
    >
      {value || "Not set"}
    </Text>
    {hint ? (
      <Text as="div" size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
        {hint}
      </Text>
    ) : null}
  </Surface>
)

const EventDoor = ({ icon, kicker, title, body, action = null }) => (
  <Surface bg="secondary" padding={4} radius="card-sm">
    <HStack gap={3} align="start">
      <EventIconWell icon={icon} />
      <VStack gap={1} style={{ minWidth: 0, flex: 1 }}>
        <Text as="div" size="2xs" weight="semibold" color="muted" style={kickerStyle}>
          {kicker}
        </Text>
        <Text as="div" size="md" weight="semibold" color="heading">
          {title}
        </Text>
        <Text as="div" size="sm" color="muted" leading={1.55}>
          {body}
        </Text>
        {action ? <div style={{ marginTop: "var(--spacing-2)" }}>{action}</div> : null}
      </VStack>
    </HStack>
  </Surface>
)

const EVENT_STAGES = [
  { id: "calendar", label: "Calendar" },
  { id: "proposal", label: "Proposal" },
  { id: "bills", label: "Bills" },
  { id: "done", label: "Done" },
]

const eventStageIndex = (event) => {
  if (!event?.gymkhanaEventId) return 0
  if (event.eventStatus === "completed") return 3
  if (event.eventStatus === "proposal_approved") return 2
  return 1
}

const EventStageRail = ({ event }) => {
  const current = eventStageIndex(event)
  return (
    <HStack gap={2} align="center" wrap>
      {EVENT_STAGES.map((stage, index) => {
        const reached = index <= current
        return (
          <HStack key={stage.id} gap={2} align="center" style={{ flex: index < EVENT_STAGES.length - 1 ? 1 : undefined, minWidth: 0 }}>
            <Surface
              bg={reached ? "brand" : "secondary"}
              padding={2}
              radius="full"
              style={{ flexShrink: 0 }}
            >
              <Text as="span" size="xs" weight="semibold" color={reached ? "primary" : "muted"}>
                {stage.label}
              </Text>
            </Surface>
            {index < EVENT_STAGES.length - 1 ? (
              <div
                aria-hidden="true"
                style={{
                  flex: 1,
                  minWidth: "var(--spacing-4)",
                  height: "var(--border-1)",
                  backgroundColor: reached && index < current
                    ? "var(--color-primary)"
                    : "var(--color-border-primary)",
                }}
              />
            ) : null}
          </HStack>
        )
      })}
    </HStack>
  )
}

const eventJourney = (event) => {
  if (!event) {
    return { kicker: "Event", line: "Open an event from the calendar to see it." }
  }
  if (event.eventStatus === "cancelled") {
    return { kicker: "Cancelled", line: "This date is no longer happening." }
  }
  if (!event.gymkhanaEventId) {
    return {
      kicker: "On the calendar",
      line: "The proposal opens after calendar approval, or earlier if Admin lets writing start.",
    }
  }
  switch (event.eventStatus) {
    case "proposal_approved":
      return { kicker: "Proposal approved", line: "The case is closed. Bills are the last paper." }
    case "proposal_submitted":
      return { kicker: "Proposal in review", line: "The proposal is in — waiting for a yes." }
    case "completed":
      return { kicker: "Completed", line: "The programme has been run." }
    case "proposal_pending":
    case "upcoming":
    default:
      return {
        kicker: "Waiting for the proposal",
        line: "Dates are set. The proposal is the next page a reviewer should meet.",
      }
  }
}

const inclusiveDayCount = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  const days = Math.round((endUtc - startUtc) / 86400000) + 1
  return days > 0 ? days : null
}

export const GymkhanaCalendarFooterTabs = ({
  years,
  selectedYear,
  onSelectYear,
  canCreateCalendar,
  onCreateCalendar,
}) => (
  <div style={footerTabStyles.tabsBar}>
    <div style={footerTabStyles.tabsList}>
      {years.map((year) => (
        <button
          key={year._id || year.academicYear}
          onClick={() => onSelectYear(year.academicYear)}
          style={{
            ...footerTabStyles.tab,
            ...(selectedYear === year.academicYear ? footerTabStyles.tabActive : {}),
          }}
          // Only the inactive tabs react, which is a selector, not a guard
          // repeated inside two handlers.
          className={selectedYear === year.academicYear ? undefined : "hover:bg-[var(--color-bg-hover)]"}
        >
          {year.academicYear}
        </button>
      ))}
      {canCreateCalendar && (
        <button
          onClick={onCreateCalendar}
          style={{ ...footerTabStyles.tab, ...footerTabStyles.addTab }}
        >
          <Plus size={12} />
          New
        </button>
      )}
    </div>
  </div>
)

export const GymkhanaCreateCalendarModal = ({
  isOpen,
  onClose,
  newAcademicYear,
  onAcademicYearChange,
  availableYearsForCreation,
  onCreateCalendar,
  submitting,
}) => (
  <Modal
    isOpen={isOpen}
    title="Create New Calendar"
    width={460}
    onClose={onClose}
    footer={
      <HStack gap={2}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onCreateCalendar} loading={submitting} disabled={!newAcademicYear}>
          Create Calendar
        </Button>
      </HStack>
    }
  >
    <VStack gap={3}>
      <Text color="muted" size="sm" style={{ margin: 0 }}>
        Select the academic year for the new activity calendar.
      </Text>
      <label style={formLabelStyles} htmlFor="newAcademicYear">
        Academic Year
      </label>
      <Select
        id="newAcademicYear"
        name="newAcademicYear"
        value={newAcademicYear}
        onChange={(event) => onAcademicYearChange(event.target.value)}
        options={availableYearsForCreation}
        placeholder="Select academic year"
      />
    </VStack>
  </Modal>
)

export const GymkhanaEventDetailsModal = ({
  isOpen,
  selectedEvent,
  onClose,
  canEditEvent,
  canRequestEventAmendment,
  canViewEventsCapability,
  isGS,
  isPresident,
  isGymkhanaRole,
  isAdminLevel,
  canCreateEventsCapability,
  canApproveEventsCapability,
  openProposalModal,
  openExpenseModal,
  getProposalDueDate,
  getCategoryBadgeStyle,
  getEventStatusVariant,
  formatDateRange,
  categoryLabels,
  onEditEvent,
  onRequestAmendment,
}) => {
  const journey = eventJourney(selectedEvent)
  const proposalDueDate = selectedEvent ? getProposalDueDate(selectedEvent) : null
  const proposalDueText = proposalDueDate ? formatIndianDate(proposalDueDate) : "Not available"
  const dayCount = selectedEvent
    ? inclusiveDayCount(selectedEvent.startDate, selectedEvent.endDate)
    : null
  const eventStatusLabel = selectedEvent?.eventStatus
    ? selectedEvent.eventStatus.replace(/_/g, " ")
    : "calendar event"
  const canSeeWorkflow =
    (isGymkhanaRole && canCreateEventsCapability) ||
    (isAdminLevel && canApproveEventsCapability)
  const canOpenProposal = Boolean(
    selectedEvent &&
      canViewEventsCapability &&
      selectedEvent.gymkhanaEventId &&
      (selectedEvent.proposalSubmitted || ((isGS || isPresident) && canCreateEventsCapability))
  )
  const canManageBills = Boolean(
    selectedEvent &&
      canViewEventsCapability &&
      selectedEvent.gymkhanaEventId &&
      (selectedEvent.eventStatus === "proposal_approved" ||
        selectedEvent.eventStatus === "completed") &&
      ((isGS && canCreateEventsCapability) || (isAdminLevel && canApproveEventsCapability))
  )
  const proposalWindowOpen = Boolean(
    selectedEvent && isProposalWindowOpen(selectedEvent) && !selectedEvent.proposalSubmitted
  )

  const proposalSummary = !selectedEvent?.gymkhanaEventId
    ? "The proposal opens after calendar approval, or earlier if Admin lets this calendar start writing."
    : selectedEvent.proposalSubmitted
      ? "The proposal is in — under review, or already approved."
      : `The proposal window ${proposalWindowOpen ? "is open" : "opens"} ${proposalDueText}.`

  const billsSummary = !selectedEvent?.gymkhanaEventId
    ? "Bills wait until the calendar is approved and this event exists as a record."
    : selectedEvent.eventStatus !== "proposal_approved" &&
        selectedEvent.eventStatus !== "completed"
      ? "Bills open after the proposal is approved."
      : "Upload and review bill PDFs for this event."

  return (
    <Modal
      isOpen={isOpen}
      title={selectedEvent?.title || "Event"}
      description={selectedEvent ? journey.line : undefined}
      size="full"
      closeButtonVariant="button"
      onClose={onClose}
      footer={
        canEditEvent || canRequestEventAmendment ? (
          <HStack gap={2} align="center">
            {canEditEvent ? (
              <Button variant="secondary" onClick={() => onEditEvent?.(selectedEvent)}>
                <Pencil size={16} /> Edit event
              </Button>
            ) : null}
            {!canEditEvent && canRequestEventAmendment ? (
              <Button variant="secondary" onClick={() => onRequestAmendment?.(selectedEvent)}>
                Request amendment
              </Button>
            ) : null}
          </HStack>
        ) : null
      }
    >
      {selectedEvent ? (
        <div
          className="grid grid-cols-1 xl:grid-cols-3"
          style={{ gap: "var(--spacing-4)", alignItems: "start" }}
        >
          <VStack gap={4} className="xl:col-span-2">
            <HStack gap={2} align="center" wrap>
              <Badge style={getCategoryBadgeStyle(selectedEvent.category)}>
                {categoryLabels[selectedEvent.category] || selectedEvent.category}
              </Badge>
              <Badge variant={getEventStatusVariant(selectedEvent.eventStatus)}>
                {eventStatusLabel}
              </Badge>
            </HStack>

            {selectedEvent.eventStatus === "cancelled" ? (
              <Alert type="warning" title="Cancelled">
                This date is no longer happening.
              </Alert>
            ) : (
              <EventStageRail event={selectedEvent} />
            )}

            {canOpenProposal && proposalWindowOpen ? (
              <Alert type="warning" title="The proposal is still waiting">
                The window is open. A reviewer should meet a programme, not an empty date on the
                calendar.
              </Alert>
            ) : null}

            <EventDetailSectionCard
              icon={NotebookText}
              title="The programme"
              accentColor="var(--color-primary)"
            >
              {selectedEvent.description?.trim() ? (
                <Text as="div" color="body" size="md" leading={1.65} style={{ whiteSpace: "pre-wrap" }}>
                  {selectedEvent.description}
                </Text>
              ) : (
                <EmptyState
                  icon={NotebookText}
                  title="No story yet"
                  description="When this event is edited, say why the date exists — a reviewer should feel the programme from here."
                  variant="block"
                />
              )}
            </EventDetailSectionCard>

            <Grid cols={{ base: 1, sm: 3 }} gap={3}>
              <EventFact
                icon={CalendarDays}
                label="When"
                value={formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}
                hint={
                  dayCount
                    ? `${dayCount} day${dayCount === 1 ? "" : "s"} on the calendar`
                    : null
                }
              />
              <EventFact
                icon={CircleDollarSign}
                label="Calendar budget"
                value={formatINR(selectedEvent.estimatedBudget)}
              />
              <EventFact
                icon={FileText}
                label="Proposal window"
                value={proposalDueText}
                hint={
                  selectedEvent.proposalSubmitted
                    ? "The proposal is already in"
                    : proposalWindowOpen
                      ? "Open now — write the proposal"
                      : "Opens on this date"
                }
              />
            </Grid>
          </VStack>

          <VStack gap={4}>
            <EventDetailSectionCard
              icon={Clock3}
              title="Where it stands"
              accentColor="var(--color-info)"
            >
              <Surface bg="brand" padding={3} radius="card-sm">
                <Text as="div" size="2xs" color="muted" style={kickerStyle}>
                  {journey.kicker}
                </Text>
                <Text
                  as="div"
                  size="md"
                  weight="semibold"
                  color="heading"
                  style={{ marginTop: "var(--spacing-1)" }}
                >
                  {eventStatusLabel}
                </Text>
                <Text
                  as="div"
                  size="xs"
                  color="muted"
                  style={{ marginTop: "var(--spacing-1)" }}
                >
                  {journey.line}
                </Text>
              </Surface>
            </EventDetailSectionCard>

            {canSeeWorkflow ? (
              <EventDetailSectionCard
                icon={FileText}
                title="Next paper"
                accentColor="var(--color-primary)"
              >
                <VStack gap={3}>
                  <EventDoor
                    icon={FileText}
                    kicker="Proposal"
                    title={
                      selectedEvent.proposalSubmitted
                        ? "Open the proposal"
                        : "Write the proposal"
                    }
                    body={proposalSummary}
                    action={
                      canOpenProposal ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => openProposalModal(selectedEvent)}
                        >
                          <FileText size={14} />{" "}
                          {selectedEvent.proposalSubmitted ? "Open proposal" : "Write proposal"}
                        </Button>
                      ) : null
                    }
                  />
                  <EventDoor
                    icon={Receipt}
                    kicker="Bills"
                    title={canManageBills ? "Manage bills" : "Bills later"}
                    body={billsSummary}
                    action={
                      canManageBills ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => openExpenseModal(selectedEvent)}
                        >
                          <Receipt size={14} /> Manage bills
                        </Button>
                      ) : null
                    }
                  />
                </VStack>
              </EventDetailSectionCard>
            ) : null}
          </VStack>
        </div>
      ) : null}
    </Modal>
  )
}

export const GymkhanaEventEditorModal = ({
  isOpen,
  onClose,
  selectedEvent,
  eventForm,
  handleEventFormChange,
  categoryOptions,
  isDateRangeOrdered,
  overlapCheckInProgressForCurrentDates,
  dateOverlapInfo,
  overlapCheckKey,
  retryDateOverlapCheck,
  overlapCheckCompletedForCurrentDates,
  formatDateRange,
  submitting,
  canSaveEventInModal,
  onSave,
}) => (
  <Modal
    isOpen={isOpen}
    title={selectedEvent ? "Edit Event" : "Add Event"}
    width={640}
    onClose={onClose}
    footer={
      <HStack gap={2}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} loading={submitting} disabled={!canSaveEventInModal}>
          Save
        </Button>
      </HStack>
    }
  >
    {isOpen && (
      <EventFormFields
        eventForm={eventForm}
        handleEventFormChange={handleEventFormChange}
        categoryOptions={categoryOptions}
        isDateRangeOrdered={isDateRangeOrdered}
        overlapCheckInProgressForCurrentDates={overlapCheckInProgressForCurrentDates}
        dateOverlapInfo={dateOverlapInfo}
        overlapCheckKey={overlapCheckKey}
        retryDateOverlapCheck={retryDateOverlapCheck}
        overlapCheckCompletedForCurrentDates={overlapCheckCompletedForCurrentDates}
        formatDateRange={formatDateRange}
      />
    )}
  </Modal>
)

export const GymkhanaAmendmentModal = ({
  isOpen,
  onClose,
  eventForm,
  handleEventFormChange,
  categoryOptions,
  isDateRangeOrdered,
  overlapCheckInProgressForCurrentDates,
  dateOverlapInfo,
  overlapCheckKey,
  retryDateOverlapCheck,
  overlapCheckCompletedForCurrentDates,
  formatDateRange,
  amendmentReason,
  setAmendmentReason,
  submitting,
  canSubmitAmendmentInModal,
  onSubmit,
}) => (
  <Modal
    isOpen={isOpen}
    title="Request Amendment"
    width={640}
    onClose={onClose}
    footer={
      <HStack gap={2}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          loading={submitting}
          disabled={!canSubmitAmendmentInModal}
        >
          Submit
        </Button>
      </HStack>
    }
  >
    {isOpen && (
      <EventFormFields
        eventForm={eventForm}
        handleEventFormChange={handleEventFormChange}
        categoryOptions={categoryOptions}
        isDateRangeOrdered={isDateRangeOrdered}
        overlapCheckInProgressForCurrentDates={overlapCheckInProgressForCurrentDates}
        dateOverlapInfo={dateOverlapInfo}
        overlapCheckKey={overlapCheckKey}
        retryDateOverlapCheck={retryDateOverlapCheck}
        overlapCheckCompletedForCurrentDates={overlapCheckCompletedForCurrentDates}
        formatDateRange={formatDateRange}
        showAmendmentReason
        amendmentReason={amendmentReason}
        setAmendmentReason={setAmendmentReason}
      />
    )}
  </Modal>
)

export const GymkhanaHistoryModal = ({ isOpen, onClose, calendarId }) => (
  <Modal
    isOpen={isOpen}
    title="Approval History"
    width={640}
    onClose={onClose}
    footer={
      <Button size="sm" variant="secondary" onClick={onClose}>
        Close
      </Button>
    }
  >
    {calendarId ? <ApprovalHistory calendarId={calendarId} /> : null}
  </Modal>
)

export const GymkhanaSettingsModal = ({
  isOpen,
  onClose,
  calendar,
  budgetSummary,
  settingsForm,
  submitting,
  onLock,
  onUnlock,
  onSettingsChange,
  onBudgetCapChange,
  onSaveSettings,
}) => (
  <Modal
    isOpen={isOpen}
    title="Calendar Settings"
    width={560}
    onClose={onClose}
    footer={
      <HStack gap={2} justify="end">
        <Button size="sm" variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button size="sm" onClick={onSaveSettings} loading={submitting}>
          Save Settings
        </Button>
      </HStack>
    }
  >
    <VStack gap={3}>
      <Text as="span" size="xs" color="muted">
        Configure lock state, proposal rules, and category budget caps for {calendar?.academicYear}
      </Text>
      <div
        style={{
          borderRadius: "var(--radius-card-sm)",
          padding: "var(--spacing-3)",
          backgroundColor: "var(--color-bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--spacing-2)",
        }}
      >
        <div>
          <Text as="span" weight="medium" size="sm" color="heading">
            Calendar Lock
          </Text>
          <Text size="xs" color="muted" style={{ margin: 0 }}>
            {calendar?.isLocked ? "Locked. GS cannot edit." : "Unlocked. GS can edit."}
          </Text>
        </div>
        {calendar?.isLocked ? (
          <Button size="sm" variant="success" onClick={onUnlock} loading={submitting}>
            <Unlock size={14} /> Unlock
          </Button>
        ) : (
          <Button size="sm" variant="warning" onClick={onLock} loading={submitting}>
            <Lock size={14} /> Lock
          </Button>
        )}
      </div>
      <Surface bg="secondary" padding={3} radius="card-sm">
        <Checkbox
          checked={Boolean(settingsForm?.allowProposalBeforeApproval)}
          disabled={submitting}
          label="Allow proposal submission before calendar approval"
          description="If enabled, proposals can be submitted and approved even while this calendar is still draft or pending approval."
          onChange={(event) => onSettingsChange?.("allowProposalBeforeApproval", event.target.checked)}
        />
      </Surface>
      <div
        style={{
          borderRadius: "var(--radius-card-sm)",
          padding: "var(--spacing-3)",
          backgroundColor: "var(--color-bg-secondary)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-1)",
        }}
      >
        <label style={formLabelStyles} htmlFor="calendar-overall-budget">
          Overall Calendar Budget Cap
        </label>
        <Input
          id="calendar-overall-budget"
          type="number"
          min="0"
          placeholder="No overall limit"
          value={settingsForm?.overallBudget ?? ""}
          disabled={submitting}
          onChange={(event) => onSettingsChange?.("overallBudget", event.target.value)}
        />
        <Text size="xs" color="muted" style={{ margin: 0 }}>
          Leave blank to keep no overall cap. The total configured category caps cannot exceed this value.
        </Text>
      </div>
      <div
        style={{
          borderRadius: "var(--radius-card-sm)",
          padding: "var(--spacing-3)",
          backgroundColor: "var(--color-bg-secondary)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-3)",
        }}
      >
        <div>
          <Text as="span" weight="medium" size="sm" color="heading">
            Category Budget Caps
          </Text>
          <Text size="xs" color="muted" style={{ margin: 0 }}>
            Leave a field blank to keep that category unlimited. Event saves will be blocked once a category total exceeds its cap.
            <br />
            Configured category caps total: {formatINR(Object.values(settingsForm?.budgetCaps || {}).reduce((sum, value) => {
              if (value === null || value === undefined || value === "") return sum
              const parsedValue = Number(value)
              return Number.isFinite(parsedValue) && parsedValue >= 0 ? sum + parsedValue : sum
            }, 0))}
          </Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
          {(settingsForm?.categoryDefinitions || []).map((category) => {
            const allocated = Number(budgetSummary?.byCategory?.[category.key] || 0)
            return (
              <VStack gap={1} key={category.key}>
                <label style={formLabelStyles} htmlFor={`budget-cap-${category.key}`}>
                  {category.label} Cap
                </label>
                <Input
                  id={`budget-cap-${category.key}`}
                  type="number"
                  min="0"
                  placeholder="No limit"
                  value={settingsForm?.budgetCaps?.[category.key] ?? ""}
                  disabled={submitting}
                  onChange={(event) => onBudgetCapChange?.(category.key, event.target.value)}
                />
                <Text as="span" size="xs" color="muted">
                  Current allocated budget: {formatINR(allocated)}
                </Text>
              </VStack>
            )
          })}
        </div>
      </div>
    </VStack>
  </Modal>
)
