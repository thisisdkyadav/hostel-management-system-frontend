import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { LogOut, Moon, Pin, Sparkles, Sun } from "lucide-react"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { isNavItemNew } from "../../../constants/navigationConfig"
import SidebarModeSwitcher from "../SidebarModeSwitcher"
import OrbitWarp from "./OrbitWarp"
import "./orbit.css"

/**
 * V6 "Orbit": the admin shell as a deep-space console.
 *
 * - Categories are planets; the selected one carries an orbit ring with a moon.
 * - The selected category's tabs hang on a glowing thread. A comet slides to the
 *   open tab, and the list behaves like a lens: rows near the pointer swell and
 *   drift outward, so the eye lands where the hand is.
 * - Ctrl+K or "/" opens Warp, a full-screen jump to any tab; Alt+1…5 switches planets.
 * - The page floats as a lit sheet over a nebula tinted by the selected category
 *   (see orbit.css; the html flags come from Sidebar).
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

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const formatCount = (count) => (count > 99 ? "99+" : String(count))

const Planet = ({ category, index, isActive, count, hasNew, onSelect }) => {
  const Icon = category.icon
  return (
    <button
      type="button"
      className="ob-planet"
      data-cat={category.id}
      data-active={isActive || undefined}
      onClick={() => onSelect(category.id)}
      aria-pressed={isActive}
      aria-label={`${category.name}${count ? `, ${count} pending` : ""}`}
    >
      <span className="ob-planet__orbit" aria-hidden="true">
        <span className="ob-planet__moon" />
      </span>
      <span className="ob-planet__body" aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>
      {count > 0 && <span className="ob-planet__count" aria-hidden="true">{formatCount(count)}</span>}
      {hasNew && !count && <span className="ob-planet__new" aria-hidden="true" />}
      <span className="ob-planet__label" aria-hidden="true">
        {category.name}
        <kbd>Alt {index + 1}</kbd>
      </span>
    </button>
  )
}

const Avatar = ({ user }) => (
  <span className="ob-avatar" aria-hidden="true">
    {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
  </span>
)

const OrbitSidebar = ({
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
  pathname,
  onHome,
}) => {
  const now = useClock()
  const [warpOpen, setWarpOpen] = useState(false)
  const [comet, setComet] = useState(null)
  const listRef = useRef(null)
  const rowRefs = useRef([])
  const lensFrame = useRef(0)
  const titleRef = useRef(null)

  const activeConfig = categories.find((category) => category.id === activeCategory) || categories[0]
  const activeIndex = items.findIndex((item) => isItemActive(item))

  // Comet: follow the open tab down the thread.
  useLayoutEffect(() => {
    const row = rowRefs.current[activeIndex]
    if (!row) {
      setComet(null)
      return
    }
    setComet({ top: row.offsetTop + row.offsetHeight / 2 })
    row.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, activeCategory, items.length])

  // Replay the title's arrival whenever the planet changes.
  useEffect(() => {
    const title = titleRef.current
    if (!title) return
    title.classList.remove("is-arriving")
    void title.offsetWidth
    title.classList.add("is-arriving")
  }, [activeCategory])

  // Lens: rows near the pointer swell. Written straight to style in a frame so
  // the list never re-renders while the pointer moves.
  const applyLens = useCallback((clientY) => {
    cancelAnimationFrame(lensFrame.current)
    lensFrame.current = requestAnimationFrame(() => {
      rowRefs.current.slice(0, items.length).forEach((row) => {
        if (!row) return
        if (clientY === null) {
          row.style.setProperty("--lens", "0")
          return
        }
        const rect = row.getBoundingClientRect()
        const distance = (rect.top + rect.height / 2 - clientY) / 46
        row.style.setProperty("--lens", Math.exp(-(distance * distance) / 1.6).toFixed(3))
      })
    })
  }, [items.length])
  useEffect(() => () => cancelAnimationFrame(lensFrame.current), [])

  // Page warp-in on every route change.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const content = document.querySelector(".layout-content")
    if (!content) return
    content.classList.remove("ob-warp-in")
    void content.offsetWidth
    content.classList.add("ob-warp-in")
    const id = window.setTimeout(() => content.classList.remove("ob-warp-in"), 700)
    return () => window.clearTimeout(id)
  }, [pathname])

  // Keys: Ctrl/Cmd+K or "/" for Warp, Alt+1…n for planets.
  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault()
        setWarpOpen((open) => !open)
        return
      }
      if (key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isTypingTarget(event.target)) {
        event.preventDefault()
        setWarpOpen(true)
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

  const dock = (
    <aside className="ob" aria-label="Main navigation">
      <header className="ob-head">
        <button type="button" className="ob-brand" onClick={onHome} title="Home">
          <span className="ob-brand__core" aria-hidden="true" />
          <span className="ob-brand__word">SMS</span>
        </button>
        <div className="ob-clock" aria-label="Time in India">
          <span className="ob-clock__time">{IST_FORMAT.format(now)}</span>
          <span className="ob-clock__day">{DAY_FORMAT.format(now)}</span>
        </div>
        <div className="ob-mode">
          <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
        </div>
      </header>

      <div className="ob-body">
        <nav className="ob-planets" aria-label="Categories">
          {categories.map((category, index) => (
            <Planet
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

        <section className="ob-space" data-cat={activeConfig?.id}>
          <div className="ob-title" ref={titleRef}>
            <span className="ob-title__name">{activeConfig?.name}</span>
            <span className="ob-title__meta">
              {items.length} {items.length === 1 ? "destination" : "destinations"}
            </span>
          </div>

          <ul
            ref={listRef}
            className="ob-thread"
            onPointerMove={(event) => event.pointerType === "mouse" && applyLens(event.clientY)}
            onPointerLeave={() => applyLens(null)}
          >
            {comet && <li className="ob-comet" aria-hidden="true" style={{ transform: `translateY(${comet.top}px)` }} />}
            {items.length === 0 && (
              <li className="ob-empty">Nothing in orbit yet. Pin tabs from other planets to see them here.</li>
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
                  className="ob-row"
                  data-active={active || undefined}
                  data-live={item.accent === "success" || undefined}
                  style={{ "--i": index }}
                >
                  <button type="button" className="ob-row__go" onClick={() => onNavigate(item)} aria-current={active ? "page" : undefined}>
                    <span className="ob-row__node" aria-hidden="true" />
                    {Icon && <Icon className="ob-row__icon" size={16} strokeWidth={2} aria-hidden="true" />}
                    <span className="ob-row__name">{labelFor(item) || item.name}</span>
                    {tag && (
                      <span className="ob-row__tag" data-pulse={tag.pulse || undefined}>
                        {tag.label}
                      </span>
                    )}
                    {count > 0 && <span className="ob-row__count">{formatCount(count)}</span>}
                    {isNavItemNew(item) && <span className="ob-row__new">New</span>}
                  </button>
                  {!locked && (
                    <button
                      type="button"
                      className="ob-row__pin"
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
        </section>
      </div>

      <footer className="ob-foot">
        <button type="button" className="ob-warp-btn" onClick={() => setWarpOpen(true)}>
          <Sparkles size={16} aria-hidden="true" />
          <span>Warp anywhere</span>
          <kbd>Ctrl K</kbd>
        </button>
        <div className="ob-pilot">
          <button
            type="button"
            className="ob-pilot__me"
            data-active={isProfileActive || undefined}
            onClick={() => profileItem && onNavigate(profileItem)}
            title="Profile"
          >
            <Avatar user={user} />
            <span className="ob-pilot__text">
              <span className="ob-pilot__name">{user?.name || "Profile"}</span>
              <span className="ob-pilot__mail">{user?.email}</span>
            </span>
          </button>
          <button
            type="button"
            className="ob-icon-btn"
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {logoutItem && (
            <button type="button" className="ob-icon-btn ob-icon-btn--exit" onClick={() => onNavigate(logoutItem)} title="Log out" aria-label="Log out">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </footer>
    </aside>
  )

  return (
    <>
      {dock}
      {warpOpen &&
        createPortal(
          <OrbitWarp
            items={allItems}
            categories={categories}
            isPinned={isPinned}
            onClose={() => setWarpOpen(false)}
            onNavigate={(item) => {
              setWarpOpen(false)
              onNavigate(item)
            }}
          />,
          document.body
        )}
    </>
  )
}

export default OrbitSidebar
