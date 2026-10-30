import { Badge, Button, Card, HStack, StatusBadge, Surface, Text } from "hzero"
import { AlertTriangle, CalendarClock, Eye, Pencil, Users, UtensilsCrossed, Wand2 } from "lucide-react"
import CapacityBar from "./CapacityBar"
import {
  allocationStatusTone,
  eligibilityLabel,
  formatDateRange,
  formatDateTime,
  getAutoAllocationState,
  periodStatusTone,
} from "./diningPeriodHelpers"

const MealSlotChip = ({ slot }) => (
  <Surface as="span" bg="tertiary" padding="var(--spacing-1) var(--spacing-2)" radius="md" border="1px solid var(--color-border-primary)" color="secondary" size="xs" style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-1)", whiteSpace: "nowrap" }}>
    <UtensilsCrossed size={12} style={{ color: "var(--color-text-muted)" }} />
    <Text as="strong" weight="medium">{slot.name}</Text>
    <Text as="span" color="muted">
      {slot.startTime}–{slot.endTime}
    </Text>
  </Surface>
)

/** Scheduled auto-allocation chip, or a warning once it ran and students were left over. */
const AutoAllocationMeta = ({ period }) => {
  const state = getAutoAllocationState(period)
  const leftOver = Number(period.autoAllocation?.leftOver || 0)
  const showScheduled = state === "scheduled" || state === "running"
  const showLeftOver = state === "completed" && leftOver > 0
  if (!showScheduled && !showLeftOver) return null

  return (
    <HStack gap={2} wrap>
      {showScheduled && (
        <Badge variant="info" size="sm" icon={<Wand2 />}>
          {state === "running" ? "Auto-allocating…" : `Auto-allocates ${formatDateTime(period.autoAllocationAt)}`}
        </Badge>
      )}
      {showLeftOver && (
        <Badge variant="warning" size="sm" icon={<AlertTriangle />}>
          {leftOver} student{leftOver === 1 ? "" : "s"} left unassigned
        </Badge>
      )}
    </HStack>
  )
}

/**
 * A single dining period rendered as a scannable card.
 * Clicking the card body opens the read-only detail drawer; Edit is explicit.
 */
const PeriodCard = ({ period, onView, onEdit, onManage }) => (
  <Card
    onClick={() => onView(period)}
    padding="p-4 md:p-5"
    className="h-full"
    style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}
  >
    {/* Title row */}
    <HStack gap={3} align="start" justify="between">
      <div style={{ minWidth: 0 }}>
        <HStack align="center" gap={2} size="md" weight="semibold" color="heading">
          <CalendarClock size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
          <span>{formatDateRange(period.startDate, period.endDate)}</span>
        </HStack>
        <HStack align="center" gap="var(--spacing-1-5)" size="sm" color="muted" style={{ marginTop: "var(--spacing-1-5)" }}>
          <Users size={14} />
          <span>
            {period.caterers.length} caterer{period.caterers.length === 1 ? "" : "s"} · {eligibilityLabel(period)}
            {" "}({period.eligibleStudentCount})
          </span>
        </HStack>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--spacing-1-5)", flexShrink: 0 }}>
        <StatusBadge status={period.status} tone={periodStatusTone(period.status)} />
        <StatusBadge status={`Alloc: ${period.allocationStatus}`} tone={allocationStatusTone(period.allocationStatus)} showDot={false} />
      </div>
    </HStack>

    {/* Capacity */}
    <CapacityBar allocated={period.totalAllocated} total={period.totalCapacity} />

    {/* Scheduled auto-allocation / leftovers */}
    <AutoAllocationMeta period={period} />

    {/* Meal slots */}
    <HStack gap={2} wrap>
      {period.mealSlots.map((slot, index) => (
        <MealSlotChip key={`${slot.name}-${index}`} slot={slot} />
      ))}
    </HStack>

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
      {onManage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation()
            onManage(period)
          }}
        >
          <Users size={16} /> Students
        </Button>
      )}
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
