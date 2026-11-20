import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowRight, Moon, Pin, Sun } from "lucide-react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import { isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./metro.css"

/**
 * V14 "Metro" (Lab): the admin shell as a transit map.
 *
 * - Each category is a line in its own colour; the line badges at the top
 *   switch lines (Alt+1…5).
 * - The open line's tabs are stations on a thick vertical route. A little
 *   train glides to the open station; switching lines sends it in from the
 *   terminus.
 * - Pinned tabs are interchanges: a ringed station with a stub of the line it
 *   connects to (Home on other lines, the tab's own line on Home).
 * - A departure board up top: flip clock, a split-flap NOW / NEXT, and a
 *   service-status ticker built from the pending counts.
 * - Every route change opens a pair of train doors over the page.
 */

const TIME_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" })

const SHORT_NAMES = { home: "Home", hostels: "Hostels", "student-affairs": "Affairs", staff: "Staff", dining: "Dining" }

const useClock = () => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const formatCount = (count) => (count > 99 ? "99+" : String(count))

/** Split-flap text: every character flips in, staggered. Remounts per text. */
const SplitFlap = ({ text }) => (
  <span className="lx-metro-flap" aria-hidden="true">
    {[...text.slice(0, 26)].map((char, index) => (
      <span key={index} className="lx-metro-flap__ch" style={{ "--d": index }}>
        {char === " " ? " " : char}
      </span>
    ))}
  </span>
)

const FlipClock = ({ now }) => {
  const time = TIME_FORMAT.format(now)
  return (
    <span className="lx-metro-clock" role="timer" aria-label={`Time in India ${time}`}>
      {[...time].map((char, index) =>
        char === ":" ? (
          <span key="colon" className="lx-metro-clock__colon" aria-hidden="true">:</span>
        ) : (
          <span key={`${index}-${char}`} className="lx-metro-clock__tile" aria-hidden="true">
            {char}
          </span>
        )
      )}
    </span>
  )
}

const Train = ({ trainRef }) => (
  <li className="lx-metro-train" ref={trainRef} data-hidden="true" aria-hidden="true">
    <span className="lx-metro-train__car">
      <svg viewBox="0 0 18 34" width="22" height="42" focusable="false">
        <path className="lx-metro-train__body" d="M2 7 Q2 1.5 9 1.5 Q16 1.5 16 7 V25 Q16 32.5 9 32.5 Q2 32.5 2 25 Z" />
        <rect className="lx-metro-train__stripe" x="2" y="13" width="14" height="3" />
        <rect className="lx-metro-train__glass" x="5" y="5" width="8" height="5" rx="1.5" />
        <path className="lx-metro-train__glass" d="M4.5 24 Q9 21.5 13.5 24 V27 Q9 30 4.5 27 Z" />
        <circle className="lx-metro-train__lamp" cx="6" cy="30.6" r="1" />
        <circle className="lx-metro-train__lamp" cx="12" cy="30.6" r="1" />
      </svg>
    </span>
  </li>
)

const Avatar = ({ user }) => (
  <span className="lx-metro-avatar" aria-hidden="true">
    {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
  </span>
)

const MetroSidebar = ({
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
  const trainRef = useRef(null)
  const rowRefs = useRef([])
  const lastStop = useRef({ category: null, top: null })
  const doorsRef = useRef(null)
  const firstPath = useRef(pathname)

  const lineIndex = Math.max(0, categories.findIndex((category) => category.id === activeCategory))
  const line = categories[lineIndex]
  const isHomeLine = activeCategory === "home"
  const activeIndex = items.findIndex((item) => isItemActive(item))
  const nameOf = (item) => (item ? labelFor(item) || item.name : "")

  const elsewhere = activeIndex < 0 ? allItems.find((item) => isItemActive(item)) : null
  const nowName = isProfileActive ? "Your pass" : activeIndex >= 0 ? nameOf(items[activeIndex]) : elsewhere ? nameOf(elsewhere) : "Between stations"
  const nextName =
    activeIndex < 0 ? nameOf(items[0]) || "No service" : activeIndex === items.length - 1 ? "Terminus" : nameOf(items[activeIndex + 1])
  const terminus = items.length ? nameOf(items[items.length - 1]) : ""

  const status = categories
    .map((category) => {
      const count = categoryCounts?.[category.id] || 0
      return `${category.name} line: ${count ? `${count} waiting` : "good service"}`
    })
    .join("   ·   ")

  // The train: written straight to the node so it can glide without a render.
  useLayoutEffect(() => {
    const train = trainRef.current
    if (!train) return
    const row = rowRefs.current[activeIndex]
    if (!row) {
      train.dataset.hidden = "true"
      lastStop.current = { category: activeCategory, top: null }
      return
    }
    const top = row.offsetTop + row.offsetHeight / 2
    const last = lastStop.current
    const sameLine = last.category === activeCategory && last.top !== null
    const reduce = prefersReducedMotion()
    const from = sameLine ? last.top : (rowRefs.current[0]?.offsetTop ?? 0) - 26

    train.dataset.hidden = "false"
    if (!sameLine || reduce) {
      train.style.transitionDuration = "0ms"
      train.style.transform = `translate3d(0, ${reduce ? top : from}px, 0)`
      void train.offsetWidth
    }
    const distance = Math.abs(top - from)
    train.style.transitionDuration = reduce ? "0ms" : `${Math.round(Math.min(1300, Math.max(420, distance * 2.4)))}ms`
    if (top !== from) train.dataset.dir = top > from ? "down" : "up"
    train.style.transform = `translate3d(0, ${top}px, 0)`
    lastStop.current = { category: activeCategory, top }
    row.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, activeCategory, items.length])

  // Doors open over the page on every route change (not on first paint).
  useEffect(() => {
    if (pathname === firstPath.current) return
    firstPath.current = null
    const doors = doorsRef.current
    if (!doors || prefersReducedMotion()) return
    doors.classList.remove("is-opening")
    void doors.offsetWidth
    doors.classList.add("is-opening")
    const id = window.setTimeout(() => doors.classList.remove("is-opening"), 700)
    return () => window.clearTimeout(id)
  }, [pathname])

  // Alt+1…n switches lines.
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
    <aside className="lx-metro" data-cat={activeCategory} aria-label="Main navigation">
      <header className="lx-metro-board">
        <div className="lx-metro-board__top">
          <button type="button" className="lx-metro-brand" onClick={onHome} title="Home line">
            <span className="lx-metro-brand__mark" aria-hidden="true">
              <span />
            </span>
            <span className="lx-metro-brand__word">
              SMS<small>Metro</small>
            </span>
          </button>
          <FlipClock now={now} />
          <div className="lx-metro-mode">
            <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
          </div>
        </div>

        <div className="lx-metro-board__screen">
          <p className="lx-metro-board__row" aria-live="polite">
            <span className="lx-metro-board__label">Now</span>
            <span className="lx-metro-sr">Now at {nowName}</span>
            <SplitFlap key={`now-${nowName}`} text={nowName} />
            <span className="lx-metro-board__plat" aria-hidden="true">L{lineIndex + 1}</span>
          </p>
          <p className="lx-metro-board__row lx-metro-board__row--dim">
            <span className="lx-metro-board__label">Next</span>
            <span className="lx-metro-sr">Next stop {nextName}</span>
            <SplitFlap key={`next-${nextName}`} text={nextName} />
          </p>
          <div className="lx-metro-ticker" title={status}>
            <span className="lx-metro-sr">{status}</span>
            <span className="lx-metro-ticker__track" aria-hidden="true">
              <span>{status}</span>
              <span>{status}</span>
            </span>
          </div>
        </div>
      </header>

      <nav className="lx-metro-lines" aria-label="Lines">
        <span className="lx-metro-lines__track" aria-hidden="true" />
        {categories.map((category, index) => {
          const Icon = category.icon
          const active = category.id === activeCategory
          const count = categoryCounts?.[category.id] || 0
          const hasNew = Boolean(newCategoryIds?.has(category.id))
          return (
            <button
              key={category.id}
              type="button"
              className="lx-metro-badge"
              data-cat={category.id}
              data-active={active || undefined}
              aria-pressed={active}
              aria-label={`${category.name} line${count ? `, ${count} pending` : ""}${hasNew ? ", has new tabs" : ""}`}
              title={`${category.name} line · Alt ${index + 1}`}
              onClick={() => onCategoryChange(category.id)}
            >
              <span className="lx-metro-badge__disc" aria-hidden="true">
                <Icon size={16} strokeWidth={2.25} />
              </span>
              <span className="lx-metro-badge__code" aria-hidden="true">{SHORT_NAMES[category.id] || category.name}</span>
              {count > 0 && <span className="lx-metro-badge__count" aria-hidden="true">{formatCount(count)}</span>}
              {hasNew && !count && <span className="lx-metro-badge__new" aria-hidden="true" />}
            </button>
          )
        })}
      </nav>

      <div className="lx-metro-sign" key={activeCategory}>
        <span className="lx-metro-sign__num" aria-hidden="true">{lineIndex + 1}</span>
        <span className="lx-metro-sign__text">
          <span className="lx-metro-sign__name">{line?.name} line</span>
          <span className="lx-metro-sign__sub">
            {items.length} {items.length === 1 ? "station" : "stations"}
            {terminus && items.length > 1 ? (
              <>
                {" · towards "}
                <strong>{terminus}</strong>
              </>
            ) : null}
          </span>
        </span>
      </div>

      <div className="lx-metro-map">
        <ul key={activeCategory} className="lx-metro-route" data-empty={items.length === 0 || undefined}>
          <Train trainRef={trainRef} />
          {items.length === 0 && (
            <li className="lx-metro-empty">No stations yet. Pin tabs on other lines to build interchanges here.</li>
          )}
          {items.map((item, index) => {
            const active = isItemActive(item)
            const pinned = isPinned(item)
            const locked = pinLocked(item)
            const origin = item.adminCategory || "hostels"
            const branch = isHomeLine ? (origin !== "home" ? origin : null) : pinned ? "home" : null
            const tag = item.badge && typeof item.badge === "object" ? item.badge : null
            const count = typeof item.badge === "number" ? item.badge : 0
            const fresh = isNavItemNew(item)
            return (
              <li
                key={item.path || item.name}
                ref={(node) => {
                  rowRefs.current[index] = node
                }}
                className="lx-metro-stop"
                data-active={active || undefined}
                data-interchange={branch ? true : undefined}
                data-branch={branch || undefined}
                data-live={item.accent === "success" || undefined}
                data-terminus={index === 0 || index === items.length - 1 || undefined}
                style={{ "--i": index }}
              >
                <button
                  type="button"
                  className="lx-metro-stop__go"
                  onClick={() => onNavigate(item)}
                  aria-current={active ? "page" : undefined}
                  title={branch ? `${nameOf(item)} · change for ${SHORT_NAMES[branch] || branch} line` : undefined}
                >
                  <span className="lx-metro-stop__marker" aria-hidden="true" />
                  {branch && <span className="lx-metro-stop__branch" aria-hidden="true" />}
                  <span className="lx-metro-stop__name">{nameOf(item)}</span>
                  {tag && (
                    <span className="lx-metro-chip lx-metro-chip--live" data-pulse={tag.pulse || undefined}>
                      {tag.label}
                    </span>
                  )}
                  {count > 0 && (
                    <span className="lx-metro-chip lx-metro-chip--count" aria-label={`${count} pending`}>
                      {formatCount(count)}
                    </span>
                  )}
                  {fresh && <span className="lx-metro-chip lx-metro-chip--new">New</span>}
                </button>
                {!locked && (
                  <button
                    type="button"
                    className="lx-metro-stop__pin"
                    data-pinned={pinned || undefined}
                    onClick={() => onTogglePin(item)}
                    title={pinned ? "Unpin from Home line" : "Pin to Home line"}
                    aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
                    aria-pressed={pinned}
                  >
                    <Pin size={13} strokeWidth={2.25} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <footer className="lx-metro-foot">
        <button
          type="button"
          className="lx-metro-pass"
          data-active={isProfileActive || undefined}
          aria-current={isProfileActive ? "page" : undefined}
          onClick={() => profileItem && onNavigate(profileItem)}
          title="Profile"
        >
          <span className="lx-metro-pass__band" aria-hidden="true">Pass</span>
          <Avatar user={user} />
          <span className="lx-metro-pass__text">
            <span className="lx-metro-pass__name">{user?.name || "Profile"}</span>
            <span className="lx-metro-pass__mail">{user?.email || "All zones"}</span>
          </span>
        </button>
        <div className="lx-metro-foot__row">
          <button
            type="button"
            className="lx-metro-service"
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
            <span>{isDark ? "Day service" : "Night service"}</span>
          </button>
          {logoutItem && (
            <button type="button" className="lx-metro-exit" onClick={() => onNavigate(logoutItem)} aria-label="Log out">
              <span>Exit</span>
              <ArrowRight size={15} strokeWidth={2.5} aria-hidden="true" />
            </button>
          )}
        </div>
      </footer>

      <div className="lx-metro-doors" ref={doorsRef} aria-hidden="true">
        <span className="lx-metro-doors__leaf lx-metro-doors__leaf--l" />
        <span className="lx-metro-doors__leaf lx-metro-doors__leaf--r" />
      </div>
    </aside>
  )
}

export default MetroSidebar
