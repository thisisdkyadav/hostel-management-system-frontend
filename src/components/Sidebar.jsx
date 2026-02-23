import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Pin } from "lucide-react"
import MobileHeader from "./MobileHeader"
import { useAuth } from "../contexts/AuthProvider"
import { FaUserCircle } from "react-icons/fa"
import { HiMenuAlt2, HiMenuAlt3 } from "react-icons/hi"
import { getMediaUrl } from "../utils/mediaUtils"
import usePwaMobile from "../hooks/usePwaMobile"
import useLayoutPreference from "../hooks/useLayoutPreference"
import HostelSwitcher from "./sidebar/HostelSwitcher"
import { authApi } from "../service"
import {
  ADMIN_NAV_CATEGORIES,
  ADMIN_NAV_CATEGORY_HOME,
  ADMIN_NAV_CATEGORY_HOSTELS,
  ADMIN_NAV_CATEGORY_DINING,
  isCsoAdminSubRole
} from "../constants/navigationConfig"

const ADMIN_DEFAULT_PINNED_PATHS = ["/admin", "/admin/hostels", "/admin/students", "/admin/sheet", "/admin/complaints"]
const ADMIN_SIDEBAR_V2_TOGGLE_KEY = "admin_sidebar_legacy_enabled"

/**
 * The categorized admin sidebar is now the default.
 * The "V1" toggle switches back to the old flat nav.
 * Remove this system later by:
 * 1) Deleting ADMIN_SIDEBAR_V2_TOGGLE_KEY and the isLegacySidebarEnabled state/effects.
 * 2) Replacing useCategorizedAdminNav checks with isAdmin in this file.
 * 3) Removing the "V1" toggle button from the header.
 */

const ADMIN_CATEGORY_ACTIVE_STYLES = {
  home: "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-[var(--shadow-button-active)]",
  hostels: "bg-emerald-600 text-white border-emerald-600 shadow-[var(--shadow-button-active)]",
  "student-affairs": "bg-amber-500 text-white border-amber-500 shadow-[var(--shadow-button-active)]",
  staff: "bg-sky-600 text-white border-sky-600 shadow-[var(--shadow-button-active)]",
  dining: "bg-rose-600 text-white border-rose-600 shadow-[var(--shadow-button-active)]",
}

/**
 * Light background tints for the sidebar bottom sections (profile + category controls).
 * These give a subtle, ambient "zone" feel for the active category.
 * Home uses no tint (transparent/default white).
 */
const ADMIN_CATEGORY_BG_TINTS = {
  home: "transparent",
  hostels: "rgba(5, 150, 105, 0.15)",
  "student-affairs": "rgba(245, 158, 11, 0.15)",
  staff: "rgba(2, 132, 199, 0.15)",
  dining: "rgba(225, 29, 72, 0.15)",
}

/**
 * Icon colors for inactive (unselected) category buttons.
 * Each category shows its brand color on the icon when not selected.
 */
const ADMIN_CATEGORY_INACTIVE_ICON_COLORS = {
  home: "text-[var(--color-primary)]",
  hostels: "text-emerald-600",
  "student-affairs": "text-amber-500",
  staff: "text-sky-600",
  dining: "text-rose-600",
}

const Sidebar = ({ navItems }) => {
  const [active, setActive] = useState("")
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeAdminCategory, setActiveAdminCategory] = useState(ADMIN_NAV_CATEGORY_HOME)
  const [pinnedAdminPaths, setPinnedAdminPaths] = useState([])
  const [isLegacySidebarEnabled, setIsLegacySidebarEnabled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isPwaMobile } = usePwaMobile()
  const { layoutPreference } = useLayoutPreference()
  const isAdmin = user?.role === "Admin"
  const isRestrictedCsoAdmin = isAdmin && isCsoAdminSubRole(user)
  const useCategorizedAdminNav = isAdmin && !isLegacySidebarEnabled && !isRestrictedCsoAdmin

  // Set data-admin-category on <html> so non-sidebar components (e.g. PageHeader) can read it
  useEffect(() => {
    if (useCategorizedAdminNav) {
      document.documentElement.setAttribute("data-admin-category", activeAdminCategory)
    } else {
      document.documentElement.removeAttribute("data-admin-category")
    }
    return () => document.documentElement.removeAttribute("data-admin-category")
  }, [activeAdminCategory, useCategorizedAdminNav])

  const adminMainPathsSignature = (navItems || [])
    .filter((item) => item.section === "main" && item.path)
    .map((item) => item.path)
    .join("|")

  // Skip sidebar rendering for student PWA in mobile mode with bottombar preference
  if (user?.role === "Student" && isPwaMobile && layoutPreference === "bottombar") {
    return null
  }

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

  useEffect(() => {
    if (!isAdmin) {
      setIsLegacySidebarEnabled(false)
      return
    }

    if (typeof window === "undefined") return
    const storedValue = window.localStorage.getItem(ADMIN_SIDEBAR_V2_TOGGLE_KEY)
    // Default to categorized nav (V2) — legacy is off unless explicitly set
    setIsLegacySidebarEnabled(storedValue === "true")
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || typeof window === "undefined") return
    window.localStorage.setItem(ADMIN_SIDEBAR_V2_TOGGLE_KEY, String(isLegacySidebarEnabled))
  }, [isAdmin, isLegacySidebarEnabled])

  useEffect(() => {
    if (!useCategorizedAdminNav) {
      setActiveAdminCategory(ADMIN_NAV_CATEGORY_HOME)
      setPinnedAdminPaths([])
      return
    }

    const adminMainNavItems = (navItems || []).filter((item) => item.section === "main" && item.path)
    const validPaths = new Set(adminMainNavItems.map((item) => item.path))
    const fallbackPins = ADMIN_DEFAULT_PINNED_PATHS.filter((path) => validPaths.has(path))
    const safeFallbackPins = fallbackPins.length > 0 ? fallbackPins : validPaths.has("/admin") ? ["/admin"] : []
    const hasPersistedPinnedTabs = Array.isArray(user?.pinnedTabs)
    const userPinnedTabs = hasPersistedPinnedTabs ? user.pinnedTabs.filter((path) => typeof path === "string" && validPaths.has(path)) : []
    const sanitizedUserPinnedTabs = [...new Set(userPinnedTabs)]

    setPinnedAdminPaths(hasPersistedPinnedTabs ? sanitizedUserPinnedTabs : safeFallbackPins)
    setActiveAdminCategory(ADMIN_NAV_CATEGORY_HOME)
  }, [useCategorizedAdminNav, adminMainPathsSignature, user?.pinnedTabs])

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

  // Safety check - if navItems is not provided, return null
  if (!navItems || !Array.isArray(navItems) || navItems.length === 0) {
    return null
  }

  const mainNavItems = navItems.filter((item) => item.section === "main")
  const bottomNavItems = navItems.filter((item) => item.section === "bottom")
  const adminMainPathSet = new Set(mainNavItems.filter((item) => item.path).map((item) => item.path))
  const filteredMainNavItems = useCategorizedAdminNav
    ? activeAdminCategory === ADMIN_NAV_CATEGORY_HOME
      ? mainNavItems.filter((item) => item.path && pinnedAdminPaths.includes(item.path))
      : mainNavItems.filter((item) => (item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS) === activeAdminCategory)
    : mainNavItems

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
    if (!useCategorizedAdminNav || !item?.path || !adminMainPathSet.has(item.path)) return

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

  const getFirstNavItemForCategory = (categoryId) => {
    if (!useCategorizedAdminNav) return null

    if (categoryId === ADMIN_NAV_CATEGORY_HOME) {
      return mainNavItems.find((item) => item.path && pinnedAdminPaths.includes(item.path)) || null
    }

    return (
      mainNavItems.find(
        (item) => item.path && (item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS) === categoryId
      ) || null
    )
  }

  const handleCategoryChange = (categoryId) => {
    setActiveAdminCategory(categoryId)

    const firstItem = getFirstNavItemForCategory(categoryId)
    if (!firstItem?.path) return

    setActive(firstItem.name)
    navigate(firstItem.path)
  }

  const renderAdminCategorySection = () => {
    if (!useCategorizedAdminNav) return null

    return (
      <div
        className={`border-t border-[var(--color-border-primary)] transition-all duration-300 ${isOpen ? "px-4 py-3" : "px-2 py-3"}`}
        style={{
          backgroundColor: ADMIN_CATEGORY_BG_TINTS[activeAdminCategory] || ADMIN_CATEGORY_BG_TINTS.home,
        }}
      >
        <div className={isOpen ? "grid grid-cols-5 gap-2" : "flex flex-col gap-1.5"}>
          {ADMIN_NAV_CATEGORIES.map((category) => {
            const isActiveCategory = activeAdminCategory === category.id
            const activeCategoryClass = ADMIN_CATEGORY_ACTIVE_STYLES[category.id] || ADMIN_CATEGORY_ACTIVE_STYLES.home
            const inactiveIconColor = ADMIN_CATEGORY_INACTIVE_ICON_COLORS[category.id] || "text-[var(--color-text-muted)]"
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`
                  h-10 rounded-xl flex items-center justify-center transition-all duration-200
                  ${isActiveCategory ? `${activeCategoryClass} shadow-md` : `bg-white ${inactiveIconColor} hover:scale-105 active:scale-95`}
                `}
                title={category.name}
                aria-label={category.name}
              >
                <category.icon size={17} strokeWidth={isActiveCategory ? 2.2 : 1.8} />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderNavItem = (item) => {
    const isActiveItem = active === item.name
    const isLogout = item.name === "Logout"
    const isProfile = item.name === "Profile"
    const isPinnedItem = !!item.path && pinnedAdminPaths.includes(item.path)
    const showPinControl = useCategorizedAdminNav && isOpen && item.section === "main" && item.path


    // Don't render profile and logout separately in the bottom section when sidebar is open
    if ((isProfile || isLogout) && isOpen) {
      return null
    }

    return (
      <li
        key={item.name}
        onClick={() => handleNavigation(item)}
        title={!isOpen ? item.name : ""}
        className={`
          group relative rounded-xl transition-all duration-200 cursor-pointer
          ${isActiveItem ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:shadow-sm"}
        `}
      >
        <div className={`flex items-center ${isOpen ? "px-4 py-3" : "px-3 py-3 justify-center"}`}>
          <div className={`relative flex justify-center items-center ${isOpen ? "mr-3" : ""}`}>
            <item.icon size={19} strokeWidth={1.8} className={`transition-all duration-200 ${isActiveItem ? "text-white" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]"}`} />

            {item?.badge > 0 && (
              <div className="absolute -top-2 -right-2 flex items-center justify-center">
                <div
                  className={` min-w-5 h-5 px-1 rounded-full bg-[var(--color-danger)] text-white text-xs font-semibold flex items-center justify-center shadow-md ${item.badge > 99 ? "min-w-6" : ""}
                `}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </div>
              </div>
            )}
          </div>

          {isOpen && (
            <div className={`flex items-center gap-2 flex-1 min-w-0 ${showPinControl ? "pr-8" : ""}`}>
              <span className={`text-[0.875rem] font-medium whitespace-nowrap transition-all duration-200 ${isActiveItem ? "text-white" : "group-hover:text-[var(--color-text-primary)]"}`}>{item.name}</span>
              {item.isNew && (
                <span
                  className={`
                    px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide rounded-md
                    ${isActiveItem ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600"}
                  `}
                >
                  New
                </span>
              )}
            </div>
          )}

          {showPinControl && (
            <button
              onClick={(event) => {
                event.stopPropagation()
                togglePinnedItem(item)
              }}
              className={`
                absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200
                ${isPinnedItem
                  ? isActiveItem
                    ? "opacity-100 text-white bg-white/20"
                    : "opacity-100 text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : isActiveItem
                    ? "opacity-0 group-hover:opacity-100 text-white/80 hover:bg-white/20"
                    : "opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-tertiary)]"
                }
              `}
              title={isPinnedItem ? "Unpin from Home" : "Pin to Home"}
              aria-label={isPinnedItem ? `Unpin ${item.name} from Home` : `Pin ${item.name} to Home`}
            >
              <Pin size={13} strokeWidth={2} className={isPinnedItem ? "fill-current" : ""} />
            </button>
          )}
          {/* NEW indicator dot when sidebar is collapsed */}
          {!isOpen && item.isNew && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)" }} />}
        </div>
      </li>
    )
  }

  const renderProfileSection = () => {
    if (!user) return null

    const profileItem = bottomNavItems.find((item) => item.name === "Profile")
    const logoutItem = bottomNavItems.find((item) => item.name === "Logout")
    const isProfileActive = active === "Profile"

    if (!isOpen) {
      // Minimized view - show just profile icon
      return (
        <div className="relative group" title={user.name || "Profile"}>
          <div
            onClick={() => profileItem && handleNavigation(profileItem)}
            className={`
              relative rounded-xl transition-all duration-200 cursor-pointer p-2 flex justify-center
              ${isProfileActive ? "bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/25" : "hover:bg-[var(--color-bg-hover)]"}
            `}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ring-2 transition-all duration-200 ${isProfileActive ? "ring-white/30" : "ring-[var(--color-border-primary)] group-hover:ring-[var(--color-primary)]/30"}`}>
              {user.profileImage ? (
                <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-full h-full object-cover" />
              ) : user.name?.charAt(0).toUpperCase() ? (
                <div className={`w-full h-full flex items-center justify-center font-semibold text-sm ${isProfileActive ? "bg-white text-[var(--color-primary)]" : "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white"}`}>{user.name.charAt(0).toUpperCase()}</div>
              ) : (
                <FaUserCircle className={`text-2xl ${isProfileActive ? "text-white" : "text-[var(--color-primary)]"}`} />
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="relative">
        <div
          onClick={() => profileItem && handleNavigation(profileItem)}
          className={`
            group relative rounded-2xl transition-all duration-200 cursor-pointer
            ${isProfileActive ? "bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/20" : "bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)]"}
          `}
        >
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center flex-1 min-w-0">
              <div className="relative mr-3 flex-shrink-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden ring-2 transition-all duration-200 ${isProfileActive ? "ring-white/30" : "ring-white"}`}>
                  {user.profileImage ? (
                    <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-full h-full object-cover" />
                  ) : user.name?.charAt(0).toUpperCase() ? (
                    <div className={`w-full h-full flex items-center justify-center font-semibold ${isProfileActive ? "bg-white text-[var(--color-primary)]" : "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white"}`}>{user.name.charAt(0).toUpperCase()}</div>
                  ) : (
                    <FaUserCircle className={`text-2xl ${isProfileActive ? "text-white" : "text-[var(--color-primary)]"}`} />
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                <span className={`text-[0.875rem] font-semibold truncate ${isProfileActive ? "text-white" : "text-[var(--color-text-primary)]"}`}>{user.name || "User"}</span>
                {user.email && <span className={`text-[0.75rem] truncate ${isProfileActive ? "text-white/75" : "text-[var(--color-text-muted)]"}`}>{user.email}</span>}
              </div>
            </div>

            {logoutItem && (
              <div className="relative flex-shrink-0 ml-2 group/logout">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNavigation(logoutItem)
                  }}
                  title="Logout"
                  className={`
                    w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                    ${isProfileActive ? "text-white/80 hover:text-white hover:bg-white/15" : "text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"}
                  `}
                  aria-label="Logout"
                >
                  <logoutItem.icon size={18} strokeWidth={1.8} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <MobileHeader isOpen={isOpen} setIsOpen={setIsOpen} bottomNavItems={bottomNavItems} handleNavigation={handleNavigation} />

      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-20 backdrop-blur-sm pt-16" onClick={() => setIsOpen(false)}></div>}

      <div
        className={`fixed md:relative z-30 transition-all duration-300 ease-in-out bg-gradient-to-b from-[var(--color-bg-primary)] to-[var(--color-bg-secondary)] ${isOpen ? "left-0" : "-left-full md:left-0"} ${isOpen ? "w-[280px]" : "w-0 md:w-[72px]"} ${isMobile ? "mt-16 h-[calc(100vh-64px)]" : "h-screen"} overflow-hidden`}
        style={{ boxShadow: "0 0 40px rgba(0, 0, 0, 0.06)" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div
            className={`border-b border-[var(--color-border-primary)] transition-all duration-300 ${isMobile ? "hidden" : ""} h-16`}
            style={{
              backgroundColor: useCategorizedAdminNav
                ? (ADMIN_CATEGORY_BG_TINTS[activeAdminCategory] || ADMIN_CATEGORY_BG_TINTS.home)
                : undefined,
            }}
          >
            <div className={`h-full flex items-center ${isOpen ? "justify-between px-5" : "justify-center px-3"} transition-all duration-200`}>
              {/* Text Logo - only show when expanded */}
              {isOpen && (
                <div className="cursor-pointer flex items-center group" onClick={() => navigate("/")}>
                  <span
                    className={`font-semibold text-lg tracking-tight transition-all duration-300 group-hover:opacity-70 ${useCategorizedAdminNav ? (ADMIN_CATEGORY_INACTIVE_ICON_COLORS[activeAdminCategory] || "text-[var(--color-text-primary)]") : "text-[var(--color-text-primary)]"}`}
                  >
                    {useCategorizedAdminNav
                      ? (ADMIN_NAV_CATEGORIES.find((c) => c.id === activeAdminCategory)?.name || "HMS")
                      : "HMS"}
                  </span>
                </div>
              )}

              {/* Toggle Button */}
              {isOpen ? (
                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <button
                      onClick={() => setIsLegacySidebarEnabled((prev) => !prev)}
                      title={isLegacySidebarEnabled ? "Switch to categorized nav" : "Switch to legacy flat nav"}
                      aria-label={isLegacySidebarEnabled ? "Switch to categorized nav" : "Switch to legacy flat nav"}
                      className={`
                        h-8 min-w-9 px-2 rounded-lg text-[9px] font-bold tracking-wider
                        flex items-center justify-center transition-all duration-200
                        ${isLegacySidebarEnabled
                          ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                          : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"
                        }
                      `}
                    >
                      V1
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    title="Minimize"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)] transition-all duration-200"
                  >
                    <HiMenuAlt2 className="text-[17px]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  title="Expand"
                  className="w-8 h-8 rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)] flex items-center justify-center transition-all duration-200"
                >
                  <HiMenuAlt3 className="text-[17px]" />
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <div className={`flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar ${isOpen ? "px-4 py-3" : "px-2 py-3"}`}>
            <ul className="space-y-1">{filteredMainNavItems.map(renderNavItem)}</ul>
            {useCategorizedAdminNav && filteredMainNavItems.length === 0 && isOpen && (
              <div className="mt-3 px-4 py-3 rounded-xl text-[0.75rem] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-light)]">
                {activeAdminCategory === ADMIN_NAV_CATEGORY_DINING ? "Coming Soon" : "No tabs here yet. Pin tabs from other categories to show them in Home."}
              </div>
            )}
          </div>

          {/* Active Hostel Switcher */}
          <HostelSwitcher isOpen={isOpen} />

          {/* Profile and Logout */}
          <div
            className={`border-t border-[var(--color-border-primary)] overflow-x-hidden transition-all duration-300 ${isOpen ? "px-4 py-3" : "px-2 py-3"}`}
            style={{
              backgroundColor: useCategorizedAdminNav
                ? (ADMIN_CATEGORY_BG_TINTS[activeAdminCategory] || ADMIN_CATEGORY_BG_TINTS.home)
                : undefined,
            }}
          >
            {renderProfileSection()}
          </div>

          {/* Admin category controls */}
          {renderAdminCategorySection()}
        </div>
      </div>
    </>
  )
}

export default Sidebar
