/**
 * Inline "Live" pill for sidebar rows, with an optional pulsing dot.
 * In a narrow row (a compact sidebar) the container query in index.css drops the word and keeps just the dot.
 */
const LiveTag = ({ label = "Live", pulse = false }) => (
  <span className="sidebar-live-tag" data-label={label}>
    <span className="sidebar-live-dot" data-pulse={pulse || undefined} aria-hidden="true" />
    <span className="sidebar-live-text">{label}</span>
  </span>
)

export default LiveTag
