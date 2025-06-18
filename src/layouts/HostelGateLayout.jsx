import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUser, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaSignOutAlt, FaSearch, FaCalendarAlt, FaExchangeAlt, FaUserPlus, FaUserClock, FaTasks } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import WardenProvider, { useWarden } from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"

const HostelGateLayout = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

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
    { name: "Add Student Entry", icon: FaUserPlus, section: "main", path: "/hostel-gate" },
    { name: "Student Entries", icon: FaUserClock, section: "main", path: "/hostel-gate/entries" },
    { name: "Visitors", icon: FaUsers, section: "main", path: "/hostel-gate/visitors" },
    { name: "My Tasks", icon: FaTasks, section: "main", path: "/hostel-gate/my-tasks" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/hostel-gate/lost-and-found" },
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

export default HostelGateLayout
