import { useState, useRef, useEffect } from "react"
import IITI_Logo from "../assets/logos/IITILogo.png"
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa"
import { useAuth } from "../contexts/AuthProvider"

const MobileHeader = ({ isOpen, setIsOpen, bottomNavItems, handleNavigation }) => {
  const { user } = useAuth()

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

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-40 flex items-center justify-between px-4 border-b border-gray-100 shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#1360AB] text-white p-2.5 rounded-full shadow-lg">
        {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      <div className="flex items-center">
        <img src={IITI_Logo} alt="IIT Indore Logo" className="h-10 w-auto object-contain" />
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
          {user?.name?.charAt(0).toUpperCase() ? <span className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</span> : <FaUserCircle className="text-white text-lg" />}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-1 border border-gray-100 animate-fadeIn">
            {bottomNavItems.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  handleNavigation(item)
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
