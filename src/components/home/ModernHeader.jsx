import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import { FiMenu, FiX, FiChevronDown, FiLogOut, FiUser, FiHome } from "react-icons/fi"

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
      submenu: [
        { label: "Academic Calendar", path: "https://academic.iiti.ac.in/Document/2025/2024-25_Academic%20Calendar_Updated%20-%2029-1-2025.pdf" },
        { label: "Hostel Rules", path: "https://academic.iiti.ac.in/New_student/Hall%20of%20Residence%20Rules%20&%20Decl.pdf" },
        { label: "Dining Rules", path: "/" },
        { label: "Menu", path: "/" },
      ],
    },
    
    { label: "Contact", path: "/" },
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
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"}`}>
      <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-12 mx-auto" style={{ margin: "0 auto" }}>
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/IITILogo.png" alt="IIT Indore Logo" className="h-10 md:h-12" />
            <div className="text-gray-800">
              <h1 className="text-sm md:text-base font-bold">IIT INDORE</h1>
              <p className="text-xs md:text-sm">Halls of Residence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <div key={index} className="relative group" ref={index === activeDropdown ? dropdownRef : null}>
                {item.submenu ? (
                  <>
                    <button onClick={() => handleDropdownToggle(index)} className="px-3 py-2 rounded-lg font-medium flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                      {item.label}
                      <FiChevronDown className={`ml-1 transform transition-transform ${activeDropdown === index ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === index && (
                      <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100">
                        <div className="py-2">
                          {item.submenu.map((subItem, subIndex) => (
                            <a
                              key={subIndex}
                              href={subItem.path.startsWith("/") ? subItem.path : subItem.path}
                              target={subItem.path.startsWith("http") ? "_blank" : undefined}
                              rel={subItem.path.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            >
                              {subItem.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={item.path} className="px-3 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Login/User Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 bg-blue-600 hover:bg-blue-700 ${isProfileOpen ? "ring-2 ring-blue-200" : ""} focus:outline-none`}>
                  {user.name?.charAt(0).toUpperCase() || <FiUser className="w-5 h-5" />}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100 animate-fadeIn">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to={getHomeRoute()} className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600" onClick={() => setIsProfileOpen(false)}>
                        <FiHome className="mr-2" />
                        Dashboard
                      </Link>
                      <Link to={`${getHomeRoute()}/profile`} className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600" onClick={() => setIsProfileOpen(false)}>
                        <FiUser className="mr-2" />
                        My Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50">
                        <FiLogOut className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 rounded-lg font-medium transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700">
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button className="lg:hidden text-2xl focus:outline-none text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden bg-white overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-screen border-t border-gray-100" : "max-h-0"}`}>
        <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-12 mx-auto py-4 space-y-4" style={{ margin: "0 auto" }}>
          {navItems.map((item, index) => (
            <div key={index} className="py-2">
              {item.submenu ? (
                <>
                  <button onClick={() => handleDropdownToggle(index)} className="w-full flex justify-between items-center text-gray-700 hover:text-blue-600 py-2">
                    <span className="font-medium">{item.label}</span>
                    <FiChevronDown className={`transition-transform ${activeDropdown === index ? "rotate-180" : ""}`} />
                  </button>

                  {activeDropdown === index && (
                    <div className="ml-4 mt-2 border-l-2 border-gray-100 pl-4 space-y-2">
                      {item.submenu.map((subItem, subIndex) => (
                        <a
                          key={subIndex}
                          href={subItem.path.startsWith("/") ? subItem.path : subItem.path}
                          target={subItem.path.startsWith("http") ? "_blank" : undefined}
                          rel={subItem.path.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="block py-2 text-gray-600 hover:text-blue-600"
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link to={item.path} className="block text-gray-700 hover:text-blue-600 py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}

export default ModernHeader
