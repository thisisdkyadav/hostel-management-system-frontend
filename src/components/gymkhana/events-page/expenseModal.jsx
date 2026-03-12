import { Button, Input, Modal } from "czero/react"
import { Badge } from "@/components/ui/data-display"
import { Alert } from "@/components/ui/feedback"
import { Checkbox, Textarea } from "@/components/ui/form"
import ApprovalHistory from "@/components/gymkhana/ApprovalHistory"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import {
  Check,
  CircleDollarSign,
  Clock3,
  History,
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
  expenseNextApprovalStages,
  toggleNextApprovalStage,
  setExpenseNextApprovalStages,
  expenseApprovalComments,
  setExpenseApprovalComments,
  handleRejectExpense,
  handleApproveExpense,
  expenseHistoryRefreshKey,
  postStudentAffairsStageOptions,
  onSave,
}) => (
  <Modal
    isOpen={isOpen}
    title={`Event Bills${expenseEvent?.title ? `: ${expenseEvent.title}` : ""}`}
    width={1120}
    closeButtonVariant="button"
    onClose={onClose}
    footer={
      canEditExpenseForm ? (
        <Button onClick={onSave} loading={submitting} disabled={!isExpenseFormValid}>
          {expenseData?._id ? "Update Bills" : "Submit Bills"}
        </Button>
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
                      {canEditExpenseForm && (expenseForm.bills || []).length > 1 && (
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
                          disabled={!canEditExpenseForm}
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
                          disabled={!canEditExpenseForm}
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
                          disabled={!canEditExpenseForm}
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
                          disabled={!canEditExpenseForm}
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
                          disabled={!canEditExpenseForm}
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
                        disabled={!canEditExpenseForm}
                        uploadedText="Uploaded"
                        viewerTitle={`Bill ${index + 1}`}
                        viewerSubtitle="Bill attachment"
                        downloadFileName={`event-bill-${index + 1}.pdf`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {canEditExpenseForm && (
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
                  disabled={!canEditExpenseForm}
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
                    disabled={!canEditExpenseForm}
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
                    }}
                  >
                    <label style={{ ...formLabelStyles, marginBottom: "var(--spacing-1)" }}>
                      Next Approval Order
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
                      {postStudentAffairsStageOptions.map((stage) => (
                        <Checkbox
                          key={`expense-stage-${stage}`}
                          label={stage}
                          checked={expenseNextApprovalStages.includes(stage)}
                          onChange={() =>
                            toggleNextApprovalStage(stage, setExpenseNextApprovalStages)
                          }
                        />
                      ))}
                    </div>
                    {expenseNextApprovalStages.length > 0 && (
                      <p
                        style={{
                          margin: "var(--spacing-1) 0 0 0",
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        Order: {expenseNextApprovalStages.join(" → ")}
                      </p>
                    )}
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
                      expenseNextApprovalStages.length === 0
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
              <ApprovalHistory
                key={`${expenseData._id}-${expenseHistoryRefreshKey}`}
                expenseId={expenseData._id}
              />
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
)
