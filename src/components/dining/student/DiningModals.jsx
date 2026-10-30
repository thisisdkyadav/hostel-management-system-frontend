import { useState } from "react"
import { Alert, Button, ConfirmDialog, Field, Input, Modal, StatusBadge, Textarea, ToggleButtonGroup } from "hzero"
import CapacityBar from "@/components/dining/CapacityBar"
import { catererInitials, formatRange, getErrorMessage, localTodayKey } from "../caterer/catererHelpers"

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
            <Input
              id="sd-away-end"
              type="date"
              min={form.startDate || localTodayKey()}
              value={form.endDate}
              onChange={set("endDate")}
              required
            />
          </Field>
        </div>
        <Field label="Reason (optional)" htmlFor="sd-away-reason">
          <Textarea id="sd-away-reason" rows={2} value={form.reason} onChange={set("reason")} placeholder="e.g. Going home for Diwali" />
        </Field>
      </form>
    </Modal>
  )
}

const SERIES_COUNT = 8
// "Filling fast" once a caterer is down to its last 15% of seats.
const LOW_SEATS_RATIO = 0.15

const seatState = ({ isSelected, remaining, max }) => {
  if (isSelected) return { key: "selected", label: "Your caterer", tone: "success" }
  if (remaining <= 0) return { key: "full", label: "Full", tone: "danger" }
  if (max > 0 && remaining / max <= LOW_SEATS_RATIO) return { key: "low", label: "Filling fast", tone: "warning" }
  return { key: "open", label: "", tone: "" }
}

/** One card per caterer with live seats; `onSelect(option)` asks to choose it. */
export const CatererOptions = ({ period, selectedCatererId, selectingCatererId, onSelect }) => {
  const options = Array.isArray(period?.catererCapacities) ? period.catererCapacities : []

  return (
    <ul className="sd-choose">
      {options.map((option, index) => {
        const isSelected = selectedCatererId === String(option.catererId)
        const remaining = Math.max(0, Number(option.remainingSeats || 0))
        const max = Number(option.maxStudentCount || 0)
        const state = seatState({ isSelected, remaining, max })
        const isFull = state.key === "full"
        const isSelecting = selectingCatererId === option.catererId
        const name = option.caterer?.name || "Caterer"
        return (
          <li
            key={option.catererId}
            className="sd-choose__option"
            data-state={state.key}
            style={{ "--sd-hue": `var(--color-series-${(index % SERIES_COUNT) + 1})` }}
          >
            <div className="sd-choose__top">
              <span className="sd-choose__avatar" aria-hidden="true">
                {catererInitials(name)}
              </span>
              <div className="sd-choose__id">
                <span className="sd-choose__name">{name}</span>
                <span className="sd-choose__meta">
                  {isFull ? "No seats left" : `${remaining.toLocaleString()} of ${max.toLocaleString()} seats left`}
                </span>
              </div>
              {state.label && <StatusBadge status={state.label} tone={state.tone} />}
            </div>
            <CapacityBar allocated={max - remaining} total={max} size="sm" showLabel={false} />
            <Button
              variant={isSelected ? "secondary" : "primary"}
              fullWidth
              disabled={isFull || isSelecting || isSelected || Boolean(selectingCatererId)}
              loading={isSelecting}
              onClick={() => onSelect(option)}
            >
              {isSelected ? "Chosen" : isFull ? "Full" : "Choose"}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

/** Pick a caterer for the open period; seats refresh while it is open. */
export const ChooseCatererModal = ({ period, selectedCatererId, selectingCatererId, onClose, onSelect }) => (
  <Modal isOpen onClose={onClose} title="Choose your caterer" width={760}>
    <p className="sd-form__note">
      For {formatRange(period.startDate, period.endDate)}. Seats update live, so pick soon if one is filling up.
    </p>
    <CatererOptions period={period} selectedCatererId={selectedCatererId} selectingCatererId={selectingCatererId} onSelect={onSelect} />
  </Modal>
)

const YES_NO_OPTIONS = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
]

/** Yes / No answer; `value` null/undefined shows neither selected. */
export const YesNoToggle = ({ value, onChange, disabled = false, size = "small" }) => (
  <ToggleButtonGroup
    options={YES_NO_OPTIONS}
    value={value}
    onChange={onChange}
    shape="rounded"
    size={size}
    hideLabelsOnMobile={false}
    disabled={disabled}
  />
)

/**
 * "Choose this caterer?" confirmation shared by the Dining page and the
 * allocation screen. When the period asks allocation-tag questions, each needs
 * a Yes / No answer (nothing preselected) before the choice can be confirmed.
 * `onConfirm(tagAnswers)` gets `[{ tagId, value }]`. Mount it only while a
 * caterer is pending so the answers start blank each time.
 */
export const ConfirmCatererDialog = ({ target, tags, onClose, onConfirm }) => {
  const [answers, setAnswers] = useState({})
  const questions = Array.isArray(tags) ? tags : []
  const name = target?.caterer?.name || "this caterer"
  const message = `You'll eat at ${name} for the whole period. You can't change it after confirming.`

  if (questions.length === 0) {
    return (
      <ConfirmDialog
        isOpen
        onClose={onClose}
        onConfirm={() => onConfirm([])}
        title="Choose this caterer?"
        message={message}
        confirmText="Yes, choose"
      />
    )
  }

  const unanswered = questions.filter((tag) => typeof answers[tag.id] !== "boolean")
  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Choose this caterer?"
      width={520}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={unanswered.length > 0}
            onClick={() => onConfirm(questions.map((tag) => ({ tagId: tag.id, value: answers[tag.id] })))}
          >
            Yes, choose
          </Button>
        </>
      }
    >
      <div className="sd-form">
        <p className="sd-form__note">{message}</p>
        <ul className="sd-tagq">
          {questions.map((tag) => (
            <li key={tag.id} className="sd-tagq__row">
              <span id={`sd-tagq-${tag.id}`} className="sd-tagq__label">
                {tag.question || tag.name}
              </span>
              <YesNoToggle value={answers[tag.id]} onChange={(value) => setAnswers((prev) => ({ ...prev, [tag.id]: value }))} />
            </li>
          ))}
        </ul>
        <p className="sd-form__note">
          {unanswered.length > 0
            ? `Answer ${unanswered.length === 1 ? "this question" : "all questions"} to continue. `
            : ""}
          Your caterer is final, but you can change these answers until the period starts.
        </p>
      </div>
    </Modal>
  )
}
