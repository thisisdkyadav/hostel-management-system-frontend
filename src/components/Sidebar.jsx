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
          group relative my-1.5 rounded-xl transition-all duration-200 cursor-pointer
          ${isActiveItem ? "bg-[#1360AB] text-white shadow-md" : "text-gray-700 hover:bg-[#1360AB]/10"}
        `}
      >
        <div
          className={`
          flex items-center ${isOpen ? "px-4 py-3" : "px-2 py-3 justify-center"}
          ${isActiveItem ? "" : "hover:text-[#1360AB]"}
        `}
        >
          <div className={`relative flex justify-center items-center ${isOpen ? "mr-3" : ""}`}>
            <item.icon
              className={`
              text-xl
              ${isActiveItem ? "text-white" : "text-[#1360AB]"}
              ${!isActiveItem ? "group-hover:text-[#1360AB]" : ""}
            `}
            />

            {item?.badge > 0 && (
              <div className="absolute -top-2 -right-2 flex items-center justify-center">
                <div
                  className={`
                  min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center
                  ${item.badge > 99 ? "min-w-6" : ""}
                `}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </div>
              </div>
            )}
          </div>

          {isOpen && (
            <span
              className={`
              text-sm font-medium whitespace-nowrap transition-all duration-200
              ${!isActiveItem ? "group-hover:translate-x-1" : ""}
            `}
            >
              {item.name}
            </span>
          )}
        </div>

        {isActiveItem && <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-2/3 bg-white rounded-r-md"></div>}
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
              relative rounded-xl transition-all duration-200 cursor-pointer py-3 px-2 flex justify-center
              ${isProfileActive ? "bg-[#1360AB] text-white shadow-md" : "text-gray-700 hover:bg-[#1360AB]/10"}
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
                <FaUserCircle className={`text-2xl ${isProfileActive ? "text-white" : "text-[#1360AB]"}`} />
              )}
            </div>
            {isProfileActive && <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-2/3 bg-white rounded-r-md"></div>}
          </div>
        </div>
      )
    }

    return (
      <div className="relative">
        <div
          onClick={() => profileItem && handleNavigation(profileItem)}
          className={`
            group relative rounded-xl transition-all duration-200 cursor-pointer
            ${isProfileActive ? "bg-[#1360AB] text-white shadow-md" : "text-gray-700 hover:bg-[#1360AB]/10"}
          `}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center flex-1 min-w-0">
              <div className="relative mr-3 flex-shrink-0">
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
                    <FaUserCircle className={`text-2xl ${isProfileActive ? "text-white" : "text-[#1360AB]"}`} />
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
                <span className={`text-sm font-medium truncate ${isProfileActive ? "text-white" : "text-gray-900"}`}>{user.name || "User"}</span>
                {user.role && <span className={`text-xs truncate ${isProfileActive ? "text-blue-100" : "text-gray-500"}`}>{user.role}</span>}
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
                    w-9 h-9 rounded-lg flex items-center justify-center
                    transition-all duration-200
                    ${isProfileActive ? "hover:bg-white/20 text-white" : "hover:bg-red-50 text-gray-600 hover:text-red-600"}
                  `}
                  aria-label="Logout"
                >
                  <logoutItem.icon className="text-lg" />
                </button>
              </div>
            )}
          </div>

          {isProfileActive && <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-2/3 bg-white rounded-r-md"></div>}
        </div>
      </div>
    )
  }

  return (
    <>
      <MobileHeader isOpen={isOpen} setIsOpen={setIsOpen} bottomNavItems={bottomNavItems} handleNavigation={handleNavigation} />

      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-20 backdrop-blur-sm pt-16" onClick={() => setIsOpen(false)}></div>}

      <div className={`fixed md:relative z-30 transition-all duration-300 ease-in-out bg-white shadow-lg border-r border-gray-100 ${isOpen ? "left-0" : "-left-full md:left-0"} ${isOpen ? "w-64" : "w-0 md:w-20"} ${isMobile ? "mt-16 h-[calc(100vh-64px)]" : "h-screen"} overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className={`border-b border-gray-100 ${isMobile ? "hidden" : ""} h-16`}>
            <div className={`h-full flex items-center ${isOpen ? "justify-between px-3" : "justify-center px-2"} hover:bg-[#f6fbff]`}>
              {/* Logo - only show when expanded. smaller and paired with subtle label */}
              {isOpen && (
                <div className="cursor-pointer flex items-center" onClick={() => navigate("/")}>
                  <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-8 w-auto object-contain transition-all opacity-95" />
                  {/* <span className="ml-2 text-sm font-semibold text-[#1360AB]">Hostel</span> */}
                </div>
              )}

              {/* Toggle Button - refined sizing and visual weight */}
              {isOpen ? (
                <button onClick={() => setIsOpen(!isOpen)} title="Minimize" className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-[#1360AB] transition-all duration-200">
                  <HiMenuAlt2 className="text-lg" />
                </button>
              ) : (
                <button onClick={() => setIsOpen(!isOpen)} title="Expand" className="w-8 h-8 rounded-md bg-gray-100 text-gray-600 hover:bg-[#1360AB] hover:text-white flex items-center justify-center transition-all duration-200">
                  <HiMenuAlt3 className="text-lg" />
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin sidebar-scrollbar">
            <ul className="space-y-1">{mainNavItems.map(renderNavItem)}</ul>
          </div>

          {/* Active Hostel */}
          {isWardenRole && assignedHostels && assignedHostels.length > 0 && (
            <div className={`border-t border-gray-100 ${isOpen ? "p-3" : "p-2"}`}>
              {isOpen ? (
                <>
                  <label htmlFor="activeHostelSelect" className="block text-xs font-medium text-gray-500 mb-1.5 px-1">
                    Active Hostel
                  </label>
                  <div className="relative">
                    <select
                      id="activeHostelSelect"
                      value={activeHostelId || ""}
                      onChange={handleHostelChange}
                      disabled={isUpdatingHostel}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1360AB] focus:border-[#1360AB] bg-gray-50 appearance-none pr-8 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
                        <CgSpinner className="animate-spin text-gray-500" />
                      ) : (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
          <div className={`border-t border-gray-100 space-y-2 overflow-x-hidden ${isOpen ? "p-3" : "p-2"}`}>
            {renderProfileSection()}
            <ul className="space-y-1">{bottomNavItems.filter((item) => item.name !== "Profile" && item.name !== "Logout").map(renderNavItem)}</ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
