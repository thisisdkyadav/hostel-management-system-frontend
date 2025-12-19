import React, { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import { FiMenu, FiX, FiChevronDown, FiLogOut, FiUser, FiHome, FiPhone, FiInfo, FiCode, FiBook, FiExternalLink } from "react-icons/fi"
import { getMediaUrl } from "../../utils/mediaUtils"

const ModernHeader = () => {
  const { user, getHomeRoute, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const dropdownRef = useRef(null)
  const profileRef = useRef(null)
  const location = useLocation()
  const isAboutPage = location.pathname === "/about"

  // Different nav items based on current page
  const homeNavItems = [
    {
      label: "Resources",
      icon: <FiBook className="mr-2" />,
      submenu: [
        { label: "Academic Calendar", path: "https://academic.iiti.ac.in/Document/2025/2024-25_Academic%20Calendar_Updated%20-%2029-1-2025.pdf" },
        { label: "Hostel Rules", path: "https://academic.iiti.ac.in/New_student/Hall%20of%20Residence%20Rules%20&%20Decl.pdf" },
        { label: "Dining Rules", path: "/" },
        { label: "Menu", path: "/" },
      ],
    },
    { label: "Contact", icon: <FiPhone className="mr-2" />, path: "/contact" },
    { label: "Dev Team", icon: <FiCode className="mr-2" />, path: "https://thisisdkyadav.github.io/hms-dev-team/", isExternal: true },
  ]

  const aboutNavItems = [
    { label: "Home", icon: <FiHome className="mr-2" />, path: "/" },
    { label: "Dev Team", icon: <FiCode className="mr-2" />, path: "https://thisisdkyadav.github.io/hms-dev-team/", isExternal: true },
  ]

  const navItems = isAboutPage ? aboutNavItems : homeNavItems

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    setIsProfileOpen(false)

    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleDropdownToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index)
  }

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-900/5 py-2 border-b border-gray-100/50" : "bg-transparent py-4"}`}>
      <div className="w-full max-w-screen-xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex justify-between items-center">
          {/* Improved Logo with hover effect */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative overflow-hidden transition-all duration-300 transform group-hover:scale-105">
              <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-6 md:h-8 z-10 relative drop-shadow-sm" />
            </div>
            <div className="text-gray-800">
              <h1 className="text-sm md:text-base font-bold tracking-wide">IIT INDORE</h1>
              <p className="text-xs md:text-sm font-semibold text-blue-600">Halls of Residence</p>
            </div>
          </Link>

          {/* Improved Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-3">
            {navItems.map((item, index) => (
              <div key={index} className="relative" ref={index === activeDropdown ? dropdownRef : null}>
                {item.submenu ? (
                  <>
                    <button onClick={() => handleDropdownToggle(index)}
                      className={`px-4 py-2.5 rounded-2xl font-medium flex items-center transition-all duration-300 ${activeDropdown === index ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80"}`}
                    >
                      {item.icon}
                      {item.label}
                      <FiChevronDown className={`ml-1 transform transition-transform duration-300 ${activeDropdown === index ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === index && (
                      <div className="absolute right-0 mt-3 w-72 bg-white backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-900/15 overflow-hidden z-50 border border-gray-100 animate-fadeIn ring-1 ring-black/5">
                        <div className="p-2">
                          {item.submenu.map((subItem, subIndex) => (
                            <a key={subIndex} href={subItem.path} target={subItem.path.startsWith("http") ? "_blank" : undefined} rel={subItem.path.startsWith("http") ? "noopener noreferrer" : undefined} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-xl font-medium" >
                              {subItem.label}
                              {subItem.path.startsWith("http") && <FiExternalLink className="w-4 h-4 text-gray-400" />}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : item.isExternal ? (
                  <a href={item.path} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-2xl font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 flex items-center">
                    {item.icon}
                    {item.label}
                    <FiExternalLink className="ml-1.5 w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link to={item.path} className="px-4 py-2.5 rounded-2xl font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 flex items-center">
                    {item.icon}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Improved Login/User Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                    isProfileOpen ? "bg-blue-600 ring-4 ring-blue-100/80 scale-105" : "bg-blue-500 hover:bg-blue-600 hover:scale-105"
                  } shadow-md shadow-blue-500/25 focus:outline-none`}
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

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-900/15 overflow-hidden z-50 border border-gray-100 animate-fadeIn ring-1 ring-black/5">
                    {/* User Info Header */}
                    <div className="px-5 py-4 bg-blue-50/60 border-b border-blue-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-md shadow-blue-500/30">
                          {user?.profileImage ? (
                            <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="w-11 h-11 rounded-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      <Link to={getHomeRoute()} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-xl" onClick={() => setIsProfileOpen(false)}>
                        <FiHome className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <Link to={`${getHomeRoute()}/profile`} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-xl" onClick={() => setIsProfileOpen(false)}>
                        <FiUser className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                      
                      {/* Divider */}
                      <div className="my-2 mx-3 border-t border-gray-100"></div>
                      
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-all duration-200 rounded-xl">
                        <FiLogOut className="w-5 h-5 text-red-400" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2.5 rounded-2xl font-medium transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02]">
                Login
              </Link>
            )}

            {/* Improved Mobile menu button */}
            <button className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-xl focus:outline-none text-gray-700 hover:bg-gray-100 transition-colors duration-300" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              <div className={`transition-all duration-300 ${isMenuOpen ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"}`}>
                <FiMenu />
              </div>
              <div className={`absolute transition-all duration-300 ${isMenuOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"}`}>
                <FiX />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Improved Mobile Navigation */}
      <div className={`lg:hidden bg-white/98 backdrop-blur-xl overflow-hidden transition-all duration-500 ${isMenuOpen ? "max-h-screen border-t border-gray-100/80 shadow-xl shadow-gray-900/5" : "max-h-0"}`}>
        <div className="w-full max-w-screen-xl mx-auto px-6 md:px-8 lg:px-12 py-4 space-y-3">
          {navItems.map((item, index) => (
            <div key={index} className={`py-2 ${activeDropdown === index ? "bg-blue-50 rounded-lg" : ""}`}>
              {item.submenu ? (
                <>
                  <button onClick={() => handleDropdownToggle(index)} className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="font-medium flex items-center">
                      {item.icon}
                      {item.label}
                    </span>
                    <FiChevronDown className={`transition-transform duration-300 ${activeDropdown === index ? "rotate-180" : ""}`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === index ? "max-h-64 mt-2" : "max-h-0"}`}>
                    <div className="border-l-2 border-blue-200 ml-4 pl-4 space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <a key={subIndex} href={subItem.path} target={subItem.path.startsWith("http") ? "_blank" : undefined} rel={subItem.path.startsWith("http") ? "noopener noreferrer" : undefined} className="block py-2 px-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              ) : item.isExternal ? (
                <a href={item.path} target="_blank" rel="noopener noreferrer" className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
                  {item.icon}
                  {item.label}
                  <FiExternalLink className="ml-1.5 w-3.5 h-3.5" />
                </a>
              ) : (
                <Link to={item.path} className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile login button if user is not logged in */}
          {!user && (
            <div className="pt-3 border-t border-gray-100 mt-3">
              <Link to="/login" className="flex items-center justify-center w-full py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 shadow-md" onClick={() => setIsMenuOpen(false)}>
                <FiUser className="mr-2" />
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default ModernHeader
