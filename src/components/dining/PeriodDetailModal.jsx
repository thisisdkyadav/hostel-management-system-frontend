import { Button, StatusBadge } from "czero/react"
import { Heading, HStack, InfoRow, Modal, Text, VStack } from "@/components/ui"
import { Archive, ArchiveRestore, CalendarClock, Pencil, Users, UtensilsCrossed } from "lucide-react"
import CapacityBar from "./CapacityBar"
import {
  allocationStatusTone,
  eligibilityLabel,
  formatDate,
  formatDateRange,
  formatDateTime,
  periodStatusTone,
} from "./diningPeriodHelpers"

const Section = ({ icon, title, children }) => (
  <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
    <HStack gap={2} align="center">
      {icon}
      <Heading as="h3" size="sm" weight="semibold" color="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {title}
      </Heading>
    </HStack>
    {children}
  </section>
)

const Field = ({ label, value }) => (
  <div>
    <Text as="div" size="xs" color="muted">{label}</Text>
    <Text as="div" size="sm" color="secondary" weight="medium">
      {value}
    </Text>
  </div>
)

const fieldGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "var(--spacing-4)",
}

const tile = {
  border: "1px solid var(--color-border-primary)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--spacing-3)",
  backgroundColor: "var(--color-bg-secondary)",
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
    <Modal isOpen={isOpen} onClose={onClose} title="Dining Period" width={760} footer={footer}>
      <VStack gap={6}>
        {/* Header summary */}
        <HStack gap={3} align="start" justify="between">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", color: "var(--color-text-heading)", fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-lg)" }}>
            <CalendarClock size={18} style={{ color: "var(--color-primary)" }} />
            {formatDateRange(period.startDate, period.endDate)}
          </div>
          <VStack gap="var(--spacing-1-5)" align="end">
            <StatusBadge status={period.status} tone={periodStatusTone(period.status)} />
            <StatusBadge status={`Alloc: ${period.allocationStatus}`} tone={allocationStatusTone(period.allocationStatus)} showDot={false} />
          </VStack>
        </HStack>

        <Section icon={<CalendarClock size={16} style={{ color: "var(--color-text-muted)" }} />} title="Schedule">
          <div style={fieldGrid}>
            <Field label="Period start" value={formatDate(period.startDate)} />
            <Field label="Period end" value={formatDate(period.endDate)} />
            <Field label="Allocation opens" value={formatDateTime(period.allocationStartAt)} />
            <Field label="Allocation closes" value={formatDateTime(period.allocationEndAt)} />
            <Field label="Daily rate" value={period.dailyRate > 0 ? `₹${period.dailyRate}/day` : "Not set"} />
          </div>
        </Section>

        <Section icon={<Users size={16} style={{ color: "var(--color-text-muted)" }} />} title="Caterers & Capacity">
          <CapacityBar allocated={period.totalAllocated} total={period.totalCapacity} label="Overall capacity" />
          <VStack gap={2}>
            {period.catererCapacities.length === 0 && (
              <Text as="span" size="sm" color="muted">No caterers configured.</Text>
            )}
            {period.catererCapacities.map((entry) => (
              <div key={entry.catererId} style={tile}>
                <InfoRow label={entry.caterer?.name || "Caterer"} value={<>{entry.remainingSeats} seats left</>} style={{ marginBottom: "var(--spacing-2)" }} />
                <CapacityBar allocated={entry.allocatedCount} total={entry.maxStudentCount} size="sm" showLabel={false} />
                <Text as="div" size="xs" color="muted" style={{ marginTop: "var(--spacing-1-5)" }}>
                  {entry.allocatedCount}/{entry.maxStudentCount} allocated
                </Text>
              </div>
            ))}
          </VStack>
        </Section>

        <Section icon={<UtensilsCrossed size={16} style={{ color: "var(--color-text-muted)" }} />} title="Meal Slots">
          <VStack gap={2}>
            {period.mealSlots.map((slot, index) => (
              <InfoRow label={slot.name} value={<>{slot.startTime} – {slot.endTime}</>} key={`${slot.name}-${index}`} />
            ))}
          </VStack>
        </Section>

        <Section icon={<Archive size={16} style={{ color: "var(--color-text-muted)" }} />} title="Short-Term Rebate Rules">
          <div style={fieldGrid}>
            <Field label="Max total days" value={period.rebateSettings.shortTermMaxTotalDays} />
            <Field label="Max continuous days" value={period.rebateSettings.shortTermMaxContinuousDays} />
            <Field label="Min days / request" value={period.rebateSettings.shortTermMinApplicationDays} />
            <Field label="Advance notice days" value={period.rebateSettings.shortTermMinAdvanceDays} />
          </div>
        </Section>

        <Section icon={<Users size={16} style={{ color: "var(--color-text-muted)" }} />} title="Student Eligibility">
          <div style={fieldGrid}>
            <Field label="Mode" value={eligibilityLabel(period)} />
            <Field label="Eligible students" value={period.eligibleStudentCount} />
          </div>
        </Section>
      </VStack>
    </Modal>
  )
}

export default PeriodDetailModal
