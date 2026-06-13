import { Button, Modal, StatusBadge } from "czero/react"
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
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
      {icon}
      <h3
        style={{
          margin: 0,
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-semibold)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--color-text-muted)",
        }}
      >
        {title}
      </h3>
    </div>
    {children}
  </section>
)

const Field = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{label}</div>
    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", fontWeight: "var(--font-weight-medium)" }}>
      {value}
    </div>
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
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
        {/* Header summary */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", color: "var(--color-text-heading)", fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-lg)" }}>
            <CalendarClock size={18} style={{ color: "var(--color-primary)" }} />
            {formatDateRange(period.startDate, period.endDate)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--spacing-1-5)" }}>
            <StatusBadge status={period.status} tone={periodStatusTone(period.status)} />
            <StatusBadge status={`Alloc: ${period.allocationStatus}`} tone={allocationStatusTone(period.allocationStatus)} showDot={false} />
          </div>
        </div>

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
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
            {period.catererCapacities.length === 0 && (
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>No caterers configured.</span>
            )}
            {period.catererCapacities.map((entry) => (
              <div key={entry.catererId} style={tile}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-2)", marginBottom: "var(--spacing-2)" }}>
                  <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-secondary)" }}>
                    {entry.caterer?.name || "Caterer"}
                  </span>
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    {entry.remainingSeats} seats left
                  </span>
                </div>
                <CapacityBar allocated={entry.allocatedCount} total={entry.maxStudentCount} size="sm" showLabel={false} />
                <div style={{ marginTop: "var(--spacing-1-5)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  {entry.allocatedCount}/{entry.maxStudentCount} allocated
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={<UtensilsCrossed size={16} style={{ color: "var(--color-text-muted)" }} />} title="Meal Slots">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
            {period.mealSlots.map((slot, index) => (
              <div
                key={`${slot.name}-${index}`}
                style={{ ...tile, display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>
                  {slot.name}
                </span>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  {slot.startTime} – {slot.endTime}
                </span>
              </div>
            ))}
          </div>
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
      </div>
    </Modal>
  )
}

export default PeriodDetailModal
