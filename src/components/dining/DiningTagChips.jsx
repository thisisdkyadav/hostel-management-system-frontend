import "./DiningTagChips.css"

/**
 * The dining tags a student has (e.g. "Jain food"), as chips.
 * `tags` is [{ id, name, muted? }]; `muted` marks a yes that came from the tag's default
 * rather than the student's own answer. `size="lg"` is the prominent form for scan result
 * cards, where kitchen staff must notice the tag at a glance. `unregistered` adds an
 * "Unregistered" chip first (the student was auto-allocated, not self-registered).
 * Renders nothing when there is neither a tag nor the flag.
 */
export const DiningUnregisteredChip = ({ size = "sm" }) => (
  <span className="dtag dtag--unregistered" data-size={size === "lg" ? "lg" : undefined} title="Auto-allocated: did not choose a caterer in time">
    Unregistered
  </span>
)

export const DiningTagChips = ({ tags, size = "sm", max = 0, className = "", unregistered = false }) => {
  const list = Array.isArray(tags) ? tags.filter((tag) => tag?.name) : []
  if (!list.length && !unregistered) return null
  const shown = max > 0 ? list.slice(0, max) : list
  const hidden = list.length - shown.length
  return (
    <span className={`dtag-list ${className}`.trim()}>
      {unregistered && <DiningUnregisteredChip size={size} />}
      {shown.map((tag) => (
        <span key={tag.id || tag.name} className="dtag" data-size={size === "lg" ? "lg" : undefined} data-muted={tag.muted || undefined} title={tag.muted ? `${tag.name} (default, not answered)` : tag.name}>
          {tag.name}
        </span>
      ))}
      {hidden > 0 && (
        <span className="dtag" data-muted title={list.slice(max).map((tag) => tag.name).join(", ")}>
          +{hidden}
        </span>
      )}
    </span>
  )
}

/**
 * Per-tag headcount line under a day's total: "Jain food 12 · No onion 4".
 * `counts` is [{ id, name, count }]; tags with no one are left out; nothing renders when none remain.
 */
export const DiningTagCounts = ({ counts, className = "" }) => {
  const list = (Array.isArray(counts) ? counts : []).filter((item) => item?.name && Number(item.count) > 0)
  if (!list.length) return null
  return (
    <ul className={`dtag-counts ${className}`.trim()} aria-label="Dining tags">
      {list.map((item) => (
        <li key={item.id || item.name}>
          <span>{item.name}</span>
          <b>{item.count}</b>
        </li>
      ))}
    </ul>
  )
}

export default DiningTagChips
