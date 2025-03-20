import Sidebar from "../components/Sidebar"
import { Outlet } from "react-router-dom"
import { FaUser, FaCog, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaExclamationTriangle } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import SecurityProvider from "../contexts/SecurityProvider"

const SecurityLayout = () => {
  const navItems = [
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/guard" },
    { name: "Add Visitors", icon: FaClipboardList, section: "main", path: "/guard/visitors/add" },
    { name: "Visitors", icon: FaClipboardList, section: "main", path: "/guard/visitors" },
    { name: "Alerts", icon: FaExclamationTriangle, section: "main", path: "/guard/alerts", isAlert: true },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/guard/profile" },
    { name: "Settings", icon: FaCog, section: "bottom", path: "/guard/settings" },
  ]

  return (
    <SecurityProvider>
      <div className="flex bg-[#EFF3F4] min-h-screen">
        <Sidebar navItems={navItems} />
        <div className="flex-1 h-screen overflow-auto">
          <Outlet />
        </div>
      </div>
    </SecurityProvider>
  )
}

export default SecurityLayout
