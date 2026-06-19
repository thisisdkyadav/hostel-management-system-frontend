import { useState } from "react"
import { Button, Input, Modal } from "czero/react"
import { Select } from "@/components/ui"
import { Badge } from "@/components/ui/data-display"
import { Alert } from "@/components/ui/feedback"
import { Checkbox, Textarea } from "@/components/ui/form"
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
        <div style={{ display: "flex", gap: "var(--spacing-2)", alignItems: "center" }}>
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
        </div>
      ) : null
    }
  >
    {proposalLoading ? (
      <div style={{ padding: "var(--spacing-6)", color: "var(--color-text-muted)" }}>
        Loading proposal...
      </div>
    ) : (
      <div
        className="grid grid-cols-1 xl:grid-cols-3"
        style={{ gap: "var(--spacing-4)", alignItems: "start" }}
      >
        <div
          className="xl:col-span-2"
          style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}
        >
          <EventDetailSectionCard
            icon={FileText}
            title="Proposal Details"
            accentColor="var(--color-primary)"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
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
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Budget:{" "}
                    <strong style={{ color: "var(--color-text-heading)" }}>
                      ₹{Number(proposalEvent.estimatedBudget || 0).toLocaleString()}
                    </strong>
                  </span>
                  {(() => {
                    const proposalDueDate = getProposalDueDate(proposalEvent)
                    return proposalDueDate ? (
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        Due:{" "}
                        <strong style={{ color: "var(--color-text-heading)" }}>
                          {proposalDueDate.toLocaleDateString()}
                        </strong>
                      </span>
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
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      @ {proposalData.currentApprovalStage}
                    </span>
                  )}
                </div>
              )}

              {!proposalData && !canCreateProposalForSelectedEvent && (
                <Alert type="warning">Proposal submission opens 21 days before event.</Alert>
              )}

              <div
                style={{
                  ...infoBoxStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--spacing-3)",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-heading)",
                    }}
                  >
                    {proposalForm.proposalDetails.programmeTitle || "Programme title not set"}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {proposalForm.proposalDetails.organisingUnit.unitType} ·{" "}
                    {proposalForm.proposalDetails.programmeDetails.programmeType} ·{" "}
                    {proposalForm.proposalDetails.programmeDetails.mode}
                  </div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    {proposalForm.proposalDetails.programmeDetails.datesAndDuration ||
                      "Dates not added"}
                  </div>
                </div>
                <Button variant="primary" size="sm" onClick={onOpenProposalDetails}>
                  {formEditable ? "Edit Details" : "View Details"}
                </Button>
              </div>

              {!isDetailedProposalComplete && (
                <Alert type="warning" title="Details incomplete">
                  Complete mandatory proposal details before submitting.
                </Alert>
              )}

              {detailedProposalPreviewText && (
                <div style={infoBoxStyle}>
                  <span style={sectionLabelStyle}>Proposal Preview</span>
                  <div
                    style={{
                      marginTop: "var(--spacing-2)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-body)",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.5,
                    }}
                  >
                    {detailedProposalPreviewText.slice(0, 400)}
                    {detailedProposalPreviewText.length > 400 ? "..." : ""}
                  </div>
                </div>
              )}

              {detailedExternalGuestsText && (
                <div style={infoBoxStyle}>
                  <span style={sectionLabelStyle}>External Guests</span>
                  <div
                    style={{
                      marginTop: "var(--spacing-1)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-body)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {detailedExternalGuestsText}
                  </div>
                </div>
              )}

              <SectionHeader>Financials</SectionHeader>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "var(--spacing-2)",
                }}
              >
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
              </div>

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
            </div>
          </EventDetailSectionCard>

          <EventDetailSectionCard
            icon={CircleDollarSign}
            title="Budget Summary"
            accentColor="var(--color-success)"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--spacing-3)",
                flexWrap: "wrap",
              }}
            >
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
            </div>
          </EventDetailSectionCard>

          {canCurrentUserReviewProposal && proposalData && (
            <EventDetailSectionCard
              icon={Check}
              title="Review Actions"
              accentColor="var(--color-warning)"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
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
                    <span
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Leave a row blank to skip that stage.
                    </span>
                    {postStudentAffairsStageOptions.map((stage) => (
                      <div
                        key={`proposal-stage-${stage}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 190px) 1fr",
                          gap: "var(--spacing-2)",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
                          {stage}
                        </span>
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
                      </div>
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
                <div
                  style={{
                    display: "flex",
                    gap: "var(--spacing-2)",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
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
                </div>
              </div>
            </EventDetailSectionCard>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
          <EventDetailSectionCard
            icon={Clock3}
            title="Proposal Snapshot"
            accentColor="var(--color-info)"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
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
            </div>
          </EventDetailSectionCard>

          <EventDetailSectionCard
            icon={History}
            title="Activity Log"
            accentColor="var(--color-text-secondary)"
          >
            {proposalData?._id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
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
              </div>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                Activity log appears after proposal submission.
              </p>
            )}
          </EventDetailSectionCard>
        </div>
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
