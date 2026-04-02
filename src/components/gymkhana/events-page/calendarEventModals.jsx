import { Button, Modal } from "czero/react"
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
      <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onCreateCalendar} loading={submitting} disabled={!newAcademicYear}>
          Create Calendar
        </Button>
      </div>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
      <p
        style={{
          margin: 0,
          color: "var(--color-text-muted)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        Select the academic year for the new activity calendar.
      </p>
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
    </div>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-2)",
                flexWrap: "wrap",
              }}
            >
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
              </div>
            {(canEditEvent || canRequestEventAmendment) && (
              <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
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
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
            <EventDetailSectionCard
              icon={CalendarDays}
              title="Schedule"
              accentColor="var(--color-info)"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
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
              </div>
            </EventDetailSectionCard>

            {((isGymkhanaRole && canCreateEventsCapability) ||
              (isAdminLevel && canApproveEventsCapability)) && (
              <EventDetailSectionCard
                icon={Clock3}
                title="Workflow"
                accentColor="var(--color-primary)"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
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
                      <p
                        style={{
                          margin: 0,
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--color-text-heading)",
                        }}
                      >
                        Proposal
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {proposalSummary}
                      </p>
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
                      <p
                        style={{
                          margin: 0,
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--color-text-heading)",
                        }}
                      >
                        Bills
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {billsSummary}
                      </p>
                    </div>
                    {canManageBills && (
                      <Button size="sm" variant="primary" onClick={() => openExpenseModal(selectedEvent)}>
                        <Receipt size={12} /> Manage
                      </Button>
                    )}
                  </div>
                </div>
              </EventDetailSectionCard>
            )}
          </div>

          <EventDetailSectionCard
            icon={NotebookText}
            title="Description"
            accentColor="var(--color-text-secondary)"
          >
            <div
              style={{
                color: "var(--color-text-body)",
                fontSize: "var(--font-size-sm)",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedEvent.description || "No description provided."}
            </div>
          </EventDetailSectionCard>
        </div>
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
      <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} loading={submitting} disabled={!canSaveEventInModal}>
          Save
        </Button>
      </div>
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
      <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
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
      </div>
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
  submitting,
  onLock,
  onUnlock,
  onToggleAllowProposalBeforeApproval,
}) => (
  <Modal
    isOpen={isOpen}
    title="Calendar Settings"
    width={480}
    onClose={onClose}
    footer={
      <Button size="sm" variant="secondary" onClick={onClose}>
        Close
      </Button>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
        Configure lock state and proposal rules for {calendar?.academicYear}
      </span>
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
          <span
            style={{
              fontWeight: "var(--font-weight-medium)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-heading)",
            }}
          >
            Calendar Lock
          </span>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            {calendar?.isLocked ? "Locked. GS cannot edit." : "Unlocked. GS can edit."}
          </p>
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
      <div
        style={{
          borderRadius: "var(--radius-card-sm)",
          padding: "var(--spacing-3)",
          backgroundColor: "var(--color-bg-secondary)",
        }}
      >
        <Checkbox
          checked={Boolean(calendar?.allowProposalBeforeApproval)}
          disabled={submitting}
          label="Allow proposal submission before calendar approval"
          description="If enabled, proposals can be submitted and approved even while this calendar is still draft or pending approval."
          onChange={(event) => onToggleAllowProposalBeforeApproval?.(event.target.checked)}
        />
      </div>
    </div>
  </Modal>
)
