import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import MobileHeader from "./MobileHeader"
import { useAuth } from "../contexts/AuthProvider"
import { wardenApi, associateWardenApi, hostelSupervisorApi } from "../services/apiService"
import { FaUserCircle, FaBuilding } from "react-icons/fa"
import { CgSpinner } from "react-icons/cg"
import { HiMenuAlt2, HiMenuAlt3 } from "react-icons/hi"
import { useWarden } from "../contexts/WardenProvider"
import { getMediaUrl } from "../utils/mediaUtils"
import usePwaMobile from "../hooks/usePwaMobile"
import Select from "./common/ui/Select"

const LAYOUT_PREFERENCE_KEY = "student_layout_preference"

const Sidebar = ({ navItems }) => {
  const [active, setActive] = useState("")
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isPwaMobile } = usePwaMobile()
  const [isUpdatingHostel, setIsUpdatingHostel] = useState(false)
  const [assignedHostels, setAssignedHostels] = useState([])
  const [activeHostelId, setActiveHostelId] = useState(null)
  const prevHostelIdRef = useRef(null)
  const [layoutPreference, setLayoutPreference] = useState("sidebar")

  const wardenContext = useWarden()
  const fetchProfile = wardenContext?.fetchProfile

  const isWardenRole = user?.role === "Warden" || user?.role === "Associate Warden" || user?.role === "Hostel Supervisor"

  // Load layout preference
  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem(LAYOUT_PREFERENCE_KEY)
      if (savedPreference) {
        setLayoutPreference(savedPreference)
      }
    } catch (error) {
      console.error("Error loading layout preference:", error)
    }
  }, [])

  // Skip sidebar rendering for student PWA in mobile mode with bottombar preference
  if (user?.role === "Student" && isPwaMobile && layoutPreference === "bottombar") {
    return null
  }

  useEffect(() => {
    if (isWardenRole && wardenContext) {
      const profileData = wardenContext?.profile || user
      const hostels = profileData?.hostels || profileData?.hostelIds || []
      const currentActiveId = profileData?.activeHostelId?._id || profileData?.activeHostelId || user?.hostel?._id

      setAssignedHostels(hostels)
      setActiveHostelId(currentActiveId)
    } else {
      setAssignedHostels([])
      setActiveHostelId(null)
    }
  }, [user, wardenContext?.profile, isWardenRole, wardenContext])

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

  const handleHostelChange = async (event) => {
    const newHostelId = event.target.value
    if (!newHostelId || newHostelId === activeHostelId) {
      return
    }

    setIsUpdatingHostel(true)
    try {
      if (user?.role === "Warden") {
        await wardenApi.setActiveHostel(newHostelId)
      } else if (user?.role === "Associate Warden") {
        await associateWardenApi.setActiveHostel(newHostelId)
      } else if (user?.role === "Hostel Supervisor") {
        await hostelSupervisorApi.setActiveHostel(newHostelId)
      }

      if (fetchProfile) {
        await fetchProfile()
      } else {
        console.warn("fetchProfile function not available from context.")
        alert("Active hostel updated (manual refresh might be needed).")
      }
    } catch (error) {
      console.error("Failed to update active hostel:", error)
      alert(`Error updating active hostel: ${error.message}`)
      event.target.value = activeHostelId
    } finally {
      setIsUpdatingHostel(false)
    }
  }

  const renderNavItem = (item) => {
    const isActiveItem = active === item.name
    const isLogout = item.name === "Logout"
    const isProfile = item.name === "Profile"

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
            <div className="flex items-center gap-2 flex-1 min-w-0">
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
            <ul className="space-y-0">{mainNavItems.map(renderNavItem)}</ul>
          </div>

          {/* Active Hostel */}
          {isWardenRole && assignedHostels && assignedHostels.length > 0 && (
            <div className={`border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/70 backdrop-blur ${isOpen ? "p-3" : "p-2"}`}>
              {isOpen ? (
                <>
                  <div className="relative">
                    <Select
                      id="activeHostelSelect"
                      value={activeHostelId || ""}
                      onChange={handleHostelChange}
                      disabled={isUpdatingHostel}
                      options={[
                        ...(!activeHostelId && assignedHostels.length > 0 ? [{ value: "", label: "Select Active Hostel", disabled: true }] : []),
                        ...assignedHostels
                          .map((hostel) => {
                            const hostelId = typeof hostel === "string" ? hostel : hostel?._id
                            const hostelName = typeof hostel === "string" ? `Hostel (${hostelId?.slice(-4) || "Unknown"})` : hostel?.name || "Unknown Hostel"
                            return { value: hostelId, label: hostelName }
                          })
                          .filter((opt) => opt.value),
                      ]}
                    />
                    {isUpdatingHostel && (
                      <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                        <CgSpinner className="animate-spin text-[var(--color-primary)]" />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="relative group" title="Active Hostel">
                  <div className="w-full py-3 flex justify-center">
                    <FaBuilding className="text-xl text-[var(--color-primary)]" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile and Logout */}
          <div className={`border-t border-[var(--color-border-primary)] space-y-2 overflow-x-hidden ${isOpen ? "px-[0.875rem] py-[0.875rem]" : "p-2"}`}>{renderProfileSection()}</div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
