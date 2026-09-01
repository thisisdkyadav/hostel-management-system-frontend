import { Moon, Sun } from "lucide-react"
import { ADMIN_NAV_CATEGORIES } from "../../constants/navigationConfig"
import { getMediaUrl } from "../../utils/mediaUtils"

const RailButton = ({ label, pressed, onClick, accent, children }) => {
  const isCategory = !!accent

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`
        w-10 h-10 rounded-[var(--radius-xl)] flex items-center justify-center shrink-0
        transition-all duration-200 motion-reduce:transition-none
        outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
        ${isCategory
          ? `border ${pressed ? "shadow-md" : "bg-[var(--color-bg-primary)] hover:scale-105 active:scale-95 motion-reduce:hover:scale-100"}`
          : pressed
            ? ""
            : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"}
      `}
      style={
        isCategory
          ? pressed
            ? { backgroundColor: accent, borderColor: accent, color: "var(--color-bg-primary)" }
            : { borderColor: "var(--color-border-primary)", color: accent }
          : pressed
            ? { backgroundColor: "var(--color-bg-hover)", color: "var(--color-text-primary)" }
            : undefined
      }
    >
      {children}
    </button>
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
    <div className="w-14 shrink-0 h-full flex flex-col items-center border-r border-[var(--color-border-primary)]">
      <div className="h-16 shrink-0 flex items-center justify-center">
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

      <nav aria-label="Categories" className="flex-1 min-h-0 w-full flex flex-col items-center gap-1.5 pt-1 pb-3 overflow-y-auto sidebar-scrollbar">
        {ADMIN_NAV_CATEGORIES.map((category) => {
          const isActiveCategory = activeCategory === category.id
          const accent = `var(${category.colorVar})`
          return (
            <RailButton
              key={category.id}
              label={category.name}
              pressed={isActiveCategory}
              accent={accent}
              onClick={() => onCategoryChange(category.id)}
            >
              <category.icon size={18} strokeWidth={isActiveCategory ? 2.2 : 1.8} />
            </RailButton>
          )
        })}
      </nav>

      <div className="shrink-0 w-full flex flex-col items-center gap-1.5 pb-3">
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
