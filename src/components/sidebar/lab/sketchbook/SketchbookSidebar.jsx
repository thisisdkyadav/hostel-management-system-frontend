import { useEffect, useRef } from "react"
import { LogOut, Moon, Sun } from "lucide-react"
import { isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./sketchbook.css"

/**
 * Lab X3 "Sketchbook": the admin shell as a spiral-bound notebook.
 *
 * - Categories are sticky notes stuck along the top of the page; the open one
 *   is pressed flat under a strip of washi tape.
 * - Tabs are written on the ruled lines, doodle icons sit in the margin and
 *   wobble like hand-drawn ink (an SVG turbulence filter; the open tab's icon
 *   "boils"). The open tab gets a marker swipe that draws itself.
 * - Pins are thumbtacks, counts are circled in red pen, Live is a rubber stamp.
 * - The page beside it is the facing sheet, bound by the spiral; it turns over
 *   (a clip-path wipe, no transforms) on every route change.
 * - Dark mode wipes the paper into a chalkboard in a wooden frame.
 * - Alt+1…5 flips between the sticky notes.
 */

const DAY_FORMAT = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const formatCount = (count) => (count > 99 ? "99+" : String(count))

// Hand-drawn strokes, in a 0–100 box stretched over whatever they decorate.
const MARKER_SWIPE = "M2 14 C 22 10, 48 15, 70 11 S 92 12, 98 12"
const MARKER_UNDERLINE = "M3 21 C 30 19, 64 23, 97 19"
const HEADING_SCRIBBLE = "M2 5 C 40 2, 110 8, 198 3 M 12 10 C 70 7, 128 11, 186 8"
const PEN_CIRCLE = "M6 6 C 14 1, 28 2, 30 10 C 32 18, 20 23, 11 21 C 3 19, 1 12, 4 8 C 6 5, 10 3, 15 3"
const ICON_CIRCLE = "M20 4 C 31 3, 37 13, 34 22 C 31 32, 15 35, 8 28 C 1 21, 4 8, 14 5 C 18 4, 23 4, 26 6"

// A doodle of the day in the bottom margin, drawn once when the notes load.
const DOODLES = [
  { name: "rocket", d: "M30 6 C 40 14, 40 30, 34 40 L 26 40 C 20 30, 20 14, 30 6 Z M 26 34 L 18 44 L 26 41 M 34 34 L 42 44 L 34 41 M 30 18 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 27 44 L 30 52 L 33 44" },
  { name: "cat", d: "M14 46 C 10 30, 14 18, 18 12 L 22 20 C 27 18, 33 18, 38 20 L 42 12 C 46 18, 50 30, 46 46 C 38 52, 22 52, 14 46 Z M 24 32 l 0 2 M 36 32 l 0 2 M 28 39 C 29 41, 31 41, 32 39 M 10 36 L 20 37 M 10 41 L 20 40 M 50 36 L 40 37 M 50 41 L 40 40" },
  { name: "flower", d: "M30 50 C 30 42, 31 36, 30 28 M 30 42 C 22 40, 18 36, 16 32 C 22 32, 27 36, 30 42 M 30 22 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 30 17 C 26 6, 34 6, 30 17 M 35 22 C 46 18, 46 26, 35 22 M 30 27 C 34 38, 26 38, 30 27 M 25 22 C 14 26, 14 18, 25 22" },
  { name: "cup", d: "M14 22 L 42 22 L 39 46 C 38 50, 18 50, 17 46 Z M 42 27 C 52 27, 52 39, 40 39 M 22 16 C 20 12, 25 10, 23 5 M 30 16 C 28 12, 33 10, 31 5 M 10 52 L 46 52" },
  { name: "sun", d: "M30 30 m -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0 M 30 8 L 30 15 M 30 45 L 30 52 M 8 30 L 15 30 M 45 30 L 52 30 M 14 14 L 19 19 M 41 41 L 46 46 M 46 14 L 41 19 M 19 41 L 14 46" },
]

const Thumbtack = ({ pinned }) => (
  <svg className="lx-sketchbook-tack" viewBox="0 0 24 24" aria-hidden="true" data-pinned={pinned || undefined}>
    <ellipse className="lx-sketchbook-tack__shadow" cx="13.5" cy="21" rx="4.5" ry="1.3" />
    <path className="lx-sketchbook-tack__needle" d="M12 12.5 L12 21" />
    <path className="lx-sketchbook-tack__body" d="M8.6 4.6 L9.2 9.2 L6.4 12.4 L17.6 12.4 L14.8 9.2 L15.4 4.6 Z" />
    <ellipse className="lx-sketchbook-tack__cap" cx="12" cy="4.4" rx="4.6" ry="2.2" />
    <ellipse className="lx-sketchbook-tack__shine" cx="10.4" cy="3.9" rx="1.5" ry="0.7" />
  </svg>
)

const PenCircle = ({ className }) => (
  <svg className={className} viewBox="0 0 34 24" preserveAspectRatio="none" aria-hidden="true">
    <path d={PEN_CIRCLE} pathLength="1" />
  </svg>
)

const StickyNote = ({ category, index, isActive, count, hasNew, onSelect }) => {
  const Icon = category.icon
  return (
    <button
      type="button"
      className="lx-sketchbook-note"
      data-cat={category.id}
      data-active={isActive || undefined}
      style={{ "--lx-sketchbook-tilt": `${[-4, 3, -2, 4, -3][index % 5]}deg`, "--lx-sketchbook-c": `var(${category.colorVar})` }}
      onClick={() => onSelect(category.id)}
      aria-pressed={isActive}
      aria-label={`${category.name}${count ? `, ${count} pending` : ""}`}
      title={`${category.name} (Alt ${index + 1})`}
    >
      <span className="lx-sketchbook-note__tape" aria-hidden="true" />
      <span className="lx-sketchbook-note__icon lx-sketchbook-doodle" aria-hidden="true">
        <Icon size={18} strokeWidth={2.1} />
      </span>
      <span className="lx-sketchbook-note__label" aria-hidden="true">{category.name}</span>
      {count > 0 && (
        <span className="lx-sketchbook-note__count" aria-hidden="true">
          <PenCircle className="lx-sketchbook-pen-circle" />
          <span>{formatCount(count)}</span>
        </span>
      )}
      {hasNew && !count && <span className="lx-sketchbook-note__new" aria-hidden="true">★</span>}
    </button>
  )
}

const SketchbookSidebar = ({
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
  const listRef = useRef(null)
  const activeConfig = categories.find((category) => category.id === activeCategory) || categories[0]
  const today = new Date()
  const doodle = DOODLES[Math.floor(today.getTime() / 86400000) % DOODLES.length]
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Profile"

  // Keep the open tab in view when it changes.
  useEffect(() => {
    listRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView?.({ block: "nearest" })
  }, [pathname, activeCategory])

  // Turn the facing page on every route change.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const content = document.querySelector(".layout-content")
    if (!content) return
    content.classList.remove("lx-sketchbook-turn")
    void content.offsetWidth
    content.classList.add("lx-sketchbook-turn")
    const id = window.setTimeout(() => content.classList.remove("lx-sketchbook-turn"), 700)
    return () => window.clearTimeout(id)
  }, [pathname])

  // Alt+1…n flips between sticky notes.
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
    <aside className="lx-sketchbook" data-cat={activeConfig?.id} data-dark={isDark || undefined} aria-label="Main navigation">
      {/* Ink filters: three seeds of the same wobble, cycled to make lines "boil". */}
      <svg className="lx-sketchbook-defs" aria-hidden="true" focusable="false">
        <defs>
          {[3, 11, 27].map((seed, index) => (
            <filter key={seed} id={`lx-sketchbook-ink-${index}`} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed={seed} result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          ))}
          <filter id="lx-sketchbook-rough" x="-5%" y="-30%" width="110%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="lx-sketchbook-chalk" x="-5%" y="-30%" width="110%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="9" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.4 1.25" result="mask" />
            <feComposite in="SourceGraphic" in2="mask" operator="in" result="grainy" />
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="5" result="noise" />
            <feDisplacementMap in="grainy" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="lx-sketchbook-paper">
        <header className="lx-sketchbook-head">
          <button type="button" className="lx-sketchbook-brand" onClick={onHome} title="Home">
            <span className="lx-sketchbook-brand__word">SMS</span>
            <svg className="lx-sketchbook-brand__star lx-sketchbook-doodle" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.5 L14.6 9 L21.5 9.4 L16.1 13.7 L18 20.6 L12 16.8 L6 20.6 L7.9 13.7 L2.5 9.4 L9.4 9 Z" />
            </svg>
          </button>
          <span className="lx-sketchbook-date">
            <span className="lx-sketchbook-date__label">Date</span>
            <span className="lx-sketchbook-date__value">{DAY_FORMAT.format(today)}</span>
          </span>
          <div className="lx-sketchbook-mode">
            <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
          </div>
        </header>

        <nav className="lx-sketchbook-notes" aria-label="Categories">
          {categories.map((category, index) => (
            <StickyNote
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

        <section className="lx-sketchbook-page" style={{ "--lx-sketchbook-c": `var(${activeConfig?.colorVar || "--color-cat-home"})` }}>
          <h2 className="lx-sketchbook-title" key={activeConfig?.id}>
            <span className="lx-sketchbook-title__name">
              {activeConfig?.name}
              <svg className="lx-sketchbook-title__scribble" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                <path d={HEADING_SCRIBBLE} pathLength="1" />
              </svg>
            </span>
            <span className="lx-sketchbook-title__meta">
              {items.length} {items.length === 1 ? "page" : "pages"}
            </span>
          </h2>

          <ul ref={listRef} className="lx-sketchbook-lines" key={`list-${activeConfig?.id}`}>
            {items.length === 0 && (
              <li className="lx-sketchbook-empty">
                Nothing stuck here yet. Push a thumbtack into any tab and it lands on this page.
              </li>
            )}
            {items.map((item, index) => {
              const active = isItemActive(item)
              const pinned = isPinned(item)
              const locked = pinLocked(item)
              const Icon = item.icon
              const tag = item.badge && typeof item.badge === "object" ? item.badge : null
              const count = typeof item.badge === "number" ? item.badge : 0
              const label = labelFor(item) || item.name
              return (
                <li
                  key={item.path || item.name}
                  className="lx-sketchbook-row"
                  data-active={active || undefined}
                  data-pinned={(pinned && !locked) || undefined}
                  data-live={item.accent === "success" || undefined}
                  style={{ "--lx-sketchbook-i": index }}
                >
                  <button
                    type="button"
                    className="lx-sketchbook-row__go"
                    onClick={() => onNavigate(item)}
                    aria-current={active ? "page" : undefined}
                    title={label}
                  >
                    <span className="lx-sketchbook-row__margin" aria-hidden="true">
                      {Icon && (
                        <span className="lx-sketchbook-row__icon lx-sketchbook-doodle">
                          <Icon size={16} strokeWidth={2} />
                        </span>
                      )}
                      {active && (
                        <svg className="lx-sketchbook-row__ring" viewBox="0 0 40 36" aria-hidden="true">
                          <path d={ICON_CIRCLE} pathLength="1" />
                        </svg>
                      )}
                    </span>
                    <span className="lx-sketchbook-row__label">
                      {active && (
                        <svg className="lx-sketchbook-marker" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
                          <path className="lx-sketchbook-marker__swipe" d={MARKER_SWIPE} pathLength="1" />
                          <path className="lx-sketchbook-marker__line" d={MARKER_UNDERLINE} pathLength="1" />
                        </svg>
                      )}
                      <span className="lx-sketchbook-row__text">{label}</span>
                    </span>
                    {tag && (
                      <span className="lx-sketchbook-stamp" data-pulse={tag.pulse || undefined}>
                        {tag.label}
                      </span>
                    )}
                    {isNavItemNew(item) && <span className="lx-sketchbook-new">new!</span>}
                    {count > 0 && (
                      <span className="lx-sketchbook-count" aria-label={`${count} pending`}>
                        <PenCircle className="lx-sketchbook-pen-circle" />
                        <span>{formatCount(count)}</span>
                      </span>
                    )}
                  </button>
                  {!locked && (
                    <button
                      type="button"
                      className="lx-sketchbook-row__pin"
                      data-pinned={pinned || undefined}
                      onClick={() => onTogglePin(item)}
                      title={pinned ? "Pull the thumbtack (unpin from Home)" : "Pin to Home"}
                      aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
                      aria-pressed={pinned}
                    >
                      <Thumbtack pinned={pinned} />
                    </button>
                  )}
                </li>
              )
            })}
            <li className="lx-sketchbook-endnote" aria-hidden="true">
              <svg className="lx-sketchbook-endnote__doodle" viewBox="0 0 60 56" data-doodle={doodle.name}>
                <path d={doodle.d} pathLength="1" />
              </svg>
            </li>
          </ul>
        </section>

        <footer className="lx-sketchbook-foot">
          <button
            type="button"
            className="lx-sketchbook-nametag"
            data-active={isProfileActive || undefined}
            onClick={() => profileItem && onNavigate(profileItem)}
            title={user?.email ? `Profile · ${user.email}` : "Profile"}
            aria-current={isProfileActive ? "page" : undefined}
          >
            <span className="lx-sketchbook-nametag__band">
              <strong>HELLO</strong>
              <span>my name is</span>
            </span>
            <span className="lx-sketchbook-nametag__name">{firstName}</span>
          </button>
          <div className="lx-sketchbook-tools">
            <button
              type="button"
              className="lx-sketchbook-tool"
              onClick={onToggleTheme}
              title={isDark ? "Back to paper (light mode)" : "Chalkboard (dark mode)"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="lx-sketchbook-doodle">{isDark ? <Sun size={18} /> : <Moon size={18} />}</span>
            </button>
            {logoutItem && (
              <button
                type="button"
                className="lx-sketchbook-tool lx-sketchbook-tool--exit"
                onClick={() => onNavigate(logoutItem)}
                title="Log out"
                aria-label="Log out"
              >
                <span className="lx-sketchbook-doodle"><LogOut size={18} /></span>
              </button>
            )}
          </div>
        </footer>
      </div>

      <span className="lx-sketchbook-spiral" aria-hidden="true" />
    </aside>
  )
}

export default SketchbookSidebar
