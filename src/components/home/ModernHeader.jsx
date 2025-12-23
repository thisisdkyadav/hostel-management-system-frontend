import React, { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import { FiMenu, FiX, FiChevronDown, FiLogOut, FiUser, FiHome, FiPhone, FiInfo, FiCode, FiBook, FiExternalLink } from "react-icons/fi"
import { FaUserCircle } from "react-icons/fa"
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
      icon: <FiBook className="modern-header-nav-icon" />,
      submenu: [
        { label: "Academic Calendar", path: "https://academic.iiti.ac.in/Document/2025/2024-25_Academic%20Calendar_Updated%20-%2029-1-2025.pdf" },
        { label: "Hostel Rules", path: "https://academic.iiti.ac.in/New_student/Hall%20of%20Residence%20Rules%20&%20Decl.pdf" },
        { label: "Dining Rules", path: "/" },
        { label: "Menu", path: "/" },
      ],
    },
    { label: "Contact", icon: <FiPhone className="modern-header-nav-icon" />, path: "/contact" },
    { label: "Dev Team", icon: <FiCode className="modern-header-nav-icon" />, path: "https://thisisdkyadav.github.io/hms-dev-team/", isExternal: true },
  ]

  const aboutNavItems = [
    { label: "Home", icon: <FiHome className="modern-header-nav-icon" />, path: "/" },
    { label: "Dev Team", icon: <FiCode className="modern-header-nav-icon" />, path: "https://thisisdkyadav.github.io/hms-dev-team/", isExternal: true },
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
    <header className={`modern-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="modern-header-container">
        <div className="modern-header-inner">
          {/* Logo */}
          <Link to="/" className="modern-header-logo">
            <div className="modern-header-logo-img-wrapper">
              <img src="/IITILogo.png" alt="IIT Indore Logo" className="modern-header-logo-img" />
            </div>
            <div className="modern-header-logo-text">
              <h1 className="modern-header-logo-title">IIT INDORE</h1>
              <p className="modern-header-logo-subtitle">Halls of Residence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="modern-header-nav">
            {navItems.map((item, index) => (
              <div key={index} className="modern-header-nav-item" ref={index === activeDropdown ? dropdownRef : null}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => handleDropdownToggle(index)}
                      className={`modern-header-nav-button ${activeDropdown === index ? "active" : ""}`}
                    >
                      {item.icon}
                      {item.label}
                      <FiChevronDown className={`modern-header-nav-chevron ${activeDropdown === index ? "open" : ""}`} />
                    </button>
                    {activeDropdown === index && (
                      <div className="modern-header-dropdown">
                        <div className="modern-header-dropdown-inner">
                          {item.submenu.map((subItem, subIndex) => (
                            <a
                              key={subIndex}
                              href={subItem.path}
                              target={subItem.path.startsWith("http") ? "_blank" : undefined}
                              rel={subItem.path.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="modern-header-dropdown-item"
                            >
                              {subItem.label}
                              {subItem.path.startsWith("http") && <FiExternalLink className="modern-header-dropdown-external-icon" />}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : item.isExternal ? (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modern-header-nav-link"
                  >
                    {item.icon}
                    {item.label}
                    <FiExternalLink className="modern-header-external-icon" />
                  </a>
                ) : (
                  <Link to={item.path} className="modern-header-nav-link">
                    {item.icon}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="modern-header-right">
            {user ? (
              <div className="modern-header-profile-wrapper" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`modern-header-profile-button ${isProfileOpen ? "active" : ""}`}
                  aria-label="User menu"
                >
                  {user?.profileImage ? (
                    <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="modern-header-profile-img" />
                  ) : user?.name?.charAt(0).toUpperCase() ? (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <FaUserCircle />
                  )}
                </button>

                {isProfileOpen && (
                  <div className="modern-header-profile-dropdown">
                    {/* User Info Header */}
                    <div className="modern-header-profile-header">
                      <div className="modern-header-profile-header-inner">
                        <div className="modern-header-profile-avatar">
                          {user?.profileImage ? (
                            <img src={getMediaUrl(user.profileImage)} alt={`${user.name}'s profile`} className="modern-header-profile-avatar-img" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="modern-header-profile-info">
                          <p className="modern-header-profile-name">{user.name}</p>
                          <p className="modern-header-profile-email">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="modern-header-profile-menu">
                      <Link to={getHomeRoute()} className="modern-header-profile-menu-item" onClick={() => setIsProfileOpen(false)}>
                        <FiHome className="modern-header-profile-menu-icon" />
                        <span>Dashboard</span>
                      </Link>
                      <Link to={`${getHomeRoute()}/profile`} className="modern-header-profile-menu-item" onClick={() => setIsProfileOpen(false)}>
                        <FiUser className="modern-header-profile-menu-icon" />
                        <span>My Profile</span>
                      </Link>

                      {/* Divider */}
                      <div className="modern-header-profile-divider"></div>

                      <button onClick={handleLogout} className="modern-header-profile-menu-item logout">
                        <FiLogOut className="modern-header-profile-menu-icon" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="modern-header-login-button">
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="modern-header-mobile-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className={`modern-header-mobile-icon ${isMenuOpen ? "hidden" : "visible"}`}>
                <FiMenu />
              </div>
              <div className={`modern-header-mobile-icon modern-header-mobile-icon-close ${isMenuOpen ? "visible" : "hidden"}`}>
                <FiX />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`modern-header-mobile-nav ${isMenuOpen ? "open" : ""}`}>
        <div className="modern-header-mobile-nav-inner">
          {navItems.map((item, index) => (
            <div key={index} className={`modern-header-mobile-nav-item ${activeDropdown === index ? "active" : ""}`}>
              {item.submenu ? (
                <>
                  <button onClick={() => handleDropdownToggle(index)} className="modern-header-mobile-nav-button">
                    <span className="modern-header-mobile-nav-button-text">
                      {item.icon}
                      {item.label}
                    </span>
                    <FiChevronDown className={`modern-header-nav-chevron ${activeDropdown === index ? "open" : ""}`} />
                  </button>

                  <div className={`modern-header-mobile-submenu ${activeDropdown === index ? "open" : ""}`}>
                    <div className="modern-header-mobile-submenu-inner">
                      {item.submenu.map((subItem, subIndex) => (
                        <a
                          key={subIndex}
                          href={subItem.path}
                          target={subItem.path.startsWith("http") ? "_blank" : undefined}
                          rel={subItem.path.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="modern-header-mobile-submenu-item"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              ) : item.isExternal ? (
                <a
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modern-header-mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                  <FiExternalLink className="modern-header-external-icon" />
                </a>
              ) : (
                <Link
                  to={item.path}
                  className="modern-header-mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile login button if user is not logged in */}
          {!user && (
            <div className="modern-header-mobile-login">
              <Link to="/login" className="modern-header-mobile-login-button" onClick={() => setIsMenuOpen(false)}>
                <FiUser className="modern-header-nav-icon" />
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
