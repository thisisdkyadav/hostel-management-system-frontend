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
    <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-primary)]" style={{ boxShadow: 'var(--shadow-sm)', }} >
      {/* Menu Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:bg-[var(--color-primary-hover)]"
      >
        {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* HMS Logo Text */}
      <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}
      >
        <span className="text-[var(--color-primary)] font-bold text-xl tracking-tight">HMS</span>
      </div>

      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`
            w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center 
            text-white font-bold transition-all duration-200 hover:bg-[var(--color-primary-hover)]
            focus:outline-none
            ${dropdownOpen ? "ring-2 ring-[var(--color-border-dark)]" : ""}
          `}
          aria-label="User menu"
        >
          {user?.profileImage ? (
            <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-full h-full rounded-full object-cover" />
          ) : user?.name?.charAt(0).toUpperCase() ? (
            <span className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</span>
          ) : (
            <FaUserCircle className="text-white text-lg" />
          )}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-primary)] rounded-xl z-50 py-2 border border-[var(--color-border-primary)] animate-fadeIn" style={{ boxShadow: 'var(--shadow-dropdown)', }} >
            {safeBottomNavItems.map((item) => (
              <div key={item.name} onClick={() => {
                if (handleNavigation) handleNavigation(item)
                setDropdownOpen(false)
              }}
                className={`
                  flex items-center px-4 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 mx-2 rounded-lg
                  ${item.name === "Logout"
                    ? "text-[var(--color-danger)] hover:bg-[var(--color-danger-bg-light)]"
                    : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)]"
                  }
                `}
              >
                <item.icon size={16} strokeWidth={2} className={`mr-3 ${item.name === "Logout" ? "text-[var(--color-danger)]" : "text-[var(--color-text-placeholder)]"}`} />
                <span className="flex-1">{item.name}</span>
                {item.isNew && (
                  <span
                    className="px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider rounded-full bg-[var(--color-success)] text-white animate-pulse"
                  >
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileHeader
