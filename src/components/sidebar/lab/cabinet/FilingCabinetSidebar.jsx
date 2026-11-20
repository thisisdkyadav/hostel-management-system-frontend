import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { LampDesk, LogOut } from "lucide-react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import { ADMIN_NAV_CATEGORY_HOME, ADMIN_NAV_CATEGORY_HOSTELS, isNavItemNew } from "../../../../constants/navigationConfig"
import SidebarModeSwitcher from "../../SidebarModeSwitcher"
import "./cabinet.css"

/**
 * Lab V18 "Filing Cabinet": the admin shell as a records-office desk.
 *
 * - Categories are steel drawers with colour label cards. The open drawer
 *   slides out (its well appears above the drawer front, as if pulled toward
 *   you) and shows the category's tabs as manila folders with staggered tabs.
 * - The open tab's folder pops up out of the stack.
 * - Pending counts are sticky notes held on with paper clips; pinning a tab
 *   clips a coloured paper clip to its folder.
 * - The page is a sheet of paper on the desk. At night the cabinet turns to
 *   dark steel under a desk lamp. Alt+1…5 opens a drawer.
 */

const STAMP_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "2-digit", timeZone: "Asia/Kolkata" })

const formatCount = (count) => (count > 99 ? "99+" : String(count))

const useToday = () => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000)
    return () => window.clearInterval(id)
  }, [])
  return STAMP_FORMAT.format(now).toUpperCase()
}

/** A classic two-loop paper clip, drawn in currentColor. */
const PaperClip = ({ className }) => (
  <svg className={className} viewBox="0 0 14 32" aria-hidden="true" focusable="false">
    <path d="M5 9v13a2.5 2.5 0 0 0 5 0V6.5a4 4 0 0 0-8 0V23a5 5 0 0 0 10 0V10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const Note = ({ count, small }) => (
  <span className={`lx-cabinet-note${small ? " lx-cabinet-note--sm" : ""}`} aria-hidden="true">
    <PaperClip className="lx-cabinet-note__clip" />
    {formatCount(count)}
  </span>
)

const DrawerFront = ({ category, index, isOpen, isClosing, count, files, hasNew, onSelect }) => {
  const Icon = category.icon
  return (
    <button
      type="button"
      className="lx-cabinet-front"
      data-closing={isClosing || undefined}
      onClick={() => onSelect(category.id)}
      aria-expanded={isOpen}
      aria-label={`${category.name} drawer${count ? `, ${count} pending` : ""}${hasNew ? ", has new tabs" : ""}`}
      title={`${category.name}: ${files} ${files === 1 ? "file" : "files"} (Alt ${index + 1})`}
    >
      <span className="lx-cabinet-front__no" aria-hidden="true">{index + 1}</span>
      <span className="lx-cabinet-holder" aria-hidden="true">
        <span className="lx-cabinet-card">
          {Icon && <Icon size={14} strokeWidth={2.25} />}
          <span className="lx-cabinet-card__name">{category.name}</span>
        </span>
      </span>
      <span className="lx-cabinet-handle" aria-hidden="true" />
      {count > 0 && <Note count={count} />}
      {hasNew && !count && <span className="lx-cabinet-stamp-new" aria-hidden="true">New</span>}
    </button>
  )
}

const Folder = ({ item, index, active, pinned, locked, label, onNavigate, onTogglePin, rowRef }) => {
  const Icon = item.icon
  const tag = item.badge && typeof item.badge === "object" ? item.badge : null
  const count = typeof item.badge === "number" ? item.badge : 0
  return (
    <li
      ref={rowRef}
      className="lx-cabinet-folder"
      data-active={active || undefined}
      data-pinned={pinned || undefined}
      data-live={item.accent === "success" || undefined}
      style={{ "--i": index, "--tab": index % 3 }}
    >
      <button type="button" className="lx-cabinet-folder__go" onClick={() => onNavigate(item)} aria-current={active ? "page" : undefined}>
        {Icon && <Icon className="lx-cabinet-folder__icon" size={15} strokeWidth={2} aria-hidden="true" />}
        <span className="lx-cabinet-folder__name">{label || item.name}</span>
        {tag && (
          <span className="lx-cabinet-live" data-pulse={tag.pulse || undefined}>
            {tag.label}
          </span>
        )}
        {isNavItemNew(item) && <span className="lx-cabinet-stamp-new lx-cabinet-stamp-new--sm">New</span>}
        {count > 0 && <Note count={count} small />}
      </button>
      {!locked && (
        <button
          type="button"
          className="lx-cabinet-clip"
          data-pinned={pinned || undefined}
          onClick={() => onTogglePin(item)}
          title={pinned ? "Unclip from Home" : "Clip to Home"}
          aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
          aria-pressed={pinned}
        >
          <PaperClip />
        </button>
      )}
    </li>
  )
}

const FilingCabinetSidebar = ({
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
  const today = useToday()
  const rowRefs = useRef([])

  // Remember which drawer just shut so it can slam (state-from-previous-render pattern).
  const [openId, setOpenId] = useState(activeCategory)
  const [closingId, setClosingId] = useState(null)
  if (openId !== activeCategory) {
    setClosingId(openId)
    setOpenId(activeCategory)
  }

  const activeIndex = items.findIndex((item) => isItemActive(item))

  useLayoutEffect(() => {
    rowRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, activeCategory])

  // Alt+1…n opens a drawer.
  useEffect(() => {
    const onKeyDown = (event) => {
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

  const filesFor = (categoryId) => {
    if (categoryId === activeCategory) return items.length
    if (categoryId === ADMIN_NAV_CATEGORY_HOME) return allItems.filter((item) => item.path && isPinned(item)).length
    return allItems.filter((item) => item.path && item.section === "main" && (item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS) === categoryId).length
  }

  return (
    <aside className="lx-cabinet" data-dark={isDark || undefined} aria-label="Main navigation">
      <span className="lx-cabinet-lamp" aria-hidden="true" />

      <header className="lx-cabinet-head">
        <button type="button" className="lx-cabinet-plate" onClick={onHome} title="Home">
          <span className="lx-cabinet-plate__screw" aria-hidden="true" />
          <span className="lx-cabinet-plate__text">
            <span className="lx-cabinet-plate__word">SMS</span>
            <span className="lx-cabinet-plate__sub">Records</span>
          </span>
          <span className="lx-cabinet-plate__screw" aria-hidden="true" />
        </button>
        <span className="lx-cabinet-stamp" aria-label={`Today, ${today}`}>
          <span className="lx-cabinet-stamp__top">Received</span>
          <span className="lx-cabinet-stamp__date">{today}</span>
        </span>
        <div className="lx-cabinet-mode">
          <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
        </div>
      </header>

      <nav className="lx-cabinet-body" aria-label="File drawers">
        {categories.map((category, index) => {
          const isOpen = category.id === activeCategory
          return (
            <div
              key={category.id}
              className="lx-cabinet-drawer"
              data-cat={category.id}
              data-open={isOpen || undefined}
              style={{ "--cat": `var(${category.colorVar})` }}
            >
              {isOpen && (
                <div className="lx-cabinet-well">
                  <div className="lx-cabinet-divider" aria-hidden="true">
                    <span className="lx-cabinet-divider__tab">{category.name}</span>
                    <span className="lx-cabinet-divider__meta">
                      {items.length} {items.length === 1 ? "file" : "files"}
                    </span>
                  </div>
                  <ul className="lx-cabinet-folders" aria-label={`${category.name} tabs`}>
                    {items.length === 0 && (
                      <li className="lx-cabinet-empty">This drawer is empty. Clip a folder from another drawer to file it here.</li>
                    )}
                    {items.map((item, itemIndex) => (
                      <Folder
                        key={item.path || item.name}
                        item={item}
                        index={itemIndex}
                        active={isItemActive(item)}
                        pinned={isPinned(item)}
                        locked={pinLocked(item)}
                        label={labelFor(item)}
                        onNavigate={onNavigate}
                        onTogglePin={onTogglePin}
                        rowRef={(node) => {
                          rowRefs.current[itemIndex] = node
                        }}
                      />
                    ))}
                  </ul>
                </div>
              )}
              <DrawerFront
                category={category}
                index={index}
                isOpen={isOpen}
                isClosing={category.id === closingId}
                count={categoryCounts?.[category.id] || 0}
                files={filesFor(category.id)}
                hasNew={Boolean(newCategoryIds?.has(category.id))}
                onSelect={onCategoryChange}
              />
            </div>
          )
        })}
      </nav>

      <footer className="lx-cabinet-desk">
        <button
          type="button"
          className="lx-cabinet-badge"
          data-active={isProfileActive || undefined}
          onClick={() => profileItem && onNavigate(profileItem)}
          aria-current={isProfileActive ? "page" : undefined}
          title="Profile"
        >
          <span className="lx-cabinet-badge__photo" aria-hidden="true">
            {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
          </span>
          <span className="lx-cabinet-badge__text">
            <span className="lx-cabinet-badge__name">{user?.name || "Profile"}</span>
            <span className="lx-cabinet-badge__mail">{user?.email || "View profile"}</span>
          </span>
        </button>
        <button
          type="button"
          className="lx-cabinet-tool lx-cabinet-tool--lamp"
          data-on={isDark || undefined}
          onClick={onToggleTheme}
          title={isDark ? "Lamp off: switch to light mode" : "Night shift: switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <LampDesk size={18} strokeWidth={2} />
        </button>
        {logoutItem && (
          <button type="button" className="lx-cabinet-tool lx-cabinet-tool--out" onClick={() => onNavigate(logoutItem)} title="Clock out (log out)" aria-label="Log out">
            <LogOut size={17} strokeWidth={2} />
          </button>
        )}
      </footer>
    </aside>
  )
}

export default FilingCabinetSidebar
