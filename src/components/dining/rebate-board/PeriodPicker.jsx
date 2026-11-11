import { useEffect, useRef, useState } from "react"
import { CalendarRange, ChevronDown } from "lucide-react"
import { days, periodText } from "./rebateBoardHelpers"

const PHASES = {
  current: { label: "Running", tone: "ok" },
  upcoming: { label: "Upcoming", tone: "info" },
  past: { label: "Ended", tone: "none" },
}
const GROUPS = [
  ["current", "Running now"],
  ["upcoming", "Upcoming"],
  ["past", "Earlier"],
]

/**
 * The dining period the board shows, in the page header. `value` is a period
 * id or "outside" (days no period covers).
 */
const PeriodPicker = ({ periods = [], value, onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = periods.find((period) => period.id === value)
  const phase = selected ? PHASES[selected.phase] : null

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (event.type === "keydown" ? event.key === "Escape" : !ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", close)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", close)
    }
  }, [open])

  const pick = (next) => {
    setOpen(false)
    if (next !== value) onChange(next)
  }

  return (
    <div className="rb-picker" ref={ref}>
      <button type="button" className="rb-picker__button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((on) => !on)}>
        <CalendarRange size={17} aria-hidden="true" />
        <span className="rb-picker__text">
          <small>Dining period</small>
          <b>{selected ? periodText(selected) : value === "outside" ? "Outside any period" : "…"}</b>
        </span>
        {phase && (
          <span className="rb-phase" data-tone={phase.tone} data-live={selected.phase === "current" || undefined}>
            {phase.label}
          </span>
        )}
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <ul className="rb-picker__menu" role="listbox" aria-label="Dining period">
          {GROUPS.map(([key, label]) => {
            const group = periods.filter((period) => period.phase === key)
            if (!group.length) return null
            return (
              <li key={key}>
                <div className="rb-picker__group">{label}</div>
                {group.map((period) => (
                  <button key={period.id} type="button" role="option" aria-selected={period.id === value} onClick={() => pick(period.id)}>
                    {periodText(period)}
                    <small>{days(period.days)}</small>
                  </button>
                ))}
              </li>
            )
          })}
          <li>
            <hr />
            <button type="button" role="option" aria-selected={value === "outside"} onClick={() => pick("outside")}>
              Outside any period
              <small>days no period covers yet</small>
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

export default PeriodPicker
