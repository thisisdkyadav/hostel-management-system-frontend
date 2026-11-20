import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { LogOut, Moon, Pin, Sun } from "lucide-react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import { isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./synthwave.css"

/**
 * V16 "Synthwave": the admin shell as an 80s neon night drive.
 *
 * - A chrome title and a VCR clock up top; categories are neon tubes, each in
 *   its own category colour, and the lit one buzzes.
 * - Tabs are neon signs. The open one is a lit tube that flickers now and then,
 *   and the category sign powers on again whenever you switch.
 * - At the bottom a striped sun sets behind wireframe mountains while the grid
 *   rolls toward you. Light mode trades the night for a pastel vaporwave dusk.
 * - Alt+1…5 switches categories.
 */

const IST_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" })

const useClock = () => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const formatCount = (count) => (count > 99 ? "99+" : String(count))

const Tube = ({ category, index, isActive, count, hasNew, onSelect }) => {
  const Icon = category.icon
  return (
    <button
      type="button"
      className="lx-synthwave-tube"
      data-cat={category.id}
      data-active={isActive || undefined}
      onClick={() => onSelect(category.id)}
      aria-pressed={isActive}
      aria-label={`${category.name}${count ? `, ${count} pending` : ""}`}
      title={`${category.name} (Alt ${index + 1})`}
    >
      <span className="lx-synthwave-tube__glass" aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>
      {count > 0 && <span className="lx-synthwave-tube__count" aria-hidden="true">{formatCount(count)}</span>}
      {hasNew && !count && <span className="lx-synthwave-tube__new" aria-hidden="true" />}
    </button>
  )
}

const Avatar = ({ user }) => (
  <span className="lx-synthwave-avatar" aria-hidden="true">
    {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
  </span>
)

/** The sunset: striped sun, wireframe mountains, and the rolling grid. */
const Horizon = () => (
  <div className="lx-synthwave-scene" aria-hidden="true">
    <div className="lx-synthwave-sun">
      <span className="lx-synthwave-sun__disc" />
    </div>
    <svg className="lx-synthwave-mountains" viewBox="0 0 300 60" preserveAspectRatio="none">
      <path
        className="lx-synthwave-mountains__far"
        d="M0 60 L0 40 L22 30 L40 38 L64 18 L86 34 L104 26 L126 40 L150 44 L176 40 L196 22 L214 32 L236 14 L262 34 L282 28 L300 36 L300 60 Z"
      />
      <path
        className="lx-synthwave-mountains__near"
        d="M0 60 L0 50 L30 42 L52 52 L80 36 L108 50 L134 56 L170 56 L196 46 L220 52 L248 38 L274 50 L300 44 L300 60 Z"
      />
    </svg>
    <div className="lx-synthwave-floor">
      <div className="lx-synthwave-floor__plane">
        <div className="lx-synthwave-floor__lines" />
      </div>
    </div>
  </div>
)

const SynthwaveSidebar = ({
  user,
  categories,
  activeCategory,
  onCategoryChange,
  items,
  isItemActive,
  isPinned,
  pinLocked,
  labelFor,
  onNavigate,
  onTogglePin,
  categoryCounts,
  newCategoryIds,
  isDark,
  onToggleTheme,
  profileItem,
  logoutItem,
  isProfileActive,
  sidebarMode,
  onModeChange,
  onHome,
}) => {
  const now = useClock()
  const rowRefs = useRef([])

  const activeConfig = categories.find((category) => category.id === activeCategory) || categories[0]
  const activeIndex = items.findIndex((item) => isItemActive(item))

  useLayoutEffect(() => {
    rowRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, activeCategory])

  // Alt+1…n switches categories.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || !/^Digit[1-9]$/.test(event.code)) return
      const category = categories[Number(event.code.slice(5)) - 1]
      if (!category) return
      event.preventDefault()
      onCategoryChange(category.id)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [categories, onCategoryChange])

  return (
    <aside className="lx-synthwave" data-cat={activeConfig?.id} data-dark={isDark || undefined} aria-label="Main navigation">
      <div className="lx-synthwave-sky" aria-hidden="true" />

      <header className="lx-synthwave-head">
        <div className="lx-synthwave-osd" aria-label="Time in India">
          <span className="lx-synthwave-osd__play" aria-hidden="true">▶ PLAY</span>
          <span className="lx-synthwave-osd__time">{IST_FORMAT.format(now)}</span>
        </div>
        <div className="lx-synthwave-mode">
          <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
        </div>
        <button type="button" className="lx-synthwave-brand" onClick={onHome} title="Home">
          <span className="lx-synthwave-brand__chrome" data-text="SMS">SMS</span>
          <span className="lx-synthwave-brand__script">{isDark ? "after dark" : "golden hour"}</span>
        </button>
      </header>

      <nav className="lx-synthwave-tubes" aria-label="Categories">
        {categories.map((category, index) => (
          <Tube
            key={category.id}
            category={category}
            index={index}
            isActive={category.id === activeCategory}
            count={categoryCounts?.[category.id] || 0}
            hasNew={Boolean(newCategoryIds?.has(category.id))}
            onSelect={onCategoryChange}
          />
        ))}
      </nav>

      <div className="lx-synthwave-sign" key={activeConfig?.id}>
        <span className="lx-synthwave-sign__meta">
          CH {String(categories.indexOf(activeConfig) + 1).padStart(2, "0")} · {items.length} {items.length === 1 ? "tab" : "tabs"}
        </span>
        <span className="lx-synthwave-sign__name">{activeConfig?.name}</span>
      </div>

      <ul className="lx-synthwave-list">
        {items.length === 0 && <li className="lx-synthwave-empty">No signal. Pin tabs from other categories to tune them in here.</li>}
        {items.map((item, index) => {
          const active = isItemActive(item)
          const pinned = isPinned(item)
          const locked = pinLocked(item)
          const Icon = item.icon
          const tag = item.badge && typeof item.badge === "object" ? item.badge : null
          const count = typeof item.badge === "number" ? item.badge : 0
          return (
            <li
              key={item.path || item.name}
              ref={(node) => {
                rowRefs.current[index] = node
              }}
              className="lx-synthwave-row"
              data-active={active || undefined}
              data-live={item.accent === "success" || undefined}
              style={{ "--i": index }}
            >
              <button type="button" className="lx-synthwave-row__go" onClick={() => onNavigate(item)} aria-current={active ? "page" : undefined}>
                {Icon && <Icon className="lx-synthwave-row__icon" size={16} strokeWidth={2} aria-hidden="true" />}
                <span className="lx-synthwave-row__name">{labelFor(item) || item.name}</span>
                {tag && (
                  <span className="lx-synthwave-row__tag" data-pulse={tag.pulse || undefined}>
                    {tag.label}
                  </span>
                )}
                {count > 0 && <span className="lx-synthwave-row__count">{formatCount(count)}</span>}
                {isNavItemNew(item) && <span className="lx-synthwave-row__new">New</span>}
              </button>
              {!locked && (
                <button
                  type="button"
                  className="lx-synthwave-row__pin"
                  data-pinned={pinned || undefined}
                  onClick={() => onTogglePin(item)}
                  title={pinned ? "Unpin from Home" : "Pin to Home"}
                  aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
                >
                  <Pin size={13} strokeWidth={2.25} />
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <div className="lx-synthwave-ground">
        <Horizon />
        <footer className="lx-synthwave-foot">
          <button
            type="button"
            className="lx-synthwave-me"
            data-active={isProfileActive || undefined}
            onClick={() => profileItem && onNavigate(profileItem)}
            title="Profile"
          >
            <Avatar user={user} />
            <span className="lx-synthwave-me__text">
              <span className="lx-synthwave-me__name">{user?.name || "Profile"}</span>
              <span className="lx-synthwave-me__mail">{user?.email}</span>
            </span>
          </button>
          <button
            type="button"
            className="lx-synthwave-icon-btn"
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {logoutItem && (
            <button
              type="button"
              className="lx-synthwave-icon-btn lx-synthwave-icon-btn--exit"
              onClick={() => onNavigate(logoutItem)}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          )}
        </footer>
      </div>
    </aside>
  )
}

export default SynthwaveSidebar
