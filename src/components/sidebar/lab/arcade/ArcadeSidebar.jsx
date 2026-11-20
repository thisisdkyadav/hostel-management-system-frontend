import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import { isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./arcade.css"

/**
 * Lab V10 "Arcade": the admin shell as an original 8-bit game cabinet.
 *
 * - Categories are worlds with pixel-art badges; the open world's tabs are its
 *   levels ("2-3"). A little sprite called Bit hops to the level you open.
 * - Pending counts are coins, the HUD keeps score (all pending work) and time
 *   (IST), and the marquee ticker blinks PRESS START between level starts.
 * - Pins are checkpoint flags: plant one and the level shows up in World 1.
 * - The page sits in the cabinet's screen bezel (see arcade.css).
 * Alt+1…5 jumps between worlds.
 */

/* ---------- Pixel art: each map is rows of characters, "." is empty ---------- */

const ART = {
  home: [
    ".....aa.....",
    "....aaaa....",
    "...aaaaaa...",
    "..aaaaaaaa..",
    ".aaaaaaaaaa.",
    "aaaaaaaaaaaa",
    ".aaaaaaaaaa.",
    ".abbaaaabba.",
    ".abbaaaabba.",
    ".aaaabbaaaa.",
    ".aaaabbaaaa.",
    ".aaaabbaaaa.",
  ],
  hostels: [
    ".aaaaaaaaaa.",
    ".abbabbabba.",
    ".abbabbabba.",
    ".aaaaaaaaaa.",
    ".abbabbabba.",
    ".abbabbabba.",
    ".aaaaaaaaaa.",
    ".abbabbabba.",
    ".abbabbabba.",
    ".aaaaaaaaaa.",
    ".aaaabbaaaa.",
    ".aaaabbaaaa.",
  ],
  "student-affairs": [
    "............",
    ".....aa.....",
    "...aaaaaa...",
    ".aaaaaaaaaa.",
    "aaaaaaaaaaaa",
    ".aaaaaaaaaab",
    "...aaaaaa..b",
    "...abbbbba.b",
    "...aaaaaa.bb",
    "....aaaa..bb",
    "............",
    "............",
  ],
  staff: [
    "............",
    "....aaaa....",
    "....a..a....",
    ".aaaaaaaaaa.",
    ".aaaaaaaaaa.",
    ".aaaaaaaaaa.",
    ".bbbbbbbbbb.",
    ".aaaabbaaaa.",
    ".aaaaaaaaaa.",
    ".aaaaaaaaaa.",
    ".aaaaaaaaaa.",
    "............",
  ],
  dining: [
    ".a.a.a...aa.",
    ".a.a.a..aaa.",
    ".a.a.a..aaa.",
    ".aaaaa..aaa.",
    "..aaa...aaa.",
    "...a....aaa.",
    "...a....aa..",
    "...a....aa..",
    "...a....aa..",
    "..aaa...aa..",
    "..aaa...aa..",
    "..aaa...aa..",
  ],
  // Unknown world: a question block.
  unknown: [
    "aaaaaaaaaaaa",
    "a..........a",
    "a...bbbb...a",
    "a..bb..bb..a",
    "a......bb..a",
    "a.....bb...a",
    "a....bb....a",
    "a....bb....a",
    "a..........a",
    "a....bb....a",
    "a..........a",
    "aaaaaaaaaaaa",
  ],
}

/* Bit: k outline, b body (world colour), w shine, e eyes, t antenna tip.
   Two foot layers alternate for an idle shuffle. */
const BIT = [
  "....tt....",
  ".....k....",
  "..kkkkkk..",
  ".kbbbbbbk.",
  "kbwbbbbbbk",
  "kbbebbebbk",
  "kbbebbebbk",
  "kbbbbbbbbk",
  ".kbbbbbbk.",
  "..........",
]
const BIT_FEET_A = [...Array(9).fill(".........."), "..ff..ff.."]
const BIT_FEET_B = [...Array(9).fill(".........."), ".gg....gg."]

const COIN = [
  "..cccc..",
  ".cyyyyc.",
  "cyywyyyc",
  "cywyyyyc",
  "cyyyyyyc",
  "cyyyyyyc",
  ".cyyyyc.",
  "..cccc..",
]

const FLAG = [
  "kffff...",
  "kfffff..",
  "kffff...",
  "k.......",
  "k.......",
  "k.......",
  "k.......",
  "kk......",
]

/* Logo: "SMS" in a 5x7 pixel face, with a drop layer one pixel down-right. */
const GLYPHS = {
  S: [".aaaa", "a....", "a....", ".aaa.", "....a", "....a", "aaaa."],
  M: ["a...a", "aa.aa", "a.a.a", "a.a.a", "a...a", "a...a", "a...a"],
}
const buildWord = (word) => {
  const width = word.length * 6 - 1 + 1
  const face = Array.from({ length: 8 }, () => Array(width).fill("."))
  const drop = Array.from({ length: 8 }, () => Array(width).fill("."))
  ;[...word].forEach((letter, i) => {
    GLYPHS[letter].forEach((row, y) => {
      ;[...row].forEach((ch, x) => {
        if (ch === ".") return
        face[y][i * 6 + x] = "a"
        drop[y + 1][i * 6 + x + 1] = "s"
      })
    })
  })
  return [drop.map((row) => row.join("")), face.map((row) => row.join(""))]
}
const LOGO = buildWord("SMS")

/** Rows -> merged horizontal runs, computed once per map. */
const runsCache = new Map()
const toRuns = (rows) => {
  if (runsCache.has(rows)) return runsCache.get(rows)
  const runs = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      if (ch === ".") {
        x += 1
        continue
      }
      let end = x
      while (end + 1 < row.length && row[end + 1] === ch) end += 1
      runs.push({ x, y, w: end - x + 1, ch })
      x = end + 1
    }
  })
  runsCache.set(rows, runs)
  return runs
}

const PixelArt = ({ layers, className }) => {
  const rows = layers[0]
  return (
    <svg
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {layers.flatMap((layer, li) =>
        toRuns(layer).map((run) => (
          <rect key={`${li}-${run.x}-${run.y}`} x={run.x} y={run.y} width={run.w} height={1} className={`lx-arcade-px-${run.ch}`} />
        ))
      )}
    </svg>
  )
}

/* ---------- Helpers ---------- */

const TIME_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" })

const useClock = () => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const formatCoins = (count) => (count > 99 ? "99+" : String(count))
const pad = (value, size) => String(Math.max(0, Math.min(value, 10 ** size - 1))).padStart(size, "0")

/* ---------- Pieces ---------- */

const World = ({ category, index, isActive, count, hasNew, onSelect }) => (
  <button
    type="button"
    className="lx-arcade-world"
    data-cat={category.id}
    data-active={isActive || undefined}
    onClick={() => onSelect(category.id)}
    aria-pressed={isActive}
    aria-label={`World ${index + 1}: ${category.name}${count ? `, ${count} pending` : ""}`}
    title={`World ${index + 1} · ${category.name} (Alt+${index + 1})`}
  >
    {isActive && <span className="lx-arcade-world__cursor" aria-hidden="true" />}
    <span className="lx-arcade-world__badge" aria-hidden="true">
      <PixelArt layers={[ART[category.id] || ART.unknown]} className="lx-arcade-world__art" />
    </span>
    <span className="lx-arcade-world__no" aria-hidden="true">
      W{index + 1}
    </span>
    {count > 0 && (
      <span className="lx-arcade-world__coins" aria-hidden="true">
        {formatCoins(count)}
      </span>
    )}
    {hasNew && !count && (
      <span className="lx-arcade-world__new" aria-hidden="true">
        !
      </span>
    )}
  </button>
)

const Avatar = ({ user }) => (
  <span className="lx-arcade-avatar" aria-hidden="true">
    {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
  </span>
)

/* ---------- Shell ---------- */

const ArcadeSidebar = ({
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
  const rowRefs = useRef([])
  const spriteRef = useRef(null)
  const hopRef = useRef(null)
  const lastSpot = useRef(null)

  const worldIndex = Math.max(0, categories.findIndex((category) => category.id === activeCategory))
  const activeConfig = categories[worldIndex]
  const worldNo = worldIndex + 1
  const activeIndex = items.findIndex((item) => isItemActive(item))
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null

  const score = Object.entries(categoryCounts || {})
    .filter(([id]) => id !== "home")
    .reduce((sum, [, n]) => sum + (Number(n) || 0), 0)
  const [hh, mm] = TIME_FORMAT.format(now).split(":")

  // Bit hops to the open level. Written straight to the DOM so nothing re-renders.
  useLayoutEffect(() => {
    const sprite = spriteRef.current
    const row = rowRefs.current[activeIndex]
    if (!sprite) return
    if (!row) {
      sprite.dataset.hidden = "true"
      lastSpot.current = null
      return
    }
    const top = row.offsetTop + row.offsetHeight / 2 - 13
    const spot = `${activeCategory}:${activeIndex}`
    delete sprite.dataset.hidden
    sprite.style.transform = `translateY(${top}px)`
    if (lastSpot.current !== spot && !prefersReducedMotion()) {
      const hop = hopRef.current
      hop?.classList.remove("is-hopping")
      void hop?.offsetWidth
      hop?.classList.add("is-hopping")
    }
    lastSpot.current = spot
    row.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, activeCategory, items.length])

  // "Level start": the page boots in with a short stepped flicker.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const content = document.querySelector(".layout-content")
    if (!content) return
    content.classList.remove("lx-arcade-boot")
    void content.offsetWidth
    content.classList.add("lx-arcade-boot")
    const id = window.setTimeout(() => content.classList.remove("lx-arcade-boot"), 500)
    return () => window.clearTimeout(id)
  }, [pathname])

  // Alt+1…n: warp to a world.
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

  const startMessage = activeItem
    ? `LEVEL ${worldNo}-${activeIndex + 1} START!`
    : isProfileActive
      ? "PLAYER 1 READY!"
      : null

  return (
    <aside className="lx-arcade" data-world={activeConfig?.id} aria-label="Main navigation">
      {/* Marquee */}
      <header className="lx-arcade-marquee">
        <button type="button" className="lx-arcade-logo" onClick={onHome} title="Home (World 1)">
          <PixelArt layers={LOGO} className="lx-arcade-logo__word" />
          <span className="lx-arcade-sr">SMS</span>
          <span className="lx-arcade-logo__sub">ARCADE</span>
        </button>
        <div className="lx-arcade-mode">
          <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
        </div>
        <span className="lx-arcade-bulbs" aria-hidden="true" />
      </header>

      {/* HUD */}
      <div className="lx-arcade-hud">
        <div className="lx-arcade-hud__cell" title="Pending items across all worlds">
          <span className="lx-arcade-hud__label">1UP SCORE</span>
          <span className="lx-arcade-hud__value">{pad(score, 6)}</span>
        </div>
        <div className="lx-arcade-hud__cell lx-arcade-hud__cell--time" aria-label={`Time in India ${hh}:${mm}`}>
          <span className="lx-arcade-hud__label">TIME</span>
          <span className="lx-arcade-hud__value">
            {hh}
            <span className="lx-arcade-hud__colon">:</span>
            {mm}
          </span>
        </div>
      </div>

      {/* Screen */}
      <div className="lx-arcade-screen" data-cat={activeConfig?.id}>
        <span className="lx-arcade-sky" aria-hidden="true" />

        <div className="lx-arcade-select">
          <span className="lx-arcade-select__label">SELECT WORLD</span>
          <nav className="lx-arcade-worlds" aria-label="Categories">
            {categories.map((category, index) => (
              <World
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
        </div>

        <div className="lx-arcade-title" key={activeConfig?.id}>
          <span className="lx-arcade-title__world">WORLD {worldNo}</span>
          <span className="lx-arcade-title__name">{activeConfig?.name}</span>
          <span className="lx-arcade-title__meta">
            {items.length} {items.length === 1 ? "LEVEL" : "LEVELS"}
          </span>
        </div>

        <div className="lx-arcade-stage">
          <ul className="lx-arcade-levels">
            <li className="lx-arcade-sprite" ref={spriteRef} data-hidden="true" aria-hidden="true">
              <span className="lx-arcade-sprite__hop" ref={hopRef}>
                <PixelArt layers={[BIT, BIT_FEET_A, BIT_FEET_B]} className="lx-arcade-sprite__art" />
              </span>
            </li>
            {items.length === 0 && (
              <li className="lx-arcade-empty">
                NO SAVED LEVELS YET.
                <br />
                Plant a checkpoint flag on any level to add it here.
              </li>
            )}
            {items.map((item, index) => {
              const active = isItemActive(item)
              const pinned = isPinned(item)
              const locked = pinLocked(item)
              const tag = item.badge && typeof item.badge === "object" ? item.badge : null
              const count = typeof item.badge === "number" ? item.badge : 0
              const name = labelFor(item) || item.name
              return (
                <li
                  key={item.path || item.name}
                  ref={(node) => {
                    rowRefs.current[index] = node
                  }}
                  className="lx-arcade-level"
                  data-active={active || undefined}
                  data-live={item.accent === "success" || undefined}
                  style={{ "--lx-arcade-i": index }}
                >
                  <button
                    type="button"
                    className="lx-arcade-level__go"
                    onClick={() => onNavigate(item)}
                    aria-current={active ? "page" : undefined}
                    title={name}
                  >
                    <span className="lx-arcade-level__no" aria-hidden="true">
                      {worldNo}-{index + 1}
                    </span>
                    <span className="lx-arcade-level__name">{name}</span>
                    {tag && (
                      <span className="lx-arcade-level__tag" data-pulse={tag.pulse || undefined}>
                        {tag.label}
                      </span>
                    )}
                    {isNavItemNew(item) && <span className="lx-arcade-level__new">NEW</span>}
                    {count > 0 && (
                      <span className="lx-arcade-level__coins" aria-label={`${count} pending`}>
                        <PixelArt layers={[COIN]} className="lx-arcade-coin" />
                        <span aria-hidden="true">{formatCoins(count)}</span>
                      </span>
                    )}
                  </button>
                  {!locked && (
                    <button
                      type="button"
                      className="lx-arcade-level__flag"
                      data-pinned={pinned || undefined}
                      onClick={() => onTogglePin(item)}
                      title={pinned ? "Checkpoint set: unpin from Home" : "Set checkpoint: pin to Home"}
                      aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
                      aria-pressed={pinned}
                    >
                      <PixelArt layers={[FLAG]} className="lx-arcade-flag" />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="lx-arcade-ticker" aria-hidden="true">
          {startMessage && (
            <span className="lx-arcade-ticker__start" key={pathname}>
              {startMessage}
            </span>
          )}
          <span className="lx-arcade-ticker__press" key={`p-${pathname}`} data-delayed={startMessage ? "true" : undefined}>
            PRESS START
          </span>
        </div>
      </div>

      {/* Control deck */}
      <footer className="lx-arcade-deck">
        <button
          type="button"
          className="lx-arcade-player"
          data-active={isProfileActive || undefined}
          onClick={() => profileItem && onNavigate(profileItem)}
          aria-current={isProfileActive ? "page" : undefined}
          title="Profile"
        >
          <Avatar user={user} />
          <span className="lx-arcade-player__text">
            <span className="lx-arcade-player__tag">PLAYER 1</span>
            <span className="lx-arcade-player__name">{user?.name || "Profile"}</span>
          </span>
        </button>
        <div className="lx-arcade-buttons">
          <button
            type="button"
            className="lx-arcade-btn lx-arcade-btn--a"
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="lx-arcade-btn__cap" aria-hidden="true" />
            <span className="lx-arcade-btn__label" aria-hidden="true">
              {isDark ? "DAY" : "NITE"}
            </span>
          </button>
          {logoutItem && (
            <button type="button" className="lx-arcade-btn lx-arcade-btn--b" onClick={() => onNavigate(logoutItem)} title="Log out" aria-label="Log out">
              <span className="lx-arcade-btn__cap" aria-hidden="true" />
              <span className="lx-arcade-btn__label" aria-hidden="true">
                QUIT
              </span>
            </button>
          )}
        </div>
      </footer>
    </aside>
  )
}

export default ArcadeSidebar
