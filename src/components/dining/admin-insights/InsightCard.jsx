import { Link } from "react-router-dom"
import { Skeleton } from "hzero"
import { ArrowUpRight } from "lucide-react"

/** Calm inline message used for empty and failed states. */
export const PanelMessage = ({ title, text, children }) => (
  <div className="dxi-msg">
    <p className="dxi-msg-title">{title}</p>
    {text && <p className="dxi-msg-text">{text}</p>}
    {children}
  </div>
)

/** Shared panel shell: a plain-language title, an optional caption and link, then the visual. */
const InsightCard = ({ className = "", title, caption, to, linkLabel = "Open", actions, loading = false, children, ...rest }) => (
  <section className={`dxi-card ${className}`} aria-label={title} {...rest}>
    <header className="dxi-card-head">
      <div className="dxi-card-titles">
        <h2 className="dxi-card-title">{title}</h2>
        {caption && <p className="dxi-card-caption">{caption}</p>}
      </div>
      {actions}
      {to && (
        <Link to={to} className="dxi-card-link">
          {linkLabel}
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      )}
    </header>
    <div className="dxi-card-body">
      {loading ? (
        <div className="dxi-skeleton">
          <Skeleton variant="rectangular" height="100%" />
        </div>
      ) : children}
    </div>
  </section>
)

export default InsightCard
