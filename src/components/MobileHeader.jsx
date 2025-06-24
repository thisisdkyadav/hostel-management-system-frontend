import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa"
import { useAuth } from "../contexts/AuthProvider"
import { getMediaUrl } from "../utils/mediaUtils"
import usePwaMobile from "../hooks/usePwaMobile"

const LAYOUT_PREFERENCE_KEY = "student_layout_preference"

const MobileHeader = ({ isOpen, setIsOpen, bottomNavItems, handleNavigation }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPwaMobile } = usePwaMobile()
  const [layoutPreference, setLayoutPreference] = useState("sidebar")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  // Hide the mobile header completely if we're in PWA mobile mode for students with bottombar preference
  if (isPwaMobile && user?.role === "Student" && layoutPreference === "bottombar") {
    return null
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Safety check - if bottomNavItems is not provided, use an empty array
  const safeBottomNavItems = bottomNavItems || []

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-40 flex items-center justify-between px-4 border-b border-gray-100 shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#1360AB] text-white p-2.5 rounded-full shadow-lg">
        {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
        <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-8 w-auto object-contain" />
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center 
            text-white font-bold transition-all duration-200
            ${dropdownOpen ? "bg-[#0d4d8c] ring-2 ring-blue-200 shadow-md" : "bg-[#1360AB] hover:bg-[#0d4d8c] shadow-md border-2 border-white hover:border-blue-100"}
            focus:outline-none focus:ring-2 focus:ring-blue-300
          `}
          aria-label="User menu"
        >
          {user?.profileImage ? (
            <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-8 h-8 rounded-full object-cover" />
          ) : user?.name?.charAt(0).toUpperCase() ? (
            <span className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</span>
          ) : (
            <FaUserCircle className="text-white text-lg" />
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-1 border border-gray-100 animate-fadeIn">
            {safeBottomNavItems.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  if (handleNavigation) handleNavigation(item)
                  setDropdownOpen(false)
                }}
                className={`
                  flex items-center px-4 py-2 text-sm cursor-pointer transition-colors
                  ${item.name === "Logout" ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-[#1360AB]/10 hover:text-[#1360AB]"}
                `}
              >
                <item.icon
                  className={`
                    text-lg mr-2
                    ${item.name === "Logout" ? "text-red-500" : "text-[#1360AB]"}
                  `}
                />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileHeader
