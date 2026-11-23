import { Check } from "lucide-react"

/**
 * A row of pill choices (filters, tabs). `options` = [{ value, label, count? }].
 * Keyboard: like ARIA tabs, one stop in the Tab order; arrow keys / Home / End
 * move between choices and select them.
 */
const Segmented = ({ options, value, onChange, label, stretch = false }) => {
  const onKeyDown = (event) => {
    const index = options.findIndex((option) => option.value === value)
    const last = options.length - 1
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last }[event.key]
    if (next === undefined) return
    event.preventDefault()
    const target = Math.min(Math.max(next, 0), last)
    onChange(options[target].value)
    event.currentTarget.querySelectorAll('[role="tab"]')[target]?.focus()
  }

  return (
    <div className="mk-seg" data-stretch={stretch || undefined} role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className="mk-seg__item"
            data-active={active || undefined}
            onClick={() => onChange(option.value)}
          >
            {active && !stretch && <Check size={16} strokeWidth={2.75} aria-hidden="true" />}
            {option.label}
            {typeof option.count === "number" && <span className="mk-seg__count">{option.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default Segmented
