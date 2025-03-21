import Sidebar from "../components/Sidebar"
import { Outlet } from "react-router-dom"
import { FaUser, FaCog, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaExclamationTriangle } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
// import WardenProvider from "../contexts/WardenProvider"

const StudentLayout = () => {
  const navItems = [
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/student" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/student/complaints" },
    { name: "Lost and Found", icon: FaClipboardList, section: "main", path: "/student/lost-and-found" },
    { name: "Events", icon: FaClipboardList, section: "main", path: "/student/events" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/student/profile" },
    { name: "Settings", icon: FaCog, section: "bottom", path: "/student/settings" },
  ]

  return (
    // <WardenProvider>
    <div className="flex bg-[#EFF3F4] min-h-screen">
      <Sidebar navItems={navItems} />
      <div className="flex-1 h-screen overflow-auto">
        <Outlet />
      </div>
    </div>
    // </WardenProvider>
  )
}

export default StudentLayout
