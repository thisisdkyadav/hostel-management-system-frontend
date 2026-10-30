import { Button, DetailSection, EmptyState, HStack, InfoRow, Modal, StatusBadge, Text, VStack } from "hzero"
import { Archive, ArchiveRestore, CalendarClock, ClipboardCheck, Pencil, Tags, Users, UtensilsCrossed } from "lucide-react"
import CapacityBar from "./CapacityBar"
import {
  allocationStatusTone,
  eligibilityLabel,
  formatDate,
  formatDateRange,
  formatDateTime,
  getAutoAllocationState,
  periodStatusTone,
} from "./diningPeriodHelpers"

const autoAllocationLabel = (period) => {
  const state = getAutoAllocationState(period)
  if (state === "none") return "Not scheduled"
  const when = formatDateTime(period.autoAllocationAt)
  if (state === "scheduled") return `${when} (scheduled)`
  if (state === "running") return `${when} (running)`
  if (state === "failed") return `${when} (failed)`
  const { assigned, leftOver } = period.autoAllocation
  return `${when} (done: ${Number(assigned || 0)} assigned, ${Number(leftOver || 0)} left over)`
}

/** Read-only deep view of a single dining period, in the common Modal. */
const PeriodDetailModal = ({ period, isOpen, onClose, onEdit, onToggleArchive }) => {
  if (!period) return null

  const footer = (
    <>
      <Button variant="secondary" onClick={() => onToggleArchive(period)}>
        {period.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
        {period.isArchived ? "Unarchive" : "Archive"}
      </Button>
      <Button variant="primary" onClick={() => onEdit(period)}>
        <Pencil size={16} /> Edit
      </Button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dining period" width={760} footer={footer}>
      <VStack gap={6}>
        {/* Header summary */}
        <HStack gap={3} align="start" justify="between">
          <HStack align="center" gap={2} size="lg" weight="semibold" color="heading">
            <CalendarClock size={18} style={{ color: "var(--color-primary)" }} />
            {formatDateRange(period.startDate, period.endDate)}
          </HStack>
          <VStack gap="var(--spacing-1-5)" align="end">
            <StatusBadge status={period.status} tone={periodStatusTone(period.status)} />
            <StatusBadge status={`Alloc: ${period.allocationStatus}`} tone={allocationStatusTone(period.allocationStatus)} showDot={false} />
          </VStack>
        </HStack>

        <DetailSection title="Schedule" icon={CalendarClock} columns={2}>
          <InfoRow label="Period start" value={formatDate(period.startDate)} />
          <InfoRow label="Period end" value={formatDate(period.endDate)} />
          <InfoRow label="Allocation opens" value={formatDateTime(period.allocationStartAt)} />
          <InfoRow label="Allocation closes" value={formatDateTime(period.allocationEndAt)} />
          <InfoRow label="Student email" value={period.notificationAt ? `${formatDateTime(period.notificationAt)}${period.notificationSentAt ? " (sent)" : ""}` : "Not scheduled"} />
          <InfoRow label="Auto-allocation" value={autoAllocationLabel(period)} />
          <InfoRow label="Daily rate" value={period.dailyRate > 0 ? `₹${period.dailyRate}/day` : "Not set"} />
        </DetailSection>

        <DetailSection title="Caterers and capacity" icon={Users}>
          <CapacityBar allocated={period.totalAllocated} total={period.totalCapacity} label="Overall capacity" />
          {period.catererCapacities.length === 0 && (
            <EmptyState variant="inline" icon={Users} message="No caterers configured. Add a caterer to this period to set its capacity." />
          )}
          {period.catererCapacities.map((entry) => (
            <VStack gap={2} key={entry.catererId}>
              <InfoRow label={entry.caterer?.name || "Caterer"} value={<>{entry.remainingSeats} seats left</>} />
              <CapacityBar allocated={entry.allocatedCount} total={entry.maxStudentCount} size="sm" showLabel={false} />
              <Text as="div" size="xs" color="muted">
                {entry.allocatedCount}/{entry.maxStudentCount} allocated
              </Text>
            </VStack>
          ))}
        </DetailSection>

        <DetailSection title="Meal slots" icon={UtensilsCrossed}>
          {period.mealSlots.map((slot, index) => (
            <InfoRow label={slot.name} value={<>{slot.startTime} – {slot.endTime}</>} key={`${slot.name}-${index}`} />
          ))}
        </DetailSection>

        <DetailSection title="Short-term rebate rules" icon={ClipboardCheck} columns={2}>
          <InfoRow label="Max total days" value={period.rebateSettings.shortTermMaxTotalDays} />
          <InfoRow label="Max continuous days" value={period.rebateSettings.shortTermMaxContinuousDays} />
          <InfoRow label="Min days per request" value={period.rebateSettings.shortTermMinApplicationDays} />
          <InfoRow label="Advance notice days" value={period.rebateSettings.shortTermMinAdvanceDays} />
        </DetailSection>

        <DetailSection title="Student eligibility" icon={Users} columns={2}>
          <InfoRow label="Mode" value={eligibilityLabel(period)} />
          <InfoRow label="Eligible students" value={period.eligibleStudentCount} />
        </DetailSection>

        <DetailSection title="Allocation tags" icon={Tags}>
          {period.tags.length === 0 && (
            <EmptyState variant="inline" icon={Tags} message="No allocation tags. Add one in Edit to ask students a yes/no question when they choose a caterer." />
          )}
          {period.tags.map((tag) => (
            <VStack gap={1} key={tag.id}>
              <InfoRow label={tag.name} value={<>Default: {tag.defaultValue === null ? "Not set" : tag.defaultValue ? "Yes" : "No"}</>} />
              <Text as="div" size="xs" color="muted">
                {tag.question ? `${tag.question} · ` : ""}
                {tag.counts.yes} yes · {tag.counts.no} no · {tag.counts.answered} answered
              </Text>
            </VStack>
          ))}
        </DetailSection>
      </VStack>
    </Modal>
  )
}

export default PeriodDetailModal
