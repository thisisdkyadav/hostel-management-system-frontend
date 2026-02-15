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
  ADMIN_NAV_CATEGORY_DINING
} from "../constants/navigationConfig"

const ADMIN_DEFAULT_PINNED_PATHS = ["/admin", "/admin/hostels", "/admin/students", "/admin/sheet", "/admin/complaints"]

const Sidebar = ({ navItems }) => {
  const [active, setActive] = useState("")
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeAdminCategory, setActiveAdminCategory] = useState(ADMIN_NAV_CATEGORY_HOME)
  const [pinnedAdminPaths, setPinnedAdminPaths] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isPwaMobile } = usePwaMobile()
  const { layoutPreference } = useLayoutPreference()
  const isAdmin = user?.role === "Admin"
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
  }, [isAdmin, adminMainPathsSignature, user?.pinnedTabs])

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
  const filteredMainNavItems = isAdmin
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
    if (!isAdmin || !item?.path || !adminMainPathSet.has(item.path)) return

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

  const renderAdminCategorySection = () => {
    if (!isAdmin) return null

    return (
      <div className={`border-t border-[var(--color-border-primary)] ${isOpen ? "px-[0.875rem] py-[0.75rem]" : "p-2"}`}>
        <div className={isOpen ? "grid grid-cols-5 gap-2" : "flex flex-col gap-2"}>
          {ADMIN_NAV_CATEGORIES.map((category) => {
            const isActiveCategory = activeAdminCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => setActiveAdminCategory(category.id)}
                className={`
                  h-9 rounded-[10px] border flex items-center justify-center transition-all duration-200
                  ${isActiveCategory ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-[var(--shadow-button-active)]" : "border-[var(--color-border-primary)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)]"}
                `}
                title={category.name}
                aria-label={category.name}
              >
                <category.icon size={16} strokeWidth={2.1} />
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
    const showPinControl = isAdmin && isOpen && item.section === "main" && item.path

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
          group relative rounded-[10px] transition-all duration-200 cursor-pointer
          ${isOpen ? "my-[0.35rem]" : "my-1"}
          ${isActiveItem ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-button-active)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-primary)] hover:shadow-sm"}
        `}
      >
        <div className={`flex items-center ${isOpen ? "px-[0.875rem] py-[0.7rem]" : "px-2 py-[0.7rem] justify-center"}`}>
          <div className={`relative flex justify-center items-center ${isOpen ? "mr-[0.65rem]" : ""}`}>
            <item.icon size={18} strokeWidth={2} className={`transition-colors duration-200 ${isActiveItem ? "text-white" : "text-[var(--color-text-light)] group-hover:text-[var(--color-primary)]"}`} />

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
            <div className={`flex items-center gap-2 flex-1 min-w-0 ${showPinControl ? "pr-7" : ""}`}>
              <span className={`text-[0.85rem] font-medium whitespace-nowrap transition-all duration-200 ${isActiveItem ? "text-white font-semibold" : ""}`}>{item.name}</span>
              {item.isNew && (
                <span
                  className={`
                    px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider rounded-full
                    ${isActiveItem ? "bg-white/20 text-white" : "bg-[var(--color-success)] text-white"}
                    animate-pulse
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
                absolute right-[0.65rem] top-1/2 -translate-y-1/2 w-5 h-5 rounded-[6px] flex items-center justify-center transition-all duration-200
                ${isPinnedItem
                  ? isActiveItem
                    ? "opacity-100 text-white bg-white/15"
                    : "opacity-100 text-[var(--color-primary)] bg-[var(--color-primary-bg)]"
                  : isActiveItem
                    ? "opacity-0 group-hover:opacity-100 text-white/85 hover:bg-white/15"
                    : "opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)]"
                }
              `}
              title={isPinnedItem ? "Unpin from Home" : "Pin to Home"}
              aria-label={isPinnedItem ? `Unpin ${item.name} from Home` : `Pin ${item.name} to Home`}
            >
              <Pin size={12} strokeWidth={2.2} className={isPinnedItem ? "fill-current" : ""} />
            </button>
          )}
          {/* NEW indicator dot when sidebar is collapsed */}
          {!isOpen && item.isNew && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" style={{ boxShadow: "var(--shadow-glow-success)" }} />}
        </div>

        {isActiveItem && <div className="absolute left-[4px] top-1/2 -translate-y-1/2 h-1/2 w-[3px] rounded-sm bg-white/80"></div>}
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
              relative rounded-xl transition-all duration-200 cursor-pointer py-3 px-2 flex justify-center border border-transparent
              ${isProfileActive ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20 border-[var(--color-primary)]/70" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-primary)]/60 hover:border-[var(--color-border-primary)] hover:text-[var(--color-primary)]"}
            `}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
              {user.profileImage ? (
                <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-full h-full object-cover" />
              ) : user.name?.charAt(0).toUpperCase() ? (
                <div className={` w-full h-full flex items-center justify-center font-semibold ${isProfileActive ? "bg-white text-[var(--color-primary)]" : "bg-[var(--color-primary)] text-white"} `}>{user.name.charAt(0).toUpperCase()}</div>
              ) : (
                <FaUserCircle className={`text-2xl ${isProfileActive ? "text-white" : "text-[var(--color-primary)]"}`} />
              )}
            </div>
            {isProfileActive && <div className="absolute left-[4px] top-1/2 -translate-y-1/2 h-1/2 w-[3px] rounded-sm bg-white/70"></div>}
          </div>
        </div>
      )
    }

    return (
      <div className="relative">
        <div
          onClick={() => profileItem && handleNavigation(profileItem)}
          className={`
            group relative rounded-xl transition-all duration-200 cursor-pointer border
            ${isProfileActive ? "bg-[var(--color-primary)] text-white border-transparent shadow-sm" : "text-[var(--color-text-muted)] border-transparent hover:bg-[var(--color-bg-tertiary)] hover:border-[var(--color-border-primary)]"}
          `}
        >
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center flex-1 min-w-0">
              <div className="relative mr-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-full h-full object-cover" />
                  ) : user.name?.charAt(0).toUpperCase() ? (
                    <div className={` w-full h-full flex items-center justify-center font-semibold ${isProfileActive ? "bg-white text-[var(--color-primary)]" : "bg-[var(--color-primary)] text-white"} `}>{user.name.charAt(0).toUpperCase()}</div>
                  ) : (
                    <FaUserCircle className={`text-2xl ${isProfileActive ? "text-white" : "text-[var(--color-primary)]"}`} />
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                <span className={`text-[0.9rem] font-semibold truncate ${isProfileActive ? "text-white" : "text-[var(--color-text-secondary)]"}`}>{user.name || "User"}</span>
                {user.email && <span className={`text-xs truncate ${isProfileActive ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>{user.email}</span>}
              </div>
            </div>

            {logoutItem && (
              <div className="relative flex-shrink-0 ml-3 group/logout">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNavigation(logoutItem)
                  }}
                  title="Logout"
                  className={`
                    w-9 h-9 rounded-[10px] flex items-center justify-center
                    transition-all duration-200 border
                    ${isProfileActive ? "hover:bg-white/20 text-white border-transparent" : "border-transparent hover:border-[var(--color-danger-light)] hover:bg-[var(--color-danger-bg-light)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"}
                  `}
                  aria-label="Logout"
                >
                  <logoutItem.icon size={18} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>

          {isProfileActive && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2/3 w-[6px] rounded-full bg-white/70 shadow-sm shadow-white/40"></div>}
        </div>
      </div>
    )
  }

  return (
    <>
      <MobileHeader isOpen={isOpen} setIsOpen={setIsOpen} bottomNavItems={bottomNavItems} handleNavigation={handleNavigation} />

      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-20 backdrop-blur-sm pt-16" onClick={() => setIsOpen(false)}></div>}

      <div
        className={`fixed md:relative z-30 transition-all duration-300 ease-in-out bg-[var(--color-bg-primary)] border-r border-[var(--color-border-primary)] ${isOpen ? "left-0" : "-left-full md:left-0"} ${isOpen ? "w-[260px]" : "w-0 md:w-20"} ${
          isMobile ? "mt-16 h-[calc(100vh-64px)]" : "h-screen"
        } overflow-hidden`}
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className={`border-b border-[var(--color-border-primary)] ${isMobile ? "hidden" : ""} h-16`}>
            <div className={`h-full flex items-center ${isOpen ? "justify-between px-4" : "justify-center px-2"} transition-colors duration-200`}>
              {/* HMS Text Logo - only show when expanded */}
              {isOpen && (
                <div className="cursor-pointer flex items-center" onClick={() => navigate("/")}>
                  <span className="text-[var(--color-primary)] font-bold text-xl tracking-tight">HMS</span>
                </div>
              )}

              {/* Toggle Button */}
              {isOpen ? (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  title="Minimize"
                  className="w-9 h-9 rounded-[10px] border border-[var(--color-border-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-primary-bg)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-primary)] transition-all duration-200"
                >
                  <HiMenuAlt2 className="text-[19px]" />
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  title="Expand"
                  className="w-9 h-9 rounded-[10px] bg-[var(--color-bg-primary)] border border-[var(--color-border-secondary)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)] hover:border-[var(--color-border-hover)] flex items-center justify-center transition-all duration-200"
                >
                  <HiMenuAlt3 className="text-[19px]" />
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-[0.875rem] py-[0.875rem] sidebar-scrollbar">
            <ul className="space-y-0">{filteredMainNavItems.map(renderNavItem)}</ul>
            {isAdmin && filteredMainNavItems.length === 0 && isOpen && (
              <div className="mt-2 px-2 py-2 rounded-lg text-[0.72rem] text-[var(--color-text-muted)] bg-[var(--color-bg-hover)]">
                {activeAdminCategory === ADMIN_NAV_CATEGORY_DINING ? "Coming Soon" : "No tabs here yet. Pin tabs from other categories to show them in Home."}
              </div>
            )}
          </div>

          {/* Active Hostel Switcher */}
          <HostelSwitcher isOpen={isOpen} />

          {/* Profile and Logout */}
          <div className={`border-t border-[var(--color-border-primary)] space-y-2 overflow-x-hidden ${isOpen ? "px-[0.875rem] py-[0.875rem]" : "p-2"}`}>{renderProfileSection()}</div>

          {/* Admin category controls */}
          {renderAdminCategorySection()}
        </div>
      </div>
    </>
  )
}

export default Sidebar
