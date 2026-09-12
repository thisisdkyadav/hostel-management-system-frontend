import { useState } from "react"
import { Pin } from "lucide-react"
import { isNavItemNew } from "../../constants/navigationConfig"
import { NewTag } from "./NewBadge"
import CategoryCountBadge from "./CategoryCountBadge"

/**
 * Single sidebar navigation row.
 * The row itself is a real <button> (keyboard focusable); the pin control is a
 * sibling button overlaid on the right so we never nest interactive elements.
 *
 * `accent` (a CSS var string like "var(--color-cat-hostels)") opts the row into
 * category-colored selected/hover states; without it the row uses app primary.
 */
const SidebarNavItem = ({ item, isActive, showPinControl, isPinned, pinLocked = false, label, onNavigate, onTogglePin, accent }) => {
  const [hovered, setHovered] = useState(false)
  const useAccent = !!accent
  const tint = (percent) => `color-mix(in srgb, ${accent} ${percent}%, transparent)`
  const displayName = label || item.name
  const pinTitle = pinLocked
    ? "Always pinned"
    : isPinned
      ? "Unpin from Home"
      : "Pin to Home"

  const isNew = isNavItemNew(item)
  // Every row keeps a 2px border so a New outline does not shift layout.
  const newBorderColor = isNew
    ? (isActive
      ? "color-mix(in srgb, var(--color-success) 80%, white)"
      : "var(--color-success)")
    : "transparent"
  const newWash = isNew && !isActive
    ? "color-mix(in srgb, var(--color-success) 10%, transparent)"
    : undefined
  let buttonStyle = { borderColor: newBorderColor, backgroundColor: newWash }
  let iconColor
  if (useAccent) {
    if (isActive) {
      // --color-on-accent, not --color-white: this reads against the button's own
      // accent fill, so it must not follow the theme.
      buttonStyle = { backgroundColor: accent, color: "var(--color-on-accent)", boxShadow: `0 2px 8px ${tint(30)}`, borderColor: newBorderColor }
      iconColor = "var(--color-on-accent)"
    } else if (hovered) {
      buttonStyle = { backgroundColor: tint(20), color: accent, borderColor: newBorderColor }
      iconColor = accent
    } else {
      buttonStyle = { backgroundColor: newWash || "transparent", color: "var(--color-text-body)", borderColor: newBorderColor }
      iconColor = isNew ? "var(--color-success)" : "var(--color-text-muted)"
    }
  }

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onNavigate(item)}
        onMouseEnter={useAccent ? () => setHovered(true) : undefined}
        onMouseLeave={useAccent ? () => setHovered(false) : undefined}
        aria-current={isActive ? "page" : undefined}
        style={buttonStyle}
        className={`
          w-full flex items-center px-3 py-2.5 text-left rounded-xl border-2 border-transparent cursor-pointer transition duration-200 active:scale-[0.99]
          outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
          ${useAccent
            ? ""
            : isActive
              ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
              : "text-[var(--color-text-body)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)]"}
        `}
      >
        <span className="relative flex justify-center items-center shrink-0 mr-3">
          <item.icon
            size={18}
            strokeWidth={1.9}
            style={useAccent ? { color: iconColor } : undefined}
            className={`transition-colors duration-200 ${useAccent ? "" : isActive ? "text-white" : isNew ? "text-[var(--color-success)] group-hover:text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"}`}
          />

          {item?.badge > 0 && (
            <CategoryCountBadge count={item.badge} />
          )}
        </span>

        <span className={`flex items-center gap-2 flex-1 min-w-0 ${showPinControl ? "pr-8" : ""}`}>
          <span className={`text-sm truncate transition-colors duration-200 ${isActive ? "font-semibold" : "font-medium"}`}>
            {displayName}
          </span>
          {isNew && <NewTag />}
        </span>
      </button>

      {showPinControl && (
        <button
          type="button"
          disabled={pinLocked}
          onClick={(event) => {
            event.stopPropagation()
            if (pinLocked) return
            onTogglePin(item)
          }}
          className={`
            absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center
            transition-all duration-200 outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
            ${pinLocked ? "cursor-default" : ""}
            ${isPinned
              ? isActive
                ? "opacity-100 text-white bg-white/20"
                : "opacity-100 text-[var(--color-primary)] bg-[var(--color-primary)]/10"
              : isActive
                ? "opacity-0 group-hover:opacity-100 text-white/80 hover:bg-white/20"
                : "opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-tertiary)]"
            }
          `}
          title={pinTitle}
          aria-label={pinLocked ? `${displayName} is always pinned` : isPinned ? `Unpin ${displayName} from Home` : `Pin ${displayName} to Home`}
        >
          <Pin size={13} strokeWidth={2} className={isPinned ? "fill-current" : ""} />
        </button>
      )}
    </li>
  )
}

export default SidebarNavItem
