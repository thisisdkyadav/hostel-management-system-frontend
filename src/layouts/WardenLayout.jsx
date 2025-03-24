import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUser, FaCog, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaExclamationTriangle, FaSignOutAlt } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import WardenProvider from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"

const WardenLayout = () => {
  const navigate = useNavigate()
  const { logout } = useAuth ? useAuth() : { logout: () => {} }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const navItems = [
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/warden" },
    { name: "Units and Rooms", icon: FaBuilding, section: "main", path: "/warden/units-and-rooms" },
    { name: "Students", icon: FaClipboardList, section: "main", path: "/warden/students" },
    { name: "Lost and Found", icon: FaClipboardList, section: "main", path: "/warden/lost-and-found" },
    { name: "Events", icon: FaClipboardList, section: "main", path: "/warden/events" },
    { name: "Room Change Requests", icon: FaClipboardList, section: "main", path: "/warden/room-change-requests" },
    { name: "Visitors", icon: FaUserTie, section: "main", path: "/warden/visitors" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/warden/complaints" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/warden/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <WardenProvider>
      <div className="flex flex-col md:flex-row bg-[#EFF3F4] min-h-screen">
        <Sidebar navItems={navItems} />
        <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
          <Outlet />
        </div>
      </div>
    </WardenProvider>
  )
}

export default WardenLayout
