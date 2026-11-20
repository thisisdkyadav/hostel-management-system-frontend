import { useEffect, useState } from "react"
import { LogOut, Moon, Pin, Sun } from "lucide-react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import { isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./jukebox.css"

/**
 * Lab v13 "Jukebox": the admin shell as a diner record player.
 *
 * - The active category is a 45 spinning on the turntable, its label in the
 *   category colour. Picking another sleeve lifts the tone arm, flings the old
 *   record off and drops the new one on.
 * - Categories sit in a rack of record sleeves (the playing one is empty: its
 *   record is on the deck). Alt+1…5 picks a sleeve.
 * - Tabs are the side's track list (A1, A2 … with made-up running times);
 *   the open tab shows a bouncing equalizer.
 * - Light is a walnut-and-chrome diner box; dark is the night-club version.
 * No audio, ever.
 */

const SIDES = "ABCDEFGHIJ"

const formatCount = (count) => (count > 99 ? "99+" : String(count))

/** A stable, plausible running time (2:05–4:59) for a track name. */
const trackSeconds = (name = "") => {
  let hash = 7
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 100003
  return 125 + (hash % 175)
}
const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

const shortName = (name) => {
  const words = name.split(" ")
  return words.length > 1 ? words[words.length - 1] : name
}

const isTypingTarget = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

const Record = ({ category, phase }) => {
  const Icon = category.icon
  const ringId = `lx-jukebox-ring-${category.id}-${phase}`
  return (
    <div className="lx-jukebox-record" data-phase={phase} style={{ "--lx-jukebox-c": `var(${category.colorVar})` }} aria-hidden="true">
      <div className="lx-jukebox-disc">
        <div className="lx-jukebox-label">
          <svg className="lx-jukebox-label__ring" viewBox="0 0 100 100">
            <defs>
              <path id={ringId} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
            </defs>
            <text>
              <textPath href={`#${ringId}`}>SMS RECORDS · {category.name.toUpperCase()} · 33⅓ RPM ·</textPath>
            </text>
          </svg>
          <Icon className="lx-jukebox-label__icon" size={20} strokeWidth={2.25} />
          <span className="lx-jukebox-label__hole" />
        </div>
      </div>
    </div>
  )
}

const ToneArm = ({ lifted }) => (
  <div className="lx-jukebox-arm" data-lifted={lifted || undefined} aria-hidden="true">
    <svg viewBox="0 0 40 130" className="lx-jukebox-arm__svg">
      <circle className="lx-jukebox-arm__base" cx="20" cy="14" r="13" />
      <circle className="lx-jukebox-arm__cap" cx="20" cy="14" r="6" />
      <path className="lx-jukebox-arm__tube" d="M20 14 L20 92 Q20 104 13 110" />
      <rect className="lx-jukebox-arm__head" x="4" y="106" width="15" height="20" rx="3" transform="rotate(28 11 116)" />
    </svg>
  </div>
)

const Sleeve = ({ category, index, isActive, count, hasNew, onSelect }) => {
  const Icon = category.icon
  return (
    <button
      type="button"
      className="lx-jukebox-sleeve"
      data-active={isActive || undefined}
      style={{ "--lx-jukebox-c": `var(${category.colorVar})` }}
      onClick={() => onSelect(category.id)}
      aria-pressed={isActive}
      aria-label={`${category.name}${count ? `, ${count} pending` : ""}`}
      title={`${category.name} (Alt ${index + 1})`}
    >
      <span className="lx-jukebox-sleeve__jacket" aria-hidden="true">
        <span className="lx-jukebox-sleeve__peek" />
        <span className="lx-jukebox-sleeve__face">
          <Icon size={17} strokeWidth={2.25} />
        </span>
        <span className="lx-jukebox-sleeve__key">{SIDES[index]}</span>
      </span>
      <span className="lx-jukebox-sleeve__name" aria-hidden="true">{shortName(category.name)}</span>
      {count > 0 && <span className="lx-jukebox-sleeve__count" aria-hidden="true">{formatCount(count)}</span>}
      {hasNew && !count && <span className="lx-jukebox-sleeve__new" aria-hidden="true" />}
    </button>
  )
}

const Equalizer = () => (
  <span className="lx-jukebox-eq" aria-hidden="true">
    <i />
    <i />
    <i />
    <i />
  </span>
)

const JukeboxSidebar = ({
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
  const activeIndex = Math.max(0, categories.findIndex((category) => category.id === activeCategory))
  const activeConfig = categories[activeIndex]
  const side = SIDES[activeIndex]

  // Record swap: remember what was playing so it can fly off while the new one drops.
  const [playing, setPlaying] = useState(activeCategory)
  const [leaving, setLeaving] = useState(null)
  if (playing !== activeCategory) {
    setLeaving(playing)
    setPlaying(activeCategory)
  }
  useEffect(() => {
    if (!leaving) return
    const id = window.setTimeout(() => setLeaving(null), 650)
    return () => window.clearTimeout(id)
  }, [leaving])

  const leavingConfig = leaving ? categories.find((category) => category.id === leaving) : null

  // Alt+1…n picks a sleeve.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return
      if (!/^Digit[1-9]$/.test(event.code)) return
      const category = categories[Number(event.code.slice(5)) - 1]
      if (category) {
        event.preventDefault()
        onCategoryChange(category.id)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [categories, onCategoryChange])

  const totalSeconds = items.reduce((sum, item) => sum + trackSeconds(item.name), 0)
  const sidePending = items.reduce((sum, item) => sum + (typeof item.badge === "number" ? item.badge : 0), 0)

  return (
    <aside className="lx-jukebox" aria-label="Main navigation" data-dark={isDark || undefined}>
      <div className="lx-jukebox-cab">
        <header className="lx-jukebox-head">
          <button type="button" className="lx-jukebox-brand" onClick={onHome} title="Home">
            <span className="lx-jukebox-brand__badge">SMS</span>
            <span className="lx-jukebox-brand__word">Jukebox</span>
          </button>
          <div className="lx-jukebox-mode">
            <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
          </div>
        </header>
        <div className="lx-jukebox-bulbs" aria-hidden="true" />

        <section className="lx-jukebox-deck" aria-label={`Now playing: ${activeConfig?.name}`}>
          <div className="lx-jukebox-platter">
            {leavingConfig && <Record key={`out-${leavingConfig.id}`} category={leavingConfig} phase="out" />}
            {activeConfig && <Record key={`in-${activeConfig.id}`} category={activeConfig} phase="in" />}
            <span className="lx-jukebox-spindle" aria-hidden="true" />
          </div>
          <ToneArm lifted={Boolean(leaving)} />
          <div className="lx-jukebox-panel" aria-hidden="true">
            <span className="lx-jukebox-led" data-on={!leaving || undefined} />
            <span className="lx-jukebox-speed">
              <b>33</b>
              <span>45</span>
            </span>
          </div>
        </section>

        <nav className="lx-jukebox-rack" aria-label="Categories">
          {categories.map((category, index) => (
            <Sleeve
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

        <section className="lx-jukebox-notes" style={{ "--lx-jukebox-c": `var(${activeConfig?.colorVar || "--color-cat-home"})` }}>
          <div className="lx-jukebox-side" key={activeCategory}>
            <span className="lx-jukebox-side__tag">Side {side}</span>
            <span className="lx-jukebox-side__name">{activeConfig?.name}</span>
            <span className="lx-jukebox-side__meta">
              {items.length} {items.length === 1 ? "track" : "tracks"} · {formatTime(totalSeconds)}
              {sidePending > 0 && <> · {formatCount(sidePending)} requests</>}
            </span>
          </div>

          <ol className="lx-jukebox-tracks" key={`list-${activeCategory}`}>
            {items.length === 0 && (
              <li className="lx-jukebox-empty">This side is blank. Pin tabs from other records to press them here.</li>
            )}
            {items.map((item, index) => {
              const active = isItemActive(item)
              const pinned = isPinned(item)
              const locked = pinLocked(item)
              const tag = item.badge && typeof item.badge === "object" ? item.badge : null
              const count = typeof item.badge === "number" ? item.badge : 0
              const label = labelFor(item) || item.name
              return (
                <li
                  key={item.path || item.name}
                  className="lx-jukebox-track"
                  data-active={active || undefined}
                  data-live={item.accent === "success" || undefined}
                  style={{ "--i": index }}
                >
                  <button type="button" className="lx-jukebox-track__go" onClick={() => onNavigate(item)} aria-current={active ? "page" : undefined}>
                    <span className="lx-jukebox-track__no">
                      {active ? <Equalizer /> : `${side}${index + 1}`}
                    </span>
                    <span className="lx-jukebox-track__name">{label}</span>
                    {tag && (
                      <span className="lx-jukebox-track__tag" data-pulse={tag.pulse || undefined}>
                        {tag.label}
                      </span>
                    )}
                    {isNavItemNew(item) && <span className="lx-jukebox-track__new">New</span>}
                    {count > 0 && (
                      <span className="lx-jukebox-track__count" title={`${count} pending`}>
                        {formatCount(count)}
                      </span>
                    )}
                    <span className="lx-jukebox-track__time" aria-hidden="true">{formatTime(trackSeconds(item.name))}</span>
                  </button>
                  {!locked && (
                    <button
                      type="button"
                      className="lx-jukebox-track__pin"
                      data-pinned={pinned || undefined}
                      onClick={() => onTogglePin(item)}
                      title={pinned ? "Unpin from Home" : "Pin to Home"}
                      aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
                    >
                      <Pin size={12} strokeWidth={2.4} />
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <footer className="lx-jukebox-foot">
          <button
            type="button"
            className="lx-jukebox-dj"
            data-active={isProfileActive || undefined}
            onClick={() => profileItem && onNavigate(profileItem)}
            title="Profile"
          >
            <span className="lx-jukebox-dj__avatar" aria-hidden="true">
              {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
            </span>
            <span className="lx-jukebox-dj__text">
              <span className="lx-jukebox-dj__kicker">Tonight's DJ</span>
              <span className="lx-jukebox-dj__name">{user?.name || "Profile"}</span>
            </span>
          </button>
          <button
            type="button"
            className="lx-jukebox-knob"
            onClick={onToggleTheme}
            title={isDark ? "Lights up (light mode)" : "Club night (dark mode)"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {logoutItem && (
            <button type="button" className="lx-jukebox-knob lx-jukebox-knob--exit" onClick={() => onNavigate(logoutItem)} title="Log out" aria-label="Log out">
              <LogOut size={16} />
            </button>
          )}
        </footer>
      </div>
    </aside>
  )
}

export default JukeboxSidebar
