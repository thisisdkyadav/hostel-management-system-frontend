import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { LogOut, Moon, Pin, Search, Sun } from "lucide-react"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { isNavItemNew } from "../../../constants/navigationConfig"
import SidebarModeSwitcher from "../SidebarModeSwitcher"
import ConsoleJump from "./ConsoleJump"
import "./console.css"

/**
 * V7 "Console": V6's layout, styled for everyday professional use.
 *
 * Same structure as V6: a dark shell holding a header (brand, India time, layout
 * version), a column of category buttons, the selected category's pages with a
 * marker that slides to the open page, and a footer with "Go to page" (Ctrl+K),
 * profile, theme and logout. The page sits on the shell as a raised sheet.
 * The frame is a dusk sky; a row of hostel blocks stands on the footer, their
 * windows lit by India time. No decorative motion.
 */

const IST_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" })
const DAY_FORMAT = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })

const useClock = () => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const isTypingTarget = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

const HOUR_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" })

/* Hostel blocks along the bottom of the sidebar: [x, width, height] in a 288×104 box. */
const BACK_BLOCKS = [[0, 30, 62], [26, 24, 78], [48, 40, 54], [86, 26, 86], [110, 34, 66], [142, 24, 94], [164, 42, 60], [204, 28, 80], [230, 34, 64], [262, 30, 88]]
const FRONT_BLOCKS = [[0, 44, 42], [42, 30, 58], [70, 52, 36], [120, 36, 66], [154, 48, 44], [200, 30, 56], [228, 38, 40], [264, 28, 52]]
const SKY_H = 104

/** Share of windows lit by IST hour: most in the evening, a few at night, almost none by day. */
const litShare = (hour) => (hour >= 18 && hour <= 23 ? 45 : hour >= 17 ? 25 : hour < 6 ? 12 : hour < 9 ? 8 : 4)

const Skyline = ({ hour }) => {
  const share = litShare(hour)
  const windows = []
  FRONT_BLOCKS.forEach(([x, w, h], b) => {
    let k = 0
    for (let wy = SKY_H - h + 7; wy < SKY_H - 6; wy += 9) {
      for (let wx = x + 6; wx < x + w - 6; wx += 7) {
        k += 1
        const lit = (b * 73 + k * 151 + wx * 7 + wy * 3) % 100 < share
        windows.push(<rect key={`${b}-${k}`} x={wx} y={wy} width="3" height="4" rx="0.5" className={lit ? "cn-win cn-win--lit" : "cn-win"} />)
      }
    }
  })
  return (
    <div className="cn-skyline" aria-hidden="true">
      <svg viewBox={`0 0 288 ${SKY_H}`} preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="cn-horizon" cx="50%" cy="100%" r="75%" fy="100%">
            <stop offset="0%" stopColor="var(--cn-horizon)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--cn-horizon)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="288" height={SKY_H} fill="url(#cn-horizon)" />
        {BACK_BLOCKS.map(([x, w, h]) => (
          <rect key={`b${x}`} x={x} y={SKY_H - h} width={w} height={h} className="cn-block cn-block--back" />
        ))}
        {FRONT_BLOCKS.map(([x, w, h]) => (
          <rect key={`f${x}`} x={x} y={SKY_H - h} width={w} height={h} className="cn-block" />
        ))}
        {windows}
      </svg>
    </div>
  )
}

const formatCount = (count) => (count > 99 ? "99+" : String(count))

const CategoryButton = ({ category, index, isActive, count, hasNew, onSelect }) => {
  const Icon = category.icon
  return (
    <button
      type="button"
      className="cn-cat"
      data-cat={category.id}
      data-active={isActive || undefined}
      onClick={() => onSelect(category.id)}
      aria-pressed={isActive}
      aria-label={`${category.name}${count ? `, ${count} pending` : ""}`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.1 : 1.8} aria-hidden="true" />
      {count > 0 && <span className="cn-cat__count" aria-hidden="true">{formatCount(count)}</span>}
      {hasNew && !count && <span className="cn-cat__new" aria-hidden="true" />}
      <span className="cn-cat__label" aria-hidden="true">
        {category.name}
        <kbd>Alt {index + 1}</kbd>
      </span>
    </button>
  )
}

const Avatar = ({ user }) => (
  <span className="cn-avatar" aria-hidden="true">
    {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
  </span>
)

const ConsoleSidebar = ({
  user,
  categories,
  activeCategory,
  onCategoryChange,
  items,
  allItems,
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
  const [jumpOpen, setJumpOpen] = useState(false)
  const [marker, setMarker] = useState(null)
  const rowRefs = useRef([])

  const activeConfig = categories.find((category) => category.id === activeCategory) || categories[0]
  const activeIndex = items.findIndex((item) => isItemActive(item))

  // Marker: slides to the open page's row.
  useLayoutEffect(() => {
    const row = rowRefs.current[activeIndex]
    if (!row) {
      setMarker(null)
      return
    }
    setMarker({ top: row.offsetTop, height: row.offsetHeight })
    row.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, activeCategory, items.length])

  // Keys: Ctrl/Cmd+K or "/" open Go to page; Alt+1…n pick a category.
  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault()
        setJumpOpen((open) => !open)
        return
      }
      if (key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isTypingTarget(event.target)) {
        event.preventDefault()
        setJumpOpen(true)
        return
      }
      if (event.altKey && !event.ctrlKey && !event.metaKey && /^Digit[1-9]$/.test(event.code)) {
        const category = categories[Number(event.code.slice(5)) - 1]
        if (category) {
          event.preventDefault()
          onCategoryChange(category.id)
        }
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [categories, onCategoryChange])

  return (
    <>
      <aside className="cn" aria-label="Main navigation">
        <header className="cn-head">
          <button type="button" className="cn-brand" onClick={onHome} title="Home">
            <span className="cn-brand__mark" aria-hidden="true">S</span>
            <span className="cn-brand__word">SMS</span>
          </button>
          <div className="cn-clock" aria-label="Time in India">
            <span className="cn-clock__time">{IST_FORMAT.format(now)}</span>
            <span className="cn-clock__day">{DAY_FORMAT.format(now)}</span>
          </div>
          <div className="cn-mode">
            <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
          </div>
        </header>

        <div className="cn-body">
          <nav className="cn-cats" aria-label="Categories">
            {categories.map((category, index) => (
              <CategoryButton
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

          <section className="cn-pages" data-cat={activeConfig?.id}>
            <div className="cn-title">
              <span className="cn-title__name">{activeConfig?.name}</span>
              <span className="cn-title__meta">
                {items.length} {items.length === 1 ? "page" : "pages"}
              </span>
            </div>

            <ul className="cn-list">
              {marker && (
                <li className="cn-marker" aria-hidden="true" style={{ transform: `translateY(${marker.top}px)`, height: marker.height }} />
              )}
              {items.length === 0 && (
                <li className="cn-empty">No pinned pages yet. Pin pages from other categories to see them here.</li>
              )}
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
                    className="cn-row"
                    data-active={active || undefined}
                  >
                    <button type="button" className="cn-row__go" onClick={() => onNavigate(item)} aria-current={active ? "page" : undefined}>
                      {Icon && <Icon className="cn-row__icon" size={17} strokeWidth={active ? 2.1 : 1.8} aria-hidden="true" />}
                      <span className="cn-row__name">{labelFor(item) || item.name}</span>
                      {tag && (
                        <span className="cn-row__tag" data-pulse={tag.pulse || undefined}>
                          {tag.label}
                        </span>
                      )}
                      {count > 0 && <span className="cn-row__count">{formatCount(count)}</span>}
                      {isNavItemNew(item) && <span className="cn-row__new">New</span>}
                    </button>
                    {!locked && (
                      <button
                        type="button"
                        className="cn-row__pin"
                        data-pinned={pinned || undefined}
                        onClick={() => onTogglePin(item)}
                        title={pinned ? "Unpin from Home" : "Pin to Home"}
                        aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
                      >
                        <Pin size={13} strokeWidth={2.1} />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        <footer className="cn-foot">
          <Skyline hour={Number(HOUR_FORMAT.format(now)) % 24} />
          <button type="button" className="cn-go" onClick={() => setJumpOpen(true)}>
            <Search size={15} aria-hidden="true" />
            <span>Go to page</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="cn-me">
            <button
              type="button"
              className="cn-me__profile"
              data-active={isProfileActive || undefined}
              onClick={() => profileItem && onNavigate(profileItem)}
              title="Profile"
            >
              <Avatar user={user} />
              <span className="cn-me__text">
                <span className="cn-me__name">{user?.name || "Profile"}</span>
                <span className="cn-me__mail">{user?.email}</span>
              </span>
            </button>
            <button
              type="button"
              className="cn-icon-btn"
              onClick={onToggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {logoutItem && (
              <button type="button" className="cn-icon-btn cn-icon-btn--exit" onClick={() => onNavigate(logoutItem)} title="Log out" aria-label="Log out">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </footer>
      </aside>

      {jumpOpen &&
        createPortal(
          <ConsoleJump
            items={allItems}
            categories={categories}
            isPinned={isPinned}
            onClose={() => setJumpOpen(false)}
            onNavigate={(item) => {
              setJumpOpen(false)
              onNavigate(item)
            }}
          />,
          document.body
        )}
    </>
  )
}

export default ConsoleSidebar
