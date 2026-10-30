import { useState } from "react"
import { Button, Modal } from "hzero"
import ApplyFromPicker from "./ApplyFromPicker"
import { applyDateError, initialApplyChoice, resolveApplyDate } from "./applyFrom"
import { formatFull } from "./menuHelpers"

/** Asks when a new weekly menu starts. Past weeks stay exactly as they were. */
export const ApplyFromModal = ({ isOpen, onClose, onConfirm, saving, today, keepDate = "", existingDates = [] }) => {
  const [value, setValue] = useState(() => initialApplyChoice(keepDate))
  const date = resolveApplyDate(value, today, keepDate)
  const error = applyDateError(date, today)
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply this menu from"
      description="Saving adds a new version of the weekly menu. Earlier weeks keep what was served."
      width={560}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" disabled={Boolean(error)} loading={saving} onClick={() => onConfirm(date)}>
            Save menu
          </Button>
        </>
      }
    >
      <div className="dm-dialog">
        <ApplyFromPicker value={value} onChange={setValue} today={today} keepDate={keepDate} />
        {error ? (
          <p className="dm-dialog__error">{error}</p>
        ) : (
          <p className="dm-dialog__note">
            This menu will be used from {formatFull(date)}.
            {existingDates.includes(date) ? " It replaces the version that already starts that day." : ""}
          </p>
        )}
      </div>
    </Modal>
  )
}

/** Copy the weekly menu between kitchens: pull one in, or push this one out to others. */
export const CopyKitchenModal = ({ isOpen, onClose, onConfirm, saving, today, kitchens, currentId, dirty }) => {
  const others = kitchens.filter((kitchen) => kitchen.id !== currentId)
  const [direction, setDirection] = useState("from")
  const [picked, setPicked] = useState([])
  const [value, setValue] = useState(() => initialApplyChoice(""))
  const date = resolveApplyDate(value, today, "")
  const error = applyDateError(date, today)
  const single = direction === "from"

  const toggle = (id) => setPicked((prev) => (single ? [id] : prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  const switchDirection = (next) => {
    setDirection(next)
    setPicked([])
  }

  const confirm = () =>
    onConfirm(
      single
        ? { fromCatererId: picked[0], toCatererIds: [currentId], effectiveFrom: date }
        : { fromCatererId: currentId, toCatererIds: picked, effectiveFrom: date },
    )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Copy a menu between kitchens"
      description="Copies the weekly menu in effect on the start day. Dates already set for single days are not copied."
      width={600}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" disabled={!picked.length || Boolean(error)} loading={saving} onClick={confirm}>
            Copy menu
          </Button>
        </>
      }
    >
      <div className="dm-dialog">
        <div className="dm-seg" role="tablist" aria-label="Direction">
          <button type="button" role="tab" aria-selected={single} data-active={single || undefined} onClick={() => switchDirection("from")}>
            Copy from another kitchen
          </button>
          <button type="button" role="tab" aria-selected={!single} data-active={!single || undefined} onClick={() => switchDirection("to")}>
            Copy this kitchen to others
          </button>
        </div>

        {others.length === 0 ? (
          <p className="dm-dialog__note">There is no other kitchen to copy with.</p>
        ) : (
          <div
            className="dm-dialog__chips"
            role={single ? "radiogroup" : "group"}
            aria-label={single ? "Source kitchen" : "Target kitchens"}
          >
            {others.map((kitchen) => (
              <button
                key={kitchen.id}
                type="button"
                className="dm-kitchen"
                aria-pressed={picked.includes(kitchen.id)}
                onClick={() => toggle(kitchen.id)}
              >
                {kitchen.name}
                {!kitchen.isActive && <em>inactive</em>}
              </button>
            ))}
          </div>
        )}

        <div className="dm-dialog__section">
          <span className="dm-editor__label">Start from</span>
          <ApplyFromPicker value={value} onChange={setValue} today={today} />
        </div>

        {error ? (
          <p className="dm-dialog__error">{error}</p>
        ) : (
          <p className="dm-dialog__note">
            {single ? "This kitchen" : "The chosen kitchens"} will use the copied menu from {formatFull(date)}. Earlier weeks are untouched.
            {dirty ? " Your unsaved edits here are not included." : ""}
          </p>
        )}
      </div>
    </Modal>
  )
}
