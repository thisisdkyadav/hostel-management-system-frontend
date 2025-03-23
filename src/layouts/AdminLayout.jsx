import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUser, FaCog, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaSignOutAlt } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import AdminProvider from "../contexts/AdminProvider"
import { useAuth } from "../contexts/AuthProvider"

const AdminLayout = () => {
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
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/admin" },
    { name: "Hostels", icon: FaBuilding, section: "main", path: "/admin/hostels" },
    { name: "Wardens", icon: FaUserTie, section: "main", path: "/admin/wardens" },
    { name: "Students", icon: FaUsers, section: "main", path: "/admin/students" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/admin/complaints" },
    { name: "Security", icon: FaUser, section: "main", path: "/admin/security" },
    { name: "Lost and Found", icon: FaClipboardList, section: "main", path: "/admin/lost-and-found" },
    { name: "Events", icon: FaClipboardList, section: "main", path: "/admin/events" },
    { name: "Update Password", icon: FaCog, section: "main", path: "/admin/update-password" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/admin/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <AdminProvider>
      <div className="flex flex-col md:flex-row bg-[#EFF3F4] min-h-screen">
        <Sidebar navItems={navItems} />
        <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
          <Outlet />
        </div>
      </div>
    </AdminProvider>
  )
}

export default AdminLayout
