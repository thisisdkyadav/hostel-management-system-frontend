import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaTools, FaUser, FaCog, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaSignOutAlt, FaShieldAlt, FaSearch, FaCalendarAlt, FaExchangeAlt, FaBell } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import AdminProvider from "../contexts/AdminProvider"
import { useAuth } from "../contexts/AuthProvider"
import { HiAnnotation } from "react-icons/hi"

const AdminLayout = () => {
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
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/admin" },
    { name: "Hostels", icon: FaBuilding, section: "main", path: "/admin/hostels", pathPattern: "^/admin/hostels(/.*)?$" },
    { name: "Students", icon: FaUsers, section: "main", path: "/admin/students" },
    { name: "Notifications", icon: FaBell, section: "main", path: "/admin/notifications" },
    { name: "Visitor Accomodation", icon: FaExchangeAlt, section: "main", path: "/admin/visitors" },
    { name: "Events", icon: FaCalendarAlt, section: "main", path: "/admin/events" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/admin/complaints" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/admin/lost-and-found" },
    { name: "Feedbacks", icon: HiAnnotation, section: "main", path: "/admin/feedbacks" },
    { name: "Wardens", icon: FaUserTie, section: "main", path: "/admin/wardens" },
    { name: "Associate Wardens", icon: FaUserTie, section: "main", path: "/admin/associate-wardens" },
    { name: "Hostel Supervisors", icon: FaUserTie, section: "main", path: "/admin/hostel-supervisors" },
    { name: "Security", icon: FaShieldAlt, section: "main", path: "/admin/security" },
    { name: "Maintenance Staff", icon: FaTools, section: "main", path: "/admin/maintenance" },
    { name: "Update Password", icon: FaCog, section: "main", path: "/admin/update-password" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/admin/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <AdminProvider>
      <div className="flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 min-h-screen">
        <Sidebar navItems={navItems} />
        <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
          <Outlet />
        </div>
      </div>
    </AdminProvider>
  )
}

export default AdminLayout
