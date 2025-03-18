import Sidebar from "../components/Sidebar"
import { Outlet } from "react-router-dom"
import { FaUser, FaCog, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaExclamationTriangle } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"

const AdminLayout = () => {
  const navItems = [
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/admin" },
    { name: "Hostels", icon: FaBuilding, section: "main", path: "/admin/hostels" },
    { name: "Wardens", icon: FaUserTie, section: "main", path: "/admin/wardens" },
    { name: "Students", icon: FaUsers, section: "main", path: "/admin/students" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/admin/complaints" },
    // { name: "Alerts", icon: FaExclamationTriangle, section: "main", path: "/admin/alerts", isAlert: true },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/admin/profile" },
    { name: "Settings", icon: FaCog, section: "bottom", path: "/admin/settings" },
  ]

  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      <Sidebar navItems={navItems} />
      <div className="flex-1 h-screen overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
