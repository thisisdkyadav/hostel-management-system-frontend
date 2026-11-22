import { useEffect, useMemo, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Bell, ChevronRight, LayoutGrid, LogOut, Moon, QrCode, Sun, X } from "lucide-react"
import { Modal } from "hzero"
import { useAuth } from "../../contexts/AuthProvider"
import useColorScheme from "../../hooks/useColorScheme"
import { getMediaUrl } from "../../utils/mediaUtils"
import { isNavItemNew } from "../../constants/navigationConfig"
import { NewTag } from "../sidebar/NewBadge"
import QRCodeGenerator from "../QRCodeGenerator"
import "./student-phone.css"

/**
 * The student portal on a phone: a slim header (SMS, campus QR, notifications),
 * the page, and a bottom bar with the pages students use most. Everything else
 * lives in the "More" sheet.
 */

// Bottom bar, in order. Complaints and Dining are the most visited pages.
const TAB_PATHS = ["/student", "/student/complaints", "/student/dining", "/student/events"]
const TAB_LABELS = { "/student": "Home" }

// Reached from the header or the sheet's profile card, so not listed in the grid.
const NOT_IN_GRID = new Set(["/student/notifications", "/student/profile"])
// Time-limited portals, shown at the top of the sheet while they are open.
const SPOTLIGHT_PATHS = new Set(["/student/elections", "/student/overall-best-performer"])
// Grid order: roughly most to least used.
const GRID_ORDER = ["/student/visitors", "/student/por", "/student/id-card", "/student/lost-and-found", "/student/feedbacks", "/student/security", "/student/undertakings"]
const GRID_LABELS = { "/student/lost-and-found": "Lost & Found", "/student/feedbacks": "Feedback" }

const isActivePath = (pathname, path) => (path === "/student" ? pathname === "/student" || pathname === "/student/" || pathname === "/" : pathname === path || pathname.startsWith(`${path}/`))

const Avatar = ({ user }) => (
  <span className="sp-avatar" aria-hidden="true">
    {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : user?.name?.charAt(0)?.toUpperCase() || "?"}
  </span>
)

const StudentPhoneShell = ({ navItems, notificationsCount = 0, blocked = false }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useColorScheme(user)
  // The sheet belongs to the page it was opened on, so any navigation
  // (a tap, the back button) closes it.
  const [sheetPath, setSheetPath] = useState(null)
  const sheetOpen = sheetPath === pathname
  const setSheetOpen = (open) => setSheetPath(open ? pathname : null)
  const [qrOpen, setQrOpen] = useState(false)

  const byPath = useMemo(() => new Map(navItems.filter((item) => item.path).map((item) => [item.path, item])), [navItems])
  const tabs = TAB_PATHS.map((path) => byPath.get(path)).filter(Boolean)
  const profileItem = byPath.get("/student/profile")
  const logoutItem = navItems.find((item) => item.name === "Logout")
  const spotlight = navItems.filter((item) => SPOTLIGHT_PATHS.has(item.path))
  const gridItems = navItems
    .filter((item) => item.path && !TAB_PATHS.includes(item.path) && !NOT_IN_GRID.has(item.path) && !SPOTLIGHT_PATHS.has(item.path))
    .sort((a, b) => {
      const ai = GRID_ORDER.indexOf(a.path)
      const bi = GRID_ORDER.indexOf(b.path)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  const sheetPageActive = !tabs.some((tab) => isActivePath(pathname, tab.path)) && !isActivePath(pathname, "/student/notifications")
  const sheetHasNews = spotlight.length > 0 || gridItems.some((item) => isNavItemNew(item))

  useEffect(() => {
    if (!sheetOpen) return undefined
    const onKey = (event) => event.key === "Escape" && setSheetPath(null)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [sheetOpen])

  const go = (item) => {
    setSheetOpen(false)
    if (item.action) item.action()
    else if (item.path) navigate(item.path)
  }

  if (blocked) {
    return (
      <div className="sp-blocked">
        <div className="sp-blocked__card">
          <span className="sp-blocked__word">SMS</span>
          <h1>Turn off “Desktop site”</h1>
          <p>SMS is made for your phone. Your browser is asking for the desktop version, which doesn’t fit a phone screen.</p>
          <ol>
            <li>Open the browser menu (⋮ in Chrome, “aA” in Safari).</li>
            <li>Untick <b>Desktop site</b> (Chrome) or tap <b>Request Mobile Website</b> (Safari).</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="sp-shell">
      <header className="sp-head">
        <button type="button" className="sp-head__brand" onClick={() => navigate("/student")}>
          SMS
        </button>
        <div className="sp-head__actions">
          <button type="button" className="sp-icon-btn" onClick={() => setQrOpen(true)} aria-label="Show campus QR code" title="Campus QR">
            <QrCode size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="sp-icon-btn"
            data-active={isActivePath(pathname, "/student/notifications") || undefined}
            onClick={() => navigate("/student/notifications")}
            aria-label={notificationsCount ? `Notifications, ${notificationsCount} new` : "Notifications"}
            title="Notifications"
          >
            <Bell size={20} strokeWidth={2} />
            {notificationsCount > 0 && <span className="sp-dot-count">{notificationsCount > 99 ? "99+" : notificationsCount}</span>}
          </button>
        </div>
      </header>

      <main className="sp-main">
        <Outlet />
      </main>

      <nav className="sp-bar" aria-label="Main">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActivePath(pathname, tab.path)
          return (
            <button key={tab.path} type="button" className="sp-tab" data-active={active || undefined} aria-current={active ? "page" : undefined} onClick={() => go(tab)}>
              <span className="sp-tab__icon">
                <Icon size={21} strokeWidth={active ? 2.4 : 2} />
                {isNavItemNew(tab) && <span className="sp-tab__dot" aria-hidden="true" />}
              </span>
              <span className="sp-tab__label">{TAB_LABELS[tab.path] || tab.name}</span>
            </button>
          )
        })}
        <button type="button" className="sp-tab" data-active={sheetOpen || sheetPageActive || undefined} aria-haspopup="dialog" aria-expanded={sheetOpen} onClick={() => setSheetOpen(!sheetOpen)}>
          <span className="sp-tab__icon">
            <LayoutGrid size={21} strokeWidth={sheetOpen || sheetPageActive ? 2.4 : 2} />
            {sheetHasNews && <span className="sp-tab__dot" aria-hidden="true" />}
          </span>
          <span className="sp-tab__label">More</span>
        </button>
      </nav>

      {sheetOpen && (
        <div className="sp-sheet-layer">
          <button type="button" className="sp-sheet-backdrop" aria-label="Close menu" onClick={() => setSheetOpen(false)} />
          <div className="sp-sheet" role="dialog" aria-modal="true" aria-label="More">
            <div className="sp-sheet__grip" aria-hidden="true" />
            <div className="sp-sheet__top">
              {profileItem ? (
                <button type="button" className="sp-me" data-active={isActivePath(pathname, profileItem.path) || undefined} onClick={() => go(profileItem)}>
                  <Avatar user={user} />
                  <span className="sp-me__text">
                    <span className="sp-me__name">{user?.name || "Profile"}</span>
                    <span className="sp-me__mail">{user?.email}</span>
                  </span>
                  <ChevronRight size={18} className="sp-me__chev" />
                </button>
              ) : <span />}
              <button type="button" className="sp-icon-btn" onClick={() => setSheetOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {spotlight.length > 0 && (
              <div className="sp-spotlight">
                {spotlight.map((item) => {
                  const Icon = item.icon
                  return (
                    <button key={item.path} type="button" className="sp-spotlight__item" onClick={() => go(item)}>
                      <Icon size={20} />
                      <span className="sp-spotlight__name">{item.name}</span>
                      <span className="sp-spotlight__tag">Open now</span>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="sp-grid">
              {gridItems.map((item) => {
                const Icon = item.icon
                const active = isActivePath(pathname, item.path)
                const count = typeof item.badge === "number" ? item.badge : 0
                return (
                  <button key={item.path} type="button" className="sp-tile" data-active={active || undefined} onClick={() => go(item)}>
                    <span className="sp-tile__icon">
                      <Icon size={22} strokeWidth={2} />
                      {count > 0 && <span className="sp-dot-count">{count > 99 ? "99+" : count}</span>}
                    </span>
                    <span className="sp-tile__label">{GRID_LABELS[item.path] || item.name}</span>
                    {isNavItemNew(item) && <NewTag />}
                  </button>
                )
              })}
            </div>

            <div className="sp-sheet__foot">
              <button type="button" className="sp-foot-btn" onClick={toggleTheme}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isDark ? "Light mode" : "Dark mode"}
              </button>
              {logoutItem && (
                <button type="button" className="sp-foot-btn sp-foot-btn--danger" onClick={() => go(logoutItem)}>
                  <LogOut size={18} />
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {qrOpen && (
        <Modal title="Campus Access QR" onClose={() => setQrOpen(false)} width={480}>
          <QRCodeGenerator />
        </Modal>
      )}
    </div>
  )
}

export default StudentPhoneShell
