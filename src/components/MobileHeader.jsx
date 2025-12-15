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
    <div 
      className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 bg-white border-b border-[#e2e8f0]"
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Menu Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-10 h-10 bg-[#0b57d0] rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:bg-[#083ca8]"
      >
        {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* HMS Logo Text */}
      <div 
        className="flex items-center cursor-pointer" 
        onClick={() => navigate("/")}
      >
        <span className="text-[#0b57d0] font-bold text-xl tracking-tight">HMS</span>
      </div>

      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`
            w-10 h-10 bg-[#0b57d0] rounded-lg flex items-center justify-center 
            text-white font-bold transition-all duration-200 hover:bg-[#083ca8]
            focus:outline-none
            ${dropdownOpen ? "ring-2 ring-[#cbd5e1]" : ""}
          `}
          aria-label="User menu"
        >
          {user?.profileImage ? (
            <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-8 h-8 rounded-lg object-cover" />
          ) : user?.name?.charAt(0).toUpperCase() ? (
            <span className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</span>
          ) : (
            <FaUserCircle className="text-white text-lg" />
          )}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div 
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl z-50 py-2 border border-[#e2e8f0] animate-fadeIn"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            {safeBottomNavItems.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  if (handleNavigation) handleNavigation(item)
                  setDropdownOpen(false)
                }}
                className={`
                  flex items-center px-4 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 mx-2 rounded-lg
                  ${item.name === "Logout" 
                    ? "text-[#ef4444] hover:bg-[#fef2f2]" 
                    : "text-[#4a6085] hover:bg-[#e8f1fe] hover:text-[#0b57d0]"
                  }
                `}
              >
                <item.icon
                  className={`
                    text-base mr-3
                    ${item.name === "Logout" ? "text-[#ef4444]" : "text-[#8fa3c4]"}
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
