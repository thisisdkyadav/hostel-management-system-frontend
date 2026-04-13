import { ErrorState, useToast } from "@/components/ui/feedback"
import { useAuth } from "@/contexts/AuthProvider"
import GymkhanaEventsPageContent from "@/components/gymkhana/events-page/GymkhanaEventsPageContent"
import {
  GymkhanaCreateCalendarModal,
  GymkhanaEventDetailsModal,
  GymkhanaProposalModal,
  GymkhanaProposalDetailsModal,
  GymkhanaExpenseModal,
  GymkhanaEventEditorModal,
  GymkhanaAmendmentModal,
  GymkhanaHistoryModal,
  GymkhanaPendingProposalsModal,
  GymkhanaPendingBillsModal,
  GymkhanaOverlapDetailsModal,
  GymkhanaSettingsModal,
  GymkhanaApprovalModal,
  GymkhanaOverlapConfirmModal,
} from "@/components/gymkhana/events-page"
import {
  ORGANISING_UNIT_OPTIONS,
  POST_STUDENT_AFFAIRS_STAGE_OPTIONS,
  PROGRAMME_MODE_OPTIONS,
  PROGRAMME_TYPE_OPTIONS,
  REGISTRATION_CATEGORIES,
} from "@/components/gymkhana/events-page/shared"
import { useGymkhanaCalendarPageState } from "@/hooks/gymkhana/useGymkhanaCalendarPageState.jsx"
import { useGymkhanaProposalActions } from "@/hooks/gymkhana/useGymkhanaProposalActions"
import { useGymkhanaExpenseActions } from "@/hooks/gymkhana/useGymkhanaExpenseActions"

const EventsPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  const calendarState = useGymkhanaCalendarPageState({ user, toast })
  const proposalState = useGymkhanaProposalActions({
    user,
    isGS: calendarState.isGS,
    isPresident: calendarState.isPresident,
    canViewEventsCapability: calendarState.canViewEventsCapability,
    canCreateEventsCapability: calendarState.canCreateEventsCapability,
    canApproveEventsCapability: calendarState.canApproveEventsCapability,
    maxApprovalAmount: calendarState.maxApprovalAmount,
    selectedYear: calendarState.selectedYear,
    selectedCalendarEventIds: calendarState.selectedCalendarEventIds,
    toast,
    fetchCalendar: calendarState.fetchCalendar,
    setSubmitting: calendarState.setSubmitting,
  })
  const expenseState = useGymkhanaExpenseActions({
    user,
    isGS: calendarState.isGS,
    isAdminLevel: calendarState.isAdminLevel,
    isSuperAdmin: calendarState.isSuperAdmin,
    canViewEventsCapability: calendarState.canViewEventsCapability,
    canCreateEventsCapability: calendarState.canCreateEventsCapability,
    canApproveEventsCapability: calendarState.canApproveEventsCapability,
    maxApprovalAmount: calendarState.maxApprovalAmount,
    selectedYear: calendarState.selectedYear,
    selectedCalendarEventIds: calendarState.selectedCalendarEventIds,
    toast,
    fetchCalendar: calendarState.fetchCalendar,
    setSubmitting: calendarState.setSubmitting,
  })

  if (calendarState.error) {
    return <ErrorState message={calendarState.error} onRetry={calendarState.fetchYears} />
  }

  if (!calendarState.canViewEventsCapability) {
    return (
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger-text)]">
          You do not have permission to view events.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <GymkhanaEventsPageContent
        activeCategoryFilter={calendarState.activeCategoryFilter}
        budgetStats={calendarState.budgetStats}
        calendar={calendarState.calendar}
        calendarMonth={calendarState.calendarMonth}
        canApprove={calendarState.canApprove}
        canApproveEventsCapability={calendarState.canApproveEventsCapability}
        canCreateCalendar={calendarState.canCreateCalendar}
        canCreateEventsCapability={calendarState.canCreateEventsCapability}
        canEdit={calendarState.canEdit}
        canManageCalendarLock={calendarState.canManageCalendarLock}
        canSubmitCalendar={calendarState.canSubmitCalendar}
        categoryLabels={calendarState.categoryLabels}
        categoryOrder={calendarState.categoryOrder}
        categoryFilterTabs={calendarState.categoryFilterTabs}
        dateConflicts={calendarState.dateConflicts}
        eventTableColumns={calendarState.eventTableColumns}
        filteredEvents={calendarState.filteredEvents}
        getDaysInMonth={calendarState.getDaysInMonth}
        getEventsForDate={calendarState.getEventsForDate}
        getHolidaysForDate={calendarState.getHolidaysForDate}
        handleAddEvent={calendarState.handleAddEvent}
        handleEventClick={calendarState.handleEventClick}
        handleEventRowClick={calendarState.handleEventRowClick}
        handleSubmitCalendar={calendarState.handleSubmitCalendar}
        hasAttemptedCalendarLoad={calendarState.hasAttemptedCalendarLoad}
        headerSubtitle={calendarState.headerSubtitle}
        headerTitle={calendarState.headerTitle}
        isAdminLevel={calendarState.isAdminLevel}
        isGS={calendarState.isGS}
        isPresident={calendarState.isPresident}
        loading={calendarState.loading}
        openAmendmentModal={calendarState.openAmendmentModal}
        openApprovalModal={calendarState.openApprovalModal}
        openProposalModal={proposalState.openProposalModal}
        pendingExpenseApprovalsForSelectedCalendar={expenseState.pendingExpenseApprovalsForSelectedCalendar}
        pendingProposalReminders={calendarState.pendingProposalReminders}
        pendingProposalsForSelectedCalendar={proposalState.pendingProposalsForSelectedCalendar}
        selectedYear={calendarState.selectedYear}
        setActiveCategoryFilter={calendarState.setActiveCategoryFilter}
        setCalendarMonth={calendarState.setCalendarMonth}
        setSelectedYear={calendarState.setSelectedYear}
        setShowCreateCalendarModal={calendarState.setShowCreateCalendarModal}
        setShowHistoryModal={calendarState.setShowHistoryModal}
        setShowOverlapDetailsModal={calendarState.setShowOverlapDetailsModal}
        setShowPendingBillsModal={expenseState.setShowPendingBillsModal}
        setShowPendingProposalModal={proposalState.setShowPendingProposalModal}
        setShowSettingsModal={calendarState.setShowSettingsModal}
        submitCalendarLabel={calendarState.submitCalendarLabel}
        submitting={calendarState.submitting}
        years={calendarState.years}
        viewMode={calendarState.viewMode}
        setViewMode={calendarState.setViewMode}
      />

      <GymkhanaCreateCalendarModal
        isOpen={calendarState.showCreateCalendarModal}
        onClose={() => {
          calendarState.setShowCreateCalendarModal(false)
          calendarState.setNewAcademicYear("")
        }}
        newAcademicYear={calendarState.newAcademicYear}
        onAcademicYearChange={calendarState.setNewAcademicYear}
        availableYearsForCreation={calendarState.availableYearsForCreation}
        onCreateCalendar={calendarState.handleCreateCalendar}
        submitting={calendarState.submitting}
      />

      <GymkhanaEventDetailsModal
        isOpen={calendarState.showEventModal}
        selectedEvent={calendarState.selectedEvent}
        onClose={calendarState.closeEventModal}
        canEditEvent={calendarState.canEdit}
        canRequestEventAmendment={
          Boolean(
            calendarState.calendar?.isLocked &&
              calendarState.isGS &&
              calendarState.canCreateEventsCapability
          )
        }
        canViewEventsCapability={calendarState.canViewEventsCapability}
        isGS={calendarState.isGS}
        isPresident={calendarState.isPresident}
        isGymkhanaRole={calendarState.isGymkhanaRole}
        isAdminLevel={calendarState.isAdminLevel}
        canCreateEventsCapability={calendarState.canCreateEventsCapability}
        canApproveEventsCapability={calendarState.canApproveEventsCapability}
        openProposalModal={proposalState.openProposalModal}
        openExpenseModal={expenseState.openExpenseModal}
        getProposalDueDate={proposalState.getProposalDueDate}
        getCategoryBadgeStyle={calendarState.getCategoryBadgeStyle}
        getEventStatusVariant={calendarState.getEventStatusVariant}
        formatDateRange={calendarState.formatDateRange}
        categoryLabels={calendarState.categoryLabels}
        onEditEvent={calendarState.handleEditEvent}
        onRequestAmendment={calendarState.openAmendmentModal}
      />

      <GymkhanaProposalModal
        isOpen={proposalState.showProposalModal}
        onClose={proposalState.closeProposalModal}
        proposalEvent={proposalState.proposalEvent}
        proposalData={proposalState.proposalData}
        proposalForm={proposalState.proposalForm}
        proposalLoading={proposalState.proposalLoading}
        submitting={calendarState.submitting}
        canEditProposalForm={proposalState.canEditProposalForm}
        isProposalFormValid={proposalState.isProposalFormValid}
        canCreateProposalForSelectedEvent={proposalState.canCreateProposalForSelectedEvent}
        isDetailedProposalComplete={proposalState.isDetailedProposalComplete}
        detailedProposalPreviewText={proposalState.detailedProposalPreviewText}
        detailedExternalGuestsText={proposalState.detailedExternalGuestsText}
        computedTotalExpectedIncome={proposalState.computedTotalExpectedIncome}
        handleProposalFormChange={proposalState.handleProposalFormChange}
        uploadProposalDocument={proposalState.uploadProposalDocument}
        uploadChiefGuestDocument={proposalState.uploadChiefGuestDocument}
        proposalDeflection={proposalState.proposalDeflection}
        canCurrentUserReviewProposal={proposalState.canCurrentUserReviewProposal}
        requiresProposalNextApprovalSelection={proposalState.requiresProposalNextApprovalSelection}
        proposalNextApproversByStage={proposalState.proposalNextApproversByStage}
        setProposalNextApproverForStage={proposalState.setProposalNextApproverForStage}
        proposalActionComments={proposalState.proposalActionComments}
        setProposalActionComments={proposalState.setProposalActionComments}
        handleRequestProposalRevision={proposalState.handleRequestProposalRevision}
        handleRejectProposal={proposalState.handleRejectProposal}
        handleApproveProposal={proposalState.handleApproveProposal}
        proposalHistoryRefreshKey={proposalState.proposalHistoryRefreshKey}
        postStudentAffairsStageOptions={POST_STUDENT_AFFAIRS_STAGE_OPTIONS}
        postStudentAffairsApproverOptionsByStage={calendarState.postStudentAffairsApproverOptionsByStage}
        toNumericValue={proposalState.toNumericValue}
        getProposalDueDate={proposalState.getProposalDueDate}
        onOpenProposalDetails={() => proposalState.setShowProposalDetailsModal(true)}
        onSave={proposalState.handleCreateOrUpdateProposal}
      />

      <GymkhanaProposalDetailsModal
        isOpen={proposalState.showProposalDetailsModal}
        onClose={() => proposalState.setShowProposalDetailsModal(false)}
        proposalForm={proposalState.proposalForm}
        canEditProposalForm={proposalState.canEditProposalForm}
        handleProposalDetailsChange={proposalState.handleProposalDetailsChange}
        uploadScheduleAnnexureDocument={proposalState.uploadScheduleAnnexureDocument}
        handleProposalRegistrationDetailChange={proposalState.handleProposalRegistrationDetailChange}
        programmeTypeOptions={PROGRAMME_TYPE_OPTIONS}
        programmeModeOptions={PROGRAMME_MODE_OPTIONS}
        organisingUnitOptions={ORGANISING_UNIT_OPTIONS}
        registrationCategories={REGISTRATION_CATEGORIES}
      />

      <GymkhanaExpenseModal
        isOpen={expenseState.showExpenseModal}
        onClose={expenseState.closeExpenseModal}
        expenseEvent={expenseState.expenseEvent}
        expenseData={expenseState.expenseData}
        expenseForm={expenseState.expenseForm}
        expenseLoading={expenseState.expenseLoading}
        submitting={calendarState.submitting}
        canEditExpenseForm={expenseState.canEditExpenseForm}
        isExpenseFormValid={expenseState.isExpenseFormValid}
        isExpenseSubmissionAllowedForSelectedEvent={expenseState.isExpenseSubmissionAllowedForSelectedEvent}
        assignedExpenseBudget={expenseState.assignedExpenseBudget}
        expenseTotal={expenseState.expenseTotal}
        handleRemoveBillRow={expenseState.handleRemoveBillRow}
        handleBillFieldChange={expenseState.handleBillFieldChange}
        uploadBillDocument={expenseState.uploadBillDocument}
        getFilenameFromUrl={expenseState.getFilenameFromUrl}
        handleAddBillRow={expenseState.handleAddBillRow}
        uploadEventReportDocument={expenseState.uploadEventReportDocument}
        handleExpenseFormChange={expenseState.handleExpenseFormChange}
        expenseVariance={expenseState.expenseVariance}
        canApproveExpense={expenseState.canApproveExpense}
        requiresExpenseNextApprovalSelection={expenseState.requiresExpenseNextApprovalSelection}
        expenseNextApproversByStage={expenseState.expenseNextApproversByStage}
        setExpenseNextApproverForStage={expenseState.setExpenseNextApproverForStage}
        expenseApprovalComments={expenseState.expenseApprovalComments}
        setExpenseApprovalComments={expenseState.setExpenseApprovalComments}
        handleRejectExpense={expenseState.handleRejectExpense}
        handleApproveExpense={expenseState.handleApproveExpense}
        expenseHistoryRefreshKey={expenseState.expenseHistoryRefreshKey}
        postStudentAffairsStageOptions={POST_STUDENT_AFFAIRS_STAGE_OPTIONS}
        postStudentAffairsApproverOptionsByStage={calendarState.postStudentAffairsApproverOptionsByStage}
        onSave={expenseState.handleCreateOrUpdateExpense}
      />

      <GymkhanaEventEditorModal
        isOpen={calendarState.showAddEventModal}
        onClose={calendarState.closeAddEventModal}
        selectedEvent={calendarState.selectedEvent}
        eventForm={calendarState.eventForm}
        handleEventFormChange={calendarState.handleEventFormChange}
        categoryOptions={calendarState.categoryOptions}
        isDateRangeOrdered={calendarState.isDateRangeOrdered}
        overlapCheckInProgressForCurrentDates={calendarState.overlapCheckInProgressForCurrentDates}
        dateOverlapInfo={calendarState.dateOverlapInfo}
        overlapCheckKey={calendarState.overlapCheckKey}
        retryDateOverlapCheck={calendarState.retryDateOverlapCheck}
        overlapCheckCompletedForCurrentDates={calendarState.overlapCheckCompletedForCurrentDates}
        formatDateRange={calendarState.formatDateRange}
        submitting={calendarState.submitting}
        canSaveEventInModal={calendarState.canSaveEventInModal}
        onSave={calendarState.handleSaveEvent}
      />

      <GymkhanaAmendmentModal
        isOpen={calendarState.showAmendmentModal}
        onClose={calendarState.closeAmendmentModal}
        eventForm={calendarState.eventForm}
        handleEventFormChange={calendarState.handleEventFormChange}
        categoryOptions={calendarState.categoryOptions}
        isDateRangeOrdered={calendarState.isDateRangeOrdered}
        overlapCheckInProgressForCurrentDates={calendarState.overlapCheckInProgressForCurrentDates}
        dateOverlapInfo={calendarState.dateOverlapInfo}
        overlapCheckKey={calendarState.overlapCheckKey}
        retryDateOverlapCheck={calendarState.retryDateOverlapCheck}
        overlapCheckCompletedForCurrentDates={calendarState.overlapCheckCompletedForCurrentDates}
        formatDateRange={calendarState.formatDateRange}
        amendmentReason={calendarState.amendmentReason}
        setAmendmentReason={calendarState.setAmendmentReason}
        submitting={calendarState.submitting}
        canSubmitAmendmentInModal={calendarState.canSubmitAmendmentInModal}
        onSubmit={calendarState.handleSubmitAmendment}
      />

      <GymkhanaHistoryModal
        isOpen={calendarState.showHistoryModal}
        onClose={() => calendarState.setShowHistoryModal(false)}
        calendarId={calendarState.calendar?._id}
      />

      <GymkhanaPendingProposalsModal
        isOpen={proposalState.showPendingProposalModal}
        onClose={() => proposalState.setShowPendingProposalModal(false)}
        pendingProposalsForSelectedCalendar={proposalState.pendingProposalsForSelectedCalendar}
        formatDateRange={calendarState.formatDateRange}
        openPendingProposalReview={proposalState.openPendingProposalReview}
      />

      <GymkhanaPendingBillsModal
        isOpen={expenseState.showPendingBillsModal}
        onClose={() => expenseState.setShowPendingBillsModal(false)}
        pendingExpenseApprovalsForSelectedCalendar={expenseState.pendingExpenseApprovalsForSelectedCalendar}
        formatDateRange={calendarState.formatDateRange}
        openPendingExpenseReview={expenseState.openPendingExpenseReview}
      />

      <GymkhanaOverlapDetailsModal
        isOpen={calendarState.showOverlapDetailsModal}
        onClose={() => calendarState.setShowOverlapDetailsModal(false)}
        dateConflicts={calendarState.dateConflicts}
      />

      <GymkhanaSettingsModal
        isOpen={calendarState.showSettingsModal}
        onClose={() => calendarState.setShowSettingsModal(false)}
        calendar={calendarState.calendar}
        budgetSummary={calendarState.budgetSummary}
        settingsForm={calendarState.calendarSettingsForm}
        submitting={calendarState.submitting}
        onSettingsChange={calendarState.handleCalendarSettingsFieldChange}
        onBudgetCapChange={calendarState.handleCalendarBudgetCapChange}
        onSaveSettings={calendarState.handleSaveCalendarSettings}
        onLock={async () => {
          await calendarState.handleLockCalendar()
          calendarState.setShowSettingsModal(false)
        }}
        onUnlock={async () => {
          await calendarState.handleUnlockCalendar()
          calendarState.setShowSettingsModal(false)
        }}
      />

      <GymkhanaApprovalModal
        isOpen={calendarState.showApprovalModal}
        onClose={() => {
          calendarState.setShowApprovalModal(false)
        }}
        calendar={calendarState.calendar}
        events={calendarState.events}
        categoryOrder={calendarState.categoryOrder}
        categoryLabels={calendarState.categoryLabels}
        budgetSummary={calendarState.budgetSummary}
        dateConflicts={calendarState.dateConflicts}
        requiresCalendarNextApprovalSelection={calendarState.requiresCalendarNextApprovalSelection}
        calendarNextApproversByStage={calendarState.calendarNextApproversByStage}
        setCalendarNextApproverForStage={calendarState.setCalendarNextApproverForStage}
        postStudentAffairsStageOptions={POST_STUDENT_AFFAIRS_STAGE_OPTIONS}
        postStudentAffairsApproverOptionsByStage={calendarState.postStudentAffairsApproverOptionsByStage}
        approvalComments={calendarState.approvalComments}
        setApprovalComments={calendarState.setApprovalComments}
        submitting={calendarState.submitting}
        onReject={calendarState.handleReject}
        onApprove={calendarState.handleApprove}
      />

      <GymkhanaOverlapConfirmModal
        isOpen={calendarState.showOverlapConfirmModal}
        onClose={() => {
          calendarState.setShowOverlapConfirmModal(false)
          calendarState.setSubmitOverlapInfo(null)
        }}
        submitOverlapInfo={calendarState.submitOverlapInfo}
        submitting={calendarState.submitting}
        onConfirm={calendarState.handleConfirmSubmitWithOverlap}
      />
    </div>
  )
}

export default EventsPage
