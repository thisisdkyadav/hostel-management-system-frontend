import Sidebar from "../components/Sidebar"
import { Outlet } from "react-router-dom"
import { FaUser, FaCog, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaExclamationTriangle } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import WardenProvider from "../contexts/WardenProvider"

const AdminLayout = () => {
  const navItems = [
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/warden" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/warden/complaints" },
    { name: "Polls", icon: FaClipboardList, section: "main", path: "/warden/polls" },
    { name: "Data", icon: FaClipboardList, section: "main", path: "/warden/data" },
    { name: "Students", icon: FaClipboardList, section: "main", path: "/warden/students" },
    { name: "Analytics", icon: FaClipboardList, section: "main", path: "/warden/analytics" },
    { name: "Staff", icon: FaUserTie, section: "main", path: "/warden/staff" },
    // { name: "Alerts", icon: FaExclamationTriangle, section: "main", path: "/warden/alerts", isAlert: true },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/warden/profile" },
    { name: "Settings", icon: FaCog, section: "bottom", path: "/warden/settings" },
  ]

  return (
    <WardenProvider>
      <div className="flex bg-[#EFF3F4] min-h-screen">
        <Sidebar navItems={navItems} />
        <div className="flex-1 h-screen overflow-auto">
          <Outlet />
        </div>
      </div>
    </WardenProvider>
  )
}

export default AdminLayout
