import { Button, Input } from "hzero"
import { HStack, Modal, Surface, Text, VStack } from "@/components/ui"
import { Badge } from "@/components/ui/data-display"
import { Checkbox, Select } from "@/components/ui/form"
import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileText,
  History,
  Lock,
  NotebookText,
  Plus,
  Receipt,
  Unlock,
} from "lucide-react"
import ApprovalHistory from "@/components/gymkhana/ApprovalHistory"
import {
  EventDetailInfoRow,
  EventDetailSectionCard,
  EventFormFields,
  eventDetailMetaChipStyles,
  footerTabStyles,
  formLabelStyles,
} from "@/components/gymkhana/events-page/sharedPrimitives"

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
          onMouseEnter={(event) => {
            if (selectedYear !== year.academicYear) {
              event.currentTarget.style.backgroundColor = "var(--color-bg-hover)"
            }
          }}
          onMouseLeave={(event) => {
            if (selectedYear !== year.academicYear) {
              event.currentTarget.style.backgroundColor = "transparent"
            }
          }}
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
}) => (
  <Modal
    isOpen={isOpen}
    title={selectedEvent?.title || "Event Details"}
    width={640}
    closeButtonVariant="button"
    onClose={onClose}
  >
    {selectedEvent && isOpen && (() => {
      const proposalDueDate = getProposalDueDate(selectedEvent)
      const proposalDueText = proposalDueDate
        ? proposalDueDate.toLocaleDateString()
        : "Not available"
      const canOpenProposal =
        canViewEventsCapability &&
        selectedEvent.gymkhanaEventId &&
        (selectedEvent.proposalSubmitted ||
          ((isGS || isPresident) && canCreateEventsCapability))
      const canManageBills =
        canViewEventsCapability &&
        selectedEvent.gymkhanaEventId &&
        (selectedEvent.eventStatus === "proposal_approved" ||
          selectedEvent.eventStatus === "completed") &&
        ((isGS && canCreateEventsCapability) ||
          (isAdminLevel && canApproveEventsCapability))

      const proposalSummary = !selectedEvent.gymkhanaEventId
        ? "Available after calendar approval, or earlier if Admin enables early proposals for this calendar."
        : selectedEvent.proposalSubmitted
          ? "Proposal submitted and under review/approved."
          : `Proposal due on ${proposalDueText}.`

      const billsSummary = !selectedEvent.gymkhanaEventId
        ? "Available after calendar approval and event record generation."
        : selectedEvent.eventStatus !== "proposal_approved" &&
            selectedEvent.eventStatus !== "completed"
          ? "Bills open after final proposal approval."
          : "Upload and review bill PDFs for this event."

      const eventStatusLabel = selectedEvent.eventStatus
        ? selectedEvent.eventStatus.replace(/_/g, " ")
        : "calendar event"

      return (
        <VStack gap={4}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--spacing-2)",
              flexWrap: "wrap",
              paddingBottom: "var(--spacing-3)",
              borderBottom: "var(--border-1) solid var(--color-border-primary)",
            }}
          >
            <HStack gap={2} align="center" wrap>
              <Badge style={getCategoryBadgeStyle(selectedEvent.category)}>
                {categoryLabels[selectedEvent.category] || selectedEvent.category}
              </Badge>
              <Badge variant={getEventStatusVariant(selectedEvent.eventStatus)}>
                {eventStatusLabel}
              </Badge>
              <span style={eventDetailMetaChipStyles}>
                <CalendarDays size={12} />
                {formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}
              </span>
                <span style={eventDetailMetaChipStyles}>
                  <CircleDollarSign size={12} />₹
                  {Number(selectedEvent.estimatedBudget || 0).toLocaleString()}
                </span>
              </HStack>
            {(canEditEvent || canRequestEventAmendment) && (
              <HStack gap={2} wrap>
                {canEditEvent && (
                  <Button size="sm" variant="secondary" onClick={() => onEditEvent?.(selectedEvent)}>
                    Edit Event
                  </Button>
                )}
                {!canEditEvent && canRequestEventAmendment && (
                  <Button size="sm" variant="secondary" onClick={() => onRequestAmendment?.(selectedEvent)}>
                    Request Amendment
                  </Button>
                )}
              </HStack>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
            <EventDetailSectionCard
              icon={CalendarDays}
              title="Schedule"
              accentColor="var(--color-info)"
            >
              <VStack gap={2}>
                <EventDetailInfoRow
                  label="Start"
                  value={
                    selectedEvent.startDate
                      ? new Date(selectedEvent.startDate).toLocaleDateString()
                      : "TBD"
                  }
                />
                <EventDetailInfoRow
                  label="End"
                  value={
                    selectedEvent.endDate
                      ? new Date(selectedEvent.endDate).toLocaleDateString()
                      : "TBD"
                  }
                />
                <EventDetailInfoRow label="Proposal Due" value={proposalDueText} />
                <EventDetailInfoRow
                  label="Budget"
                  value={`₹${Number(selectedEvent.estimatedBudget || 0).toLocaleString()}`}
                />
              </VStack>
            </EventDetailSectionCard>

            {((isGymkhanaRole && canCreateEventsCapability) ||
              (isAdminLevel && canApproveEventsCapability)) && (
              <EventDetailSectionCard
                icon={Clock3}
                title="Workflow"
                accentColor="var(--color-primary)"
              >
                <VStack gap={2}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--spacing-2)",
                      padding: "var(--spacing-2)",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--color-bg-secondary)",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Text size="xs" weight="semibold" color="heading" style={{ margin: 0 }}>
                        Proposal
                      </Text>
                      <Text size="xs" color="muted" style={{ margin: 0 }}>
                        {proposalSummary}
                      </Text>
                    </div>
                    {canOpenProposal && (
                      <Button size="sm" variant="primary" onClick={() => openProposalModal(selectedEvent)}>
                        <FileText size={12} />{" "}
                        {selectedEvent.proposalSubmitted ? "View" : "Submit"}
                      </Button>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--spacing-2)",
                      padding: "var(--spacing-2)",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--color-bg-secondary)",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Text size="xs" weight="semibold" color="heading" style={{ margin: 0 }}>
                        Bills
                      </Text>
                      <Text size="xs" color="muted" style={{ margin: 0 }}>
                        {billsSummary}
                      </Text>
                    </div>
                    {canManageBills && (
                      <Button size="sm" variant="primary" onClick={() => openExpenseModal(selectedEvent)}>
                        <Receipt size={12} /> Manage
                      </Button>
                    )}
                  </div>
                </VStack>
              </EventDetailSectionCard>
            )}
          </div>

          <EventDetailSectionCard
            icon={NotebookText}
            title="Description"
            accentColor="var(--color-text-secondary)"
          >
            <Text as="div" color="body" size="sm" leading="1.6" style={{ whiteSpace: "pre-wrap" }}>
              {selectedEvent.description || "No description provided."}
            </Text>
          </EventDetailSectionCard>
        </VStack>
      )
    })()}
  </Modal>
)

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
            Configured category caps total: ₹{Object.values(settingsForm?.budgetCaps || {}).reduce((sum, value) => {
              if (value === null || value === undefined || value === "") return sum
              const parsedValue = Number(value)
              return Number.isFinite(parsedValue) && parsedValue >= 0 ? sum + parsedValue : sum
            }, 0).toLocaleString()}
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
                  Current allocated budget: ₹{allocated.toLocaleString()}
                </Text>
              </VStack>
            )
          })}
        </div>
      </div>
    </VStack>
  </Modal>
)
