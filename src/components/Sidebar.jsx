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
          group relative rounded-[10px] transition-all duration-300 cursor-pointer border
          ${isOpen ? "my-[0.35rem]" : "my-1"}
          ${isActiveItem 
            ? "text-white border-transparent" 
            : "text-[#4a6085] border-transparent hover:bg-white/80 hover:border-[#d4e4fd] hover:text-[#0b57d0]"
          }
        `}
        style={isActiveItem ? {
          background: 'linear-gradient(135deg, #0b57d0, #3b7de8)',
          boxShadow: '0 4px 15px rgba(11, 87, 208, 0.3)',
        } : {}}
      >
        <div className={`flex items-center ${isOpen ? "px-[0.875rem] py-[0.7rem]" : "px-2 py-[0.7rem] justify-center"}`}>
          <div className={`relative flex justify-center items-center ${isOpen ? "mr-[0.65rem]" : ""}`}>
            <item.icon className={`text-base transition-colors duration-200 ${isActiveItem ? "text-white" : "text-[#8fa3c4] group-hover:text-[#0b57d0]"}`} style={{ width: '22px' }} />

            {item?.badge > 0 && (
              <div className="absolute -top-2 -right-2 flex items-center justify-center">
                <div
                  className={`
                  min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center shadow shadow-red-500/30
                  ${item.badge > 99 ? "min-w-6" : ""}
                `}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </div>
              </div>
            )}
          </div>

          {isOpen && <span className={`text-[0.85rem] font-medium whitespace-nowrap transition-all duration-200 ${isActiveItem ? "text-white" : ""}`}>{item.name}</span>}
        </div>

        {isActiveItem && <div className="absolute left-[4px] top-1/2 -translate-y-1/2 h-1/2 w-[3px] rounded-sm bg-white/70"></div>}
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
              ${isProfileActive ? "bg-[#1360AB] text-white shadow-lg shadow-[#1360AB]/20 border-[#1360AB]/70" : "text-slate-600 hover:bg-white/60 hover:border-slate-200 hover:text-[#1360AB]"}
            `}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
              {user.profileImage ? (
                <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-full h-full object-cover" />
              ) : user.name?.charAt(0).toUpperCase() ? (
                <div
                  className={`
                    w-full h-full flex items-center justify-center font-semibold
                    ${isProfileActive ? "bg-white text-[#1360AB]" : "bg-[#1360AB] text-white"}
                  `}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <FaUserCircle className={`text-2xl ${isProfileActive ? "text-white" : "text-[#0b57d0]"}`} />
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
            group relative rounded-xl transition-all duration-300 cursor-pointer border
            ${isProfileActive ? "text-white border-transparent" : "text-[#4a6085] border-transparent hover:bg-white/80 hover:border-[#d4e4fd]"}
          `}
          style={isProfileActive ? {
            background: 'linear-gradient(135deg, #0b57d0, #3b7de8)',
            boxShadow: '0 4px 15px rgba(11, 87, 208, 0.3)',
          } : {}}
        >
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center flex-1 min-w-0">
              <div className="relative mr-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-full h-full object-cover" />
                  ) : user.name?.charAt(0).toUpperCase() ? (
                    <div
                      className={`
                      w-full h-full flex items-center justify-center font-semibold
                      ${isProfileActive ? "bg-white text-[#0b57d0]" : ""}
                    `}
                      style={!isProfileActive ? {
                        background: 'linear-gradient(135deg, #0b57d0, #3b7de8)',
                        color: 'white'
                      } : {}}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <FaUserCircle className={`text-2xl ${isProfileActive ? "text-white" : "text-[#0b57d0]"}`} />
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                <span className={`text-[0.9rem] font-semibold truncate ${isProfileActive ? "text-white" : "text-[#0a1628]"}`}>{user.name || "User"}</span>
                {user.email && <span className={`text-xs truncate ${isProfileActive ? "text-white/80" : "text-[#4a6085]"}`}>{user.email}</span>}
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
                    ${isProfileActive 
                      ? "hover:bg-white/20 text-white border-transparent" 
                      : "border-transparent hover:border-[#fecaca] hover:bg-[#fef2f2] text-[#4a6085] hover:text-[#ef4444]"
                    }
                  `}
                  aria-label="Logout"
                >
                  <logoutItem.icon className="text-lg" />
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
        className={`fixed md:relative z-30 transition-all duration-300 ease-in-out border-r border-[#d4e4fd] ${isOpen ? "left-0" : "-left-full md:left-0"} ${isOpen ? "w-[260px]" : "w-0 md:w-20"} ${
          isMobile ? "mt-16 h-[calc(100vh-64px)]" : "h-screen"
        } overflow-hidden`}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(232,241,254,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '4px 0 20px rgba(11, 87, 208, 0.05)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className={`border-b border-[#d4e4fd] ${isMobile ? "hidden" : ""} h-16`} style={{ background: 'rgba(255,255,255,0.8)' }}>
            <div className={`h-full flex items-center ${isOpen ? "justify-between px-4" : "justify-center px-2"} transition-colors duration-200`}>
              {/* HMS Text Logo - only show when expanded */}
              {isOpen && (
                <div className="cursor-pointer flex items-center" onClick={() => navigate("/")}>
                  <span className="text-[#0b57d0] font-bold text-xl tracking-tight">HMS</span>
                </div>
              )}

              {/* Toggle Button */}
              {isOpen ? (
                <button onClick={() => setIsOpen(!isOpen)} title="Minimize" className="w-9 h-9 rounded-[10px] border border-[#d4e4fd] flex items-center justify-center text-[#4a6085] bg-white hover:bg-[#e8f1fe] hover:border-[#a8c9fc] hover:text-[#0b57d0] transition-all duration-200">
                  <HiMenuAlt2 className="text-[19px]" />
                </button>
              ) : (
                <button onClick={() => setIsOpen(!isOpen)} title="Expand" className="w-9 h-9 rounded-[10px] bg-white border border-[#d4e4fd] text-[#4a6085] hover:bg-[#e8f1fe] hover:text-[#0b57d0] hover:border-[#a8c9fc] flex items-center justify-center transition-all duration-200">
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
            <div className={`border-t border-slate-200/60 bg-white/70 backdrop-blur ${isOpen ? "p-3" : "p-2"}`}>
              {isOpen ? (
                <>
                  <div className="relative">
                    <select
                      id="activeHostelSelect"
                      value={activeHostelId || ""}
                      onChange={handleHostelChange}
                      disabled={isUpdatingHostel}
                      className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1360AB]/60 focus:border-[#1360AB]/60 bg-white/70 shadow-sm appearance-none pr-9 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {!activeHostelId && assignedHostels.length > 0 && (
                        <option value="" disabled>
                          Select Active Hostel
                        </option>
                      )}
                      {assignedHostels.map((hostel) => {
                        const hostelId = typeof hostel === "string" ? hostel : hostel?._id
                        const hostelName = typeof hostel === "string" ? `Hostel (${hostelId?.slice(-4) || "Unknown"})` : hostel?.name || "Unknown Hostel"
                        if (!hostelId) return null
                        return (
                          <option key={hostelId} value={hostelId}>
                            {hostelName}
                          </option>
                        )
                      })}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      {isUpdatingHostel ? (
                        <CgSpinner className="animate-spin text-[#1360AB]" />
                      ) : (
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative group" title="Active Hostel">
                  <div className="w-full py-3 flex justify-center">
                    <FaBuilding className="text-xl text-[#1360AB]" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile and Logout */}
          <div className={`border-t border-[#d4e4fd] space-y-2 overflow-x-hidden ${isOpen ? "px-[0.875rem] py-[0.875rem]" : "p-2"}`} style={{ background: 'rgba(255,255,255,0.8)' }}>
            {renderProfileSection()}
            {/* <ul className={`${isOpen ? "space-y-1.5" : "space-y-1"}`}>{bottomNavItems.filter((item) => item.name !== "Profile" && item.name !== "Logout").map(renderNavItem)}</ul> */}
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
