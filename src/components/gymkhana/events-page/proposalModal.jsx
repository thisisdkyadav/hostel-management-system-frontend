import { useState } from "react"
import { Alert, Badge, Button, Grid, HStack, Modal, Select, Surface, Text, Textarea, VStack } from "hzero"
import { ProposalDossier, ProposalLedger, ProposalPapers } from "@/components/gymkhana/events-page/proposalDossier"
import { getProposalDetailsCompleteness } from "@/components/gymkhana/events-page/shared"
import AuditTimeline from "@/components/gymkhana/AuditTimeline"
import AuditTimelineModal from "@/components/gymkhana/AuditTimelineModal"
import AdminEntityActions from "@/components/gymkhana/events-page/AdminEntityActions"
import ReasonPromptModal from "@/components/gymkhana/events-page/ReasonPromptModal"
import { formatINR, formatIndianDate } from "@/utils/formatters"
import {
  Check,
  Clock3,
  FileText,
  History,
  Pencil,
} from "lucide-react"
import {
  EventDetailInfoRow,
  EventDetailSectionCard,
  SectionHeader,
  formLabelStyles,
} from "@/components/gymkhana/events-page/sharedPrimitives"

export const GymkhanaProposalModal = ({
  isOpen,
  onClose,
  proposalEvent,
  proposalData,
  proposalForm,
  proposalLoading,
  submitting,
  canEditProposalForm,
  isProposalFormValid,
  canCreateProposalForSelectedEvent,
  isDetailedProposalComplete,
  computedTotalExpectedIncome,
  handleProposalFormChange,
  uploadProposalDocument,
  uploadChiefGuestDocument,
  proposalDeflection,
  canCurrentUserReviewProposal,
  requiresProposalNextApprovalSelection,
  proposalNextApproversByStage,
  setProposalNextApproverForStage,
  proposalActionComments,
  setProposalActionComments,
  handleRequestProposalRevision,
  handleRejectProposal,
  handleApproveProposal,
  handleDirectApproveProposal,
  proposalHistoryRefreshKey,
  postStudentAffairsStageOptions,
  postStudentAffairsApproverOptionsByStage,
  toNumericValue,
  getProposalDueDate,
  onOpenProposalDetails,
  onSave,
  canAdminEditProposal = false,
  handleAdminDeleteProposal,
  editMode = false,
  setEditMode,
  onCancelEdit,
}) => {
  const [reasonOpen, setReasonOpen] = useState(false)
  const [showHistoryDetails, setShowHistoryDetails] = useState(false)

  // "May edit at all" (GS/President or admin) vs the active edit mode toggle.
  const formEditable = canEditProposalForm && editMode

  const handleSaveClick = () => {
    // Admin override edits ask for a reason in a separate popup before saving.
    if (canAdminEditProposal) setReasonOpen(true)
    else onSave()
  }

  const detailsCompleteness = getProposalDetailsCompleteness(proposalForm.proposalDetails)
  const isNewProposal = !proposalData?._id
  const proposalActionLabel = formEditable
    ? detailsCompleteness.requiredFilled === 0
      ? "Write the proposal"
      : detailsCompleteness.complete
        ? "Refine the proposal"
        : "Continue the proposal"
    : "View proposal"
  const modalTitle = isNewProposal
    ? `New proposal${proposalEvent?.title ? `: ${proposalEvent.title}` : ""}`
    : formEditable
      ? `Editing proposal${proposalEvent?.title ? `: ${proposalEvent.title}` : ""}`
      : `Event proposal${proposalEvent?.title ? `: ${proposalEvent.title}` : ""}`

  return (
    <>
  <Modal
    isOpen={isOpen}
    title={modalTitle}
    description={
      isNewProposal
        ? "Write it as if the Dean has two minutes. The proposal is the case; the rest is the paper around it."
        : formEditable
          ? "You are editing the proposal. Reviewers will read the dossier, not the fields."
          : undefined
    }
    width={1080}
    closeButtonVariant="button"
    onClose={onClose}
    footer={
      canEditProposalForm ? (
        <HStack gap={2} align="center">
          {canAdminEditProposal && handleAdminDeleteProposal && !editMode ? (
            <AdminEntityActions
              onDelete={handleAdminDeleteProposal}
              deleting={submitting}
              label="proposal"
            />
          ) : null}
          {editMode ? (
            <>
              {proposalData?._id ? (
                <Button variant="ghost" onClick={onCancelEdit} disabled={submitting}>
                  Cancel
                </Button>
              ) : null}
              <Button onClick={handleSaveClick} loading={submitting} disabled={!isProposalFormValid}>
                {canAdminEditProposal
                  ? "Save (Admin Override)"
                  : isNewProposal
                    ? "Submit proposal"
                    : "Save proposal"}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setEditMode?.(true)}>
              <Pencil size={16} /> Edit proposal
            </Button>
          )}
        </HStack>
      ) : null
    }
  >
    {proposalLoading ? (
      <Text as="div" color="muted" style={{ padding: "var(--spacing-6)" }}>
        Loading proposal...
      </Text>
    ) : (
      <div
        className="grid grid-cols-1 xl:grid-cols-3"
        style={{ gap: "var(--spacing-4)", alignItems: "start" }}
      >
        <VStack gap={4} className="xl:col-span-2">
          <EventDetailSectionCard
            icon={FileText}
            title="Proposal"
            accentColor="var(--color-primary)"
            headerAction={
              <Button variant="primary" size="sm" onClick={onOpenProposalDetails}>
                {proposalActionLabel}
              </Button>
            }
          >
            <VStack gap={3}>
              {proposalEvent && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-3)",
                    flexWrap: "wrap",
                    padding: "var(--spacing-2)",
                    backgroundColor: "var(--color-bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <Text as="span" size="xs" color="muted">
                    Budget:{" "}
                    <Text as="strong" color="heading">
                      {formatINR(proposalEvent.estimatedBudget)}
                    </Text>
                  </Text>
                  {(() => {
                    const proposalDueDate = getProposalDueDate(proposalEvent)
                    return proposalDueDate ? (
                      <Text as="span" size="xs" color="muted">
                        Due:{" "}
                        <Text as="strong" color="heading">
                          {formatIndianDate(proposalDueDate)}
                        </Text>
                      </Text>
                    ) : null
                  })()}
                  {proposalData && (
                    <Badge
                      variant={
                        proposalData.status === "approved"
                          ? "success"
                          : proposalData.status === "rejected"
                            ? "danger"
                            : "info"
                      }
                    >
                      {proposalData.status?.replace(/_/g, " ")}
                    </Badge>
                  )}
                  {proposalData?.currentApprovalStage && (
                    <Text as="span" size="xs" color="muted">
                      @ {proposalData.currentApprovalStage}
                    </Text>
                  )}
                </div>
              )}

              {isNewProposal && canCreateProposalForSelectedEvent && (
                <Alert type="info" title="A new proposal">
                  You are writing the case for {proposalEvent?.title || "this event"}. Name the
                  programme first — spend and papers wait until the story stands.
                </Alert>
              )}

              {!proposalData && !canCreateProposalForSelectedEvent && (
                <Alert type="warning">The window to write this proposal opens 60 days before the event.</Alert>
              )}

              {!isDetailedProposalComplete && detailsCompleteness.requiredFilled > 0 && (
                <Alert type="warning" title="The proposal is still open">
                  {detailsCompleteness.requiredTotal - detailsCompleteness.requiredFilled} required{" "}
                  {detailsCompleteness.requiredTotal - detailsCompleteness.requiredFilled === 1
                    ? "line is"
                    : "lines are"}{" "}
                  still missing. A reviewer should meet a programme, not a half-written form.
                </Alert>
              )}

              <ProposalDossier
                details={proposalForm.proposalDetails}
                variant="compact"
                completeness={detailsCompleteness}
                action={
                  detailsCompleteness.requiredFilled === 0 ? (
                    <Button variant="secondary" size="sm" onClick={onOpenProposalDetails}>
                      {proposalActionLabel}
                    </Button>
                  ) : null
                }
              />

              <SectionHeader>The ledger</SectionHeader>
              <ProposalLedger
                idPrefix="gymkhana"
                income={computedTotalExpectedIncome}
                expenditure={proposalForm.totalExpenditure}
                onExpenditureChange={(value) => handleProposalFormChange("totalExpenditure", value)}
                registrationFee={toNumericValue(
                  proposalForm.proposalDetails?.sourceOfFunds?.registrationFee
                )}
                accommodationRequired={proposalForm.accommodationRequired}
                onAccommodationChange={(checked) =>
                  handleProposalFormChange("accommodationRequired", checked)
                }
                deflection={proposalDeflection}
                estimatedBudget={proposalEvent?.estimatedBudget}
                editable={formEditable}
              />

              <SectionHeader>The papers</SectionHeader>
              <ProposalPapers
                proposalUrl={proposalForm.proposalDocumentUrl}
                onProposalUrl={(url) => handleProposalFormChange("proposalDocumentUrl", url)}
                onUploadProposal={uploadProposalDocument}
                guestUrl={proposalForm.chiefGuestDocumentUrl}
                onGuestUrl={(url) => handleProposalFormChange("chiefGuestDocumentUrl", url)}
                onUploadGuest={uploadChiefGuestDocument}
                disabled={!formEditable}
              />
            </VStack>
          </EventDetailSectionCard>

          {canCurrentUserReviewProposal && proposalData && (
            <EventDetailSectionCard
              icon={Check}
              title="Stand behind it"
              accentColor="var(--color-warning)"
            >
              <VStack gap={2}>
                {requiresProposalNextApprovalSelection && (
                  <div
                    style={{
                      padding: "var(--spacing-2)",
                      backgroundColor: "var(--color-bg-secondary)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-2)",
                    }}
                  >
                    <label style={{ ...formLabelStyles, marginBottom: 0 }}>
                      Next Recommenders
                    </label>
                    <Text as="span" size="xs" color="muted">
                      Leave a row blank to skip that stage.
                    </Text>
                    {postStudentAffairsStageOptions.map((stage) => (
                      <Grid cols="minmax(0, 190px) 1fr" gap={2} align="center" key={`proposal-stage-${stage}`}>
                        <Text as="span" size="sm" color="body">
                          {stage}
                        </Text>
                        <Select
                          name={`proposal-next-approver-${stage}`}
                          value={proposalNextApproversByStage?.[stage] || ""}
                          onChange={(event) => setProposalNextApproverForStage(stage, event.target.value)}
                          options={[
                            { value: "", label: `Skip ${stage}` },
                            ...(postStudentAffairsApproverOptionsByStage?.[stage] || []),
                          ]}
                          placeholder={`Select ${stage}`}
                        />
                      </Grid>
                    ))}
                  </div>
                )}

                <div>
                  <label style={formLabelStyles} htmlFor="proposalActionComments">
                    Comments
                  </label>
                  <Textarea
                    id="proposalActionComments"
                    name="proposalActionComments"
                    placeholder="Comments (required for reject/revision)"
                    value={proposalActionComments}
                    onChange={(event) => setProposalActionComments(event.target.value)}
                    rows={2}
                  />
                </div>
                <HStack gap={2} justify="end" wrap>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={handleRequestProposalRevision}
                    loading={submitting}
                  >
                    Request Revision
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleRejectProposal}
                    loading={submitting}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={requiresProposalNextApprovalSelection ? handleDirectApproveProposal : handleApproveProposal}
                    loading={submitting}
                    disabled={requiresProposalNextApprovalSelection && Object.values(proposalNextApproversByStage || {}).filter(Boolean).length > 0}
                  >
                    Approve
                  </Button>
                  {requiresProposalNextApprovalSelection && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleApproveProposal}
                      loading={submitting}
                      disabled={Object.values(proposalNextApproversByStage || {}).filter(Boolean).length === 0}
                    >
                      Recommend & Forward
                    </Button>
                  )}
                </HStack>
              </VStack>
            </EventDetailSectionCard>
          )}
        </VStack>

        <VStack gap={3}>
          <EventDetailSectionCard
            icon={Clock3}
            title="Where this stands"
            accentColor="var(--color-info)"
          >
            <VStack gap={3}>
              <Surface bg="brand" padding={3} radius="card-sm">
                <Text as="div" size="2xs" color="muted" style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {isNewProposal ? "Not yet submitted" : "In the corridor"}
                </Text>
                <Text as="div" size="md" weight="semibold" color="heading" style={{ marginTop: "var(--spacing-1)" }}>
                  {proposalData?.status
                    ? proposalData.status.replace(/_/g, " ")
                    : "A draft in your hands"}
                </Text>
                <Text as="div" size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
                  {proposalData?.currentApprovalStage
                    ? `Waiting with ${proposalData.currentApprovalStage}`
                    : "Submit when the proposal is complete"}
                </Text>
              </Surface>
              <EventDetailInfoRow
                label="Due"
                value={
                  proposalEvent
                    ? formatIndianDate(getProposalDueDate(proposalEvent), "") ||
                      "Not available"
                    : "Not available"
                }
              />
              <EventDetailInfoRow
                label="Calendar budget"
                value={formatINR(proposalEvent?.estimatedBudget)}
              />
            </VStack>
          </EventDetailSectionCard>

          <EventDetailSectionCard
            icon={History}
            title="Activity Log"
            accentColor="var(--color-text-secondary)"
            headerAction={
              proposalData?._id ? (
                <Button variant="ghost" size="sm" onClick={() => setShowHistoryDetails(true)}>
                  <History size={14} /> View detailed history
                </Button>
              ) : null
            }
          >
            {proposalData?._id ? (
              <AuditTimeline
                key={proposalHistoryRefreshKey}
                entityType="EventProposal"
                entityId={proposalData._id}
                compact
              />
            ) : (
              <Text size="sm" color="muted" style={{ margin: 0 }}>
                History appears after this proposal is submitted.
              </Text>
            )}
          </EventDetailSectionCard>
        </VStack>
      </div>
    )}
  </Modal>

      {reasonOpen ? (
        <ReasonPromptModal
          isOpen
          onClose={() => setReasonOpen(false)}
          loading={submitting}
          title="Admin override — reason required"
          description="This edit changes the proposal without altering its approval status. Your reason is recorded in the audit log."
          confirmText="Save changes"
          placeholder="Why are you editing this proposal?"
          onConfirm={async (reason) => {
            await onSave(reason)
            setReasonOpen(false)
          }}
        />
      ) : null}

      {showHistoryDetails && proposalData?._id ? (
        <AuditTimelineModal
          isOpen
          onClose={() => setShowHistoryDetails(false)}
          entityType="EventProposal"
          entityId={proposalData._id}
          title="Proposal history"
        />
      ) : null}
    </>
  )
}
