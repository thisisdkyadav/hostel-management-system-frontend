import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { LogOut, Moon, Pin, RotateCcw, Sun, Sunrise, Sunset } from "lucide-react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import { isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./daylight.css"

/**
 * Lab V15 "Daylight": the sidebar is a window onto the real sky over campus.
 *
 * - The sky follows the actual time in India (Asia/Kolkata): night, dawn,
 *   morning, day, golden hour and dusk crossfade as six gradient layers whose
 *   weights come from today's real sunrise and sunset at IIT Indore.
 * - The sun arcs across the top between sunrise and sunset; at night the moon
 *   takes over, drawn in tonight's actual phase. Clouds drift, birds cross by
 *   day, stars twinkle and the hostel windows light up after dark.
 * - Tabs sit on frosted cloud-glass cards that switch between a light and a
 *   dark glass so the text keeps its contrast at every hour (dark theme always
 *   wears the dark glass, like sunglasses). The category colour tints the horizon.
 * - Drag the sky (or focus it and use the arrow keys) to time-travel; it drifts
 *   back to now on its own. In dev, ?skyHour=19.5 pins the sky to an hour.
 */

// ---------- Sky maths ----------

const CAMPUS = { lat: 22.52, lon: 75.92 } // IIT Indore, Simrol
const IST_OFFSET_MIN = 330
const DEG = Math.PI / 180
const SYNODIC_DAYS = 29.530588853
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14)
const PHASES = ["night", "dawn", "morning", "day", "golden", "dusk"]

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const wrapHour = (hour) => ((hour % 24) + 24) % 24
const smooth = (t) => t * t * (3 - 2 * t)
const pad = (n) => String(n).padStart(2, "0")
const formatHour = (hour) => {
  const total = Math.round(wrapHour(hour) * 60) % 1440
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

const istHour = (date) => wrapHour((date.getTime() / 60000 + IST_OFFSET_MIN) / 60)
const istDayOfYear = (date) => {
  const shifted = new Date(date.getTime() + IST_OFFSET_MIN * 60000)
  return Math.floor((shifted.getTime() - Date.UTC(shifted.getUTCFullYear(), 0, 0)) / 86400000)
}

/** Sunrise and sunset in IST hours for the campus (NOAA-style approximation, within a few minutes). */
const sunTimes = (date) => {
  const day = istDayOfYear(date)
  const b = (2 * Math.PI * (day - 81)) / 364
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  const solarNoon = 12 + ((82.5 - CAMPUS.lon) * 4 - equationOfTime) / 60
  const declination = 23.44 * DEG * Math.sin((2 * Math.PI * (day - 81)) / 365)
  const lat = CAMPUS.lat * DEG
  const cosHourAngle = (Math.sin(-0.83 * DEG) - Math.sin(lat) * Math.sin(declination)) / (Math.cos(lat) * Math.cos(declination))
  const halfDay = Math.acos(clamp(cosHourAngle, -1, 1)) / DEG / 15
  return { rise: solarNoon - halfDay, set: solarNoon + halfDay }
}

/** Weight of each sky layer at an hour; two neighbours blend at a time. */
const skyWeights = (hour, rise, set) => {
  const keys = [
    [rise - 1.4, "night"],
    [rise - 0.35, "dawn"],
    [rise + 0.75, "morning"],
    [rise + 2.4, "day"],
    [set - 1.9, "day"],
    [set - 0.55, "golden"],
    [set + 0.3, "dusk"],
    [set + 1.25, "night"],
  ]
  const weights = Object.fromEntries(PHASES.map((phase) => [phase, 0]))
  if (hour <= keys[0][0] || hour >= keys[keys.length - 1][0]) {
    weights.night = 1
    return weights
  }
  for (let i = 0; i < keys.length - 1; i += 1) {
    const [from, fromPhase] = keys[i]
    const [to, toPhase] = keys[i + 1]
    if (hour >= from && hour <= to) {
      const f = smooth((hour - from) / (to - from))
      weights[fromPhase] += 1 - f
      weights[toPhase] += f
      break
    }
  }
  return weights
}

const phaseLabel = (phase, hour) => {
  if (phase === "night") return hour < 3 ? "Small hours" : hour < 12 ? "Before dawn" : hour < 22 ? "Evening" : "Night"
  if (phase === "day") return hour < 11.5 ? "Bright morning" : hour < 14 ? "Midday" : "Afternoon"
  return { dawn: "Dawn", morning: "Sunrise", golden: "Golden hour", dusk: "Dusk" }[phase]
}

/** 0 = new moon, 0.5 = full. */
const moonPhase = (date) => {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000
  return (((days / SYNODIC_DAYS) % 1) + 1) % 1
}

/** Lit part of a moon of radius r centred on 0,0 (northern hemisphere: waxing lights the right). */
const moonPath = (phase, r) => {
  const k = Math.cos(2 * Math.PI * phase)
  const rx = (Math.abs(k) * r).toFixed(2)
  const waxing = phase < 0.5
  const crescent = k > 0
  const limbSweep = waxing ? 1 : 0
  const terminatorSweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0
  return `M0 ${-r}A${r} ${r} 0 0 ${limbSweep} 0 ${r}A${rx} ${r} 0 0 ${terminatorSweep} 0 ${-r}Z`
}

// The arc the sun and moon ride, in sky-window pixels (the window is 300 wide).
const ARC = { cx: 150, cy: 112, rx: 116, ry: 74 }
const arcPoint = (t) => {
  const angle = Math.PI * t
  return { x: ARC.cx - ARC.rx * Math.cos(angle), y: ARC.cy - ARC.ry * Math.sin(angle) }
}
const ARC_PATH = `M${ARC.cx - ARC.rx} ${ARC.cy}A${ARC.rx} ${ARC.ry} 0 0 1 ${ARC.cx + ARC.rx} ${ARC.cy}`
const MINUTES_PER_PX = 4
const RETURN_AFTER_MS = 12000

const readPinnedHour = () => {
  if (!import.meta.env.DEV || typeof window === "undefined") return null
  const raw = new URLSearchParams(window.location.search).get("skyHour")
  const hour = raw === null || raw === "" ? NaN : Number(raw)
  return Number.isFinite(hour) ? wrapHour(hour) : null
}

const DAY_FORMAT = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })

const STARS = [
  [22, 18, 0], [64, 30, 1.2], [96, 12, 2.1], [131, 52, 0.6], [178, 20, 1.7], [204, 44, 2.6], [236, 14, 0.3],
  [272, 34, 1.4], [44, 62, 2.9], [112, 84, 0.9], [252, 70, 2.2], [160, 72, 3.1], [286, 92, 1.1], [18, 96, 2.4],
]
const CLOUDS = [
  { top: 54, scale: 0.8, duration: 150, delay: -20, rest: 30 },
  { top: 96, scale: 0.55, duration: 110, delay: -75, rest: 190 },
  { top: 230, scale: 1, duration: 190, delay: -60, rest: 120 },
  { top: 420, scale: 0.7, duration: 165, delay: -130, rest: 10 },
  { top: 640, scale: 0.9, duration: 210, delay: -10, rest: 170 },
]

// ---------- Pieces ----------

const formatCount = (count) => (count > 99 ? "99+" : String(count))

const Skyline = memo(() => {
  const blocks = [
    { x: 10, y: 50, w: 58, h: 60, cols: 4, rows: 4 },
    { x: 104, y: 30, w: 44, h: 80, cols: 3, rows: 6 },
    { x: 214, y: 46, w: 42, h: 64, cols: 3, rows: 4 },
  ]
  const windows = []
  blocks.forEach((block, b) => {
    for (let row = 0; row < block.rows; row += 1) {
      for (let col = 0; col < block.cols; col += 1) {
        const i = b * 31 + row * 7 + col * 3
        windows.push(
          <rect
            key={`${b}-${row}-${col}`}
            className="lx-daylight-window"
            data-off={i % 5 === 0 || undefined}
            data-flicker={i % 11 === 4 || undefined}
            x={block.x + 7 + col * ((block.w - 14) / block.cols)}
            y={block.y + 8 + row * 12}
            width="6"
            height="6"
            rx="1"
          />
        )
      }
    }
  })
  return (
    <svg className="lx-daylight-skyline" viewBox="0 0 300 110" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g className="lx-daylight-land">
        <circle cx="4" cy="92" r="13" />
        <rect x="10" y="50" width="58" height="60" rx="2" />
        <rect x="86" y="44" width="5" height="66" />
        <rect x="76" y="30" width="25" height="16" rx="3" />
        <rect x="104" y="30" width="44" height="80" rx="2" />
        <rect x="124" y="18" width="2" height="12" />
        <rect x="152" y="68" width="58" height="42" rx="2" />
        <circle cx="181" cy="68" r="15" />
        <rect x="179.5" y="44" width="3" height="10" />
        <rect x="214" y="46" width="42" height="64" rx="2" />
        <circle cx="266" cy="88" r="15" />
        <circle cx="290" cy="94" r="13" />
        <rect x="0" y="104" width="300" height="6" />
      </g>
      <g className="lx-daylight-windows">
        {windows}
        <rect className="lx-daylight-window" x="165" y="80" width="6" height="10" rx="1" />
        <rect className="lx-daylight-window" x="178" y="80" width="6" height="10" rx="1" />
        <rect className="lx-daylight-window" data-flicker x="191" y="80" width="6" height="10" rx="1" />
      </g>
    </svg>
  )
})
Skyline.displayName = "Skyline"

/**
 * The sky window: sun, moon, clock and the time-travel dial. It owns the clock
 * and writes the sky's weights onto the root as CSS variables, so the tab list
 * never re-renders while someone scrubs.
 */
const SkyWindow = ({ rootRef, isDark, onHome, sidebarMode, onModeChange }) => {
  const [now, setNow] = useState(() => new Date())
  const [pinnedHour] = useState(readPinnedHour)
  const [offset, setOffset] = useState(0)
  const [scrubbing, setScrubbing] = useState(false)
  const drag = useRef(null)

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) setNow(new Date())
    }
    const id = window.setInterval(tick, 30000)
    document.addEventListener("visibilitychange", tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [])

  // A preview drifts back to the real sky once left alone.
  useEffect(() => {
    if (!offset || scrubbing) return
    const id = window.setTimeout(() => setOffset(0), RETURN_AFTER_MS)
    return () => window.clearTimeout(id)
  }, [offset, scrubbing])

  const baseHour = pinnedHour ?? istHour(now)
  const hour = wrapHour(baseHour + offset)
  const previewing = offset !== 0 || pinnedHour !== null
  const { rise, set } = sunTimes(now)
  const weights = skyWeights(hour, rise, set)
  const phase = PHASES.reduce((best, candidate) => (weights[candidate] > weights[best] ? candidate : best), "night")
  const starLevel = clamp(weights.night + weights.dusk * 0.55 + weights.dawn * 0.45)
  const nightGlass = isDark || weights.night + weights.dusk * 0.8 + weights.dawn * 0.6 > 0.5
  const birds = weights.day + weights.morning + weights.golden * 0.6 > 0.5

  const sunT = (hour - rise) / (set - rise)
  const nightLength = 24 - (set - rise)
  let moonT = wrapHour(hour - set) / nightLength
  if (moonT > 1.08) moonT -= 24 / nightLength
  const sun = arcPoint(sunT)
  const moon = arcPoint(moonT)
  const sunUp = sunT > -0.1 && sunT < 1.1
  const moonUp = moonT > -0.1 && moonT < 1.1
  const lunarPhase = moonPhase(now)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    PHASES.forEach((name) => root.style.setProperty(`--lx-daylight-w-${name}`, weights[name].toFixed(3)))
    root.style.setProperty("--lx-daylight-stars", starLevel.toFixed(3))
    root.dataset.phase = phase
    root.dataset.glass = nightGlass ? "night" : "day"
    root.dataset.birds = birds ? "1" : "0"
    root.dataset.scrubbing = scrubbing ? "1" : "0"
  })

  const shift = useCallback((hours) => setOffset((current) => current + hours), [])

  const onPointerDown = (event) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    drag.current = { x: event.clientX, offset }
    setScrubbing(true)
  }
  const onPointerMove = (event) => {
    if (!drag.current) return
    setOffset(drag.current.offset + ((event.clientX - drag.current.x) * MINUTES_PER_PX) / 60)
  }
  const endDrag = () => {
    drag.current = null
    setScrubbing(false)
  }
  const onKeyDown = (event) => {
    const steps = { ArrowRight: 0.25, ArrowUp: 0.25, ArrowLeft: -0.25, ArrowDown: -0.25, PageUp: 1, PageDown: -1 }
    if (event.key in steps) {
      event.preventDefault()
      shift(steps[event.key])
    } else if (event.key === "Home" || event.key === "Escape") {
      event.preventDefault()
      setOffset(0)
    }
  }

  const label = phaseLabel(phase, hour)

  return (
    <header className="lx-daylight-skywin">
      <div className="lx-daylight-stars" aria-hidden="true">
        {STARS.map(([x, y, delay]) => (
          <span key={`${x}-${y}`} className="lx-daylight-star" style={{ left: x, top: y, animationDelay: `${delay}s` }} />
        ))}
        <span className="lx-daylight-shooting" />
      </div>

      <div className="lx-daylight-birds" aria-hidden="true">
        <svg viewBox="0 0 40 16">
          <path className="lx-daylight-bird" d="M2 8q5-6 9 0q4-6 9 0" />
          <path className="lx-daylight-bird lx-daylight-bird--b" d="M22 4q3.5-4 6.5 0q3-4 6.5 0" />
        </svg>
      </div>

      <div
        className="lx-daylight-dial"
        role="slider"
        tabIndex={0}
        aria-label="Sky time. Drag or use the arrow keys to preview another hour; Home returns to now."
        aria-valuemin={0}
        aria-valuemax={24}
        aria-valuenow={Number(hour.toFixed(2))}
        aria-valuetext={`${formatHour(hour)}, ${label}${previewing ? " (preview)" : ""}`}
        title="Drag the sky to time-travel"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        onDoubleClick={() => setOffset(0)}
      >
        <svg className="lx-daylight-arc" viewBox="0 0 300 120" aria-hidden="true">
          <path d={ARC_PATH} />
          <line x1="14" y1={ARC.cy} x2="286" y2={ARC.cy} />
        </svg>
        <div className="lx-daylight-orbit" aria-hidden="true">
          <span
            className="lx-daylight-sun"
            data-up={sunUp || undefined}
            style={{ transform: `translate(${sun.x - 17}px, ${sun.y - 17}px)` }}
          >
            <span className="lx-daylight-sun__rays" />
            <span className="lx-daylight-sun__core" />
          </span>
          <span
            className="lx-daylight-moon"
            data-up={moonUp || undefined}
            style={{ transform: `translate(${moon.x - 14}px, ${moon.y - 14}px)` }}
          >
            <svg viewBox="-12 -12 24 24">
              <circle className="lx-daylight-moon__dark" r="10" />
              <path className="lx-daylight-moon__lit" d={moonPath(lunarPhase, 10)} />
            </svg>
          </span>
        </div>
      </div>

      <div className="lx-daylight-skytop">
        <button type="button" className="lx-daylight-brand" onClick={onHome} title="Home">
          {sunUp ? <Sun size={15} strokeWidth={2.4} aria-hidden="true" /> : <Moon size={15} strokeWidth={2.4} aria-hidden="true" />}
          <span>SMS</span>
        </button>
        <div className="lx-daylight-mode">
          <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
        </div>
      </div>

      <div className="lx-daylight-skyfoot">
        <span className="lx-daylight-suntime" title="Sunrise today">
          <Sunrise size={13} aria-hidden="true" />
          {formatHour(rise)}
        </span>
        <div className="lx-daylight-clock" data-preview={previewing || undefined} aria-live="off">
          <span className="lx-daylight-clock__time">{formatHour(hour)}</span>
          <span className="lx-daylight-clock__phase">
            {label} · {previewing ? "preview" : DAY_FORMAT.format(now)}
          </span>
          {offset !== 0 && (
            <button type="button" className="lx-daylight-clock__now" onClick={() => setOffset(0)} title="Back to now" aria-label="Back to the real time">
              <RotateCcw size={12} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <span className="lx-daylight-suntime" title="Sunset today">
          <Sunset size={13} aria-hidden="true" />
          {formatHour(set)}
        </span>
      </div>
    </header>
  )
}

const Avatar = ({ user }) => (
  <span className="lx-daylight-avatar" aria-hidden="true">
    {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
  </span>
)

const isTypingTarget = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

// ---------- Shell ----------

const DaylightSidebar = ({
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
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const activeConfig = categories.find((category) => category.id === activeCategory) || categories[0]

  // Keep the open tab in view when the category or route changes.
  useEffect(() => {
    listRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView?.({ block: "nearest" })
  }, [activeCategory, items])

  // Alt+1…5 switches category.
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

  return (
    <aside
      ref={rootRef}
      className="lx-daylight"
      data-theme={isDark ? "dark" : "light"}
      data-cat={activeConfig?.id}
      aria-label="Main navigation"
      style={{ "--lx-daylight-cat": `var(${activeConfig?.colorVar || "--color-cat-home"})` }}
    >
      {/* The sky itself fills the whole window behind the page sheet. */}
      <div className="lx-daylight-sky" aria-hidden="true">
        {PHASES.map((name) => (
          <div key={name} className={`lx-daylight-layer lx-daylight-layer--${name}`} />
        ))}
        <div className="lx-daylight-starfield" />
        <div className="lx-daylight-horizon" />
      </div>

      <div className="lx-daylight-clouds" aria-hidden="true">
        {CLOUDS.map((cloud) => (
          <span
            key={cloud.top}
            className="lx-daylight-cloud"
            style={{
              top: cloud.top,
              "--lx-daylight-scale": cloud.scale,
              "--lx-daylight-rest": `${cloud.rest}px`,
              animationDuration: `${cloud.duration}s`,
              animationDelay: `${cloud.delay}s`,
            }}
          />
        ))}
      </div>

      <Skyline />

      <SkyWindow rootRef={rootRef} isDark={isDark} onHome={onHome} sidebarMode={sidebarMode} onModeChange={onModeChange} />

      <nav className="lx-daylight-cats lx-daylight-glass" aria-label="Categories">
        {categories.map((category, index) => {
          const Icon = category.icon
          const active = category.id === activeCategory
          const count = categoryCounts?.[category.id] || 0
          const hasNew = Boolean(newCategoryIds?.has(category.id))
          return (
            <button
              key={category.id}
              type="button"
              className="lx-daylight-cat"
              data-active={active || undefined}
              style={{ "--lx-daylight-c": `var(${category.colorVar})` }}
              onClick={() => onCategoryChange(category.id)}
              aria-pressed={active}
              aria-label={`${category.name}${count ? `, ${count} pending` : ""}`}
              title={`${category.name} (Alt ${index + 1})`}
            >
              <span className="lx-daylight-cat__disc" aria-hidden="true">
                {Icon && <Icon size={18} strokeWidth={2.1} />}
              </span>
              {count > 0 && <span className="lx-daylight-cat__count" aria-hidden="true">{formatCount(count)}</span>}
              {hasNew && !count && <span className="lx-daylight-cat__new" aria-hidden="true" />}
            </button>
          )
        })}
      </nav>

      <section className="lx-daylight-tabs lx-daylight-glass" aria-label={`${activeConfig?.name} tabs`}>
        <div className="lx-daylight-tabs__head" key={activeConfig?.id}>
          <span className="lx-daylight-tabs__name">{activeConfig?.name}</span>
          <span className="lx-daylight-tabs__meta">
            {items.length} {items.length === 1 ? "tab" : "tabs"}
          </span>
        </div>
        <ul ref={listRef} className="lx-daylight-list">
          {items.length === 0 && <li className="lx-daylight-empty">Clear skies. Pin tabs from other categories and they will land here.</li>}
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
                className="lx-daylight-row"
                data-active={active || undefined}
                data-live={item.accent === "success" || undefined}
                style={{ "--lx-daylight-i": index }}
              >
                <button type="button" className="lx-daylight-row__go" onClick={() => onNavigate(item)} aria-current={active ? "page" : undefined}>
                  {Icon && <Icon className="lx-daylight-row__icon" size={16} strokeWidth={2} aria-hidden="true" />}
                  <span className="lx-daylight-row__name">{labelFor(item) || item.name}</span>
                  {tag && (
                    <span className="lx-daylight-row__tag" data-pulse={tag.pulse || undefined}>
                      {tag.label}
                    </span>
                  )}
                  {count > 0 && <span className="lx-daylight-row__count">{formatCount(count)}</span>}
                  {isNavItemNew(item) && <span className="lx-daylight-row__new">New</span>}
                </button>
                {!locked && (
                  <button
                    type="button"
                    className="lx-daylight-row__pin"
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

      <footer className="lx-daylight-foot lx-daylight-glass">
        <button
          type="button"
          className="lx-daylight-me"
          data-active={isProfileActive || undefined}
          aria-current={isProfileActive ? "page" : undefined}
          onClick={() => profileItem && onNavigate(profileItem)}
          title="Profile"
        >
          <Avatar user={user} />
          <span className="lx-daylight-me__text">
            <span className="lx-daylight-me__name">{user?.name || "Profile"}</span>
            <span className="lx-daylight-me__mail">{user?.email}</span>
          </span>
        </button>
        <button
          type="button"
          className="lx-daylight-icon-btn"
          onClick={onToggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {logoutItem && (
          <button type="button" className="lx-daylight-icon-btn lx-daylight-icon-btn--exit" onClick={() => onNavigate(logoutItem)} title="Log out" aria-label="Log out">
            <LogOut size={16} />
          </button>
        )}
      </footer>
    </aside>
  )
}

export default DaylightSidebar
