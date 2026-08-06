import { Button, Table } from "czero/react"
import { Grid, HStack, Modal, Surface, Text, VStack } from "@/components/ui"
import { Select } from "@/components/ui"
import { AlertTriangle, Check, X } from "lucide-react"
import { Textarea } from "@/components/ui/form"
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
    <VStack gap={2}>
      <Text as="span" size="xs" color="warning" weight="medium">
        {pendingProposalsForSelectedCalendar.length} pending in current calendar
      </Text>
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
                <VStack gap={1}>
                  <Text as="span" weight="medium">
                    {proposal.eventId?.title || "Unknown event"}
                  </Text>
                  <Text as="span" size="xs" color="muted">
                    By {proposal.submittedBy?.name || "Unknown"}
                  </Text>
                </VStack>
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
    </VStack>
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
    <VStack gap={2}>
      <Text as="span" size="xs" color="warning" weight="medium">
        {pendingExpenseApprovalsForSelectedCalendar.length} pending in current calendar
      </Text>
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
                <Text as="span" weight="medium">
                  {expense.eventId?.title || "Unknown event"}
                </Text>
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
    </VStack>
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
    <VStack gap={2}>
      <Text as="span" size="xs" color="warning" weight="medium">
        {dateConflicts.length} overlaps detected
      </Text>
      {dateConflicts.map((conflict, index) => (
        <Surface bg="secondary" padding={2} radius="card-sm" size="xs" key={`${conflict.eventA._id || conflict.eventA.title}-${conflict.eventB._id || conflict.eventB.title}-${index}`}>
          <Text as="span" weight="medium">
            {conflict.eventA.title}
          </Text>
          <Text as="span" color="muted" style={{ margin: "0 var(--spacing-1)" }}>
            ↔
          </Text>
          <Text as="span" weight="medium">
            {conflict.eventB.title}
          </Text>
        </Surface>
      ))}
    </VStack>
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
  calendarNextApproversByStage,
  setCalendarNextApproverForStage,
  postStudentAffairsStageOptions,
  postStudentAffairsApproverOptionsByStage,
  approvalComments,
  setApprovalComments,
  submitting,
  onReject,
  onApprove,
  onDirectApprove,
}) => (
  <Modal
    isOpen={isOpen}
    title="Review Calendar"
    width={640}
    onClose={onClose}
    footer={
      <HStack gap={2}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" variant="danger" onClick={onReject} loading={submitting}>
          <X size={14} /> Reject
        </Button>
        {requiresCalendarNextApprovalSelection ? (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={onApprove}
              loading={submitting}
              disabled={Object.values(calendarNextApproversByStage || {}).filter(Boolean).length === 0}
            >
              <Check size={14} /> Recommend & Forward
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={onDirectApprove}
              loading={submitting}
              disabled={Object.values(calendarNextApproversByStage || {}).filter(Boolean).length > 0}
            >
              <Check size={14} /> Approve
            </Button>
          </>
        ) : (
          <Button size="sm" variant="success" onClick={onApprove} loading={submitting}>
            <Check size={14} /> Approve
          </Button>
        )}
      </HStack>
    }
  >
    <VStack gap={3}>
      <Text as="span" size="xs" color="muted">
        Reviewing {calendar?.academicYear} calendar with {events.length} events
      </Text>

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
        <Surface as="span" bg="brand" padding="var(--spacing-1) var(--spacing-2)" radius="card-sm" color="brand" weight="medium">
          Total: ₹{budgetSummary.total.toLocaleString()}
        </Surface>
      </div>

      {dateConflicts.length > 0 && (
        <Text as="span" size="xs" color="warning">
          <AlertTriangle size={12} style={{ marginRight: "var(--spacing-1)" }} />
          {dateConflicts.length} overlap(s) detected
        </Text>
      )}

      {requiresCalendarNextApprovalSelection && (
        <div>
          <label style={formLabelStyles}>Next Recommenders</label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-2)",
              padding: "var(--spacing-2)",
              backgroundColor: "var(--color-bg-secondary)",
              borderRadius: "var(--radius-card-sm)",
            }}
          >
            <Text as="span" size="xs" color="muted">
              Leave a row blank to skip that stage.
            </Text>
            {postStudentAffairsStageOptions.map((stage) => (
              <Grid cols="minmax(0, 190px) 1fr" gap={2} align="center" key={`calendar-stage-${stage}`}>
                <Text as="span" size="sm" color="body">
                  {stage}
                </Text>
                <Select
                  name={`calendar-next-approver-${stage}`}
                  value={calendarNextApproversByStage?.[stage] || ""}
                  onChange={(event) => setCalendarNextApproverForStage(stage, event.target.value)}
                  options={[
                    { value: "", label: `Skip ${stage}` },
                    ...(postStudentAffairsApproverOptionsByStage?.[stage] || []),
                  ]}
                  placeholder={`Select ${stage}`}
                />
              </Grid>
            ))}
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
    </VStack>
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
      <HStack gap={2}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" variant="warning" onClick={onConfirm} loading={submitting}>
          Submit Anyway
        </Button>
      </HStack>
    }
  >
    <VStack gap={2}>
      <Text as="span" size="xs" color="warning">
        {submitOverlapInfo?.message || "Events have overlapping date ranges."}
      </Text>
      {(submitOverlapInfo?.overlaps || []).slice(0, 5).map((overlap, index) => (
        <Surface bg="secondary" padding={2} radius="card-sm" size="xs" key={`${overlap.eventA?.eventId || overlap.eventA?.title}-${overlap.eventB?.eventId || overlap.eventB?.title}-${index}`}>
          <Text as="span" weight="medium">
            {overlap.eventA?.title}
          </Text>
          <Text as="span" color="muted" style={{ margin: "0 var(--spacing-1)" }}>
            ↔
          </Text>
          <Text as="span" weight="medium">
            {overlap.eventB?.title}
          </Text>
        </Surface>
      ))}
    </VStack>
  </Modal>
)
