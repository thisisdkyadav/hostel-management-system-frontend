import { ChevronRight } from "lucide-react"

/**
 * Building blocks for phone list pages: a tappable row for `.mk-list`, a tone
 * circle for its leading icon, loading ghosts, and empty / error cards.
 */

export const Row = ({ lead, title, meta, children, trailing, onClick, dim = false }) => {
  const body = (
    <>
      {lead}
      <span className="mk-row__main">
        <span className="mk-row__title">{title}</span>
        {meta && <span className="mk-row__meta">{meta}</span>}
        {children}
      </span>
      {trailing !== undefined ? trailing : onClick && <ChevronRight size={18} className="mk-row__chev" aria-hidden="true" />}
    </>
  )
  return onClick ? (
    <button type="button" className="mk-row" data-dim={dim || undefined} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className="mk-row" data-dim={dim || undefined}>
      {body}
    </div>
  )
}

export const Lead = ({ icon, tone = "info", size = 20 }) => {
  const Icon = icon
  return (
    <span className="mk-lead" data-tone={tone} aria-hidden="true">
      <Icon size={size} />
    </span>
  )
}

export const Pill = ({ tone = "neutral", children }) => (
  <span className="mc-pill mk-pill" data-tone={tone}>
    {children}
  </span>
)

export const Ghosts = ({ count = 4 }) => (
  <ul className="mk-list" aria-busy="true">
    {Array.from({ length: count }, (_, n) => (
      <li key={n} className="mc-row mc-row--ghost">
        <span className="mk-shimmer mc-row__ghost-icon" />
        <span className="mc-row__ghost-lines">
          <span className="mk-shimmer" />
          <span className="mk-shimmer" />
        </span>
      </li>
    ))}
  </ul>
)

export const EmptyCard = ({ icon: Icon, title, text, action }) => (
  <div className="mk-empty">
    {Icon && (
      <span className="mk-empty__icon">
        <Icon size={28} />
      </span>
    )}
    <p className="mk-empty__title">{title}</p>
    {text && <p className="mk-sub">{text}</p>}
    {action}
  </div>
)

export const ErrorCard = ({ text = "Couldn't load this right now.", onRetry }) => (
  <div className="mk-empty" role="alert">
    <p>{text}</p>
    {onRetry && (
      <button type="button" className="mk-btn mk-btn--soft" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
)

/** A labelled value row for detail lists (profile, sheets). Hidden when empty. */
export const Field = ({ icon: Icon, label, value, action }) => {
  if (!value && !action) return null
  return (
    <li className="mk-field">
      {Icon && <Icon size={18} className="mk-field__icon" aria-hidden="true" />}
      <span className="mk-field__main">
        <span className="mk-field__label">{label}</span>
        {value && <span className="mk-field__value">{value}</span>}
      </span>
      {action}
    </li>
  )
}

export const shortDate = (value, withYear = false) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) }) : ""

export const timeOf = (value) => (value ? new Date(value).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "")
