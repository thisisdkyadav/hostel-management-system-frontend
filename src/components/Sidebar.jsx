import { useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import MobileHeader from "./MobileHeader"
import { useAuth } from "../contexts/AuthProvider"
import { HiMenuAlt2, HiMenuAlt3 } from "react-icons/hi"
import usePwaMobile from "../hooks/usePwaMobile"
import useLayoutPreference from "../hooks/useLayoutPreference"
import HostelSwitcher from "./sidebar/HostelSwitcher"
import SidebarNavItem from "./sidebar/SidebarNavItem"
import SidebarModeSwitcher from "./sidebar/SidebarModeSwitcher"
import ProfileCard from "./sidebar/ProfileCard"
import CategoryBar from "./sidebar/CategoryBar"
import { getCategoryTint } from "./sidebar/categoryStyles"
import FlatGroupedNav from "./sidebar/FlatGroupedNav"
import WorkspaceNav from "./sidebar/WorkspaceNav"
import useRecentPaths from "./sidebar/useRecentPaths"
import {
  SIDEBAR_MODE_FLAT,
  SIDEBAR_MODE_CATEGORIES,
  SIDEBAR_MODE_WORKSPACE,
  SIDEBAR_MODE_STORAGE_KEY,
  readStoredSidebarMode,
} from "./sidebar/sidebarModes"
import { authApi } from "../service"
import {
  ADMIN_NAV_CATEGORIES,
  ADMIN_NAV_CATEGORY_HOME,
  ADMIN_NAV_CATEGORY_HOSTELS,
  ADMIN_NAV_CATEGORY_DINING,
  isCsoAdminSubRole,
} from "../constants/navigationConfig"

const ADMIN_DEFAULT_PINNED_PATHS = [
  "/admin",
  "/admin/hostels",
  "/admin/students",
  "/admin/sheet",
  "/admin/complaints",
  "/admin/overall-best-performer",
  "/admin/caterers",
  "/admin/dining-periods",
]

const ADMIN_PINNED_TAB_MIGRATIONS = [
  {
    storageKey: "admin_sidebar_pin_overall_best_performer_v1",
    path: "/admin/overall-best-performer",
  },
  {
    storageKey: "admin_sidebar_pin_caterers_v1",
    path: "/admin/caterers",
  },
  {
    storageKey: "admin_sidebar_pin_dining_periods_v1",
    path: "/admin/dining-periods",
  },
]

const Sidebar = ({ navItems }) => {
  const [active, setActive] = useState("")
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarMode, setSidebarMode] = useState(readStoredSidebarMode)
  const [activeAdminCategory, setActiveAdminCategory] = useState(ADMIN_NAV_CATEGORY_HOME)
  const [pinnedAdminPaths, setPinnedAdminPaths] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isPwaMobile } = usePwaMobile()
  const { layoutPreference } = useLayoutPreference()
  const { recentPaths, recordVisit } = useRecentPaths()

  const isAdmin = user?.role === "Admin"
  const isRestrictedCsoAdmin = isAdmin && isCsoAdminSubRole(user)
  // The V1/V2/V3 layouts only apply to the full admin nav; everyone else gets the plain list
  const isAdminNav = isAdmin && !isRestrictedCsoAdmin
  const isCategorizedMode = isAdminNav && sidebarMode === SIDEBAR_MODE_CATEGORIES

  const mainNavItems = useMemo(
    () => (Array.isArray(navItems) ? navItems.filter((item) => item.section === "main") : []),
    [navItems]
  )
  const bottomNavItems = useMemo(
    () => (Array.isArray(navItems) ? navItems.filter((item) => item.section === "bottom") : []),
    [navItems]
  )

  const adminMainPathsSignature = mainNavItems
    .filter((item) => item.path)
    .map((item) => item.path)
    .join("|")

  // Set data-admin-category on <html> so non-sidebar surfaces can tint by category (V2 only)
  useEffect(() => {
    if (isCategorizedMode) {
      document.documentElement.setAttribute("data-admin-category", activeAdminCategory)
    } else {
      document.documentElement.removeAttribute("data-admin-category")
    }
    return () => document.documentElement.removeAttribute("data-admin-category")
  }, [activeAdminCategory, isCategorizedMode])

  useEffect(() => {
    const currentItem = navItems?.find((item) => {
      if (location.pathname === item.path) return true
      if (item.pathPattern && new RegExp(item.pathPattern).test(location.pathname)) return true
      if (location.pathname === "/" && item.path === "/Dashboard") return true

      return false
    })

    if (currentItem) {
      setActive(currentItem.name)
    }
  }, [location.pathname, navItems])

  // Track recent visits so the Workspace (V3) layout can surface them
  useEffect(() => {
    if (!isAdminNav || !active) return
    const currentItem = mainNavItems.find((item) => item.name === active)
    if (currentItem?.path) recordVisit(currentItem.path)
  }, [isAdminNav, active, mainNavItems, recordVisit])

  useEffect(() => {
    if (!isAdminNav || typeof window === "undefined") return
    window.localStorage.setItem(SIDEBAR_MODE_STORAGE_KEY, sidebarMode)
  }, [isAdminNav, sidebarMode])

  useEffect(() => {
    if (!isAdminNav) {
      setActiveAdminCategory(ADMIN_NAV_CATEGORY_HOME)
      setPinnedAdminPaths([])
      return
    }

    if (typeof window === "undefined") return

    const adminMainNavItems = mainNavItems.filter((item) => item.path)
    const validPaths = new Set(adminMainNavItems.map((item) => item.path))
    const fallbackPins = ADMIN_DEFAULT_PINNED_PATHS.filter((path) => validPaths.has(path))
    const safeFallbackPins = fallbackPins.length > 0 ? fallbackPins : validPaths.has("/admin") ? ["/admin"] : []
    const hasPersistedPinnedTabs = Array.isArray(user?.pinnedTabs)
    const userPinnedTabs = hasPersistedPinnedTabs ? user.pinnedTabs.filter((path) => typeof path === "string" && validPaths.has(path)) : []
    const sanitizedUserPinnedTabs = [...new Set(userPinnedTabs)]
    const nextPinnedPaths = hasPersistedPinnedTabs ? sanitizedUserPinnedTabs : safeFallbackPins

    const migrationPathsToAdd = ADMIN_PINNED_TAB_MIGRATIONS
      .filter((migration) => validPaths.has(migration.path) && !window.localStorage.getItem(migration.storageKey))
      .map((migration) => migration.path)

    const migratedPinnedPaths = [...new Set([...nextPinnedPaths, ...migrationPathsToAdd])]

    setPinnedAdminPaths(migratedPinnedPaths)
    setActiveAdminCategory(ADMIN_NAV_CATEGORY_HOME)

    if (migrationPathsToAdd.length > 0) {
      ADMIN_PINNED_TAB_MIGRATIONS.forEach((migration) => {
        if (migrationPathsToAdd.includes(migration.path)) {
          window.localStorage.setItem(migration.storageKey, "true")
        }
      })

      authApi.updatePinnedTabs(migratedPinnedPaths).catch((error) => {
        console.error("Failed to persist pinned tab migration:", error)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminNav, adminMainPathsSignature, user?.pinnedTabs])

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Skip sidebar rendering for student PWA in mobile mode with bottombar preference.
  // All hooks must run before this point (Rules of Hooks).
  if (user?.role === "Student" && isPwaMobile && layoutPreference === "bottombar") {
    return null
  }

  if (!navItems || !Array.isArray(navItems) || navItems.length === 0) {
    return null
  }

  const adminMainPathSet = new Set(mainNavItems.filter((item) => item.path).map((item) => item.path))
  const profileItem = bottomNavItems.find((item) => item.name === "Profile")
  const logoutItem = bottomNavItems.find((item) => item.name === "Logout")

  const handleNavigation = (item) => {
    if (item.action) {
      item.action()
    } else if (item.path) {
      setActive(item.name)
      navigate(item.path)
    }

    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const togglePinnedItem = async (item) => {
    if (!isAdminNav || !item?.path || !adminMainPathSet.has(item.path)) return

    const previousPinnedPaths = pinnedAdminPaths
    const nextPinnedPaths = previousPinnedPaths.includes(item.path)
      ? previousPinnedPaths.filter((path) => path !== item.path)
      : [...previousPinnedPaths, item.path]

    setPinnedAdminPaths(nextPinnedPaths)

    try {
      const response = await authApi.updatePinnedTabs(nextPinnedPaths)
      if (Array.isArray(response?.pinnedTabs)) {
        const sanitizedPinnedTabs = [...new Set(response.pinnedTabs.filter((path) => typeof path === "string" && adminMainPathSet.has(path)))]
        setPinnedAdminPaths(sanitizedPinnedTabs)
      }
    } catch (error) {
      console.error("Failed to save pinned tabs:", error)
      setPinnedAdminPaths(previousPinnedPaths)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setActiveAdminCategory(categoryId)

    const firstItem =
      categoryId === ADMIN_NAV_CATEGORY_HOME
        ? mainNavItems.find((item) => item.path && pinnedAdminPaths.includes(item.path))
        : mainNavItems.find((item) => item.path && (item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS) === categoryId)

    if (!firstItem?.path) return

    setActive(firstItem.name)
    navigate(firstItem.path)
  }

  const headerTint = isCategorizedMode ? getCategoryTint(activeAdminCategory) : undefined
  const activeCategoryConfig = isCategorizedMode
    ? ADMIN_NAV_CATEGORIES.find((category) => category.id === activeAdminCategory)
    : null
  const headerTitle = activeCategoryConfig?.name || "HMS"
  const headerTitleColor = activeCategoryConfig ? `var(${activeCategoryConfig.colorVar})` : "var(--color-text-primary)"

  const renderPlainList = (items, { withPins = false } = {}) => (
    <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar ${isOpen ? "px-4 py-3" : "px-2 py-3"}`}>
      <ul className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.name}
            item={item}
            isActive={active === item.name}
            isOpen={isOpen}
            showPinControl={withPins && isOpen && !!item.path}
            isPinned={!!item.path && pinnedAdminPaths.includes(item.path)}
            onNavigate={handleNavigation}
            onTogglePin={togglePinnedItem}
          />
        ))}
      </ul>
      {withPins && items.length === 0 && isOpen && (
        <div className="mt-3 px-4 py-3 rounded-xl text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-light)]">
          {activeAdminCategory === ADMIN_NAV_CATEGORY_DINING
            ? "Coming Soon"
            : "No tabs here yet. Pin tabs from other categories to show them in Home."}
        </div>
      )}
    </div>
  )

  const renderNavBody = () => {
    if (!isAdminNav) return renderPlainList(mainNavItems)

    if (sidebarMode === SIDEBAR_MODE_FLAT) {
      return (
        <FlatGroupedNav
          items={mainNavItems}
          pinnedPaths={pinnedAdminPaths}
          activeName={active}
          isOpen={isOpen}
          onNavigate={handleNavigation}
          onTogglePin={togglePinnedItem}
        />
      )
    }

    if (sidebarMode === SIDEBAR_MODE_WORKSPACE) {
      return (
        <WorkspaceNav
          items={mainNavItems}
          pinnedPaths={pinnedAdminPaths}
          recentPaths={recentPaths}
          activeName={active}
          isOpen={isOpen}
          onNavigate={handleNavigation}
          onTogglePin={togglePinnedItem}
          onRequestExpand={() => setIsOpen(true)}
        />
      )
    }

    const categoryItems =
      activeAdminCategory === ADMIN_NAV_CATEGORY_HOME
        ? mainNavItems.filter((item) => item.path && pinnedAdminPaths.includes(item.path))
        : mainNavItems.filter((item) => (item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS) === activeAdminCategory)

    return renderPlainList(categoryItems, { withPins: true })
  }

  return (
    <>
      <MobileHeader isOpen={isOpen} setIsOpen={setIsOpen} bottomNavItems={bottomNavItems} handleNavigation={handleNavigation} />

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/40 z-20 backdrop-blur-sm pt-16" onClick={() => setIsOpen(false)}></div>}

      <div
        className={`fixed md:relative z-30 transition-all duration-300 ease-in-out bg-[var(--color-bg-primary)] border-r border-[var(--color-border-primary)] ${isOpen ? "left-0" : "-left-full md:left-0"} ${isOpen ? "w-[280px]" : "w-0 md:w-[72px]"} ${isMobile ? "mt-16 h-[calc(100vh-64px)]" : "h-screen"} overflow-hidden`}
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo, mode switcher and collapse toggle */}
          <div
            className={`border-b border-[var(--color-border-primary)] transition-all duration-300 ${isMobile ? "hidden" : ""} h-16 shrink-0`}
            style={{ backgroundColor: headerTint }}
          >
            <div className={`h-full flex items-center ${isOpen ? "justify-between px-5" : "justify-center px-3"} transition-all duration-200`}>
              {isOpen && (
                <div className="cursor-pointer flex items-center group min-w-0" onClick={() => navigate("/")}>
                  <span
                    className="font-semibold text-lg tracking-tight truncate transition-all duration-300 group-hover:opacity-70"
                    style={{ color: headerTitleColor }}
                  >
                    {headerTitle}
                  </span>
                </div>
              )}

              {isOpen ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  {isAdminNav && <SidebarModeSwitcher mode={sidebarMode} onChange={setSidebarMode} />}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    title="Minimize"
                    aria-label="Minimize sidebar"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
                  >
                    <HiMenuAlt2 className="text-[17px]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  title="Expand"
                  aria-label="Expand sidebar"
                  className="w-8 h-8 rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)] flex items-center justify-center transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
                >
                  <HiMenuAlt3 className="text-[17px]" />
                </button>
              )}
            </div>
          </div>

          {/* Main navigation (layout depends on role + mode) */}
          {renderNavBody()}

          {/* Active hostel switcher (warden roles only) */}
          <HostelSwitcher isOpen={isOpen} onExpand={() => setIsOpen(true)} />

          {/* Profile and logout */}
          <div
            className={`border-t border-[var(--color-border-primary)] overflow-x-hidden transition-all duration-300 shrink-0 ${isOpen ? "px-4 py-3" : "px-2 py-3"}`}
            style={{ backgroundColor: headerTint }}
          >
            <ProfileCard
              user={user}
              isOpen={isOpen}
              profileItem={profileItem}
              logoutItem={logoutItem}
              isActive={active === "Profile"}
              onNavigate={handleNavigation}
            />
          </div>

          {/* V2 category bar */}
          {isCategorizedMode && <CategoryBar activeCategory={activeAdminCategory} onCategoryChange={handleCategoryChange} isOpen={isOpen} />}
        </div>
      </div>
    </>
  )
}

export default Sidebar
