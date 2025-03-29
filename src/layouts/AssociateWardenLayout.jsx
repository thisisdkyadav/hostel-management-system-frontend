import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUser, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaSignOutAlt, FaSearch, FaCalendarAlt, FaExchangeAlt } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import WardenProvider from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"
import { HiAnnotation } from "react-icons/hi"

const AssociateWardenLayout = () => {
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
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/associate-warden" },
    { name: "Units and Rooms", icon: FaBuilding, section: "main", path: "/associate-warden/units-and-rooms" },
    { name: "Students", icon: FaUsers, section: "main", path: "/associate-warden/students" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/associate-warden/lost-and-found" },
    { name: "Events", icon: FaCalendarAlt, section: "main", path: "/associate-warden/events" },
    { name: "Room Change Requests", icon: FaExchangeAlt, section: "main", path: "/associate-warden/room-change-requests" },
    { name: "Visitors", icon: FaUserTie, section: "main", path: "/associate-warden/visitors" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/associate-warden/complaints" },
    { name: "Feedbacks", icon: HiAnnotation, section: "main", path: "/associate-warden/feedbacks" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/associate-warden/profile" },
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

export default AssociateWardenLayout
