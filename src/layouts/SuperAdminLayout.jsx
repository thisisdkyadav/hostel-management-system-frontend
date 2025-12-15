import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUserCog, FaUser, FaKey, FaSignOutAlt } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import { useAuth } from "../contexts/AuthProvider"

const SuperAdminLayout = () => {
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
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/super-admin" },
    { name: "Admin Management", icon: FaUserCog, section: "main", path: "/super-admin/admins" },
    { name: "API Keys", icon: FaKey, section: "main", path: "/super-admin/api-keys" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/super-admin/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <div className="flex flex-col md:flex-row bg-[#f0f4f9] min-h-screen">
      <Sidebar navItems={navItems} />
      <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
        <Outlet />
      </div>
    </div>
  )
}

export default SuperAdminLayout
