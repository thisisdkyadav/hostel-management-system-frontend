import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa"
import { useAuth } from "../contexts/AuthProvider"
import { getMediaUrl } from "../utils/mediaUtils"
import usePwaMobile from "../hooks/usePwaMobile"
import useLayoutPreference from "../hooks/useLayoutPreference"

const MobileHeader = ({ isOpen, setIsOpen, bottomNavItems, handleNavigation }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPwaMobile } = usePwaMobile()
  const { layoutPreference } = useLayoutPreference()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  // Hide the mobile header completely if we're in PWA mobile mode for students
  // with bottombar preference. Must come after all hooks (Rules of Hooks).
  if (isPwaMobile && user?.role === "Student" && layoutPreference === "bottombar") {
    return null
  }

  // Safety check - if bottomNavItems is not provided, use an empty array
  const safeBottomNavItems = bottomNavItems || []
  const menuItems = safeBottomNavItems.filter((item) => item.name !== "Logout")
  const logoutItem = safeBottomNavItems.find((item) => item.name === "Logout")

  const selectItem = (item) => {
    if (handleNavigation) handleNavigation(item)
    setDropdownOpen(false)
  }

  return (
    <div
      className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-primary)]"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {/* Menu Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-200
          outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
          ${isOpen
            ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
            : "bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"}
        `}
      >
        {isOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      {/* HMS Logo Text */}
      <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
        <span className="text-[var(--color-primary)] font-bold text-xl tracking-tight">HMS</span>
      </div>

      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-label="User menu"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          className={`
            w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center overflow-hidden
            text-white font-semibold transition-all duration-200 hover:bg-[var(--color-primary-hover)]
            outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
            ${dropdownOpen ? "ring-2 ring-[var(--color-primary)]/30" : ""}
          `}
        >
          {user?.profileImage ? (
            <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-full h-full rounded-full object-cover" />
          ) : user?.name?.charAt(0).toUpperCase() ? (
            <span>{user.name.charAt(0).toUpperCase()}</span>
          ) : (
            <FaUserCircle className="text-lg" />
          )}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-60 bg-[var(--color-bg-primary)] rounded-xl z-50 border border-[var(--color-border-primary)] animate-fadeIn overflow-hidden"
            style={{ boxShadow: "var(--shadow-dropdown)" }}
          >
            {/* Signed-in user summary */}
            {user && (
              <div className="px-4 py-3 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-primary)]">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{user.name || "User"}</p>
                {user.email && <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>}
              </div>
            )}

            <div className="py-1.5 px-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  role="menuitem"
                  onClick={() => selectItem(item)}
                  className="w-full flex items-center px-2.5 py-2.5 rounded-lg text-sm font-medium text-left transition-colors duration-200 text-[var(--color-text-body)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)]"
                >
                  <item.icon size={16} strokeWidth={2} className="mr-3 shrink-0 text-[var(--color-text-muted)]" />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider rounded-md bg-[var(--color-success)]/10 text-[var(--color-success)]">
                      New
                    </span>
                  )}
                </button>
              ))}
            </div>

            {logoutItem && (
              <div className="py-1.5 px-1.5 border-t border-[var(--color-border-primary)]">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => selectItem(logoutItem)}
                  className="w-full flex items-center px-2.5 py-2.5 rounded-lg text-sm font-medium text-left transition-colors duration-200 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg-light)]"
                >
                  <logoutItem.icon size={16} strokeWidth={2} className="mr-3 shrink-0" />
                  <span className="flex-1 truncate">{logoutItem.name}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileHeader
