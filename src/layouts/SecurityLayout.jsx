import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaSignOutAlt, FaExclamationTriangle, FaSearch, FaUserPlus, FaClipboardList, FaUserClock, FaUsers } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import SecurityProvider from "../contexts/SecurityProvider"
import { useAuth } from "../contexts/AuthProvider"

const SecurityLayout = () => {
  const navigate = useNavigate()
  const { logout } = useAuth ? useAuth() : { logout: () => {} }

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

  const navItems = [
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/guard" },
    { name: "Add Student Entry", icon: FaUserPlus, section: "main", path: "/guard/add-entry" },
    { name: "Student Entries", icon: FaUserClock, section: "main", path: "/guard/entries" },
    { name: "Add Visitors", icon: FaUserPlus, section: "main", path: "/guard/visitors/add" },
    { name: "Visitors", icon: FaUsers, section: "main", path: "/guard/visitors" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/guard/lost-and-found" },
    // { name: "Alerts", icon: FaExclamationTriangle, section: "main", path: "/guard/alerts", isAlert: true },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <SecurityProvider>
      <div className="flex flex-col md:flex-row bg-[#EFF3F4] min-h-screen">
        <Sidebar navItems={navItems} />
        <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
          <Outlet />
        </div>
      </div>
    </SecurityProvider>
  )
}

export default SecurityLayout
