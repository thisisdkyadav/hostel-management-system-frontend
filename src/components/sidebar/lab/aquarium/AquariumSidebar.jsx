import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { LogOut, Moon, Pin, Sun } from "lucide-react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import { isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./aquarium.css"

/**
 * Lab X4 "Aquarium": the admin shell as a fish tank.
 *
 * - Water tinted by the selected category, with caustic ripples, light shafts,
 *   rising bubbles (more while the pointer is in the tank) and swaying seaweed.
 * - Categories are shells on the reef; tabs float as glass pebbles and a little
 *   pilot fish swims to the open one. Opening a tab lets off a puff of bubbles.
 * - The dive computer reads the time in India and how deep down the list you are;
 *   the water darkens a touch the deeper you go.
 * - The page sits behind aquarium glass (see aquarium.css). Light mode is a shallow
 *   lagoon, dark mode is the deep sea with bioluminescence.
 */

const IST_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" })

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const isTypingTarget = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

const formatCount = (count) => (count > 99 ? "99+" : String(count))

const useClock = () => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

/* Deterministic "random" bubbles so the tank looks the same on every render. */
const makeBubbles = (count, seed) =>
  Array.from({ length: count }, (_, i) => {
    const r = (n) => {
      const x = Math.sin((i + 1) * 12.9898 * n + seed * 78.233) * 43758.5453
      return x - Math.floor(x)
    }
    return {
      left: 4 + r(1) * 90,
      size: 4 + Math.round(r(2) * 9),
      duration: 9 + r(3) * 10,
      delay: -r(4) * 18,
      sway: (r(5) - 0.5) * 18,
    }
  })
const BUBBLES = makeBubbles(11, 1)
const EXTRA_BUBBLES = makeBubbles(16, 7)

const Bubble = ({ bubble }) => (
  <span
    className="lx-aquarium-bubble"
    style={{
      left: `${bubble.left}%`,
      width: bubble.size,
      height: bubble.size,
      animationDuration: `${bubble.duration}s`,
      animationDelay: `${bubble.delay}s`,
      "--sway": `${bubble.sway}px`,
    }}
  />
)

/* ---------- Shells (one per category) ---------- */

const URCHIN_SPIKES = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2
  const inner = 11
  const outer = i % 2 ? 19 : 21.5
  return {
    x1: 24 + Math.cos(a) * inner,
    y1: 25 + Math.sin(a) * inner,
    x2: 24 + Math.cos(a) * outer,
    y2: 25 + Math.sin(a) * outer,
  }
})

const SHELLS = {
  home: (
    <>
      <path className="lx-aquarium-shell__fill" d="M18 39 L30 39 L32.5 45 L15.5 45 Z" />
      <path className="lx-aquarium-shell__fill" d="M24 41 C15 40 5 30 4.5 19.5 C4.5 11 13.5 5 24 5 C34.5 5 43.5 11 43.5 19.5 C43 30 33 40 24 41 Z" />
      <path className="lx-aquarium-shell__ribs" d="M24 40 L7.5 17 M24 40 L12 10 M24 40 L18 6.5 M24 40 L24 5.5 M24 40 L30 6.5 M24 40 L36 10 M24 40 L40.5 17" />
      <path className="lx-aquarium-shell__shine" d="M10 15 C13 9 19 7 24 7 C17 9 13 12 11 17 Z" />
    </>
  ),
  hostels: (
    <>
      <path className="lx-aquarium-shell__fill" d="M24 5 C36 5 44 13.5 44 24 C44 35 35.5 43 24.5 43 C15 43 7 37 5 28.5 C3.5 22 6.5 16.5 10 14 C13.5 8.5 18.5 5 24 5 Z" />
      <path className="lx-aquarium-shell__ribs" d="M26 25 a2.5 2.5 0 1 1 -5 0 a5 5 0 1 1 10 0 a8 8 0 1 1 -16 0 a11.5 11.5 0 1 1 23 0 a15 15 0 1 1 -30 1.5" />
      <path className="lx-aquarium-shell__shine" d="M14 12 C18 8 23 7 27 7.5 C21 9 17 11.5 15 15 Z" />
    </>
  ),
  "student-affairs": (
    <>
      <polygon className="lx-aquarium-shell__fill lx-aquarium-shell__fill--round" points="24,5 29,18.1 43,18.8 32.1,27.6 35.8,41.2 24,33.5 12.2,41.2 15.9,27.6 5,18.8 19,18.1" />
      <g className="lx-aquarium-shell__dots">
        <circle cx="24" cy="11" r="1.1" />
        <circle cx="37.5" cy="20.5" r="1.1" />
        <circle cx="32.5" cy="36.5" r="1.1" />
        <circle cx="15.5" cy="36.5" r="1.1" />
        <circle cx="10.5" cy="20.5" r="1.1" />
      </g>
    </>
  ),
  staff: (
    <>
      <g className="lx-aquarium-shell__spikes">
        {URCHIN_SPIKES.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
        ))}
      </g>
      <circle className="lx-aquarium-shell__fill" cx="24" cy="25" r="12.5" />
      <path className="lx-aquarium-shell__shine" d="M15.5 21 C17 16.5 20.5 14 24.5 13.5 C20.5 16 18.5 18.5 17.5 22 Z" />
    </>
  ),
  dining: (
    <>
      <path className="lx-aquarium-shell__fill" d="M5 27 C7 37.5 16 43 24 43 C32 43 41 37.5 43 27 Z" />
      <path className="lx-aquarium-shell__fill" d="M5.5 23 C7 11.5 15.5 5 24 5 C32.5 5 41 11.5 42.5 23 Z" />
      <path className="lx-aquarium-shell__ribs" d="M24 22 L12 9.5 M24 22 L24 6 M24 22 L36 9.5 M24 28 L13 39 M24 28 L35 39" />
      <circle className="lx-aquarium-shell__pearl" cx="38" cy="25" r="3.2" />
    </>
  ),
}

const Shell = ({ category, index, isActive, count, hasNew, onSelect }) => {
  const Icon = category.icon
  return (
    <button
      type="button"
      className="lx-aquarium-shell"
      data-cat={category.id}
      data-active={isActive || undefined}
      onClick={() => onSelect(category.id)}
      aria-pressed={isActive}
      aria-label={`${category.name}${count ? `, ${count} pending` : ""}`}
      title={`${category.name} (Alt ${index + 1})`}
    >
      <span className="lx-aquarium-shell__halo" aria-hidden="true" />
      <svg className="lx-aquarium-shell__art" viewBox="0 0 48 48" aria-hidden="true">
        {SHELLS[category.id] || SHELLS.home}
      </svg>
      <span className="lx-aquarium-shell__icon" aria-hidden="true">
        <Icon size={15} strokeWidth={2.4} />
      </span>
      {isActive && (
        <span className="lx-aquarium-shell__stream" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
      {count > 0 && <span className="lx-aquarium-shell__count" aria-hidden="true">{formatCount(count)}</span>}
      {hasNew && !count && <span className="lx-aquarium-shell__new" aria-hidden="true" />}
    </button>
  )
}

/* ---------- Creatures ---------- */

const Fish = ({ variant }) => (
  <svg className="lx-aquarium-fish__art" viewBox="0 0 44 26" aria-hidden="true">
    <path className="lx-aquarium-fish__tail" d="M33 13 L43 4.5 L40.5 13 L43 21.5 Z" />
    <path className="lx-aquarium-fish__fin" d="M14 5.5 C18 0.5 25 1 28 6 Z" />
    <path className="lx-aquarium-fish__body" d="M3 13 C7 3.5 24 2 34 13 C24 24 7 22.5 3 13 Z" />
    {variant === "clown" && (
      <path className="lx-aquarium-fish__stripe" d="M10 5.6 C12.5 10 12.5 16 10 20.4 L13.6 21.4 C15.8 16 15.8 10 13.6 4.6 Z M21.5 3.9 C23.5 9.5 23.5 16.5 21.5 22.1 L25 21 C26.5 16 26.5 10 25 5 Z" />
    )}
    {variant === "tang" && <path className="lx-aquarium-fish__stripe" d="M9 12 C13 7 22 6.5 28 10.5 C22 9.5 15 10.5 11 14 Z" />}
    <circle className="lx-aquarium-fish__eye" cx="8.4" cy="11.2" r="1.9" />
    <circle className="lx-aquarium-fish__glint" cx="7.9" cy="10.6" r="0.6" />
  </svg>
)

const Jelly = () => (
  <svg className="lx-aquarium-jelly__art" viewBox="0 0 40 64" aria-hidden="true">
    <g className="lx-aquarium-jelly__tentacles">
      <path d="M11 22 C8 32 14 38 10 50" />
      <path d="M17 23 C15 35 20 42 17 58" />
      <path d="M23 23 C25 35 20 42 23 58" />
      <path d="M29 22 C32 32 26 38 30 50" />
    </g>
    <path className="lx-aquarium-jelly__bell" d="M4 22 C4 10 11 3 20 3 C29 3 36 10 36 22 C33 20.5 30 23.5 27 21.5 C24 23.5 22 21 20 22.5 C18 21 16 23.5 13 21.5 C10 23.5 7 20.5 4 22 Z" />
    <path className="lx-aquarium-jelly__shine" d="M10 14 C11 9 15 6 19 6 C15 8 12.5 11 12 15 Z" />
  </svg>
)

const Seaweed = ({ className, d, style }) => (
  <svg className={`lx-aquarium-weed ${className}`} viewBox="0 0 30 120" preserveAspectRatio="xMidYMax meet" style={style} aria-hidden="true">
    <path d={d} />
  </svg>
)

const PilotFish = () => (
  <svg className="lx-aquarium-pilot__art" viewBox="0 0 26 16" aria-hidden="true">
    <path className="lx-aquarium-pilot__tail" d="M7 8 L0.5 2.5 L2 8 L0.5 13.5 Z" />
    <path className="lx-aquarium-pilot__body" d="M6 8 C10 1.5 20 1.5 25 8 C20 14.5 10 14.5 6 8 Z" />
    <circle className="lx-aquarium-pilot__eye" cx="20.5" cy="7" r="1.3" />
  </svg>
)

const Avatar = ({ user }) => (
  <span className="lx-aquarium-avatar" aria-hidden="true">
    {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
  </span>
)

let burstSeq = 0

const AquariumSidebar = ({
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
  pathname,
  onHome,
}) => {
  const now = useClock()
  const tankRef = useRef(null)
  const rowRefs = useRef([])
  const titleRef = useRef(null)
  const [pilot, setPilot] = useState(null)
  const [bursts, setBursts] = useState([])

  const activeConfig = categories.find((category) => category.id === activeCategory) || categories[0]
  const activeIndex = items.findIndex((item) => isItemActive(item))
  const depthMetres = activeIndex < 0 ? 0 : 3 + activeIndex * 4
  const depthShade = activeIndex < 0 || items.length < 2 ? 0 : activeIndex / (items.length - 1)
  const pending = items.reduce((sum, item) => sum + (typeof item.badge === "number" ? item.badge : 0), 0)

  // The pilot fish swims to the open tab.
  useLayoutEffect(() => {
    const row = rowRefs.current[activeIndex]
    if (!row) {
      setPilot(null)
      return
    }
    setPilot(row.offsetTop + row.offsetHeight / 2)
    row.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, activeCategory, items.length])

  // Replay the title's float-in when the reef changes.
  useEffect(() => {
    const title = titleRef.current
    if (!title) return
    title.classList.remove("is-arriving")
    void title.offsetWidth
    title.classList.add("is-arriving")
  }, [activeCategory])

  // The page surfaces gently on every route change (opacity + blur only, so
  // pages that measure themselves on mount still see their real geometry).
  useEffect(() => {
    if (prefersReducedMotion()) return
    const content = document.querySelector(".layout-content")
    if (!content) return
    content.classList.remove("lx-aquarium-surface-in")
    void content.offsetWidth
    content.classList.add("lx-aquarium-surface-in")
    const id = window.setTimeout(() => content.classList.remove("lx-aquarium-surface-in"), 700)
    return () => window.clearTimeout(id)
  }, [pathname])

  // Alt+1…5 hops between reefs.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return
      if (!/^Digit[1-9]$/.test(event.code)) return
      const category = categories[Number(event.code.slice(5)) - 1]
      if (!category) return
      event.preventDefault()
      onCategoryChange(category.id)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [categories, onCategoryChange])

  // A puff of bubbles where a pebble was pressed.
  const puff = (event) => {
    const tank = tankRef.current
    if (!tank || prefersReducedMotion()) return
    const box = tank.getBoundingClientRect()
    const from = event.currentTarget.getBoundingClientRect()
    const x = event.detail > 0 ? event.clientX : from.left + 28
    const y = event.detail > 0 ? event.clientY : from.top + from.height / 2
    const id = ++burstSeq
    setBursts((list) => [...list.slice(-3), { id, x: x - box.left, y: y - box.top }])
    window.setTimeout(() => setBursts((list) => list.filter((burst) => burst.id !== id)), 1500)
  }

  return (
    <aside
      ref={tankRef}
      className="lx-aquarium"
      data-cat={activeConfig?.id}
      data-dark={isDark || undefined}
      aria-label="Main navigation"
      style={{ "--lx-aquarium-depth": depthShade.toFixed(3) }}
    >
      {/* ---------- The water (decorative) ---------- */}
      <div className="lx-aquarium-water" aria-hidden="true">
        <div className="lx-aquarium-deepen" />
        <div className="lx-aquarium-rays">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="lx-aquarium-caustics" />
        <div className="lx-aquarium-plankton" />
        <div className="lx-aquarium-fish lx-aquarium-fish--clown">
          <span className="lx-aquarium-fish__bob">
            <Fish variant="clown" />
          </span>
        </div>
        <div className="lx-aquarium-fish lx-aquarium-fish--tang">
          <span className="lx-aquarium-fish__bob">
            <Fish variant="tang" />
          </span>
        </div>
        <div className="lx-aquarium-fish lx-aquarium-fish--minnow">
          <span className="lx-aquarium-fish__bob">
            <Fish variant="minnow" />
          </span>
        </div>
        <div className="lx-aquarium-jelly">
          <Jelly />
        </div>
        <div className="lx-aquarium-bubbles">
          {BUBBLES.map((bubble, i) => (
            <Bubble key={i} bubble={bubble} />
          ))}
        </div>
        <div className="lx-aquarium-bubbles lx-aquarium-bubbles--extra">
          {EXTRA_BUBBLES.map((bubble, i) => (
            <Bubble key={i} bubble={bubble} />
          ))}
        </div>
        {bursts.map((burst) => (
          <span key={burst.id} className="lx-aquarium-burst" style={{ left: burst.x, top: burst.y }}>
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        ))}
      </div>

      {/* ---------- Header ---------- */}
      <header className="lx-aquarium-head">
        <button type="button" className="lx-aquarium-brand" onClick={onHome} title="Home">
          <span className="lx-aquarium-porthole" aria-hidden="true">
            <span className="lx-aquarium-porthole__glass" />
          </span>
          <span className="lx-aquarium-brand__text">
            <span className="lx-aquarium-brand__word">SMS</span>
            <span className="lx-aquarium-brand__sub">aquarium</span>
          </span>
        </button>
        <div className="lx-aquarium-dive" aria-label={`Time in India ${IST_FORMAT.format(now)}, depth ${depthMetres} metres`}>
          <span className="lx-aquarium-dive__time">{IST_FORMAT.format(now)}</span>
          <span className="lx-aquarium-dive__depth">{depthMetres ? `↓ ${depthMetres} m` : "surface"}</span>
        </div>
        <div className="lx-aquarium-mode">
          <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
        </div>
      </header>

      {/* ---------- Reef: category shells ---------- */}
      <nav className="lx-aquarium-reef" aria-label="Categories">
        {categories.map((category, index) => (
          <Shell
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

      {/* ---------- Pebbles: the tabs ---------- */}
      <section className="lx-aquarium-pool">
        <div className="lx-aquarium-title" ref={titleRef}>
          <span className="lx-aquarium-title__name">{activeConfig?.name}</span>
          <span className="lx-aquarium-title__meta">
            {items.length} {items.length === 1 ? "pebble" : "pebbles"}
            {pending > 0 && <> · {formatCount(pending)} waiting</>}
          </span>
        </div>

        <ul className="lx-aquarium-pebbles">
          {pilot !== null && (
            <li className="lx-aquarium-pilot" aria-hidden="true" style={{ transform: `translateY(${pilot}px)` }}>
              <span className="lx-aquarium-pilot__swim">
                <PilotFish />
              </span>
            </li>
          )}
          {items.length === 0 && (
            <li className="lx-aquarium-empty">This tide pool is empty. Pin tabs from the other reefs to keep them here.</li>
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
                className="lx-aquarium-pebble"
                data-active={active || undefined}
                data-live={item.accent === "success" || undefined}
                data-pinnable={!locked || undefined}
                style={{ "--i": index }}
              >
                <button
                  type="button"
                  className="lx-aquarium-pebble__go"
                  onClick={(event) => {
                    puff(event)
                    onNavigate(item)
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  {Icon && <Icon className="lx-aquarium-pebble__icon" size={16} strokeWidth={2} aria-hidden="true" />}
                  <span className="lx-aquarium-pebble__name">{labelFor(item) || item.name}</span>
                  {tag && (
                    <span className="lx-aquarium-pebble__tag" data-pulse={tag.pulse || undefined}>
                      {tag.label}
                    </span>
                  )}
                  {count > 0 && <span className="lx-aquarium-pebble__count">{formatCount(count)}</span>}
                  {isNavItemNew(item) && <span className="lx-aquarium-pebble__new">New</span>}
                </button>
                {!locked && (
                  <button
                    type="button"
                    className="lx-aquarium-pebble__pin"
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

      {/* ---------- Seabed ---------- */}
      <footer className="lx-aquarium-bed">
        <svg className="lx-aquarium-sand" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 18 C30 8 55 6 85 13 C120 21 150 22 185 12 C215 4 255 6 300 16 L300 40 L0 40 Z" />
        </svg>
        <Seaweed className="lx-aquarium-weed--a" d="M15 120 C5 100 24 88 13 70 C3 54 22 42 12 24 C8 16 12 8 15 2" />
        <Seaweed className="lx-aquarium-weed--b" d="M15 120 C24 104 6 92 16 76 C24 62 8 52 15 36" />
        <Seaweed className="lx-aquarium-weed--c" d="M15 120 C6 102 23 92 14 74 C6 58 22 48 14 30 C11 22 14 14 17 8" />
        <Seaweed className="lx-aquarium-weed--d" d="M15 120 C23 106 8 96 15 82 C21 70 10 62 15 50" />
        <span className="lx-aquarium-rock lx-aquarium-rock--a" aria-hidden="true" />
        <span className="lx-aquarium-rock lx-aquarium-rock--b" aria-hidden="true" />

        <div className="lx-aquarium-diver">
          <button
            type="button"
            className="lx-aquarium-diver__me"
            data-active={isProfileActive || undefined}
            onClick={() => profileItem && onNavigate(profileItem)}
            title="Profile"
          >
            <Avatar user={user} />
            <span className="lx-aquarium-diver__text">
              <span className="lx-aquarium-diver__name">{user?.name || "Profile"}</span>
              <span className="lx-aquarium-diver__mail">{user?.email}</span>
            </span>
          </button>
          <button
            type="button"
            className="lx-aquarium-icon-btn"
            onClick={onToggleTheme}
            title={isDark ? "Surface (light mode)" : "Dive deep (dark mode)"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {logoutItem && (
            <button
              type="button"
              className="lx-aquarium-icon-btn lx-aquarium-icon-btn--exit"
              onClick={() => onNavigate(logoutItem)}
              title="Swim out (log out)"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </footer>
    </aside>
  )
}

export default AquariumSidebar
