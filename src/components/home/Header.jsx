import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import IITI_Logo from "../../assets/logos/IITILogo.png"

const Header = () => {
  const { user, getHomeRoute } = useAuth()
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { logout } = useAuth ? useAuth() : { logout: () => {} }

  const handleLogout = async () => {
    setDropdownOpen(false)
    const confirmLogout = window.confirm("Are you sure you want to logout?")
    if (!confirmLogout) return

    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

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
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className={`${isScrolled ? "shadow-md" : ""} bg-white sticky top-0 z-50 transition-shadow duration-300`}>
      <div className="py-3 px-4 border-b border-gray-100">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={IITI_Logo} alt="IIT Indore Logo" className="h-12" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">INDIAN INSTITUTE OF TECHNOLOGY INDORE</h1>
              <p className="text-sm text-[#1360AB]">Halls of Residence</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    text-white font-bold transition-all duration-200
                    ${dropdownOpen ? "bg-[#0d4d8c] ring-2 ring-blue-200 shadow-md" : "bg-[#1360AB] hover:bg-[#0d4d8c] shadow-md border-2 border-white hover:border-blue-100"}
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                  `}
                >
                  {user?.name?.charAt(0).toUpperCase() || (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg z-50 py-1 border border-gray-100 animate-fadeIn">
                    <Link to={getHomeRoute()} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#1360AB]/10 hover:text-[#1360AB]" onClick={() => setDropdownOpen(false)}>
                      <svg className="w-4 h-4 mr-2 text-[#1360AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Dashboard</span>
                    </Link>
                    <Link to={`${getHomeRoute()}/profile`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#1360AB]/10 hover:text-[#1360AB]" onClick={() => setDropdownOpen(false)}>
                      <svg className="w-4 h-4 mr-2 text-[#1360AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </Link>
                    <div className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50" onClick={handleLogout}>
                      <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors shadow-sm">
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Toggle menu">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <nav className="bg-[#1360AB] text-white h-[60px] md:py-3">
        <div className="container mx-auto px-4 flex items-center h-full">
          <div className="md:flex justify-between items-center hidden w-full">
            <div className="flex space-x-6">
              <a href="https://www.iiti.ac.in/page/about-us" className="font-medium hover:text-yellow-200 transition-colors">
                About
              </a>
              <a href="https://www.iiti.ac.in/page/administration" className="font-medium hover:text-yellow-200 transition-colors">
                Administration
              </a>
              <a href="https://studentaffairs.iiti.ac.in/" className="font-medium hover:text-yellow-200 transition-colors">
                Students
              </a>
              <a href="https://facultyaffairs.iiti.ac.in/" className="font-medium hover:text-yellow-200 transition-colors">
                Faculty & Staff
              </a>
              <a href="https://academic.iiti.ac.in/" className="font-medium hover:text-yellow-200 transition-colors">
                Academics
              </a>
              <a href="https://academic.iiti.ac.in/admission.php" className="font-medium hover:text-yellow-200 transition-colors">
                Admissions
              </a>
              <a href="https://rnd.iiti.ac.in/" className="font-medium hover:text-yellow-200 transition-colors">
                Research
              </a>
              <a href="https://www.iiti.ac.in/page/campus-facilities" className="font-medium hover:text-yellow-200 transition-colors">
                Facilities
              </a>

              <div className="relative" onMouseEnter={() => setIsRulesOpen(true)} onMouseLeave={() => setIsRulesOpen(false)}>
                <button className="font-medium hover:text-yellow-200 transition-colors flex items-center" onClick={() => setIsRulesOpen(!isRulesOpen)}>
                  Rules
                  <svg className={`w-4 h-4 ml-1 transition-transform ${isRulesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isRulesOpen && (
                  <div className="absolute top-5 right-0 bg-white text-gray-800 min-w-[200px] rounded-lg shadow-lg z-10 mt-1 overflow-hidden">
                    <div className="py-1">
                      <a href="https://academic.iiti.ac.in/New_student/Hall%20of%20Residence%20Rules%20&%20Decl.pdf" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#E4F1FF] transition-colors">
                        Hostel Rules
                      </a>
                      <a href="https://hostel.iiti.ac.in/docs/Hostel%20Policies%20New%20Jan%2023.pdf" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-[#E4F1FF] transition-colors">
                        Hostel Policies
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`md:hidden flex flex-col space-y-2  pb-3 bg-[#1360AB] border-t border-blue-400 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 overflow-y-auto" : "max-h-0"}`}>
        {!user && (
    <Link to="/login" className="block text-center py-2 bg-[#1360AB] text-white rounded-md mx-4 hover:bg-[#0d4b86] transition-colors">
      Login
    </Link>
  )}
          <a href="https://www.iiti.ac.in/page/about-us" className="block text-center py-2 hover:bg-blue-700 transition-colors">
            About
          </a>
          <a href="https://www.iiti.ac.in/page/administration" className="block text-center py-2 hover:bg-blue-700 transition-colors">
            Administration
          </a>
          <a href="https://studentaffairs.iiti.ac.in/" className="block text-center py-2 hover:bg-blue-700 transition-colors">
            Students
          </a>
          <a href="https://facultyaffairs.iiti.ac.in/" className="block text-center py-2 hover:bg-blue-700 transition-colors">
            Faculty & Staff
          </a>
          <a href="https://academic.iiti.ac.in/" className="block text-center py-2 hover:bg-blue-700 transition-colors">
            Academics
          </a>
          <a href="https://academic.iiti.ac.in/admission.php" className="block text-center py-2 hover:bg-blue-700 transition-colors">
            Admissions
          </a>
          <a href="https://rnd.iiti.ac.in/" className="block text-center py-2 hover:bg-blue-700 transition-colors">
            Research
          </a>
          <a href="https://www.iiti.ac.in/page/campus-facilities" className="block text-center py-2 hover:bg-blue-700 transition-colors">
            Facilities
          </a>

          <div className="text-center">
            <button onClick={() => setIsRulesOpen(!isRulesOpen)} className="w-full py-2 hover:bg-blue-700 transition-colors flex items-center justify-center">
              Rules
              <svg className={`w-4 h-4 ml-1 transition-transform ${isRulesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isRulesOpen && (
              <div className="bg-blue-800 text-white mt-1 rounded-md">
                <a href="https://academic.iiti.ac.in/New_student/Hall%20of%20Residence%20Rules%20&%20Decl.pdf" className="block px-4 py-2 hover:bg-blue-700 transition-colors">
                  Hostel Rules
                </a>
                <a href="https://hostel.iiti.ac.in/docs/Hostel%20Policies%20New%20Jan%2023.pdf" className="block px-4 py-2 hover:bg-blue-700 transition-colors">
                  Hostel Policies
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
