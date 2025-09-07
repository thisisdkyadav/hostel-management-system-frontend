import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaSignOutAlt, FaTools, FaClipboardList, FaQrcode, FaTasks, FaCalendarAlt } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import { useAuth } from "../contexts/AuthProvider"

const MaintenanceLayout = () => {
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
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/maintenance" },
    { name: "Leaves", icon: FaCalendarAlt, section: "main", path: "/maintenance/leaves" },
    { name: "My Tasks", icon: FaTasks, section: "main", path: "/maintenance/my-tasks" },
    { name: "Attendance", icon: FaQrcode, section: "main", path: "/maintenance/attendance" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 min-h-screen">
      <Sidebar navItems={navItems} />
      <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
        <Outlet />
      </div>
    </div>
  )
}

export default MaintenanceLayout
