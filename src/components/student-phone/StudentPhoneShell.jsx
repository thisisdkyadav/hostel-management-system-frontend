import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, Bell, ChevronRight, House, LayoutGrid, LogOut, Monitor, Moon, QrCode, Sun, X } from "lucide-react"
import { useAuth } from "../../contexts/AuthProvider"
import useColorScheme from "../../hooks/useColorScheme"
import { getMediaUrl } from "../../utils/mediaUtils"
import { isNavItemNew } from "../../constants/navigationConfig"
import { NewTag } from "../sidebar/NewBadge"
import { setPhoneBeta } from "./phoneBeta"
import useSheetDrag from "./kit/useSheetDrag"
import PhoneSheet from "./kit/PhoneSheet"
import { renderSheetModal } from "./kit/SheetModal"
import { ModalOverrideContext } from "../common/AdaptiveModal"
import { PhoneShellContext } from "./phoneShellContext"
import CampusQr from "./kit/CampusQr"
import { PhoneConfirmProvider } from "./kit/PhoneConfirm"
import useLayer from "./kit/useLayer"
import { Ghosts } from "./kit/ListBits"
import useTabSwipe from "./kit/useTabSwipe"
import usePhonePreload from "./usePhonePreload"
import RouteAccessGuard from "../authz/RouteAccessGuard"
import NotFoundPage from "../../pages/NotFoundPage"
import "./student-phone.css"
import "./pages/phone-pages.css"

// Pages with their own phone design; every other route renders its normal page.
// lazy(), plus a preload() to fetch the page's code ahead of the first visit.
const lazyPage = (load) => Object.assign(lazy(load), { preload: load })
const PhoneHome = lazyPage(() => import("./pages/PhoneHome"))
const PhoneComplaints = lazyPage(() => import("./pages/PhoneComplaints"))
const PhoneDining = lazyPage(() => import("./pages/PhoneDining"))
const PhoneEvents = lazyPage(() => import("./pages/PhoneEvents"))
const PhoneNotifications = lazyPage(() => import("./pages/PhoneNotifications"))
const PhoneLostFound = lazyPage(() => import("./pages/PhoneLostFound"))
const PhoneFeedback = lazyPage(() => import("./pages/PhoneFeedback"))
const PhonePor = lazyPage(() => import("./pages/PhonePor"))
const PhoneIDCard = lazyPage(() => import("./pages/PhoneIDCard"))
const PhoneSecurity = lazyPage(() => import("./pages/PhoneSecurity"))
const PhoneUndertakings = lazyPage(() => import("./pages/PhoneUndertakings"))
const PhoneVisitors = lazyPage(() => import("./pages/PhoneVisitors"))
const PhoneProfile = lazyPage(() => import("./pages/PhoneProfile"))

// Same access keys as the routes in StudentRoutes (the shell renders these in place of <Outlet/>).
// Placeholder while a page's code or access check loads (instead of a blank screen).
const PageGhost = () => (
  <div className="mk-page" aria-busy="true">
    <span className="mk-shimmer sp-ghost-title" />
    <Ghosts count={3} />
  </div>
)
const guarded = (routeKey, page) => (
  <RouteAccessGuard routeKey={routeKey} fallback={<NotFoundPage />} loadingFallback={<PageGhost />}>
    {page}
  </RouteAccessGuard>
)
const PHONE_PAGES = {
  "/student": guarded("route.student.dashboard", <PhoneHome />),
  "/student/complaints": guarded("route.student.complaints", <PhoneComplaints />),
  // Unguarded on purpose, like the desktop route: Dining is always shown to students.
  "/student/dining": <PhoneDining />,
  "/student/events": guarded("route.student.events", <PhoneEvents />),
  "/student/notifications": guarded("route.student.notifications", <PhoneNotifications />),
  "/student/lost-and-found": guarded("route.student.lostAndFound", <PhoneLostFound />),
  "/student/feedbacks": guarded("route.student.feedbacks", <PhoneFeedback />),
  "/student/id-card": guarded("route.student.idCard", <PhoneIDCard />),
  "/student/security": guarded("route.student.security", <PhoneSecurity />),
  "/student/undertakings": guarded("route.student.undertakings", <PhoneUndertakings />),
  "/student/visitors": guarded("route.student.visitors", <PhoneVisitors />),
  "/student/profile": guarded("route.student.profile", <PhoneProfile />),
  "/student/por": guarded("route.student.por", <PhonePor />),
}
// Bottom-bar pages, whose code is fetched early.
const TAB_PAGES = [PhoneHome, PhoneComplaints, PhoneDining, PhoneEvents]
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
// What slides in beside the page during a swipe.
const PEEK_PAGES = PHONE_PAGES
const phonePageFor = (pathname) => PHONE_PAGES[pathname === "/" || pathname === "/student/" ? "/student" : pathname.replace(/\/$/, "")] || null

/**
 * The student portal on a phone: a slim header (SMS, campus QR, notifications),
 * the page, and a bottom bar with the pages students use most. Everything else
 * lives in the "More" sheet.
 */

// Bottom bar, in order. Complaints and Dining are the most visited pages.
const TAB_PATHS = ["/student", "/student/complaints", "/student/dining", "/student/events"]
const TAB_LABELS = { "/student": "Home", "/student/complaints": "Issues" }
// The nav config gives Dashboard a grid icon, which looks like the More tab beside it.
const TAB_ICONS = { "/student": House }

// Reached from the header or the sheet's profile card, so not listed in the grid.
const NOT_IN_GRID = new Set(["/student/notifications", "/student/profile"])
// Time-limited portals, shown at the top of the sheet while they are open.
const SPOTLIGHT_PATHS = new Set(["/student/elections", "/student/overall-best-performer"])
// Shared pages that switch to a phone layout inside the shell: paint them in the phone palette too.
const PHONE_STYLED_PATHS = SPOTLIGHT_PATHS
// Grid order: roughly most to least used.
const GRID_ORDER = ["/student/visitors", "/student/por", "/student/id-card", "/student/lost-and-found", "/student/feedbacks", "/student/security", "/student/undertakings"]
// The big tiles; everything else in the More sheet gets a compact two-column row.
const PRIMARY_GRID = new Set(["/student/visitors", "/student/por", "/student/id-card"])

const GRID_LABELS = { "/student/lost-and-found": "Lost & Found", "/student/feedbacks": "Feedback", "/student/visitors": "Guest stays", "/student/por": "Positions", "/student/id-card": "ID card" }

const HEAD_TITLES = { "/student/profile": "Profile", "/student/notifications": "Notifications", "/student/overall-best-performer": "Best Performer" }

const isActivePath = (pathname, path) => (path === "/student" ? pathname === "/student" || pathname === "/student/" || pathname === "/" : pathname === path || pathname.startsWith(`${path}/`))

const Avatar = ({ user }) => (
  <span className="sp-avatar" aria-hidden="true">
    {user?.profileImage ? (
      <img src={getMediaUrl(user.profileImage)} alt="" />
    ) : (
      String(user?.name || "?")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "?"
    )}
  </span>
)

// Display face for titles and numbers, loaded only for the phone shell.
const DISPLAY_FONT_HREF = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
const useDisplayFont = () =>
  useEffect(() => {
    if (document.querySelector(`link[href="${DISPLAY_FONT_HREF}"]`)) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = DISPLAY_FONT_HREF
    document.head.appendChild(link)
  }, [])

const StudentPhoneShell = ({ navItems, notificationsCount = 0, blocked = false, waiting = false }) => {
  const navigate = useNavigate()
  const { pathname, key: locationKey } = useLocation()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useColorScheme(user)
  // The sheet belongs to the page it was opened on, so any navigation
  // (a tap, the back button) closes it.
  const [sheetPath, setSheetPath] = useState(null)
  const sheetOpen = sheetPath === pathname
  const setSheetOpen = (open) => setSheetPath(open ? pathname : null)
  const [qrOpen, setQrOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Once a sub-page's big title has scrolled away, the top bar names the page instead of "SMS".
  const [titleGonePath, setTitleGonePath] = useState(null)
  // Scrolling down shrinks the page's New button to its icon so it covers less of the list.
  const [fabMiniPath, setFabMiniPath] = useState(null) // the page it was shrunk on; a new page starts full
  const fabMini = fabMiniPath === pathname
  const lastTopRef = useRef(0)
  const onMainScroll = (event) => {
    const top = event.currentTarget.scrollTop
    setScrolled(top > 4)
    setTitleGonePath(top > 28 ? pathname : null)
    const delta = top - lastTopRef.current
    if (Math.abs(delta) > 6) {
      setFabMiniPath(delta > 0 && top > 48 ? pathname : null)
      lastTopRef.current = top
    }
  }
  useDisplayFont()
  const phonePage = phonePageFor(pathname)
  const phonePainted = Boolean(phonePage) || PHONE_STYLED_PATHS.has(pathname.replace(/\/$/, ""))

  const byPath = useMemo(() => new Map(navItems.filter((item) => item.path).map((item) => [item.path, item])), [navItems])
  const tabs = TAB_PATHS.map((path) => byPath.get(path)).filter(Boolean)
  const profileItem = byPath.get("/student/profile")
  const logoutItem = navItems.find((item) => item.name === "Logout")
  const spotlight = navItems.filter((item) => SPOTLIGHT_PATHS.has(item.path))
  const cleanPath = pathname.replace(/\/$/, "")
  // Once the page's big title scrolls away, the header names the page (every page but Home).
  const headTitle =
    titleGonePath === pathname && cleanPath !== "/student" && cleanPath !== ""
      ? HEAD_TITLES[cleanPath] || TAB_LABELS[cleanPath] || GRID_LABELS[cleanPath] || byPath.get(cleanPath)?.name || null
      : null
  const gridItems = navItems
    .filter((item) => item.path && !TAB_PATHS.includes(item.path) && !NOT_IN_GRID.has(item.path) && !SPOTLIGHT_PATHS.has(item.path))
    .sort((a, b) => {
      const ai = GRID_ORDER.indexOf(a.path)
      const bi = GRID_ORDER.indexOf(b.path)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  // A tapped tab lights up straight away, before its page has rendered (page
  // changes are React transitions, so a heavy page can take a moment).
  const [pending, setPending] = useState(null)
  const shownPath = pending && pending.from === locationKey ? pending.path : pathname
  const sheetPageActive = !tabs.some((tab) => isActivePath(pathname, tab.path)) && !isActivePath(pathname, "/student/notifications") && !(pending && pending.from === locationKey)
  const sheetHasNews = spotlight.length > 0 || gridItems.some((item) => isNavItemNew(item))

  const tabPaths = tabs.map((tab) => tab.path)
  // Neighbouring page shown during a swipe; tied to the page it was opened from,
  // so it disappears by itself once the swipe navigates.
  const [peek, setPeek] = useState(null)
  const peekRef = useRef(null)
  const onPeek = useCallback((path) => setPeek(path ? { path, from: pathname } : null), [pathname])
  const peekPage = peek && peek.from === pathname ? PEEK_PAGES[peek.path] : null
  const mainRef = useTabSwipe({
    paths: tabPaths,
    currentIndex: tabPaths.findIndex((path) => isActivePath(pathname, path)),
    onSwitch: navigate,
    onPeek,
    peekRef,
    active: !blocked,
  })
  usePhonePreload(!blocked)

  // Fetch the bottom-bar pages' code early, so a first tap or swipe isn't waiting on it.
  useEffect(() => {
    const timer = window.setTimeout(() => TAB_PAGES.forEach((Page) => Page.preload?.().catch(() => {})), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  // Tapping a tab slides the pages like a swipe does: a still copy of the page
  // being left slides out while the new page slides in from the side the tab is on.
  const slideRef = useRef(null) // { ghost, dir } captured at the tap
  const slideAnims = useRef([])
  const stopSlide = () => {
    slideAnims.current.forEach((animation) => animation.cancel())
    slideAnims.current = []
    document.querySelectorAll(".sp-slide-ghost").forEach((node) => node.remove())
  }
  const captureSlide = (toIndex) => {
    stopSlide()
    const main = mainRef.current
    const fromIndex = tabPaths.findIndex((path) => isActivePath(pathname, path))
    slideRef.current = null
    if (!main || fromIndex < 0 || toIndex < 0 || fromIndex === toIndex || reducedMotion()) return
    const ghost = main.cloneNode(true)
    ghost.className = "sp-main sp-peek sp-slide-ghost"
    ghost.removeAttribute("style")
    ghost.setAttribute("aria-hidden", "true")
    ghost.inert = true
    if (phonePainted) ghost.setAttribute("data-mpage", "")
    slideRef.current = { ghost, scrollTop: main.scrollTop, dir: toIndex > fromIndex ? 1 : -1 }
  }

  // New page: start at the top, drop any swipe transform and sideways scroll
  // before it paints, then run the tap slide if there is one.
  useLayoutEffect(() => {
    const main = mainRef.current
    if (!main) return
    main.style.transition = "none"
    main.style.transform = ""
    main.scrollTop = 0
    main.scrollLeft = 0
    if (main.parentElement) main.parentElement.scrollLeft = 0
    const slide = slideRef.current
    slideRef.current = null
    if (!slide || !main.parentElement) return
    main.parentElement.insertBefore(slide.ghost, main.nextSibling)
    slide.ghost.scrollTop = slide.scrollTop
    const timing = { duration: 280, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
    const pageIn = main.animate([{ transform: `translate3d(${slide.dir * 100}%, 0, 0)` }, { transform: "translate3d(0, 0, 0)" }], timing)
    const pageOut = slide.ghost.animate([{ transform: "translate3d(0, 0, 0)" }, { transform: `translate3d(${slide.dir * -100}%, 0, 0)` }], { ...timing, fill: "forwards" })
    slideAnims.current = [pageIn, pageOut]
    pageOut.finished.then(() => slide.ghost.remove(), () => slide.ghost.remove())
  }, [pathname, mainRef])
  useEffect(() => stopSlide, [])
  const closeSheet = useCallback(() => setSheetPath(null), [])
  const { sheetRef, backdropRef } = useSheetDrag(closeSheet, sheetOpen)

  useLayer(closeSheet, sheetRef, sheetOpen) // Back / Escape close it; focus stays inside

  const go = (item) => {
    const fromSheet = sheetOpen
    setSheetOpen(false)
    if (item.action) return item.action()
    if (!item.path) return
    if (item.path === shownPath) {
      // Already here: a second tap goes back to the top.
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const toIndex = tabPaths.indexOf(item.path)
    if (!fromSheet) captureSlide(toIndex)
    setPending({ path: item.path, from: locationKey })
    // From the sheet, replace its history entry so Back returns to the page it was opened on.
    navigate(item.path, fromSheet ? { replace: true } : undefined)
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
          <div className="sp-blocked__actions">
            <button type="button" className="sp-blocked__btn sp-blocked__btn--primary" onClick={() => window.location.reload()}>
              Done, reload
            </button>
            <button type="button" className="sp-blocked__btn" onClick={() => setPhoneBeta(false)}>
              Use the classic layout instead
            </button>
            {logoutItem && (
              <button type="button" className="sp-blocked__btn sp-blocked__btn--quiet" onClick={() => go(logoutItem)}>
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <PhoneConfirmProvider>
    <div className="sp-shell" data-mpage={phonePainted ? "" : undefined} data-scrolled={scrolled || undefined} data-fab-mini={fabMini || undefined}>
      <header className="sp-head">
        <div className="sp-head__lead">
          {!tabs.some((tab) => isActivePath(pathname, tab.path)) && (
            <button
              type="button"
              className="sp-icon-btn sp-head__back"
              aria-label="Back"
              // Back through the app's own history when there is some (react-router keeps an index); otherwise home.
              onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/student"))}
            >
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
          )}
          {headTitle ? (
            <span className="sp-head__title">{headTitle}</span>
          ) : (
            <button type="button" className="sp-head__brand" onClick={() => navigate("/student")}>
              SMS
            </button>
          )}
        </div>
        <div className="sp-head__actions">
          <button type="button" className="sp-icon-btn" onClick={() => setQrOpen(true)} aria-label="Show campus QR code" title="Campus QR">
            <QrCode size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="sp-icon-btn"
            data-active={isActivePath(pathname, "/student/notifications") || undefined}
            onClick={() => navigate("/student/notifications")}
            aria-label={notificationsCount ? `Notifications, ${notificationsCount} active` : "Notifications"}
            title="Notifications"
          >
            <Bell size={20} strokeWidth={2} />
            {notificationsCount > 0 && <span className="sp-dot-count">{notificationsCount > 99 ? "99+" : notificationsCount}</span>}
          </button>
        </div>
      </header>

      <main ref={mainRef} className="sp-main" onScroll={onMainScroll}>
        {waiting ? (
          // The app is still checking the account: the frame shows straight away.
          <PageGhost />
        ) : phonePage ? (
          // Phone pages also read PhoneShellContext, for the shared dining cards inside them.
          <PhoneShellContext.Provider value={true}>
            <Suspense fallback={<PageGhost />}>{phonePage}</Suspense>
          </PhoneShellContext.Provider>
        ) : (
          // Shared pages without a phone page of their own: they can ask for
          // phone layout (PhoneShellContext) and their dialogs open as sheets.
          <PhoneShellContext.Provider value={true}>
            <ModalOverrideContext.Provider value={renderSheetModal}>
              <Outlet />
            </ModalOverrideContext.Provider>
          </PhoneShellContext.Provider>
        )}
      </main>
      {peekPage && (
        <div
          ref={peekRef}
          className="sp-main sp-peek"
          data-side={tabPaths.indexOf(peek.path) > tabPaths.findIndex((path) => isActivePath(pathname, path)) ? "right" : "left"}
          data-mpage={PHONE_PAGES[peek.path] ? "" : undefined}
          aria-hidden="true"
          inert
        >
          <Suspense fallback={null}>{peekPage}</Suspense>
        </div>
      )}

      <nav className="sp-bar" aria-label="Main">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.path] || tab.icon
          const active = isActivePath(shownPath, tab.path)
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
          <button ref={backdropRef} type="button" tabIndex={-1} className="sp-sheet-backdrop" aria-label="Close menu" onClick={() => setSheetOpen(false)} />
          <div ref={sheetRef} tabIndex={-1} className="sp-sheet" role="dialog" aria-modal="true" aria-label="More">
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
              <button type="button" className="sp-icon-btn sp-icon-btn--filled" onClick={() => setSheetOpen(false)} aria-label="Close">
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

            {[gridItems.filter((item) => PRIMARY_GRID.has(item.path)), gridItems.filter((item) => !PRIMARY_GRID.has(item.path))].map((group, index) =>
              group.length === 0 ? null : (
                <div key={index} className="sp-grid" data-compact={index === 1 || undefined}>
                  {group.map((item) => {
                    const Icon = item.icon
                    const active = isActivePath(pathname, item.path)
                    const count = typeof item.badge === "number" ? item.badge : 0
                    return (
                      <button key={item.path} type="button" className="sp-tile" data-active={active || undefined} onClick={() => go(item)}>
                        <span className="sp-tile__icon">
                          <Icon size={index === 1 ? 18 : 22} strokeWidth={2} />
                          {count > 0 && <span className="sp-dot-count">{count > 99 ? "99+" : count}</span>}
                        </span>
                        <span className="sp-tile__label">{GRID_LABELS[item.path] || item.name}</span>
                        {isNavItemNew(item) && <NewTag />}
                      </button>
                    )
                  })}
                </div>
              )
            )}

            <div className="sp-sheet__foot">
              <button type="button" className="sp-foot-btn" onClick={toggleTheme}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isDark ? "Light mode" : "Dark mode"}
              </button>
              <button type="button" className="sp-foot-btn" onClick={() => setPhoneBeta(false)}>
                <Monitor size={18} />
                Classic view
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
        <PhoneSheet title="Campus QR" onClose={() => setQrOpen(false)}>
          <CampusQr />
        </PhoneSheet>
      )}
    </div>
    </PhoneConfirmProvider>
  )
}

export default StudentPhoneShell
