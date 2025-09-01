import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUser, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaSignOutAlt, FaSearch, FaCalendarAlt, FaExchangeAlt, FaBoxes, FaTasks, FaBell, FaFileSignature } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import WardenProvider, { useWarden } from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"
import { HiAnnotation } from "react-icons/hi"

const WardenLayout = () => {
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
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/warden" },
    { name: "Units and Rooms", icon: FaBuilding, section: "main", path: `/warden/hostels/${user?.hostel?.name}`, pathPattern: "^/warden/hostels(/.*)?$" },
    { name: "Students", icon: FaUsers, section: "main", path: "/warden/students" },
    { name: "Student Inventory", icon: FaBoxes, section: "main", path: "/warden/student-inventory" },
    { name: "My Tasks", icon: FaTasks, section: "main", path: "/warden/my-tasks" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/warden/lost-and-found" },
    { name: "Events", icon: FaCalendarAlt, section: "main", path: "/warden/events" },
    // { name: "Room Change Requests", icon: FaExchangeAlt, section: "main", path: "/warden/room-change-requests" },
    { name: "Visitors", icon: FaUserTie, section: "main", path: "/warden/visitors" },
    { name: "Notifications", icon: FaBell, section: "main", path: "/warden/notifications" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/warden/complaints" },
    { name: "Feedbacks", icon: HiAnnotation, section: "main", path: "/warden/feedbacks" },
    { name: "Undertakings", icon: FaFileSignature, section: "main", path: "/warden/undertakings" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/warden/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <WardenProvider>
      <div className="flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 min-h-screen">
        <Sidebar navItems={navItems} />
        <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
          <Outlet />
        </div>
      </div>
    </WardenProvider>
  )
}

export default WardenLayout
