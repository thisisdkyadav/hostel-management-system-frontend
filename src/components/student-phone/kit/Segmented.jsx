import { Check } from "lucide-react"

/** A row of pill choices (filters, tabs). `options` = [{ value, label, count? }]. */
const Segmented = ({ options, value, onChange, label, stretch = false }) => (
  <div className="mk-seg" data-stretch={stretch || undefined} role="tablist" aria-label={label}>
    {options.map((option) => {
      const active = option.value === value
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={active}
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

export default Segmented
