import { useId } from "react"
import { Moon, Sun } from "lucide-react"
import {
  ADMIN_NAV_CATEGORIES,
  ADMIN_NAV_CATEGORY_HOME,
  ADMIN_NAV_CATEGORY_HOSTELS,
} from "../../constants/navigationConfig"
import { getCategoryTint } from "./categoryStyles"
import { getMediaUrl } from "../../utils/mediaUtils"
import CategoryCountBadge from "./CategoryCountBadge"
import { SIDEBAR_MOTION } from "./motion"

const panelColorFor = (categoryId) => {
  const tint = getCategoryTint(categoryId)
  return tint === "transparent" ? "var(--color-bg-primary)" : tint
}

/**
 * Selected tile opens into the main panel as one tinted surface.
 * Tile height sits halfway between the original 2.5rem chip and the
 * fully-flush 2.5rem + radius-xl strip. viewBox adds radius-xl shoulders
 * and the 8px gutter. The quarter-circle reaches x=48 with a vertical tangent;
 * the final two units are solid overdraw into the panel so antialiasing cannot
 * reveal the rail background at the join.
 */
const TAB_PATH = "M 0 24 A 12 12 0 0 1 12 12 L 36 12 A 12 12 0 0 0 48 0 L 50 0 L 50 70 L 48 70 A 12 12 0 0 0 36 58 L 12 58 A 12 12 0 0 1 0 46 Z"

const TAB_SIZE = "calc(2.5rem + var(--radius-xl) / 2)"

const RailActiveJoin = ({ panelColor, fadeTo, index }) => {
  const uid = useId().replace(/:/g, "")
  const fadeId = `rail-tab-fade-${uid}`

  return (
    <div
      aria-hidden
      className="absolute left-0 right-0 z-0 pointer-events-none motion-reduce:!transition-none"
      style={{
        top: "var(--radius-xl)",
        height: TAB_SIZE,
        transform: `translateY(calc(${index} * ${TAB_SIZE}))`,
        transition: `transform ${SIDEBAR_MOTION}`,
      }}
    >
      <svg
        viewBox="0 0 50 70"
        preserveAspectRatio="none"
        className="absolute"
        style={{
          left: "var(--spacing-2)",
          width: "calc(100% - var(--spacing-2) + 2 * var(--spacing-px))",
          top: "calc(-1 * var(--radius-xl))",
          height: "calc(100% + 2 * var(--radius-xl))",
        }}
      >
        <defs>
          <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="82%" stopColor="var(--color-bg-primary)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-bg-primary)" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d={TAB_PATH}
          fill={panelColor}
          className="motion-reduce:!transition-none"
          style={{ transition: `fill ${SIDEBAR_MOTION}` }}
        />
        <path
          d={TAB_PATH}
          fill={`url(#${fadeId})`}
          className="motion-reduce:!transition-none"
          style={{ opacity: fadeTo ? 1 : 0, transition: `opacity ${SIDEBAR_MOTION}` }}
        />
      </svg>
    </div>
  )
}

const RailButton = ({ label, pressed, onClick, accent, hasNew = false, count = 0, onFill = false, children }) => {
  const isCategory = !!accent
  const accessibleLabel = [
    label,
    count > 0 ? `${count > 99 ? "99+" : count} needing attention` : null,
    hasNew && !count ? "new" : null,
  ].filter(Boolean).join(", ")

  const button = (
    <button
      type="button"
      title={accessibleLabel}
      aria-label={accessibleLabel}
      aria-pressed={pressed}
      onMouseDown={isCategory ? (event) => event.preventDefault() : undefined}
      onClick={onClick}
      className={`
        relative z-10 flex items-center justify-center shrink-0
        transition-all duration-200 motion-reduce:transition-none
        outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
        ${isCategory
          ? "w-full rounded-[var(--radius-xl)]"
          : pressed
            ? "w-10 h-10 rounded-[var(--radius-xl)]"
            : "w-10 h-10 rounded-[var(--radius-xl)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"}
      `}
      style={
        isCategory
          ? {
              color: pressed && onFill ? "var(--color-on-accent)" : accent,
              height: TAB_SIZE,
            }
          : pressed
            ? { backgroundColor: "var(--color-bg-hover)", color: "var(--color-text-primary)" }
            : undefined
      }
    >
      <span className="relative inline-flex items-center justify-center">
        {children}
        <CategoryCountBadge count={count} />
        {hasNew && !count && (
          <span
            aria-hidden
            className="absolute top-0 right-0 z-10 pointer-events-none rounded-full bg-[var(--color-success)]"
            style={{
              width: "var(--spacing-1-5)",
              height: "var(--spacing-1-5)",
              transform: "translate(42%, -42%)",
              boxShadow: "0 0 0 var(--spacing-0-5) var(--color-bg-primary)",
            }}
          />
        )}
      </span>
    </button>
  )

  return button
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
  newCategoryIds,
  categoryCounts,
  stagePanelColor,
}) => {
  return (
    <div className="relative w-14 shrink-0 h-full flex flex-col items-center">
      {!stagePanelColor && (
        <span aria-hidden className="absolute inset-y-0 right-0 w-px bg-[var(--color-border-primary)] pointer-events-none" />
      )}

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

      <nav aria-label="Categories" className="relative z-10 flex-1 min-h-0 w-full flex flex-col items-center py-[var(--radius-xl)]">
        <RailActiveJoin
          index={Math.max(0, ADMIN_NAV_CATEGORIES.findIndex((category) => category.id === activeCategory))}
          panelColor={
            stagePanelColor
              || (activeCategory === ADMIN_NAV_CATEGORY_HOME
                ? getCategoryTint(ADMIN_NAV_CATEGORY_HOSTELS)
                : panelColorFor(activeCategory))
          }
          fadeTo={!stagePanelColor && activeCategory === ADMIN_NAV_CATEGORY_HOME ? "var(--color-bg-primary)" : undefined}
        />
        {ADMIN_NAV_CATEGORIES.map((category) => {
          const isActiveCategory = activeCategory === category.id
          const accent = `var(${category.colorVar})`
          return (
            <RailButton
              key={category.id}
              label={category.name}
              pressed={isActiveCategory}
              accent={accent}
              onFill={Boolean(stagePanelColor)}
              hasNew={Boolean(newCategoryIds?.has(category.id))}
              count={categoryCounts?.[category.id] || 0}
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
