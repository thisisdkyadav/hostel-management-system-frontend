import { useState } from "react"
import { Alert, Badge, Button, Checkbox, Grid, HStack, Input, Modal, Select, Text, Textarea, VStack } from "hzero"
import AuditTimeline from "@/components/gymkhana/AuditTimeline"
import AuditTimelineModal from "@/components/gymkhana/AuditTimelineModal"
import AdminEntityActions from "@/components/gymkhana/events-page/AdminEntityActions"
import ReasonPromptModal from "@/components/gymkhana/events-page/ReasonPromptModal"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import {
  Check,
  CircleDollarSign,
  Clock3,
  FileText,
  History,
  Pencil,
} from "lucide-react"
import {
  EventDetailInfoRow,
  EventDetailSectionCard,
  FormField,
  SectionHeader,
  formLabelStyles,
  infoBoxStyle,
  sectionLabelStyle,
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
  detailedProposalPreviewText,
  detailedExternalGuestsText,
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

  return (
    <>
  <Modal
    isOpen={isOpen}
    title={`Event Proposal${proposalEvent?.title ? `: ${proposalEvent.title}` : ""}`}
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
                  : proposalData?._id
                    ? "Save Proposal"
                    : "Submit Proposal"}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setEditMode?.(true)}>
              <Pencil size={16} /> Edit
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
            title="Proposal Details"
            accentColor="var(--color-primary)"
          >
            <VStack gap={2}>
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
                      ₹{Number(proposalEvent.estimatedBudget || 0).toLocaleString()}
                    </Text>
                  </Text>
                  {(() => {
                    const proposalDueDate = getProposalDueDate(proposalEvent)
                    return proposalDueDate ? (
                      <Text as="span" size="xs" color="muted">
                        Due:{" "}
                        <Text as="strong" color="heading">
                          {proposalDueDate.toLocaleDateString()}
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

              {!proposalData && !canCreateProposalForSelectedEvent && (
                <Alert type="warning">Proposal submission opens 60 days before event.</Alert>
              )}

              <HStack gap={3} align="center" justify="between" wrap>
                <div>
                  <Text as="div" size="sm" weight="semibold" color="heading">
                    {proposalForm.proposalDetails.programmeTitle || "Programme title not set"}
                  </Text>
                  <Text as="div" size="xs" color="muted" style={{ marginTop: 2 }}>
                    {proposalForm.proposalDetails.organisingUnit.unitType} ·{" "}
                    {proposalForm.proposalDetails.programmeDetails.programmeType} ·{" "}
                    {proposalForm.proposalDetails.programmeDetails.mode}
                  </Text>
                  <Text as="div" size="xs" color="muted">
                    {proposalForm.proposalDetails.programmeDetails.datesAndDuration ||
                      "Dates not added"}
                  </Text>
                </div>
                <Button variant="primary" size="sm" onClick={onOpenProposalDetails}>
                  {formEditable ? "Edit Details" : "View Details"}
                </Button>
              </HStack>

              {!isDetailedProposalComplete && (
                <Alert type="warning" title="Details incomplete">
                  Complete mandatory proposal details before submitting.
                </Alert>
              )}

              {detailedProposalPreviewText && (
                <div style={infoBoxStyle}>
                  <span style={sectionLabelStyle}>Proposal Preview</span>
                  <Text as="div" size="sm" color="body" leading={1.5} style={{ marginTop: "var(--spacing-2)", whiteSpace: "pre-wrap" }}>
                    {detailedProposalPreviewText.slice(0, 400)}
                    {detailedProposalPreviewText.length > 400 ? "..." : ""}
                  </Text>
                </div>
              )}

              {detailedExternalGuestsText && (
                <div style={infoBoxStyle}>
                  <span style={sectionLabelStyle}>External Guests</span>
                  <Text as="div" size="sm" color="body" style={{ marginTop: "var(--spacing-1)", whiteSpace: "pre-wrap" }}>
                    {detailedExternalGuestsText}
                  </Text>
                </div>
              )}

              <SectionHeader>Financials</SectionHeader>
              <Grid cols={3} gap={2}>
                <FormField label="Expected Income" htmlFor="gymkhana-total-expected-income">
                  <Input
                    id="gymkhana-total-expected-income"
                    type="number"
                    min={0}
                    value={String(computedTotalExpectedIncome)}
                    placeholder="Auto"
                    disabled
                  />
                </FormField>
                <FormField label="Total Expenditure" htmlFor="gymkhana-total-expenditure">
                  <Input
                    id="gymkhana-total-expenditure"
                    type="number"
                    min={0}
                    value={proposalForm.totalExpenditure}
                    onChange={(event) =>
                      handleProposalFormChange("totalExpenditure", event.target.value)
                    }
                    placeholder="Amount"
                    disabled={!formEditable}
                  />
                </FormField>
                <FormField label="Registration Fee" htmlFor="gymkhana-registration-fee-source">
                  <Input
                    id="gymkhana-registration-fee-source"
                    type="number"
                    min={0}
                    value={String(
                      toNumericValue(proposalForm.proposalDetails?.sourceOfFunds?.registrationFee)
                    )}
                    placeholder="From source"
                    disabled
                  />
                </FormField>
              </Grid>

              <Checkbox
                checked={proposalForm.accommodationRequired}
                onChange={(event) =>
                  handleProposalFormChange("accommodationRequired", event.target.checked)
                }
                label="Accommodation required"
                disabled={!formEditable}
              />

              <SectionHeader>Documents</SectionHeader>
              <PdfUploadField
                label="Proposal PDF"
                value={proposalForm.proposalDocumentUrl}
                onChange={(url) => handleProposalFormChange("proposalDocumentUrl", url)}
                onUpload={uploadProposalDocument}
                disabled={!formEditable}
                uploadedText="Proposal document uploaded"
                viewerTitle="Proposal Document"
                viewerSubtitle="Event proposal attachment"
                downloadFileName="proposal-document.pdf"
              />

              <PdfUploadField
                label="Chief Guest PDF"
                value={proposalForm.chiefGuestDocumentUrl}
                onChange={(url) => handleProposalFormChange("chiefGuestDocumentUrl", url)}
                onUpload={uploadChiefGuestDocument}
                disabled={!formEditable}
                uploadedText="Chief guest document uploaded"
                viewerTitle="Chief Guest Document"
                viewerSubtitle="External guest attachment"
                downloadFileName="chief-guest-document.pdf"
              />
            </VStack>
          </EventDetailSectionCard>

          <EventDetailSectionCard
            icon={CircleDollarSign}
            title="Budget Summary"
            accentColor="var(--color-success)"
          >
            <HStack gap={3} align="center" justify="between" wrap>
              <EventDetailInfoRow
                label="Income"
                value={`₹${Number(computedTotalExpectedIncome || 0).toLocaleString()}`}
              />
              <EventDetailInfoRow
                label="Expenditure"
                value={`₹${Number(proposalForm.totalExpenditure || 0).toLocaleString()}`}
              />
              <EventDetailInfoRow
                label="Deflection"
                value={`₹${proposalDeflection.toLocaleString()}`}
                valueColor={
                  proposalDeflection > 0
                    ? "var(--color-danger)"
                    : "var(--color-success)"
                }
              />
            </HStack>
          </EventDetailSectionCard>

          {canCurrentUserReviewProposal && proposalData && (
            <EventDetailSectionCard
              icon={Check}
              title="Review Actions"
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
            title="Proposal Snapshot"
            accentColor="var(--color-info)"
          >
            <VStack gap={2}>
              <EventDetailInfoRow
                label="Status"
                value={proposalData?.status ? proposalData.status.replace(/_/g, " ") : "Draft"}
              />
              <EventDetailInfoRow
                label="Current Stage"
                value={proposalData?.currentApprovalStage || "Not submitted"}
              />
              <EventDetailInfoRow
                label="Due Date"
                value={
                  proposalEvent
                    ? getProposalDueDate(proposalEvent)?.toLocaleDateString() ||
                      "Not available"
                    : "Not available"
                }
              />
              <EventDetailInfoRow
                label="Event Budget"
                value={`₹${Number(proposalEvent?.estimatedBudget || 0).toLocaleString()}`}
              />
            </VStack>
          </EventDetailSectionCard>

          <EventDetailSectionCard
            icon={History}
            title="Activity Log"
            accentColor="var(--color-text-secondary)"
          >
            {proposalData?._id ? (
              <VStack gap={3}>
                <AuditTimeline
                  key={proposalHistoryRefreshKey}
                  entityType="EventProposal"
                  entityId={proposalData._id}
                  compact
                  editsOnly
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistoryDetails(true)}
                  style={{ alignSelf: "flex-start" }}
                >
                  <History size={14} /> View detailed history
                </Button>
              </VStack>
            ) : (
              <Text size="sm" color="muted" style={{ margin: 0 }}>
                Activity log appears after proposal submission.
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
