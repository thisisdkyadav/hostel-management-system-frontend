import { Input } from "hzero"
import { maxAheadKey } from "./applyFrom"
import { formatFull, formatLong, nextMondayAfter } from "./menuHelpers"

/**
 * "Apply from": today, next Monday, or a chosen date (never in the past). `keepDate` adds a first option
 * that keeps a scheduled version on its own start day.
 */
const ApplyFromPicker = ({ value, onChange, today, keepDate = "" }) => {
  const options = [
    ...(keepDate ? [{ id: "keep", label: "Same start", hint: formatFull(keepDate) }] : []),
    { id: "today", label: "Today", hint: formatLong(today) },
    { id: "monday", label: "Next Monday", hint: formatLong(nextMondayAfter(today)) },
    { id: "date", label: "Pick a date", hint: value.choice === "date" && value.custom ? formatFull(value.custom) : "Choose below" },
  ]
  return (
    <div className="dm-apply">
      <div className="dm-apply__options" role="radiogroup" aria-label="Apply from">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={value.choice === option.id}
            className="dm-apply__option"
            data-active={value.choice === option.id || undefined}
            onClick={() => onChange({ ...value, choice: option.id, custom: value.custom || today })}
          >
            <strong>{option.label}</strong>
            <span>{option.hint}</span>
          </button>
        ))}
      </div>
      {value.choice === "date" && (
        <Input
          type="date"
          aria-label="Start date"
          value={value.custom || ""}
          min={today}
          max={maxAheadKey(today)}
          onChange={(event) => onChange({ ...value, custom: event.target.value })}
        />
      )}
    </div>
  )
}

export default ApplyFromPicker
