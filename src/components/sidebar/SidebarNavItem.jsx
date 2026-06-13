import { useState } from "react"
import { Pin } from "lucide-react"

/**
 * Single sidebar navigation row.
 * The row itself is a real <button> (keyboard focusable); the pin control is a
 * sibling button overlaid on the right so we never nest interactive elements.
 *
 * `accent` (a CSS var string like "var(--color-cat-hostels)") opts the row into
 * category-colored selected/hover states; without it the row uses app primary.
 */
const SidebarNavItem = ({ item, isActive, isOpen, showPinControl, isPinned, onNavigate, onTogglePin, accent }) => {
  const [hovered, setHovered] = useState(false)
  const useAccent = !!accent
  const tint = (percent) => `color-mix(in srgb, ${accent} ${percent}%, transparent)`

  // Accent path is driven by inline styles (dynamic per-category color); the
  // default path stays on Tailwind classes/tokens.
  let buttonStyle
  let iconColor
  if (useAccent) {
    if (isActive) {
      buttonStyle = { backgroundColor: accent, color: "#fff", boxShadow: `0 2px 8px ${tint(30)}` }
      iconColor = "#fff"
    } else if (hovered) {
      buttonStyle = { backgroundColor: tint(20), color: accent }
      iconColor = accent
    } else {
      buttonStyle = { backgroundColor: "transparent", color: "var(--color-text-body)" }
      iconColor = "var(--color-text-muted)"
    }
  }

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onNavigate(item)}
        onMouseEnter={useAccent ? () => setHovered(true) : undefined}
        onMouseLeave={useAccent ? () => setHovered(false) : undefined}
        title={!isOpen ? item.name : undefined}
        aria-current={isActive ? "page" : undefined}
        style={useAccent ? buttonStyle : undefined}
        className={`
          w-full flex items-center rounded-xl cursor-pointer transition duration-200 active:scale-[0.99]
          outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
          ${isOpen ? "px-3 py-2.5 text-left" : "px-0 py-2.5 justify-center"}
          ${useAccent
            ? ""
            : isActive
              ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
              : "text-[var(--color-text-body)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)]"}
        `}
      >
        <span className={`relative flex justify-center items-center shrink-0 ${isOpen ? "mr-3" : ""}`}>
          <item.icon
            size={18}
            strokeWidth={1.9}
            style={useAccent ? { color: iconColor } : undefined}
            className={`transition-colors duration-200 ${useAccent ? "" : isActive ? "text-white" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"}`}
          />

          {item?.badge > 0 && (
            <span
              className={`absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-[var(--color-danger)] text-white text-xs font-semibold flex items-center justify-center shadow-md ${item.badge > 99 ? "min-w-6" : ""}`}
            >
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </span>

        {isOpen && (
          <span className={`flex items-center gap-2 flex-1 min-w-0 ${showPinControl ? "pr-8" : ""}`}>
            <span className={`text-sm truncate transition-colors duration-200 ${isActive ? "font-semibold" : "font-medium"}`}>
              {item.name}
            </span>
            {item.isNew && (
              <span
                className={`
                  px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide rounded-md shrink-0
                  ${isActive ? "bg-white/25 text-white" : "bg-[var(--color-success)]/10 text-[var(--color-success)]"}
                `}
              >
                New
              </span>
            )}
          </span>
        )}

        {/* Collapsed-mode "new" indicator dot */}
        {!isOpen && item.isNew && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)]" />
        )}
      </button>

      {showPinControl && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onTogglePin(item)
          }}
          className={`
            absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center
            transition-all duration-200 outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
            ${isPinned
              ? isActive
                ? "opacity-100 text-white bg-white/20"
                : "opacity-100 text-[var(--color-primary)] bg-[var(--color-primary)]/10"
              : isActive
                ? "opacity-0 group-hover:opacity-100 text-white/80 hover:bg-white/20"
                : "opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-tertiary)]"
            }
          `}
          title={isPinned ? "Unpin from Home" : "Pin to Home"}
          aria-label={isPinned ? `Unpin ${item.name} from Home` : `Pin ${item.name} to Home`}
        >
          <Pin size={13} strokeWidth={2} className={isPinned ? "fill-current" : ""} />
        </button>
      )}
    </li>
  )
}

export default SidebarNavItem
