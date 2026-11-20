import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { LogOut, Moon, Pin, Sun } from "lucide-react"
import { isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./blueprint.css"

/**
 * V17 "Blueprint": the admin shell as an architect's technical drawing.
 *
 * - Categories are section markers (A, B, C…); the open one swings its flag
 *   down towards the sheet's callouts.
 * - Tabs are numbered callouts on leader lines pointing at a hatched wall
 *   section. The open tab is dimensioned: a dimension line draws in beneath it
 *   and quotes the label's real width in millimetres.
 * - A CAD crosshair follows the pointer across the panel, reading out its
 *   position in mm and marking the ruler.
 * - The title block (project, sheet, drawn-by, date) holds profile, theme
 *   ("blueprint"/"whiteprint") and exit.
 * - The page is a sheet pinned to the drafting table; every route change is
 *   re-plotted by a pen carriage sweeping down it.
 */

const LETTERS = "ABCDEFGHIJ"
const PX_TO_MM = 25.4 / 96
const RULER_MARKS = Array.from({ length: 14 }, (_, index) => index)
const ZONE_COLUMNS = Array.from({ length: 8 }, (_, index) => index + 1)
const ZONE_ROWS = ["A", "B", "C", "D", "E", "F"]

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata" })

const formatCount = (count) => (count > 99 ? "99+" : String(count))
const pad2 = (value) => String(value).padStart(2, "0")

const isTypingTarget = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

const SectionMarker = ({ category, letter, index, isActive, count, hasNew, onSelect }) => {
  const Icon = category.icon
  return (
    <button
      type="button"
      className="lx-blueprint-marker"
      data-cat={category.id}
      data-active={isActive || undefined}
      onClick={() => onSelect(category.id)}
      aria-pressed={isActive}
      aria-label={`Section ${letter}: ${category.name}${count ? `, ${count} pending` : ""}`}
      title={`${category.name} (Alt ${index + 1})`}
    >
      <span className="lx-blueprint-marker__sym" aria-hidden="true">
        <svg className="lx-blueprint-marker__flag" viewBox="0 0 48 48">
          <path d="M24 4 L44 24 L24 44 Z" />
        </svg>
        <span className="lx-blueprint-marker__disc">
          <span className="lx-blueprint-marker__letter">{letter}</span>
          <span className="lx-blueprint-marker__icon">
            <Icon size={12} strokeWidth={2.25} />
          </span>
        </span>
        {count > 0 && <span className="lx-blueprint-marker__count">{formatCount(count)}</span>}
        {hasNew && !count && <span className="lx-blueprint-marker__new" />}
      </span>
      <span className="lx-blueprint-marker__name" aria-hidden="true">
        {category.name}
      </span>
    </button>
  )
}

const DeltaCount = ({ count }) => (
  <span className="lx-blueprint-count" title={`${count} pending`}>
    <svg viewBox="0 0 10 9" aria-hidden="true">
      <path d="M5 0.8 L9.2 8.2 L0.8 8.2 Z" />
    </svg>
    {formatCount(count)}
  </span>
)

const NorthArrow = () => (
  <svg className="lx-blueprint-north" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="17" className="lx-blueprint-north__ring" />
    <circle cx="20" cy="20" r="12.5" className="lx-blueprint-north__ring lx-blueprint-north__ring--thin" />
    <g className="lx-blueprint-north__needle">
      <path d="M20 5 L25 22 L20 19 Z" className="lx-blueprint-north__solid" />
      <path d="M20 5 L15 22 L20 19 Z" className="lx-blueprint-north__hollow" />
      <text x="20" y="33" textAnchor="middle">N</text>
    </g>
  </svg>
)

const BlueprintSidebar = ({
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
  const [today] = useState(() => DATE_FORMAT.format(new Date()).replace(/\//g, "."))
  const [measure, setMeasure] = useState(null)
  const asideRef = useRef(null)
  const readoutRef = useRef(null)
  const activeLabelRef = useRef(null)
  const crossFrame = useRef(0)
  const pointerInside = useRef(false)

  const activeIndexInCats = Math.max(0, categories.findIndex((category) => category.id === activeCategory))
  const activeConfig = categories[activeIndexInCats]
  const sectionLetter = LETTERS[activeIndexInCats] || "?"
  const activeIndex = items.findIndex((item) => isItemActive(item))
  const totalPending = categories.reduce((sum, category) => sum + (categoryCounts?.[category.id] || 0), 0)
  const sheetNo = `${sectionLetter}-${activeIndex >= 0 ? pad2(activeIndex + 1) : "00"}`

  // Dimension the open tab: measure its label once it is on the sheet.
  useLayoutEffect(() => {
    const label = activeLabelRef.current
    if (!label) {
      setMeasure(null)
      return
    }
    setMeasure(Math.max(1, Math.round(label.offsetWidth * PX_TO_MM)))
    label.closest("li")?.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, activeCategory, items.length])

  // CAD crosshair: written straight to style in a frame, never re-rendering.
  const moveCross = useCallback((event) => {
    if (event.pointerType !== "mouse") return
    const { clientX, clientY } = event
    pointerInside.current = true
    cancelAnimationFrame(crossFrame.current)
    crossFrame.current = requestAnimationFrame(() => {
      const aside = asideRef.current
      if (!aside || !pointerInside.current) return
      const rect = aside.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      aside.style.setProperty("--lx-bp-cx", `${x}px`)
      aside.style.setProperty("--lx-bp-cy", `${y}px`)
      aside.dataset.cross = "on"
      if (readoutRef.current) {
        readoutRef.current.textContent = `X ${(x * PX_TO_MM).toFixed(1)}  Y ${(y * PX_TO_MM).toFixed(1)}`
      }
    })
  }, [])
  const hideCross = useCallback(() => {
    pointerInside.current = false
    cancelAnimationFrame(crossFrame.current)
    if (asideRef.current) delete asideRef.current.dataset.cross
  }, [])
  useEffect(() => () => cancelAnimationFrame(crossFrame.current), [])

  // Alt+1…n jumps between sections.
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

  const drawnBy = user?.name || "Profile"

  return (
    <>
      <aside
        ref={asideRef}
        className="lx-blueprint"
        aria-label="Main navigation"
        data-cat={activeConfig?.id}
        onPointerMove={moveCross}
        onPointerLeave={hideCross}
      >
        <div className="lx-blueprint-ruler" aria-hidden="true">
          {RULER_MARKS.map((mark) => (
            <span key={mark} className="lx-blueprint-ruler__num" style={{ top: `${mark * 100}px` }}>
              {mark * 100}
            </span>
          ))}
          <span className="lx-blueprint-ruler__mark" />
        </div>

        <div className="lx-blueprint-cross" aria-hidden="true">
          <span className="lx-blueprint-cross__h" />
          <span className="lx-blueprint-cross__v" />
          <span className="lx-blueprint-cross__readout" ref={readoutRef} />
        </div>

        <header className="lx-blueprint-head">
          <button type="button" className="lx-blueprint-brand" onClick={onHome} title="Home">
            <span className="lx-blueprint-brand__compass" style={{ "--lx-bp-heading": `${activeIndexInCats * -72}deg` }}>
              <NorthArrow />
            </span>
            <span className="lx-blueprint-brand__text">
              <span className="lx-blueprint-brand__word">SMS</span>
              <span className="lx-blueprint-brand__dwg">DWG ADM-17 · Rev C</span>
            </span>
          </button>
          <div className="lx-blueprint-mode">
            <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
          </div>
        </header>

        <nav className="lx-blueprint-markers" aria-label="Sections">
          {categories.map((category, index) => (
            <SectionMarker
              key={category.id}
              category={category}
              letter={LETTERS[index]}
              index={index}
              isActive={category.id === activeCategory}
              count={categoryCounts?.[category.id] || 0}
              hasNew={Boolean(newCategoryIds?.has(category.id))}
              onSelect={onCategoryChange}
            />
          ))}
        </nav>

        <div className="lx-blueprint-section" key={`title-${activeCategory}`}>
          <div className="lx-blueprint-section__title">
            <span className="lx-blueprint-section__cut">
              {sectionLetter}–{sectionLetter}
            </span>
            <h2 className="lx-blueprint-section__name">{activeConfig?.name}</h2>
          </div>
          <div className="lx-blueprint-section__dim" aria-hidden="true">
            <span className="lx-blueprint-tick" />
            <span className="lx-blueprint-section__line" />
            <span className="lx-blueprint-section__val">
              {items.length} {items.length === 1 ? "callout" : "callouts"}
            </span>
            <span className="lx-blueprint-section__line" />
            <span className="lx-blueprint-tick" />
          </div>
        </div>

        <div className="lx-blueprint-sheet">
          <span className="lx-blueprint-hatch" aria-hidden="true" />
          <ul className="lx-blueprint-callouts" key={`list-${activeCategory}`}>
            {items.length === 0 && (
              <li className="lx-blueprint-empty">
                Nothing drawn on this sheet yet. Pin tabs from other sections to see them here.
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
                  className="lx-blueprint-row"
                  data-active={active || undefined}
                  data-live={item.accent === "success" || undefined}
                  data-pinned={pinned || undefined}
                  style={{ "--lx-bp-i": index }}
                >
                  <button
                    type="button"
                    className="lx-blueprint-row__go"
                    onClick={() => onNavigate(item)}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="lx-blueprint-row__leader" aria-hidden="true" />
                    <span className="lx-blueprint-row__bubble" aria-hidden="true">
                      {pad2(index + 1)}
                    </span>
                    {Icon && <Icon className="lx-blueprint-row__icon" size={15} strokeWidth={2} aria-hidden="true" />}
                    <span className="lx-blueprint-row__labelwrap">
                      <span className="lx-blueprint-row__label" ref={active ? activeLabelRef : undefined}>
                        {label}
                      </span>
                      {active && measure !== null && (
                        <span className="lx-blueprint-row__dim" aria-hidden="true">
                          <span className="lx-blueprint-tick" />
                          <span className="lx-blueprint-row__dimline" />
                          <span className="lx-blueprint-row__dimval">{measure} mm</span>
                          <span className="lx-blueprint-row__dimline" />
                          <span className="lx-blueprint-tick" />
                        </span>
                      )}
                    </span>
                    <span className="lx-blueprint-row__ext" aria-hidden="true" />
                    {tag && (
                      <span className="lx-blueprint-tag" data-pulse={tag.pulse || undefined}>
                        {tag.label}
                      </span>
                    )}
                    {count > 0 && <DeltaCount count={count} />}
                    {isNavItemNew(item) && <span className="lx-blueprint-new">New</span>}
                  </button>
                  {!locked && (
                    <button
                      type="button"
                      className="lx-blueprint-row__pin"
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
        </div>

        <footer className="lx-blueprint-titleblock" aria-label="Title block">
          <div className="lx-blueprint-cell lx-blueprint-cell--project">
            <span className="lx-blueprint-cell__k">Project</span>
            <span className="lx-blueprint-cell__v lx-blueprint-cell__v--big">SMS</span>
          </div>
          <div className="lx-blueprint-cell lx-blueprint-cell--sheet">
            <span className="lx-blueprint-cell__k">Sheet</span>
            <span className="lx-blueprint-cell__v lx-blueprint-cell__v--big">{sheetNo}</span>
          </div>
          <button
            type="button"
            className="lx-blueprint-cell lx-blueprint-cell--drawn"
            data-active={isProfileActive || undefined}
            onClick={() => profileItem && onNavigate(profileItem)}
            title="Profile"
            aria-current={isProfileActive ? "page" : undefined}
          >
            <span className="lx-blueprint-cell__k">Drawn by</span>
            <span className="lx-blueprint-cell__v lx-blueprint-cell__v--sign">{drawnBy}</span>
          </button>
          <div className="lx-blueprint-cell lx-blueprint-cell--date">
            <span className="lx-blueprint-cell__k">Date</span>
            <span className="lx-blueprint-cell__v">{today}</span>
          </div>
          <button
            type="button"
            className="lx-blueprint-cell lx-blueprint-cell--print"
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="lx-blueprint-cell__k">Print</span>
            <span className="lx-blueprint-cell__v">
              {isDark ? <Sun size={13} aria-hidden="true" /> : <Moon size={13} aria-hidden="true" />}
              {isDark ? "Blue" : "White"}
            </span>
          </button>
          <div className="lx-blueprint-cell lx-blueprint-cell--rev" title={`${totalPending} pending across all sections`}>
            <span className="lx-blueprint-cell__k">Revs</span>
            <span className="lx-blueprint-cell__v" data-hot={totalPending > 0 || undefined}>
              {totalPending > 0 ? `Δ ${formatCount(totalPending)}` : "None"}
            </span>
          </div>
          {logoutItem && (
            <button
              type="button"
              className="lx-blueprint-cell lx-blueprint-cell--exit"
              onClick={() => onNavigate(logoutItem)}
              title="Log out"
              aria-label="Log out"
            >
              <span className="lx-blueprint-cell__k">Exit</span>
              <span className="lx-blueprint-cell__v">
                <LogOut size={13} aria-hidden="true" />
              </span>
            </button>
          )}
        </footer>
      </aside>

      {/* The drafting table: zone marks round the sheet, four pins, and the plotter. */}
      <div className="lx-blueprint-table" aria-hidden="true">
        <div className="lx-blueprint-zones lx-blueprint-zones--top">
          {ZONE_COLUMNS.map((zone) => (
            <span key={zone}>{zone}</span>
          ))}
        </div>
        <div className="lx-blueprint-zones lx-blueprint-zones--side">
          {ZONE_ROWS.map((zone) => (
            <span key={zone}>{zone}</span>
          ))}
        </div>
        <span className="lx-blueprint-pin lx-blueprint-pin--tl" />
        <span className="lx-blueprint-pin lx-blueprint-pin--tr" />
        <span className="lx-blueprint-pin lx-blueprint-pin--bl" />
        <span className="lx-blueprint-pin lx-blueprint-pin--br" />
        <div className="lx-blueprint-plot" key={pathname}>
          <span className="lx-blueprint-plot__bar" />
        </div>
      </div>
    </>
  )
}

export default BlueprintSidebar
