import { useEffect, useRef, useState } from "react"
import { LogOut, Moon, Pin, Sun } from "lucide-react"
import { isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./terminal.css"

/**
 * Lab V9 "Terminal": the admin shell as a phosphor CRT in a chunky monitor case.
 *
 * - Categories are directories (`ls --color /`); each glows in its own phosphor.
 *   Picking one types `cd ~/<dir> && ls` and prints its tabs line by line.
 * - The open tab is inverse video with a blinking block cursor.
 * - The clock is a `date` prompt; profile is `whoami`, log out is `exit`.
 * - The case has a power LED, a disk LED that flickers on every navigation, and
 *   a PHOSPHOR / PAPER rocker for the theme (paper = amber-on-cream e-ink).
 * - A one-time BIOS boot per session. Alt+1…5 switches directory.
 * - The page sits in the case's second bezel (terminal.css).
 */

const DATE_FMT = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
const TIME_FMT = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Kolkata" })
const BOOT_KEY = "lx-terminal-booted"

const BOOT_LINES = [
  "HMS BIOS v9.0  (C) 1986",
  "CPU : HMS-6502 1MHz ..... OK",
  "MEM : 640K + 64K mess ... OK",
  "DISK: /hostels /dining .. OK",
  "TTY1: phosphor warm ..... OK",
  "",
  "login: admin",
  "Welcome. Have a nice shift.",
]

const TIPS = [
  "# tip: Alt+1..5 switches dirs",
  "# tip: pin a tab to keep it in ~",
  "# tip: try the rocker switch below",
  "# fortune: no place like ~",
  "# tip: exit logs you out. bye!",
]

const formatCount = (count) => (count > 99 ? "99+" : String(count))

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const isTypingTarget = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

const readBooted = () => {
  try {
    return window.sessionStorage.getItem(BOOT_KEY) === "1"
  } catch {
    return true
  }
}

const dirOf = (categoryId) => (categoryId === "home" ? "~" : `~/${categoryId}`)

/** Re-renders on its own so the rest of the shell stays still. */
const Clock = () => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setNow(new Date())
    }, 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className="lx-terminal-out" aria-label="Time in India">
      {DATE_FMT.format(now).replace(/,/g, "")} {TIME_FMT.format(now)} IST
    </span>
  )
}

/** A command that types itself out, one character per step. */
const Typed = ({ text, delay = 0 }) => (
  <span
    className="lx-terminal-typed"
    style={{
      "--n": text.length,
      animationTimingFunction: `steps(${text.length}, end)`,
      animationDuration: `${Math.min(700, 26 * text.length)}ms`,
      animationDelay: `${delay}ms`,
    }}
  >
    {text}
  </span>
)

const Boot = () => (
  <div className="lx-terminal-boot" aria-hidden="true">
    {BOOT_LINES.map((line, index) => (
      <div key={index} className="lx-terminal-boot__line" style={{ "--i": index }}>
        {line || " "}
      </div>
    ))}
  </div>
)

const TerminalSidebar = ({
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
  const [booting, setBooting] = useState(() => !readBooted() && !prefersReducedMotion())
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])
  const screenRef = useRef(null)
  const listRef = useRef(null)
  const mountedAt = useRef(0)

  const uname = (user?.name?.split(" ")[0] || "admin").toLowerCase().replace(/[^a-z0-9]/g, "") || "admin"
  const cwd = dirOf(activeCategory)
  const activeIndex = items.findIndex((item) => isItemActive(item))

  // One BIOS screen per session.
  useEffect(() => {
    if (!booting) return
    const id = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(BOOT_KEY, "1")
      } catch {
        // Private window: it just boots again next time.
      }
      setBooting(false)
    }, 1900)
    return () => window.clearTimeout(id)
  }, [booting])

  useEffect(() => {
    mountedAt.current = performance.now()
  }, [])

  // Degauss wobble when the directory changes (not while the shell settles in).
  useEffect(() => {
    if (!mountedAt.current || performance.now() - mountedAt.current < 1200) return
    const screen = screenRef.current
    if (!screen || prefersReducedMotion()) return
    screen.classList.remove("is-degauss")
    void screen.offsetWidth
    screen.classList.add("is-degauss")
  }, [activeCategory])

  // Keep the open tab on screen.
  useEffect(() => {
    listRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, activeCategory])

  // A quick refresh flash on the page for every route.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const content = document.querySelector(".layout-content")
    if (!content) return
    content.classList.remove("lx-terminal-refresh")
    void content.offsetWidth
    content.classList.add("lx-terminal-refresh")
    const id = window.setTimeout(() => content.classList.remove("lx-terminal-refresh"), 500)
    return () => window.clearTimeout(id)
  }, [pathname])

  // Alt+1…n switches directory.
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

  const command = activeCategory === "home" ? "cd ~ && ls" : `cd ${activeCategory} && ls`

  return (
    <aside className="lx-terminal" data-cat={activeCategory} aria-label="Main navigation">
      <div className="lx-terminal-case-top">
        <button type="button" className="lx-terminal-badge" onClick={onHome} title="Home">
          <span className="lx-terminal-badge__mark" aria-hidden="true" />
          <span>
            HMS<span className="lx-terminal-badge__model">-9000</span>
          </span>
        </button>
        <div className="lx-terminal-mode">
          <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
        </div>
      </div>

      <div className="lx-terminal-screen" ref={screenRef}>
        <div className="lx-terminal-glass">
          <header className="lx-terminal-head">
            <div className="lx-terminal-line lx-terminal-dim">HMS-OS 9.0 · tty1 · 80x24</div>
            <div className="lx-terminal-line">
              <span className="lx-terminal-ps1">{uname}@hms:~$</span> date
            </div>
            <div className="lx-terminal-line">
              <Clock />
            </div>
          </header>

          <nav className="lx-terminal-block" aria-label="Categories">
            <div className="lx-terminal-line">
              <span className="lx-terminal-ps1">~$</span> ls --color /
            </div>
            <ul className="lx-terminal-dirs">
              {categories.map((category, index) => {
                const count = categoryCounts?.[category.id] || 0
                const hasNew = Boolean(newCategoryIds?.has(category.id))
                const active = category.id === activeCategory
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      className="lx-terminal-dir"
                      data-cat={category.id}
                      data-active={active || undefined}
                      aria-pressed={active}
                      title={`${category.name} (Alt+${index + 1})`}
                      aria-label={`${category.name}${count ? `, ${count} pending` : ""}${hasNew ? ", new" : ""}`}
                      onClick={() => onCategoryChange(category.id)}
                    >
                      <span className="lx-terminal-dir__perm" aria-hidden="true">drwx</span>
                      <span className="lx-terminal-dir__name" aria-hidden="true">{category.id}/</span>
                      {hasNew && <span className="lx-terminal-dir__new" aria-hidden="true">*</span>}
                      {count > 0 && <span className="lx-terminal-dir__count" aria-hidden="true">{formatCount(count)}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <section className="lx-terminal-files" aria-label={`${categories.find((c) => c.id === activeCategory)?.name || ""} tabs`}>
            <div className="lx-terminal-line lx-terminal-cmd" key={activeCategory}>
              <span className="lx-terminal-ps1">~$</span> <Typed text={command} />
            </div>
            <ul className="lx-terminal-list" ref={listRef} key={`list-${activeCategory}`}>
              {items.length === 0 && (
                <li className="lx-terminal-line lx-terminal-dim lx-terminal-empty">ls: ~ is empty. Pin tabs from other dirs to keep them here.</li>
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
                    className="lx-terminal-row"
                    data-active={active || undefined}
                    data-live={item.accent === "success" || undefined}
                    style={{ "--i": index }}
                  >
                    <button
                      type="button"
                      className="lx-terminal-go"
                      onClick={() => onNavigate(item)}
                      aria-current={active ? "page" : undefined}
                      title={label}
                    >
                      <span className="lx-terminal-go__mark" aria-hidden="true">{active ? ">" : "-"}</span>
                      {Icon && <Icon className="lx-terminal-go__icon" size={14} strokeWidth={2} aria-hidden="true" />}
                      <span className="lx-terminal-go__name">
                        {label}
                        {active && <span className="lx-terminal-cursor" aria-hidden="true" />}
                      </span>
                      {tag && (
                        <span className="lx-terminal-tag" data-pulse={tag.pulse || undefined}>
                          {tag.label}
                        </span>
                      )}
                      {count > 0 && <span className="lx-terminal-count">[{formatCount(count)}]</span>}
                      {isNavItemNew(item) && <span className="lx-terminal-new">NEW</span>}
                    </button>
                    {!locked && (
                      <button
                        type="button"
                        className="lx-terminal-pin"
                        data-pinned={pinned || undefined}
                        onClick={() => onTogglePin(item)}
                        title={pinned ? "Unpin from ~ (Home)" : "Pin to ~ (Home)"}
                        aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
                        aria-pressed={pinned}
                      >
                        <Pin size={12} strokeWidth={2.25} />
                      </button>
                    )}
                  </li>
                )
              })}
              <li className="lx-terminal-line lx-terminal-idle" aria-hidden="true" style={{ "--i": items.length }}>
                <span className="lx-terminal-ps1">{cwd}$</span> <span className="lx-terminal-cursor lx-terminal-cursor--idle" />
              </li>
            </ul>
          </section>

          <footer className="lx-terminal-foot">
            <div className="lx-terminal-line lx-terminal-dim lx-terminal-tip">{tip}</div>
            <div className="lx-terminal-foot__row">
              <button
                type="button"
                className="lx-terminal-cmdbtn lx-terminal-whoami"
                data-active={isProfileActive || undefined}
                aria-current={isProfileActive ? "page" : undefined}
                onClick={() => profileItem && onNavigate(profileItem)}
                title="Profile"
              >
                <span className="lx-terminal-dim">$ whoami</span>
                <span className="lx-terminal-whoami__name">{user?.name || "Profile"}</span>
              </button>
              {logoutItem && (
                <button type="button" className="lx-terminal-cmdbtn lx-terminal-exit" onClick={() => onNavigate(logoutItem)} title="Log out">
                  <LogOut size={13} strokeWidth={2.25} aria-hidden="true" />
                  exit
                </button>
              )}
            </div>
          </footer>
        </div>
        {booting && <Boot />}
      </div>

      <div className="lx-terminal-case-bottom">
        <span className="lx-terminal-leds" aria-hidden="true">
          <span className="lx-terminal-led lx-terminal-led--power" />
          <span key={pathname} className="lx-terminal-led lx-terminal-led--disk" />
        </span>
        <span className="lx-terminal-vents" aria-hidden="true" />
        <button
          type="button"
          className="lx-terminal-rocker"
          onClick={onToggleTheme}
          data-dark={isDark || undefined}
          title={isDark ? "Switch to light mode (paper)" : "Switch to dark mode (phosphor)"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="lx-terminal-rocker__side" data-on={!isDark || undefined}>
            <Sun size={11} strokeWidth={2.5} aria-hidden="true" />
            paper
          </span>
          <span className="lx-terminal-rocker__side" data-on={isDark || undefined}>
            <Moon size={11} strokeWidth={2.5} aria-hidden="true" />
            phosphor
          </span>
        </button>
      </div>
    </aside>
  )
}

export default TerminalSidebar
