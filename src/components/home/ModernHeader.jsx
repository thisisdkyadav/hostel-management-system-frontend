import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import { FiMenu, FiX, FiChevronDown, FiLogOut, FiUser, FiHome, FiBook, FiPhone, FiInfo } from "react-icons/fi"

const ModernHeader = () => {
  const { user, getHomeRoute, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const dropdownRef = useRef(null)
  const profileRef = useRef(null)

  const navItems = [
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
    { label: "Contact", icon: <FiPhone className="mr-2" />, path: "/" },
    { label: "About", icon: <FiInfo className="mr-2" />, path: "/" },
  ]

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
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-4"}`}>
      <div className="w-full max-w-screen-xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex justify-between items-center">
          {/* Improved Logo with hover effect */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative overflow-hidden transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-md">
              <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-6 md:h-8 z-10 relative" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-lg"></div>
            </div>
            <div className="text-gray-800">
              <h1 className="text-sm md:text-base font-bold">IIT INDORE</h1>
              <p className="text-xs md:text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Halls of Residence</p>
            </div>
          </Link>

          {/* Improved Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-3">
            {navItems.map((item, index) => (
              <div key={index} className="relative" ref={index === activeDropdown ? dropdownRef : null}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => handleDropdownToggle(index)}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 ${activeDropdown === index ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
                    >
                      {item.icon}
                      {item.label}
                      <FiChevronDown className={`ml-1 transform transition-transform duration-300 ${activeDropdown === index ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === index && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100 animate-fadeIn">
                        <div className="p-1">
                          {item.submenu.map((subItem, subIndex) => (
                            <a
                              key={subIndex}
                              href={subItem.path.startsWith("/") ? subItem.path : subItem.path}
                              target={subItem.path.startsWith("http") ? "_blank" : undefined}
                              rel={subItem.path.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-colors duration-200 rounded-lg m-1"
                            >
                              {subItem.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={item.path} className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center">
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
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                    isProfileOpen ? "bg-gradient-to-r from-blue-600 to-indigo-600 ring-4 ring-blue-100" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-indigo-600"
                  } shadow-md focus:outline-none`}
                  aria-label="User menu"
                >
                  {user.name?.charAt(0).toUpperCase() || <FiUser className="w-5 h-5" />}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100 animate-fadeIn">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link to={getHomeRoute()} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-colors duration-200 rounded-lg m-1" onClick={() => setIsProfileOpen(false)}>
                        <FiHome className="mr-3 text-gray-400" />
                        Dashboard
                      </Link>
                      <Link to={`${getHomeRoute()}/profile`} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-colors duration-200 rounded-lg m-1" onClick={() => setIsProfileOpen(false)}>
                        <FiUser className="mr-3 text-gray-400" />
                        My Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg m-1">
                        <FiLogOut className="mr-3 text-red-400" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2.5 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg">
                Login
              </Link>
            )}

            {/* Improved Mobile menu button */}
            <button className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-xl focus:outline-none text-gray-700 hover:bg-gray-100 transition-colors duration-300" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
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
      <div className={`lg:hidden bg-white/95 backdrop-blur-md overflow-hidden transition-all duration-500 ${isMenuOpen ? "max-h-screen border-t border-gray-100 shadow-lg" : "max-h-0"}`}>
        <div className="w-full max-w-screen-xl mx-auto px-6 md:px-8 lg:px-12 py-4 space-y-3">
          {navItems.map((item, index) => (
            <div key={index} className={`py-2 ${activeDropdown === index ? "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg" : ""}`}>
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
                        <a
                          key={subIndex}
                          href={subItem.path.startsWith("/") ? subItem.path : subItem.path}
                          target={subItem.path.startsWith("http") ? "_blank" : undefined}
                          rel={subItem.path.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="block py-2 px-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
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
              <Link to="/login" className="flex items-center justify-center w-full py-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white transition-colors duration-300 shadow-md" onClick={() => setIsMenuOpen(false)}>
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
