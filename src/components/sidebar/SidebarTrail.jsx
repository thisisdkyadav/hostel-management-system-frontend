import "./trail.css"

/**
 * V8 "Trail": the open page's sections, listed under its sidebar row.
 * A thin guide line hangs from the row's icon; the section you're on is marked
 * on that line in the category colour. Plain links: one click, no extra steps.
 */
const SidebarTrail = ({ entries, accent, onOpen }) => {
  if (!entries?.length) return null
  const color = accent || "var(--color-primary)"
  return (
    <ul className="sidebar-trail" style={{ "--trail-accent": color }} aria-label="Sections">
      {entries.map((entry) => (
        <li key={entry.key} data-depth={entry.depth || 1}>
          <button
            type="button"
            className="sidebar-trail__link"
            data-active={entry.active || undefined}
            data-open={entry.open || undefined}
            aria-current={entry.active ? "page" : undefined}
            onClick={() => onOpen(entry.to)}
          >
            <span className="sidebar-trail__label">{entry.label}</span>
            {typeof entry.count === "number" && <span className="sidebar-trail__count">{entry.count}</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}

export default SidebarTrail
