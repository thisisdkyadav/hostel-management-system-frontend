import { useState } from "react"
import { Button, Input, Modal } from "czero/react"
import { Select } from "@/components/ui"
import { Badge } from "@/components/ui/data-display"
import { Alert } from "@/components/ui/feedback"
import { Textarea } from "@/components/ui/form"
import AuditTimeline from "@/components/gymkhana/AuditTimeline"
import AuditTimelineModal from "@/components/gymkhana/AuditTimelineModal"
import AdminEntityActions from "@/components/gymkhana/events-page/AdminEntityActions"
import ReasonPromptModal from "@/components/gymkhana/events-page/ReasonPromptModal"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import {
  Check,
  CircleDollarSign,
  Clock3,
  History,
  Pencil,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react"
import {
  EventDetailInfoRow,
  EventDetailSectionCard,
  formLabelStyles,
} from "@/components/gymkhana/events-page/sharedPrimitives"

export const GymkhanaExpenseModal = ({
  isOpen,
  onClose,
  expenseEvent,
  expenseData,
  expenseForm,
  expenseLoading,
  submitting,
  canEditExpenseForm,
  isExpenseFormValid,
  isExpenseSubmissionAllowedForSelectedEvent,
  assignedExpenseBudget,
  expenseTotal,
  handleRemoveBillRow,
  handleBillFieldChange,
  uploadBillDocument,
  getFilenameFromUrl,
  handleAddBillRow,
  uploadEventReportDocument,
  handleExpenseFormChange,
  expenseVariance,
  canApproveExpense,
  requiresExpenseNextApprovalSelection,
  expenseNextApproversByStage,
  setExpenseNextApproverForStage,
  expenseApprovalComments,
  setExpenseApprovalComments,
  handleRejectExpense,
  handleApproveExpense,
  expenseHistoryRefreshKey,
  postStudentAffairsStageOptions,
  postStudentAffairsApproverOptionsByStage,
  onSave,
  canAdminEditExpense = false,
  handleAdminDeleteExpense,
  editMode = false,
  setEditMode,
  onCancelEdit,
}) => {
  const [reasonOpen, setReasonOpen] = useState(false)
  const [showHistoryDetails, setShowHistoryDetails] = useState(false)

  const formEditable = canEditExpenseForm && editMode

  const handleSaveClick = () => {
    if (canAdminEditExpense) setReasonOpen(true)
    else onSave()
  }

  return (
    <>
  <Modal
    isOpen={isOpen}
    title={`Event Bills${expenseEvent?.title ? `: ${expenseEvent.title}` : ""}`}
    width={1120}
    closeButtonVariant="button"
    onClose={onClose}
    footer={
      canEditExpenseForm ? (
        <div style={{ display: "flex", gap: "var(--spacing-2)", alignItems: "center" }}>
          {canAdminEditExpense && handleAdminDeleteExpense && !editMode ? (
            <AdminEntityActions
              onDelete={handleAdminDeleteExpense}
              deleting={submitting}
              label="bill"
            />
          ) : null}
          {editMode ? (
            <>
              {expenseData?._id ? (
                <Button variant="ghost" onClick={onCancelEdit} disabled={submitting}>
                  Cancel
                </Button>
              ) : null}
              <Button onClick={handleSaveClick} loading={submitting} disabled={!isExpenseFormValid}>
                {canAdminEditExpense
                  ? "Save (Admin Override)"
                  : expenseData?._id
                    ? "Update Bills"
                    : "Submit Bills"}
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
    {expenseLoading ? (
      <div style={{ padding: "var(--spacing-6)", color: "var(--color-text-muted)" }}>
        Loading bills...
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
            icon={Receipt}
            title="Bills & Documents"
            accentColor="var(--color-primary)"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
              {expenseEvent && (
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
                      ₹{assignedExpenseBudget.toLocaleString()}
                    </strong>
                  </span>
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Total:{" "}
                    <strong style={{ color: "var(--color-text-heading)" }}>
                      ₹{expenseTotal.toLocaleString()}
                    </strong>
                  </span>
                  {expenseData && (
                    <Badge
                      variant={
                        expenseData.approvalStatus === "approved"
                          ? "success"
                          : expenseData.approvalStatus === "rejected"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {expenseData.approvalStatus === "approved"
                        ? "Approved"
                        : expenseData.approvalStatus === "rejected"
                          ? "Rejected"
                          : "Pending"}
                    </Badge>
                  )}
                  {expenseData?.currentApprovalStage &&
                    expenseData.approvalStatus !== "approved" && (
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        @ {expenseData.currentApprovalStage}
                      </span>
                    )}
                </div>
              )}

              {!expenseData && !isExpenseSubmissionAllowedForSelectedEvent && (
                <Alert type="warning">Bills submission opens after proposal approval.</Alert>
              )}

              {expenseData?.approvalStatus === "rejected" && expenseData?.rejectionReason && (
                <Alert type="error">Rejection: {expenseData.rejectionReason}</Alert>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                {(expenseForm.bills || []).map((bill, index) => (
                  <div
                    key={bill.localId}
                    style={{
                      border: "var(--border-1) solid var(--color-border-primary)",
                      borderRadius: "var(--radius-card-sm)",
                      padding: "var(--spacing-2)",
                      backgroundColor: "var(--color-bg-primary)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "var(--spacing-2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--color-text-heading)",
                        }}
                      >
                        Bill #{index + 1}
                      </span>
                      {formEditable && (expenseForm.bills || []).length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveBillRow(bill.localId)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "var(--spacing-2)",
                        gridTemplateColumns: "repeat(4, 1fr)",
                      }}
                    >
                      <div>
                        <label style={formLabelStyles} htmlFor={`bill-description-${bill.localId}`}>
                          Description *
                        </label>
                        <Input
                          id={`bill-description-${bill.localId}`}
                          name={`bill-description-${bill.localId}`}
                          placeholder="Description"
                          value={bill.description}
                          onChange={(event) =>
                            handleBillFieldChange(
                              bill.localId,
                              "description",
                              event.target.value
                            )
                          }
                          disabled={!formEditable}
                        />
                      </div>
                      <div>
                        <label style={formLabelStyles} htmlFor={`bill-amount-${bill.localId}`}>
                          Amount (₹) *
                        </label>
                        <Input
                          id={`bill-amount-${bill.localId}`}
                          name={`bill-amount-${bill.localId}`}
                          type="number"
                          placeholder="₹"
                          value={bill.amount}
                          onChange={(event) =>
                            handleBillFieldChange(bill.localId, "amount", event.target.value)
                          }
                          disabled={!formEditable}
                        />
                      </div>
                      <div>
                        <label style={formLabelStyles} htmlFor={`bill-number-${bill.localId}`}>
                          Bill No.
                        </label>
                        <Input
                          id={`bill-number-${bill.localId}`}
                          name={`bill-number-${bill.localId}`}
                          placeholder="Optional"
                          value={bill.billNumber}
                          onChange={(event) =>
                            handleBillFieldChange(
                              bill.localId,
                              "billNumber",
                              event.target.value
                            )
                          }
                          disabled={!formEditable}
                        />
                      </div>
                      <div>
                        <label style={formLabelStyles} htmlFor={`bill-date-${bill.localId}`}>
                          Date
                        </label>
                        <Input
                          id={`bill-date-${bill.localId}`}
                          name={`bill-date-${bill.localId}`}
                          type="date"
                          value={bill.billDate}
                          onChange={(event) =>
                            handleBillFieldChange(
                              bill.localId,
                              "billDate",
                              event.target.value
                            )
                          }
                          disabled={!formEditable}
                        />
                      </div>
                    </div>

                    <div
                      style={{ display: "grid", gap: "var(--spacing-2)", gridTemplateColumns: "1fr 2fr" }}
                    >
                      <div>
                        <label style={formLabelStyles} htmlFor={`bill-vendor-${bill.localId}`}>
                          Vendor
                        </label>
                        <Input
                          id={`bill-vendor-${bill.localId}`}
                          name={`bill-vendor-${bill.localId}`}
                          placeholder="Optional"
                          value={bill.vendor}
                          onChange={(event) =>
                            handleBillFieldChange(bill.localId, "vendor", event.target.value)
                          }
                          disabled={!formEditable}
                        />
                      </div>

                      <PdfUploadField
                        label="Bill PDF"
                        value={bill.documentUrl}
                        onChange={(url) => {
                          handleBillFieldChange(bill.localId, "documentUrl", url)
                          handleBillFieldChange(
                            bill.localId,
                            "documentName",
                            getFilenameFromUrl(url)
                          )
                        }}
                        onUpload={uploadBillDocument}
                        required
                        disabled={!formEditable}
                        uploadedText="Uploaded"
                        viewerTitle={`Bill ${index + 1}`}
                        viewerSubtitle="Bill attachment"
                        downloadFileName={`event-bill-${index + 1}.pdf`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {formEditable && (
                <Button size="sm" variant="ghost" onClick={handleAddBillRow}>
                  <Plus size={12} /> Add Bill
                </Button>
              )}

              <div style={{ display: "grid", gap: "var(--spacing-2)", gridTemplateColumns: "1fr 1fr" }}>
                <PdfUploadField
                  label="Event Report PDF"
                  value={expenseForm.eventReportDocumentUrl}
                  onChange={(url) => handleExpenseFormChange("eventReportDocumentUrl", url)}
                  onUpload={uploadEventReportDocument}
                  required
                  disabled={!formEditable}
                  uploadedText="Uploaded"
                  viewerTitle="Event Report"
                  viewerSubtitle="Post-event report"
                  downloadFileName="event-report.pdf"
                />

                <div>
                  <label style={formLabelStyles} htmlFor="expenseNotes">
                    Notes
                  </label>
                  <Textarea
                    id="expenseNotes"
                    name="expenseNotes"
                    placeholder="Optional"
                    value={expenseForm.notes}
                    onChange={(event) => handleExpenseFormChange("notes", event.target.value)}
                    rows={2}
                    disabled={!formEditable}
                  />
                </div>
              </div>
            </div>
          </EventDetailSectionCard>

          <EventDetailSectionCard
            icon={CircleDollarSign}
            title="Bill Summary"
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
              <EventDetailInfoRow label="Bills" value={`₹${expenseTotal.toLocaleString()}`} />
              <EventDetailInfoRow
                label="Budget"
                value={`₹${assignedExpenseBudget.toLocaleString()}`}
              />
              <EventDetailInfoRow
                label="Variance"
                value={`₹${expenseVariance.toLocaleString()}`}
                valueColor={
                  expenseVariance > 0 ? "var(--color-danger)" : "var(--color-success)"
                }
              />
            </div>
          </EventDetailSectionCard>

          {canApproveExpense && (
            <EventDetailSectionCard
              icon={Check}
              title="Approval"
              accentColor="var(--color-warning)"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                {requiresExpenseNextApprovalSelection && (
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
                      Next Approvers
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
                        key={`expense-stage-${stage}`}
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
                          name={`expense-next-approver-${stage}`}
                          value={expenseNextApproversByStage?.[stage] || ""}
                          onChange={(event) => setExpenseNextApproverForStage(stage, event.target.value)}
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
                  <label style={formLabelStyles} htmlFor="expenseApprovalComments">
                    Comments
                  </label>
                  <Textarea
                    id="expenseApprovalComments"
                    name="expenseApprovalComments"
                    placeholder="Required for rejection"
                    value={expenseApprovalComments}
                    onChange={(event) => setExpenseApprovalComments(event.target.value)}
                    rows={2}
                  />
                </div>
                <div
                  style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}
                >
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleRejectExpense}
                    loading={submitting}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={handleApproveExpense}
                    loading={submitting}
                    disabled={
                      requiresExpenseNextApprovalSelection &&
                      Object.values(expenseNextApproversByStage || {}).filter(Boolean).length === 0
                    }
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </EventDetailSectionCard>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
          <EventDetailSectionCard icon={Clock3} title="Status" accentColor="var(--color-info)">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
              <EventDetailInfoRow
                label="Status"
                value={
                  expenseData?.approvalStatus === "approved"
                    ? "Approved"
                    : expenseData?.approvalStatus === "rejected"
                      ? "Rejected"
                      : expenseData?.approvalStatus
                        ? "Pending Approval"
                        : "Draft"
                }
              />
              <EventDetailInfoRow
                label="Current Stage"
                value={expenseData?.currentApprovalStage || "Not submitted"}
              />
              <EventDetailInfoRow label="Bills Count" value={`${(expenseForm.bills || []).length}`} />
              <EventDetailInfoRow
                label="Submitted By"
                value={expenseData?.submittedBy?.name || "Not submitted"}
              />
            </div>
          </EventDetailSectionCard>

          <EventDetailSectionCard
            icon={History}
            title="Activity Log"
            accentColor="var(--color-text-secondary)"
          >
            {expenseData?._id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                <AuditTimeline
                  key={`${expenseData._id}-${expenseHistoryRefreshKey}`}
                  entityType="EventExpense"
                  entityId={expenseData._id}
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
                Activity log appears after bill submission.
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
          description="This edit changes the bill without altering its approval status. Your reason is recorded in the audit log."
          confirmText="Save changes"
          placeholder="Why are you editing this bill?"
          onConfirm={async (reason) => {
            await onSave(reason)
            setReasonOpen(false)
          }}
        />
      ) : null}

      {showHistoryDetails && expenseData?._id ? (
        <AuditTimelineModal
          isOpen
          onClose={() => setShowHistoryDetails(false)}
          entityType="EventExpense"
          entityId={expenseData._id}
          title="Bill history"
        />
      ) : null}
    </>
  )
}
