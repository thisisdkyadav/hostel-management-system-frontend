import { useState } from "react"
import { Button, Modal, Input, StatusBadge } from "czero/react"
import { CalendarClock } from "lucide-react"
import { Alert, Label, Textarea, VStack } from "@/components/ui"
import { formatCurrency, formatDateRange, getErrorMessage, getIdValue } from "./diningBillingHelpers"
import { periodStatusTone } from "./diningPeriodHelpers"

/**
 * Create / edit a billing period: a name, an optional note, and the set of
 * dining periods ("timing periods") it bills for. Conditional-mounted with a
 * `key` so the useState initializer seeds edit values without a reset effect.
 */
const BillingPeriodFormModal = ({
  isOpen,
  title,
  submitLabel,
  initialData = {},
  periods = [],
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(() => initialData.name || "")
  const [note, setNote] = useState(() => initialData.note || "")
  const [selectedPeriodIds, setSelectedPeriodIds] = useState(() =>
    Array.isArray(initialData.diningPeriodIds) ? initialData.diningPeriodIds.map(getIdValue).filter(Boolean) : []
  )
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const togglePeriod = (periodId) => {
    setSelectedPeriodIds((prev) =>
      prev.includes(periodId) ? prev.filter((id) => id !== periodId) : [...prev, periodId]
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setError("Billing period name is required.")
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), note: note.trim(), diningPeriodIds: selectedPeriodIds })
      onClose()
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to save billing period. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={640}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="billing-period-form" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </>
      }
    >
      <form id="billing-period-form" onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && <Alert type="error" icon>{error}</Alert>}

          <div>
            <Label htmlFor="billing-name" required>Billing Period Name</Label>
            <Input
              id="billing-name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (error) setError("") }}
              placeholder="e.g. Semester 1 — Mess Billing"
              required
            />
          </div>

          <div>
            <Label>Dining Periods to Bill</Label>
            {periods.length === 0 ? (
              <Alert type="warning" icon>No dining periods found. Create a dining period (with a daily rate) first.</Alert>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", maxHeight: "260px", overflowY: "auto" }}>
                {periods.map((period) => {
                  const selected = selectedPeriodIds.includes(period.id)
                  return (
                    <label
                      key={period.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--spacing-3)",
                        padding: "var(--spacing-3)",
                        border: `1px solid ${selected ? "var(--color-primary)" : "var(--color-border-primary)"}`,
                        borderRadius: "var(--radius-lg)",
                        backgroundColor: selected ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                        cursor: "pointer",
                      }}
                    >
                      <input type="checkbox" checked={selected} onChange={() => togglePeriod(period.id)} />
                      <CalendarClock size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>
                          {formatDateRange(period.startDate, period.endDate)}
                        </span>
                        <span style={{ display: "block", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                          {period.dailyRate > 0 ? `${formatCurrency(period.dailyRate)}/day` : "No daily rate set"}
                        </span>
                      </span>
                      {period.status && <StatusBadge status={period.status} tone={periodStatusTone(period.status)} />}
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="billing-note">Note (optional)</Label>
            <Textarea
              id="billing-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any internal note about this billing period"
              rows={2}
            />
          </div>

          <Alert type="info" icon>
            Each student is billed each dining period&apos;s daily rate for every eligible day (approved-rebate days are skipped).
            Top up student allocations from the billing period&apos;s detail page.
          </Alert>
        </VStack>
      </form>
    </Modal>
  )
}

export default BillingPeriodFormModal
