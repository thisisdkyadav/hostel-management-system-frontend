import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import MobileHeader from "./MobileHeader"
import { useAuth } from "../contexts/AuthProvider"
import { wardenApi, associateWardenApi, hostelSupervisorApi } from "../services/apiService"
import { FaUserCircle, FaBuilding } from "react-icons/fa"
import { CgSpinner } from "react-icons/cg"
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
      setIsOpen(window.innerWidth >= 768)
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

    if (isProfile && isOpen && user) {
      return (
        <li
          key={item.name}
          onClick={() => handleNavigation(item)}
          className={`
            group relative my-1.5 rounded-xl transition-all duration-200 cursor-pointer
            ${isActiveItem ? "bg-[#1360AB] text-white shadow-md" : "text-gray-700 hover:bg-[#1360AB]/10"}
          `}
        >
          <div className={`flex items-center px-4 py-3 ${isActiveItem ? "" : "hover:text-[#1360AB]"}`}>
            <div className="min-w-10 h-10 rounded-full flex items-center justify-center overflow-hidden mr-3">
              {user.profileImage ? (
                <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-10 h-10 rounded-full object-cover" />
              ) : user.name?.charAt(0).toUpperCase() ? (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActiveItem ? "bg-white text-[#1360AB]" : "bg-[#1360AB] text-white"}`}>
                  <span className="font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              ) : (
                <FaUserCircle className={`text-2xl ${isActiveItem ? "text-white" : "text-[#1360AB]"}`} />
              )}
            </div>

            <div className="flex flex-col justify-center overflow-hidden">
              <span className={`text-sm font-medium truncate ${isActiveItem ? "text-white" : ""}`}>{user.name || "User"}</span>
              {user.email && <span className={`text-xs truncate ${isActiveItem ? "text-blue-100" : "text-gray-500"}`}>{user.email}</span>}
              {user.role && <span className={`text-xs truncate ${isActiveItem ? "text-blue-200" : "text-gray-400"}`}>{user.role}</span>}
            </div>
          </div>

          {isActiveItem && <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-2/3 bg-white rounded-r-md"></div>}
        </li>
      )
    }

    return (
      <li
        key={item.name}
        onClick={() => handleNavigation(item)}
        className={`
          group relative my-1.5 rounded-xl transition-all duration-200 cursor-pointer
          ${isActiveItem ? "bg-[#1360AB] text-white shadow-md" : "text-gray-700 hover:bg-[#1360AB]/10"}
          ${isLogout ? "hover:bg-red-50 hover:text-red-600" : ""}
        `}
      >
        <div
          className={`
          flex items-center px-4 py-3 
          ${isActiveItem ? "" : isLogout ? "hover:text-red-600" : "hover:text-[#1360AB]"}
        `}
        >
          <div className={`relative flex justify-center items-center ${isOpen ? "mr-3" : "mx-auto"}`}>
            <item.icon
              className={`
              text-xl
              ${isActiveItem ? "text-white" : isLogout ? "text-red-500" : "text-[#1360AB]"}
              ${!isActiveItem && !isLogout ? "group-hover:text-[#1360AB]" : ""}
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
              ${isLogout && !isActiveItem ? "text-red-500" : ""}
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

  return (
    <>
      <MobileHeader isOpen={isOpen} setIsOpen={setIsOpen} bottomNavItems={bottomNavItems} handleNavigation={handleNavigation} />

      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-20 backdrop-blur-sm pt-16" onClick={() => setIsOpen(false)}></div>}

      <div className={`fixed md:relative z-30 transition-all duration-300 ease-in-out bg-white shadow-lg border-r border-gray-100 ${isOpen ? "left-0" : "-left-full md:left-0"} ${isOpen ? "w-64" : "w-0 md:w-20"} ${isMobile ? "mt-16 h-[calc(100vh-64px)]" : "h-screen"}`}>
        <div className="flex flex-col h-full">
          <div className={`p-4 flex justify-center items-center border-b border-gray-100 ${isOpen ? "h-20" : "h-16"} ${isMobile ? "hidden" : ""} cursor-pointer`} onClick={() => navigate("/")}>
            {isOpen ? <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-10 w-auto object-contain" /> : <div className="w-10 h-10 rounded-full bg-[#1360AB] flex items-center justify-center text-white font-bold text-xs transition-all hover:bg-[#0d4d8c]">IITI</div>}
          </div>

          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            <ul className="space-y-1">{mainNavItems.map(renderNavItem)}</ul>
          </div>
          {isWardenRole && isOpen && assignedHostels && assignedHostels.length > 0 && (
            <div className="p-3 border-t border-gray-100">
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
            </div>
          )}

          <div className="p-3 border-t border-gray-100">
            <ul className="space-y-1">{bottomNavItems.map(renderNavItem)}</ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
