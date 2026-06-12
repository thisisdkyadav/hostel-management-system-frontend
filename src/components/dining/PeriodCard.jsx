import { Button, StatusBadge } from "czero/react"
import { CalendarClock, Eye, Pencil, Users, UtensilsCrossed } from "lucide-react"
import { Card } from "@/components/ui"
import CapacityBar from "./CapacityBar"
import {
  allocationStatusTone,
  eligibilityLabel,
  formatDateRange,
  periodStatusTone,
} from "./diningPeriodHelpers"

const MealSlotChip = ({ slot }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--spacing-1)",
      padding: "var(--spacing-1) var(--spacing-2)",
      borderRadius: "var(--radius-md)",
      backgroundColor: "var(--color-bg-tertiary)",
      border: "1px solid var(--color-border-primary)",
      fontSize: "var(--font-size-xs)",
      color: "var(--color-text-secondary)",
      whiteSpace: "nowrap",
    }}
  >
    <UtensilsCrossed size={12} style={{ color: "var(--color-text-muted)" }} />
    <strong style={{ fontWeight: "var(--font-weight-medium)" }}>{slot.name}</strong>
    <span style={{ color: "var(--color-text-muted)" }}>
      {slot.startTime}–{slot.endTime}
    </span>
  </span>
)

/**
 * A single dining period rendered as a scannable card.
 * Clicking the card body opens the read-only detail drawer; Edit is explicit.
 */
const PeriodCard = ({ period, onView, onEdit }) => (
  <Card
    onClick={() => onView(period)}
    padding="p-4 md:p-5"
    className="h-full"
    style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}
  >
    {/* Title row */}
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--spacing-3)" }}>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-2)",
            color: "var(--color-text-heading)",
            fontWeight: "var(--font-weight-semibold)",
            fontSize: "var(--font-size-md)",
          }}
        >
          <CalendarClock size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
          <span>{formatDateRange(period.startDate, period.endDate)}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-1-5)",
            marginTop: "var(--spacing-1-5)",
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <Users size={14} />
          <span>
            {period.caterers.length} caterer{period.caterers.length === 1 ? "" : "s"} · {eligibilityLabel(period)}
            {" "}({period.eligibleStudentCount})
          </span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--spacing-1-5)", flexShrink: 0 }}>
        <StatusBadge status={period.status} tone={periodStatusTone(period.status)} />
        <StatusBadge status={`Alloc: ${period.allocationStatus}`} tone={allocationStatusTone(period.allocationStatus)} showDot={false} />
      </div>
    </div>

    {/* Capacity */}
    <CapacityBar allocated={period.totalAllocated} total={period.totalCapacity} />

    {/* Meal slots */}
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)" }}>
      {period.mealSlots.map((slot, index) => (
        <MealSlotChip key={`${slot.name}-${index}`} slot={slot} />
      ))}
    </div>

    {/* Actions */}
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "var(--spacing-2)",
        marginTop: "auto",
        paddingTop: "var(--spacing-2)",
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={(event) => {
          event.stopPropagation()
          onView(period)
        }}
      >
        <Eye size={16} /> View
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={(event) => {
          event.stopPropagation()
          onEdit(period)
        }}
      >
        <Pencil size={16} /> Edit
      </Button>
    </div>
  </Card>
)

export default PeriodCard
