import { useState } from "react"
import { Alert, Button, Field, Input, Modal, StatusBadge, Textarea } from "hzero"
import CapacityBar from "@/components/dining/CapacityBar"
import { formatRange, getErrorMessage, localTodayKey } from "../caterer/catererHelpers"

/** "I'll be away": a date range and an optional reason. */
export const AwayModal = ({ onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" })
  const [error, setError] = useState("")
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.startDate || !form.endDate) return setError("Pick the first and last day you'll be away.")
    if (form.startDate > form.endDate) return setError("The last day can't be before the first day.")
    setError("")
    try {
      await onSubmit(form)
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Couldn't save that. Please check the dates."))
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="I'll be away"
      width={520}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="sd-away-form" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            Send
          </Button>
        </>
      }
    >
      <form id="sd-away-form" className="sd-form" onSubmit={handleSubmit}>
        <p className="sd-form__note">
          You won&apos;t be charged for these days. Short trips are approved straight away; longer ones go to the dining office.
        </p>
        {error && (
          <Alert type="error" icon>
            {error}
          </Alert>
        )}
        <div className="sd-form__dates">
          <Field label="First day away" htmlFor="sd-away-start" required>
            <Input id="sd-away-start" type="date" min={localTodayKey()} value={form.startDate} onChange={set("startDate")} required />
          </Field>
          <Field label="Last day away" htmlFor="sd-away-end" required>
            <Input id="sd-away-end" type="date" min={form.startDate || localTodayKey()} value={form.endDate} onChange={set("endDate")} required />
          </Field>
        </div>
        <Field label="Reason (optional)" htmlFor="sd-away-reason">
          <Textarea id="sd-away-reason" rows={2} value={form.reason} onChange={set("reason")} placeholder="e.g. Going home for Diwali" />
        </Field>
      </form>
    </Modal>
  )
}

/** Pick a caterer for the open period; seats refresh while it is open. */
export const ChooseCatererModal = ({ period, selectedCatererId, selectingCatererId, onClose, onSelect }) => {
  const options = Array.isArray(period?.catererCapacities) ? period.catererCapacities : []

  return (
    <Modal isOpen onClose={onClose} title="Choose your caterer" width={760}>
      <p className="sd-form__note">
        For {formatRange(period.startDate, period.endDate)}. Seats update live, so pick soon if one is filling up.
      </p>
      <ul className="sd-choose">
        {options.map((option) => {
          const isSelected = selectedCatererId === String(option.catererId)
          const remaining = Number(option.remainingSeats || 0)
          const max = Number(option.maxStudentCount || 0)
          const isFull = remaining <= 0 && !isSelected
          const isSelecting = selectingCatererId === option.catererId
          return (
            <li key={option.catererId} className="sd-choose__option" data-full={isFull || undefined}>
              <div className="sd-choose__head">
                <span className="sd-choose__name">{option.caterer?.name || "Caterer"}</span>
                {isSelected && <StatusBadge status="Your caterer" tone="success" />}
              </div>
              <CapacityBar allocated={max - remaining} total={max} label={isFull ? "Full" : `${remaining} seats left`} />
              <Button
                variant={isSelected ? "secondary" : "primary"}
                fullWidth
                disabled={isFull || isSelecting || isSelected}
                loading={isSelecting}
                onClick={() => onSelect(option)}
              >
                {isSelected ? "Chosen" : isFull ? "Full" : "Choose"}
              </Button>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
