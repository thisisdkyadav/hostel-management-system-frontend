import { Pin } from "lucide-react"
import { isNavItemNew } from "../../constants/navigationConfig"
import { NewTag } from "./NewBadge"
import CategoryCountBadge from "./CategoryCountBadge"
import { SIDEBAR_MOTION_CURVE } from "./motion"

/**
 * Single sidebar navigation row.
 * The row itself is a real <button> (keyboard focusable); the pin control is a
 * sibling button overlaid on the right so we never nest interactive elements.
 *
 * `accent` opts the row into category-colored selected/hover states.
 * `sharedFill` means a sliding pill behind the list owns the selected fill.
 */
const SidebarNavItem = ({
  item,
  isActive,
  showPinControl,
  isPinned,
  pinLocked = false,
  label,
  onNavigate,
  onTogglePin,
  accent,
  sharedFill = false,
  lightFill = false,
}) => {
  const useAccent = !!accent
  const tint = (percent) => `color-mix(in srgb, ${accent} ${percent}%, transparent)`
  const displayName = label || item.name
  const pinTitle = pinLocked
    ? "Always pinned"
    : isPinned
      ? "Unpin from Home"
      : "Pin to Home"

  const isNew = isNavItemNew(item)
  const newBorderColor = isNew
    ? (isActive
      ? "color-mix(in srgb, var(--color-success) 80%, white)"
      : "var(--color-success)")
    : "transparent"
  const newWash = isNew && !isActive
    ? "color-mix(in srgb, var(--color-success) 10%, transparent)"
    : undefined

  let buttonStyle = {
    "--nav-accent": accent || "var(--color-primary)",
    borderColor: newBorderColor,
    backgroundColor: newWash,
  }
  let iconColor

  if (sharedFill) {
    const activeInk = lightFill ? "var(--color-v5-ink)" : "var(--color-on-accent)"
    buttonStyle = {
      ...buttonStyle,
      backgroundColor: isActive ? "transparent" : (newWash || "transparent"),
      color: isActive ? activeInk : "var(--color-text-body)",
      height: lightFill ? "calc(2.5rem + var(--radius-xl) / 2)" : undefined,
      transition: isActive
        ? `color 200ms 150ms ${SIDEBAR_MOTION_CURVE}`
        : `color 140ms ${SIDEBAR_MOTION_CURVE}, background-color 200ms ${SIDEBAR_MOTION_CURVE}`,
    }
    iconColor = "inherit"
  } else if (useAccent) {
    if (isActive) {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: accent,
        color: "var(--color-on-accent)",
        boxShadow: `0 2px 8px ${tint(30)}`,
      }
      iconColor = "var(--color-on-accent)"
    } else {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: newWash || "transparent",
        color: "var(--color-text-body)",
      }
      iconColor = isNew ? "var(--color-success)" : "var(--color-text-muted)"
    }
  }

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onNavigate(item)}
        aria-current={isActive ? "page" : undefined}
        data-sidebar-active={isActive ? "true" : undefined}
        style={buttonStyle}
        className={`
          w-full flex items-center px-3 py-2.5 text-left rounded-xl border-2 border-transparent cursor-pointer
          outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
          motion-reduce:transition-none
          ${sharedFill
            ? isActive
              ? ""
              : lightFill
                ? "hover:bg-[color-mix(in_srgb,var(--v5-panel-ink)_8%,transparent)]"
                : "hover:text-[var(--nav-accent)] hover:bg-[color-mix(in_srgb,var(--nav-accent)_16%,transparent)]"
            : useAccent
              ? isActive
                ? ""
                : "hover:text-[var(--nav-accent)] hover:bg-[color-mix(in_srgb,var(--nav-accent)_16%,transparent)]"
              : isActive
                ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                : "text-[var(--color-text-body)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)]"}
        `}
      >
        <span className="relative flex justify-center items-center shrink-0 mr-3">
          <item.icon
            size={18}
            strokeWidth={isActive ? 2.05 : 1.9}
            style={iconColor ? { color: iconColor } : undefined}
            className={`motion-reduce:transition-none ${sharedFill || useAccent ? "" : isActive ? "text-white" : isNew ? "text-[var(--color-success)] group-hover:text-[var(--color-primary)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"}`}
          />

          {item?.badge > 0 && (
            <CategoryCountBadge count={item.badge} />
          )}
        </span>

        <span className={`flex items-center gap-2 flex-1 min-w-0 ${showPinControl ? "pr-8" : ""}`}>
          <span className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"}`}>
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
            absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center z-10
            transition-all duration-200 motion-reduce:transition-none outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
            ${pinLocked ? "cursor-default" : ""}
            ${isPinned
              ? isActive
                ? lightFill
                  ? "opacity-100 text-[var(--color-v5-ink)] bg-[color-mix(in_srgb,var(--v5-panel-ink)_12%,transparent)]"
                  : "opacity-100 text-white bg-white/20"
                : lightFill
                  ? "opacity-100 text-[var(--v5-panel-ink)] bg-[color-mix(in_srgb,var(--v5-panel-ink)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--v5-panel-ink)_18%,transparent)]"
                  : "opacity-100 text-[var(--color-primary)] bg-[var(--color-primary)]/10"
              : isActive
                ? lightFill
                  ? "opacity-0 group-hover:opacity-100 text-[var(--color-v5-ink)]/70 hover:bg-[color-mix(in_srgb,var(--v5-panel-ink)_10%,transparent)]"
                  : "opacity-0 group-hover:opacity-100 text-white/80 hover:bg-white/20"
                : lightFill
                  ? "opacity-0 group-hover:opacity-100 text-[var(--v5-panel-ink)]/70 hover:bg-[color-mix(in_srgb,var(--v5-panel-ink)_10%,transparent)]"
                  : "opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-tertiary)]"}
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
