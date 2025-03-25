import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUser, FaClipboardList, FaSignOutAlt, FaSearch, FaCalendarAlt } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import { useAuth } from "../contexts/AuthProvider"

const StudentLayout = () => {
  const navigate = useNavigate()
  const { logout } = useAuth ? useAuth() : { logout: () => {} }

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?")
    if (!confirmLogout) return

    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const navItems = [
    // { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/student" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/student/complaints" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/student/lost-and-found" },
    { name: "Events", icon: FaCalendarAlt, section: "main", path: "/student/events" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/student/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <div className="flex flex-col md:flex-row bg-[#EFF3F4] min-h-screen">
      <Sidebar navItems={navItems} />
      <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
        <Outlet />
      </div>
    </div>
  )
}

export default StudentLayout
