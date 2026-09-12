import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import MobileHeader from "./MobileHeader"
import { useAuth } from "../contexts/AuthProvider"
import { Moon, Sun } from "lucide-react"
import usePwaMobile from "../hooks/usePwaMobile"
import useLayoutPreference from "../hooks/useLayoutPreference"
import useColorScheme from "../hooks/useColorScheme"
import useAdminCategoryCounts from "../hooks/useAdminCategoryCounts"
import HostelSwitcher from "./sidebar/HostelSwitcher"
import SidebarNavItem from "./sidebar/SidebarNavItem"
import SidebarModeSwitcher from "./sidebar/SidebarModeSwitcher"
import ProfileCard from "./sidebar/SidebarProfileCard"
import CategoryBar from "./sidebar/CategoryBar"
import IconRail from "./sidebar/IconRail"
import { getCategoryTint } from "./sidebar/categoryStyles"
import FlatGroupedNav from "./sidebar/FlatGroupedNav"
import WorkspaceNav from "./sidebar/WorkspaceNav"
import useRecentPaths from "./sidebar/useRecentPaths"
import {
  SIDEBAR_MODE_FLAT,
  SIDEBAR_MODE_CATEGORIES,
  SIDEBAR_MODE_WORKSPACE,
  SIDEBAR_MODE_RAIL,
  SIDEBAR_MODE_STORAGE_KEY,
  isValidSidebarMode,
  isV4ForceActive,
  readLocalSidebarMode,
  resolveSidebarMode,
} from "./sidebar/sidebarModes"
import { authApi } from "../service"
import {
  ADMIN_NAV_CATEGORIES,
  ADMIN_NAV_CATEGORY_HOME,
  ADMIN_NAV_CATEGORY_HOSTELS,
  ADMIN_NAV_CATEGORY_DINING,
  ADMIN_DASHBOARD_PATHS,
  getAdminDashboardSectionByPath,
  isAutoPinNavItem,
  isCsoAdminSubRole,
  isNavItemNew,
} from "../constants/navigationConfig"

const navItemKey = (item) => item.path || item.name

const isNavItemActive = (item, pathname) => {
  if (item.path && pathname === item.path) return true
  if (item.pathPattern && new RegExp(item.pathPattern).test(pathname)) return true
  return false
}
import { HStack, Surface, Text } from "hzero"

const ADMIN_DEFAULT_PINNED_PATHS = [
  "/admin",
  "/admin/hostels",
  "/admin/hostel-explorer",
  "/admin/students",
  "/admin/sheet",
  "/admin/complaints",
  "/admin/overall-best-performer",
  "/admin/caterers",
  "/admin/dining-periods",
]

const autoPinDismissKey = (path) => `admin_sidebar_autopin_dismiss:${path}`

const isAutoPinDismissed = (path) => {
  if (typeof window === "undefined" || !path) return false
  return Boolean(window.localStorage.getItem(autoPinDismissKey(path)))
}

const setAutoPinDismissed = (path, dismissed) => {
  if (typeof window === "undefined" || !path) return
  if (dismissed) window.localStorage.setItem(autoPinDismissKey(path), "true")
  else window.localStorage.removeItem(autoPinDismissKey(path))
}

const insertAfterHostels = (paths, extras) => {
  const result = [...paths]
  for (const path of extras) {
    if (!path || result.includes(path)) continue
    const hostelsIdx = result.indexOf("/admin/hostels")
    result.splice((hostelsIdx >= 0 ? hostelsIdx : 0) + 1, 0, path)
  }
  return result
}

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
  const [pickedSidebarMode, setPickedSidebarMode] = useState(null)
  const [activeAdminCategory, setActiveAdminCategory] = useState(ADMIN_NAV_CATEGORY_HOME)
  const [pinnedAdminPaths, setPinnedAdminPaths] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isDark, toggleTheme } = useColorScheme(user)
  const { isPwaMobile } = usePwaMobile()
  const { layoutPreference } = useLayoutPreference()
  const { recentPaths, recordVisit } = useRecentPaths()

  const isAdmin = user?.role === "Admin"
  const isRestrictedCsoAdmin = isAdmin && isCsoAdminSubRole(user)
  // The V1–V4 layouts only apply to the full admin nav; everyone else gets the plain list
  const isAdminNav = isAdmin && !isRestrictedCsoAdmin
  const persistSidebarMode = useCallback((mode) => {
    if (!isValidSidebarMode(mode) || typeof window === "undefined") return
    window.localStorage.setItem(SIDEBAR_MODE_STORAGE_KEY, mode)
    authApi.updateSidebarMode(mode).catch((error) => {
      console.error("Failed to save sidebar mode:", error)
    })
  }, [])
  const handleSidebarModeChange = useCallback((nextMode) => {
    setPickedSidebarMode(nextMode)
    persistSidebarMode(nextMode)
  }, [persistSidebarMode])
  const v4ForceSavedRef = useRef(false)
  const sidebarMode = pickedSidebarMode ?? resolveSidebarMode({
    dbMode: user?.sidebarMode,
    storedMode: readLocalSidebarMode(),
  })
  const isRailMode = isAdminNav && sidebarMode === SIDEBAR_MODE_RAIL
  const isCategorizedMode = isAdminNav && (sidebarMode === SIDEBAR_MODE_CATEGORIES || isRailMode)

  const mainNavItems = useMemo(
    () => (Array.isArray(navItems) ? navItems.filter((item) => item.section === "main") : []),
    [navItems]
  )
  const bottomNavItems = useMemo(
    () => (Array.isArray(navItems) ? navItems.filter((item) => item.section === "bottom") : []),
    [navItems]
  )
  const newCategoryIds = useMemo(() => {
    const ids = new Set()
    for (const item of mainNavItems) {
      if (isNavItemNew(item) && item.adminCategory) ids.add(item.adminCategory)
    }
    return ids
  }, [mainNavItems])
  const categoryCounts = useAdminCategoryCounts(isAdminNav)

  const adminMainPathsSignature = mainNavItems
    .filter((item) => item.path)
    .map((item) => item.path)
    .join("|")

  // Set data-admin-category on <html> so non-sidebar surfaces can tint by category (V2 / V4)
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
      if (isNavItemActive(item, location.pathname)) return true
      if (location.pathname === "/" && item.path === "/Dashboard") return true
      return false
    })

    if (currentItem) {
      setActive(navItemKey(currentItem))
    }

    const dashboardSection = getAdminDashboardSectionByPath(location.pathname)
    if (dashboardSection) {
      setActiveAdminCategory(dashboardSection.category)
    }
  }, [location.pathname, navItems])

  // Track recent visits so the Workspace (V3) layout can surface them
  useEffect(() => {
    if (!isAdminNav) return
    const currentItem = mainNavItems.find((item) => isNavItemActive(item, location.pathname))
    if (currentItem?.path) recordVisit(currentItem.path)
  }, [isAdminNav, location.pathname, mainNavItems, recordVisit])

  useEffect(() => {
    if (!isAdminNav || typeof window === "undefined") return
    window.localStorage.setItem(SIDEBAR_MODE_STORAGE_KEY, sidebarMode)
  }, [isAdminNav, sidebarMode])

  useEffect(() => {
    if (!isAdminNav || !isV4ForceActive() || !user?._id) return
    if (user.sidebarMode === SIDEBAR_MODE_RAIL || v4ForceSavedRef.current) return
    v4ForceSavedRef.current = true
    persistSidebarMode(SIDEBAR_MODE_RAIL)
  }, [isAdminNav, persistSidebarMode, user?._id, user?.sidebarMode])

  useEffect(() => {
    if (!isAdminNav) {
      setActiveAdminCategory(ADMIN_NAV_CATEGORY_HOME)
      setPinnedAdminPaths([])
      return
    }

    if (typeof window === "undefined") return

    const adminMainNavItems = mainNavItems.filter((item) => item.path)
    const validPaths = new Set(adminMainNavItems.map((item) => item.path))
    const alwaysPinnedPaths = adminMainNavItems.filter((item) => item.alwaysPinned).map((item) => item.path)
    const fallbackPins = ADMIN_DEFAULT_PINNED_PATHS.filter((path) => validPaths.has(path))
    const safeFallbackPins = fallbackPins.length > 0 ? fallbackPins : validPaths.has(ADMIN_DASHBOARD_PATHS.home) ? [ADMIN_DASHBOARD_PATHS.home] : []
    const hasPersistedPinnedTabs = Array.isArray(user?.pinnedTabs)
    const userPinnedTabs = hasPersistedPinnedTabs ? user.pinnedTabs.filter((path) => typeof path === "string" && validPaths.has(path)) : []
    const sanitizedUserPinnedTabs = [...new Set(userPinnedTabs)]
    const nextPinnedPaths = [...new Set([
      ...alwaysPinnedPaths,
      ...(hasPersistedPinnedTabs ? sanitizedUserPinnedTabs : safeFallbackPins),
    ])]

    const migrationPathsToAdd = ADMIN_PINNED_TAB_MIGRATIONS
      .filter((migration) => validPaths.has(migration.path) && !window.localStorage.getItem(migration.storageKey))
      .map((migration) => migration.path)
    const autoPinPaths = adminMainNavItems
      .filter((item) => isAutoPinNavItem(item) && validPaths.has(item.path) && !isAutoPinDismissed(item.path))
      .map((item) => item.path)
    const addedAutoPins = autoPinPaths.filter((path) => !nextPinnedPaths.includes(path))

    const migratedPinnedPaths = insertAfterHostels(
      [...new Set([...alwaysPinnedPaths, ...nextPinnedPaths, ...migrationPathsToAdd])],
      autoPinPaths
    )

    setPinnedAdminPaths(migratedPinnedPaths)
    const dashboardSection = getAdminDashboardSectionByPath(window.location.pathname)
    setActiveAdminCategory(dashboardSection?.category || ADMIN_NAV_CATEGORY_HOME)

    const missingAlwaysPinned = alwaysPinnedPaths.some((path) => !sanitizedUserPinnedTabs.includes(path))
    if (migrationPathsToAdd.length > 0 || addedAutoPins.length > 0 || (hasPersistedPinnedTabs && missingAlwaysPinned)) {
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
      // Desktop sidebar is always expanded; mobile starts as a closed drawer.
      setIsOpen(!mobile)
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
      setActive(navItemKey(item))
      navigate(item.path)
    }

    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const alwaysPinnedPaths = mainNavItems.filter((item) => item.alwaysPinned && item.path).map((item) => item.path)

  const togglePinnedItem = async (item) => {
    if (!isAdminNav || !item?.path || !adminMainPathSet.has(item.path) || item.alwaysPinned) return

    const previousPinnedPaths = pinnedAdminPaths
    const isUnpinning = previousPinnedPaths.includes(item.path)
    const toggledPaths = isUnpinning
      ? previousPinnedPaths.filter((path) => path !== item.path)
      : [...previousPinnedPaths, item.path]
    const nextPinnedPaths = [...new Set([...alwaysPinnedPaths, ...toggledPaths])]
    const tracksAutoPin = isAutoPinNavItem(item)
    const previousDismissed = tracksAutoPin ? isAutoPinDismissed(item.path) : false

    setPinnedAdminPaths(nextPinnedPaths)
    if (tracksAutoPin) setAutoPinDismissed(item.path, isUnpinning)

    try {
      const response = await authApi.updatePinnedTabs(nextPinnedPaths)
      if (Array.isArray(response?.pinnedTabs)) {
        const sanitizedPinnedTabs = [...new Set([
          ...alwaysPinnedPaths,
          ...response.pinnedTabs.filter((path) => typeof path === "string" && adminMainPathSet.has(path)),
        ])]
        setPinnedAdminPaths(sanitizedPinnedTabs)
      }
    } catch (error) {
      console.error("Failed to save pinned tabs:", error)
      setPinnedAdminPaths(previousPinnedPaths)
      if (tracksAutoPin) setAutoPinDismissed(item.path, previousDismissed)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setActiveAdminCategory(categoryId)

    const firstItem =
      categoryId === ADMIN_NAV_CATEGORY_HOME
        ? mainNavItems.find((item) => item.path === ADMIN_DASHBOARD_PATHS.home)
          || mainNavItems.find((item) => item.alwaysPinned)
          || mainNavItems.find((item) => item.path && pinnedAdminPaths.includes(item.path))
        : mainNavItems.find((item) => item.path && (item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS) === categoryId)

    if (!firstItem?.path) return

    setActive(navItemKey(firstItem))
    navigate(firstItem.path)
  }

  const headerTint = isCategorizedMode ? getCategoryTint(activeAdminCategory) : undefined
  const activeCategoryConfig = isCategorizedMode
    ? ADMIN_NAV_CATEGORIES.find((category) => category.id === activeAdminCategory)
    : null
  const headerTitle = activeCategoryConfig?.name || "SMS"
  const headerTitleColor = activeCategoryConfig ? `var(${activeCategoryConfig.colorVar})` : "var(--color-text-primary)"

  const renderPlainList = (items, { withPins = false, accent, tintBg } = {}) => (
    <div
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar px-4 py-3 motion-reduce:!transition-none"
      style={{
        backgroundColor: tintBg || undefined,
        transition: "background-color 450ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <ul className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={navItemKey(item)}
            item={item}
            isActive={isNavItemActive(item, location.pathname) || active === navItemKey(item)}
            showPinControl={withPins && !!item.path}
            isPinned={!!item.path && (item.alwaysPinned || pinnedAdminPaths.includes(item.path))}
            pinLocked={Boolean(item.alwaysPinned)}
            label={item.pinnedName && activeAdminCategory === ADMIN_NAV_CATEGORY_HOME ? item.pinnedName : undefined}
            accent={accent}
            onNavigate={handleNavigation}
            onTogglePin={togglePinnedItem}
          />
        ))}
      </ul>
      {withPins && items.length === 0 && (
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
          pinnedPaths={[...new Set([...alwaysPinnedPaths, ...pinnedAdminPaths])]}
          activePath={location.pathname}
          onNavigate={handleNavigation}
          onTogglePin={togglePinnedItem}
        />
      )
    }

    if (sidebarMode === SIDEBAR_MODE_WORKSPACE) {
      return (
        <WorkspaceNav
          items={mainNavItems}
          pinnedPaths={[...new Set([...alwaysPinnedPaths, ...pinnedAdminPaths])]}
          recentPaths={recentPaths}
          activePath={location.pathname}
          onNavigate={handleNavigation}
          onTogglePin={togglePinnedItem}
        />
      )
    }

    const categoryItems =
      activeAdminCategory === ADMIN_NAV_CATEGORY_HOME
        ? [
            ...mainNavItems.filter((item) => item.alwaysPinned && item.path),
            ...mainNavItems.filter((item) => item.path && pinnedAdminPaths.includes(item.path) && !item.alwaysPinned),
          ]
        : mainNavItems.filter((item) => (item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS) === activeAdminCategory)

    const activeCategoryConfig = ADMIN_NAV_CATEGORIES.find((category) => category.id === activeAdminCategory)
    const categoryAccent = `var(${activeCategoryConfig?.colorVar || "--color-primary"})`

    return renderPlainList(categoryItems, {
      withPins: true,
      accent: categoryAccent,
      tintBg: getCategoryTint(activeAdminCategory),
    })
  }

  return (
    <>
      <MobileHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        bottomNavItems={bottomNavItems}
        handleNavigation={handleNavigation}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/40 z-20 backdrop-blur-sm pt-16" onClick={() => setIsOpen(false)}></div>}

      <Surface shadow="sm" className={`fixed md:relative z-30 transition-all duration-300 ease-in-out bg-[var(--color-bg-primary)] border-r border-[var(--color-border-primary)] ${isRailMode ? "w-[308px] max-w-full" : "w-[280px]"} ${isOpen ? "left-0" : "-left-full md:left-0"} ${isMobile ? "mt-16 h-[calc(100vh-64px)]" : "h-screen"} overflow-hidden`}>
        <div className={`flex h-full ${isRailMode ? "flex-row" : "flex-col"}`}>
          {isRailMode && (
            <IconRail
              activeCategory={activeAdminCategory}
              onCategoryChange={handleCategoryChange}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onLogoClick={() => navigate("/")}
              user={user}
              profileItem={profileItem}
              logoutItem={logoutItem}
              isProfileActive={profileItem ? location.pathname === profileItem.path : false}
              onNavigate={handleNavigation}
              newCategoryIds={newCategoryIds}
              categoryCounts={categoryCounts}
            />
          )}

          <div className="flex flex-col h-full min-w-0 flex-1">
            {/* Title, mode switcher, and (in V1–V3) the theme toggle */}
            <Surface bg={headerTint} className={`relative z-20 border-b border-[var(--color-border-primary)] transition-[background-color,color] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isMobile ? "hidden" : ""} h-16 shrink-0`}>
              <div className="h-full flex items-center justify-between px-5 transition-all duration-200">
                <div className="cursor-pointer flex items-center group min-w-0" onClick={() => navigate("/")}>
                  <Text as="span" color={headerTitleColor} className="font-semibold text-lg tracking-tight truncate transition-[color,opacity] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:opacity-70">
                    {headerTitle}
                  </Text>
                </div>

                <HStack align="center" gap="var(--spacing-1-5)" className="shrink-0">
                  {isAdminNav && (
                    <SidebarModeSwitcher
                      mode={sidebarMode}
                      onChange={handleSidebarModeChange}
                    />
                  )}
                  {!isRailMode && (
                    <button
                      type="button"
                      onClick={toggleTheme}
                      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
                    >
                      {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                  )}
                </HStack>
              </div>
            </Surface>

            {/* Main navigation (layout depends on role + mode) */}
            {renderNavBody()}

            {/* Active hostel switcher (warden roles only) */}
            <HostelSwitcher />

            {/* Profile and logout — V4 keeps these on the left rail */}
            {!isRailMode && (
              <Surface bg={headerTint} className="border-t border-[var(--color-border-primary)] overflow-x-hidden transition-all duration-300 shrink-0 px-4 py-3">
                <ProfileCard
                  user={user}
                  profileItem={profileItem}
                  logoutItem={logoutItem}
                  isActive={profileItem ? location.pathname === profileItem.path : false}
                  onNavigate={handleNavigation}
                />
              </Surface>
            )}

            {/* V2 category bar — V4 uses the left rail instead */}
            {isCategorizedMode && !isRailMode && (
              <CategoryBar
                activeCategory={activeAdminCategory}
                onCategoryChange={handleCategoryChange}
                newCategoryIds={newCategoryIds}
                categoryCounts={categoryCounts}
              />
            )}
          </div>
        </div>
      </Surface>
    </>
  )
}

export default Sidebar
