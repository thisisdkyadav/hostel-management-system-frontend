import { useId } from "react"
import { Moon, Sun } from "lucide-react"
import {
  ADMIN_NAV_CATEGORIES,
  ADMIN_NAV_CATEGORY_HOME,
  ADMIN_NAV_CATEGORY_HOSTELS,
} from "../../constants/navigationConfig"
import { getCategoryTint } from "./categoryStyles"
import { getMediaUrl } from "../../utils/mediaUtils"

const panelColorFor = (categoryId) => {
  const tint = getCategoryTint(categoryId)
  return tint === "transparent" ? "var(--color-bg-primary)" : tint
}

/**
 * Selected tile opens into the main panel as one tinted surface.
 * viewBox is the w-10 tile + 8px gutter + --radius-xl shoulders (12px).
 */
const TAB_PATH = "M 0 24 A 12 12 0 0 1 12 12 L 36 12 A 12 12 0 0 0 48 0 L 48 64 A 12 12 0 0 0 36 52 L 12 52 A 12 12 0 0 1 0 40 Z"

const RailActiveJoin = ({ panelColor, fadeTo }) => {
  const uid = useId().replace(/:/g, "")
  const gradId = `rail-tab-${uid}`
  const fill = fadeTo ? `url(#${gradId})` : panelColor

  return (
    <svg
      aria-hidden
      viewBox="0 0 48 64"
      preserveAspectRatio="none"
      className="absolute pointer-events-none"
      style={{
        left: "var(--spacing-2)",
        width: "calc(100% - var(--spacing-2))",
        top: "calc(-1 * var(--radius-xl))",
        height: "calc(100% + 2 * var(--radius-xl))",
      }}
    >
      {fadeTo && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={panelColor} />
            <stop offset="82%" stopColor={panelColor} />
            <stop offset="100%" stopColor={fadeTo} />
          </linearGradient>
        </defs>
      )}
      <path d={TAB_PATH} fill={fill} />
    </svg>
  )
}

const RailButton = ({ label, pressed, onClick, accent, panelColor, fadeTo, children }) => {
  const isCategory = !!accent
  const isActiveTab = isCategory && pressed

  const button = (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onMouseDown={isCategory ? (event) => event.preventDefault() : undefined}
      onClick={onClick}
      className={`
        w-10 h-10 flex items-center justify-center shrink-0
        transition-all duration-200 motion-reduce:transition-none
        outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
        ${isCategory
          ? `relative z-10 rounded-[var(--radius-xl)] ${isActiveTab
            ? ""
            : "bg-[var(--color-bg-primary)] hover:scale-105 active:scale-95 motion-reduce:hover:scale-100"}`
          : pressed
            ? "rounded-[var(--radius-xl)]"
            : "rounded-[var(--radius-xl)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"}
      `}
      style={
        isCategory
          ? { color: accent }
          : pressed
            ? { backgroundColor: "var(--color-bg-hover)", color: "var(--color-text-primary)" }
            : undefined
      }
    >
      {children}
    </button>
  )

  if (!isCategory) return button

  return (
    <div className={`relative w-full h-10 flex justify-center overflow-visible ${isActiveTab ? "z-10" : ""}`}>
      {isActiveTab && <RailActiveJoin panelColor={panelColor} fadeTo={fadeTo} />}
      {button}
    </div>
  )
}

const RailAvatar = ({ user, isActive }) => {
  const initial = user?.name?.charAt(0)?.toUpperCase()

  return (
    <span
      className={`
        w-10 h-10 rounded-[var(--radius-xl)] flex items-center justify-center overflow-hidden shrink-0
        ring-2 transition-shadow duration-200 motion-reduce:transition-none
        ${isActive ? "ring-[var(--color-primary)]" : "ring-[var(--color-border-primary)]"}
      `}
    >
      {user?.profileImage ? (
        <img src={getMediaUrl(user.profileImage)} alt="" className="w-full h-full object-cover" />
      ) : initial ? (
        <span className="w-full h-full flex items-center justify-center font-semibold text-sm bg-[var(--color-primary)] text-[var(--color-white)]">
          {initial}
        </span>
      ) : (
        <span className="w-full h-full bg-[var(--color-bg-secondary)]" />
      )}
    </span>
  )
}

/**
 * V4 left icon column. Same categories as V2's bottom bar, with theme,
 * logout and profile moved here so the main panel is only the tab list.
 */
const IconRail = ({
  activeCategory,
  onCategoryChange,
  isDark,
  onToggleTheme,
  onLogoClick,
  user,
  profileItem,
  logoutItem,
  isProfileActive,
  onNavigate,
}) => {
  return (
    <div className="relative w-14 shrink-0 h-full flex flex-col items-center">
      <span aria-hidden className="absolute inset-y-0 right-0 w-px bg-[var(--color-border-primary)] pointer-events-none" />

      <div className="relative z-10 h-16 shrink-0 flex items-center justify-center">
        <button
          type="button"
          onClick={onLogoClick}
          title="SMS"
          aria-label="SMS home"
          className="text-[length:var(--font-size-xs)] font-bold tracking-wider leading-none text-[var(--color-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 rounded-[var(--radius-sm)] hover:opacity-70 transition-opacity duration-200 motion-reduce:transition-none"
        >
          SMS
        </button>
      </div>

      <nav aria-label="Categories" className="relative z-10 flex-1 min-h-0 w-full flex flex-col items-center gap-[var(--radius-xl)] py-[var(--radius-xl)]">
        {ADMIN_NAV_CATEGORIES.map((category) => {
          const isActiveCategory = activeCategory === category.id
          const isHome = category.id === ADMIN_NAV_CATEGORY_HOME
          const accent = `var(${category.colorVar})`
          return (
            <RailButton
              key={category.id}
              label={category.name}
              pressed={isActiveCategory}
              accent={accent}
              panelColor={isHome ? getCategoryTint(ADMIN_NAV_CATEGORY_HOSTELS) : panelColorFor(category.id)}
              fadeTo={isHome ? "var(--color-bg-primary)" : undefined}
              onClick={() => onCategoryChange(category.id)}
            >
              <category.icon size={18} strokeWidth={isActiveCategory ? 2.2 : 1.8} />
            </RailButton>
          )
        })}
      </nav>

      <div className="relative z-10 shrink-0 w-full flex flex-col items-center gap-1.5 pb-3">
        <RailButton
          label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onToggleTheme}
        >
          {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
        </RailButton>

        {logoutItem && (
          <RailButton label="Logout" onClick={() => onNavigate(logoutItem)}>
            <logoutItem.icon size={18} strokeWidth={1.8} />
          </RailButton>
        )}

        {user && profileItem && (
          <button
            type="button"
            title={user.name || "Profile"}
            aria-label="Profile"
            aria-current={isProfileActive ? "page" : undefined}
            onClick={() => onNavigate(profileItem)}
            className="rounded-[var(--radius-xl)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
          >
            <RailAvatar user={user} isActive={isProfileActive} />
          </button>
        )}
      </div>
    </div>
  )
}

export default IconRail
