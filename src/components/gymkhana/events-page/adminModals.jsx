import { Button, Modal, Table } from "czero/react"
import { AlertTriangle, Check, X } from "lucide-react"
import { Checkbox, Textarea } from "@/components/ui/form"
import { formLabelStyles } from "@/components/gymkhana/events-page/sharedPrimitives"

export const GymkhanaPendingProposalsModal = ({
  isOpen,
  onClose,
  pendingProposalsForSelectedCalendar,
  formatDateRange,
  openPendingProposalReview,
}) => (
  <Modal
    isOpen={isOpen}
    title="Pending Proposals"
    width={860}
    onClose={onClose}
    footer={
      <Button size="sm" variant="secondary" onClick={onClose}>
        Close
      </Button>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-warning)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {pendingProposalsForSelectedCalendar.length} pending in current calendar
      </span>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Event</Table.Head>
            <Table.Head>Date</Table.Head>
            <Table.Head>Expected Income</Table.Head>
            <Table.Head>Total Expenditure</Table.Head>
            <Table.Head>Deflection</Table.Head>
            <Table.Head align="right">Action</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {pendingProposalsForSelectedCalendar.map((proposal) => (
            <Table.Row key={proposal._id}>
              <Table.Cell>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
                  <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                    {proposal.eventId?.title || "Unknown event"}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    By {proposal.submittedBy?.name || "Unknown"}
                  </span>
                </div>
              </Table.Cell>
              <Table.Cell>
                {formatDateRange(
                  proposal.eventId?.scheduledStartDate,
                  proposal.eventId?.scheduledEndDate
                )}
              </Table.Cell>
              <Table.Cell>
                ₹{Number(proposal.totalExpectedIncome || 0).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                ₹{Number(proposal.totalExpenditure || 0).toLocaleString()}
              </Table.Cell>
              <Table.Cell
                style={{
                  color:
                    Number(proposal.budgetDeflection || 0) > 0
                      ? "var(--color-danger)"
                      : "var(--color-success)",
                }}
              >
                ₹{Number(proposal.budgetDeflection || 0).toLocaleString()}
              </Table.Cell>
              <Table.Cell align="right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    onClose()
                    await openPendingProposalReview(proposal)
                  }}
                >
                  Review
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  </Modal>
)

export const GymkhanaPendingBillsModal = ({
  isOpen,
  onClose,
  pendingExpenseApprovalsForSelectedCalendar,
  formatDateRange,
  openPendingExpenseReview,
}) => (
  <Modal
    isOpen={isOpen}
    title="Pending Bills"
    width={860}
    onClose={onClose}
    footer={
      <Button size="sm" variant="secondary" onClick={onClose}>
        Close
      </Button>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-warning)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {pendingExpenseApprovalsForSelectedCalendar.length} pending in current calendar
      </span>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Event</Table.Head>
            <Table.Head>Date</Table.Head>
            <Table.Head>Submitted By</Table.Head>
            <Table.Head>Total Bills</Table.Head>
            <Table.Head>Assigned Budget</Table.Head>
            <Table.Head>Variance</Table.Head>
            <Table.Head align="right">Action</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {pendingExpenseApprovalsForSelectedCalendar.map((expense) => (
            <Table.Row key={expense._id}>
              <Table.Cell>
                <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                  {expense.eventId?.title || "Unknown event"}
                </span>
              </Table.Cell>
              <Table.Cell>
                {formatDateRange(
                  expense.eventId?.scheduledStartDate,
                  expense.eventId?.scheduledEndDate
                )}
              </Table.Cell>
              <Table.Cell>{expense.submittedBy?.name || "Unknown"}</Table.Cell>
              <Table.Cell>
                ₹{Number(expense.totalExpenditure || 0).toLocaleString()}
              </Table.Cell>
              <Table.Cell>₹{Number(expense.estimatedBudget || 0).toLocaleString()}</Table.Cell>
              <Table.Cell
                style={{
                  color:
                    Number(expense.budgetVariance || 0) > 0
                      ? "var(--color-danger)"
                      : "var(--color-success)",
                }}
              >
                ₹{Number(expense.budgetVariance || 0).toLocaleString()}
              </Table.Cell>
              <Table.Cell align="right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    onClose()
                    await openPendingExpenseReview(expense)
                  }}
                >
                  Review
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  </Modal>
)

export const GymkhanaOverlapDetailsModal = ({
  isOpen,
  onClose,
  dateConflicts,
}) => (
  <Modal
    isOpen={isOpen}
    title="Date Overlaps"
    width={640}
    onClose={onClose}
    footer={
      <Button size="sm" variant="secondary" onClick={onClose}>
        Close
      </Button>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-warning)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {dateConflicts.length} overlaps detected
      </span>
      {dateConflicts.map((conflict, index) => (
        <div
          key={`${conflict.eventA._id || conflict.eventA.title}-${conflict.eventB._id || conflict.eventB.title}-${index}`}
          style={{
            borderRadius: "var(--radius-card-sm)",
            padding: "var(--spacing-2)",
            backgroundColor: "var(--color-bg-secondary)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>
            {conflict.eventA.title}
          </span>
          <span style={{ color: "var(--color-text-muted)", margin: "0 var(--spacing-1)" }}>
            ↔
          </span>
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>
            {conflict.eventB.title}
          </span>
        </div>
      ))}
    </div>
  </Modal>
)

export const GymkhanaApprovalModal = ({
  isOpen,
  onClose,
  calendar,
  events,
  categoryOrder,
  categoryLabels,
  budgetSummary,
  dateConflicts,
  requiresCalendarNextApprovalSelection,
  calendarNextApprovalStages,
  toggleNextApprovalStage,
  setCalendarNextApprovalStages,
  postStudentAffairsStageOptions,
  approvalComments,
  setApprovalComments,
  submitting,
  onReject,
  onApprove,
}) => (
  <Modal
    isOpen={isOpen}
    title="Review Calendar"
    width={640}
    onClose={onClose}
    footer={
      <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" variant="danger" onClick={onReject} loading={submitting}>
          <X size={14} /> Reject
        </Button>
        <Button
          size="sm"
          variant="success"
          onClick={onApprove}
          loading={submitting}
          disabled={
            requiresCalendarNextApprovalSelection &&
            calendarNextApprovalStages.length === 0
          }
        >
          <Check size={14} /> Approve
        </Button>
      </div>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
        Reviewing {calendar?.academicYear} calendar with {events.length} events
      </span>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)", fontSize: "var(--font-size-xs)" }}>
        {categoryOrder.map((category) => (
          <span
            key={category}
            style={{
              padding: "var(--spacing-1) var(--spacing-2)",
              backgroundColor: "var(--color-bg-secondary)",
              borderRadius: "var(--radius-card-sm)",
            }}
          >
            {categoryLabels[category]}: ₹
            {(budgetSummary.byCategory[category] || 0).toLocaleString()}
          </span>
        ))}
        <span
          style={{
            padding: "var(--spacing-1) var(--spacing-2)",
            backgroundColor: "var(--color-primary-bg)",
            borderRadius: "var(--radius-card-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--color-primary)",
          }}
        >
          Total: ₹{budgetSummary.total.toLocaleString()}
        </span>
      </div>

      {dateConflicts.length > 0 && (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)" }}>
          <AlertTriangle size={12} style={{ marginRight: "var(--spacing-1)" }} />
          {dateConflicts.length} overlap(s) detected
        </span>
      )}

      {requiresCalendarNextApprovalSelection && (
        <div>
          <label style={formLabelStyles}>Next Approval Order</label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-1)",
              padding: "var(--spacing-2)",
              backgroundColor: "var(--color-bg-secondary)",
              borderRadius: "var(--radius-card-sm)",
            }}
          >
            {postStudentAffairsStageOptions.map((stage) => (
              <Checkbox
                key={`calendar-stage-${stage}`}
                label={stage}
                checked={calendarNextApprovalStages.includes(stage)}
                onChange={() =>
                  toggleNextApprovalStage(stage, setCalendarNextApprovalStages)
                }
              />
            ))}
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                marginTop: "var(--spacing-1)",
              }}
            >
              {calendarNextApprovalStages.length > 0
                ? calendarNextApprovalStages.join(" → ")
                : "No stage selected"}
            </span>
          </div>
        </div>
      )}

      <div>
        <label style={formLabelStyles} htmlFor="calendarReviewComments">
          Comments
        </label>
        <Textarea
          id="calendarReviewComments"
          name="comments"
          placeholder="Required for rejection"
          value={approvalComments}
          onChange={(event) => setApprovalComments(event.target.value)}
          rows={2}
        />
      </div>
    </div>
  </Modal>
)

export const GymkhanaOverlapConfirmModal = ({
  isOpen,
  onClose,
  submitOverlapInfo,
  submitting,
  onConfirm,
}) => (
  <Modal
    isOpen={isOpen}
    title="Confirm Overlap"
    width={560}
    onClose={onClose}
    footer={
      <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" variant="warning" onClick={onConfirm} loading={submitting}>
          Submit Anyway
        </Button>
      </div>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)" }}>
        {submitOverlapInfo?.message || "Events have overlapping date ranges."}
      </span>
      {(submitOverlapInfo?.overlaps || []).slice(0, 5).map((overlap, index) => (
        <div
          key={`${overlap.eventA?.eventId || overlap.eventA?.title}-${overlap.eventB?.eventId || overlap.eventB?.title}-${index}`}
          style={{
            borderRadius: "var(--radius-card-sm)",
            padding: "var(--spacing-2)",
            backgroundColor: "var(--color-bg-secondary)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>
            {overlap.eventA?.title}
          </span>
          <span style={{ color: "var(--color-text-muted)", margin: "0 var(--spacing-1)" }}>
            ↔
          </span>
          <span style={{ fontWeight: "var(--font-weight-medium)" }}>
            {overlap.eventB?.title}
          </span>
        </div>
      ))}
    </div>
  </Modal>
)
