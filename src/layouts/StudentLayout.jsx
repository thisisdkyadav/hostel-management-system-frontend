import Sidebar from "../components/Sidebar"
import BottomBar from "../components/BottomBar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUser, FaClipboardList, FaSignOutAlt, FaSearch, FaCalendarAlt, FaBell, FaUserFriends, FaIdCard } from "react-icons/fa"
import { MdOutlineSpaceDashboard, MdOutlineEvent, MdOutlineSearch } from "react-icons/md"
import { LuClipboardList } from "react-icons/lu"
import { useAuth } from "../contexts/AuthProvider"
import { HiAnnotation } from "react-icons/hi"
import { useEffect, useState } from "react"
import { notificationApi } from "../services/notificationApi"
import usePwaMobile from "../hooks/usePwaMobile"

const LAYOUT_PREFERENCE_KEY = "student_layout_preference"

const StudentLayout = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { isPwaMobile, isMobile, isStandalone } = usePwaMobile()
  const [layoutPreference, setLayoutPreference] = useState("sidebar") // Default to sidebar
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load layout preference from localStorage
  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem(LAYOUT_PREFERENCE_KEY)
      if (savedPreference && (savedPreference === "sidebar" || savedPreference === "bottombar")) {
        setLayoutPreference(savedPreference)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error loading layout preference:", error)
      setLoading(false)
    }
  }, [])

  const handleLogout = async () => {
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
    const fetchNotificationsCount = async () => {
      try {
        const data = await notificationApi.getActiveNotificationsCount()
        setNotificationsCount(data.activeCount || 0)
      } catch (error) {
        console.error("Failed to fetch notifications count:", error)
      }
    }

    fetchNotificationsCount()
  }, [])

  // All navigation items
  const allNavItems = [
    { name: "Dashboard", icon: MdOutlineSpaceDashboard, section: "main", path: "/student" },
    { name: "Complaints", icon: LuClipboardList, section: "main", path: "/student/complaints" },
    { name: "Lost and Found", icon: MdOutlineSearch, section: "main", path: "/student/lost-and-found" },
    { name: "Events", icon: MdOutlineEvent, section: "main", path: "/student/events" },
    { name: "Visitors", icon: FaUserFriends, section: "main", path: "/student/visitors" },
    { name: "Feedbacks", icon: HiAnnotation, section: "main", path: "/student/feedbacks" },
    { name: "Notifications", icon: FaBell, section: "main", path: "/student/notifications", badge: notificationsCount },
    { name: "Security", icon: FaUser, section: "main", path: "/student/security" },
    { name: "ID Card", icon: FaIdCard, section: "main", path: "/student/id-card" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/student/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  // For the PWA bottom bar, we need 4 main items and the rest will be in the dropdown
  const pwaBottomBarMainItems = [
    { name: "Home", icon: MdOutlineSpaceDashboard, path: "/student" },
    { name: "Complaints", icon: LuClipboardList, path: "/student/complaints" },
    { name: "Lost & Found", icon: MdOutlineSearch, path: "/student/lost-and-found" },
    { name: "Events", icon: MdOutlineEvent, path: "/student/events" },
  ]

  // Hidden items for the PWA bottom bar dropdown
  const pwaBottomBarHiddenItems = allNavItems.filter((item) => !pwaBottomBarMainItems.some((mainItem) => mainItem.path === item.path))

  // Standard sidebar items for non-PWA view
  const sidebarNavItems = [
    { name: "Dashboard", icon: MdOutlineSpaceDashboard, section: "main", path: "/student" },
    { name: "Complaints", icon: LuClipboardList, section: "main", path: "/student/complaints" },
    { name: "Lost and Found", icon: MdOutlineSearch, section: "main", path: "/student/lost-and-found" },
    { name: "Events", icon: MdOutlineEvent, section: "main", path: "/student/events" },
    { name: "Visitors", icon: FaUserFriends, section: "main", path: "/student/visitors" },
    { name: "Feedbacks", icon: HiAnnotation, section: "main", path: "/student/feedbacks" },
    { name: "Notifications", icon: FaBell, section: "main", path: "/student/notifications", badge: notificationsCount },
    { name: "Security", icon: FaUser, section: "main", path: "/student/security" },
    { name: "ID Card", icon: FaIdCard, section: "main", path: "/student/id-card" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/student/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  // Navigation handler
  const handleNavigation = (item) => {
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }
  }

  // If still loading, don't render anything yet to avoid flashing
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  // Determine which layout to show based on preferences and device
  // Use a safer approach to determine layout
  let showBottomBar = false

  if (user && user.role === "Student" && isMobile) {
    if (isStandalone) {
      // For installed PWA, respect user preference
      showBottomBar = layoutPreference === "bottombar"
    } else if (isPwaMobile) {
      // For mobile browser PWA view, always use bottom bar
      showBottomBar = true
    }
  }

  const showSidebar = !showBottomBar

  return (
    <div className={`flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 min-h-screen ${showBottomBar ? "pwa-container" : ""}`}>
      {showSidebar && <Sidebar navItems={sidebarNavItems} />}

      <div className={`flex-1 h-screen overflow-auto ${showBottomBar ? "pb-16 pwa-bottom-padding" : "pt-16 md:pt-0"}`}>
        <Outlet />
      </div>

      {showBottomBar && <BottomBar mainNavItems={pwaBottomBarMainItems} hiddenNavItems={pwaBottomBarHiddenItems} handleNavigation={handleNavigation} />}
    </div>
  )
}

export default StudentLayout
