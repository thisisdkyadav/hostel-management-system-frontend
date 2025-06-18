import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaSignOutAlt, FaExclamationTriangle, FaSearch, FaUserPlus, FaClipboardList, FaUserClock, FaUsers, FaQrcode, FaTasks } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import { useAuth } from "../contexts/AuthProvider"

const SecurityLayout = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth ? useAuth() : { logout: () => {}, user: null }
  const isHostelGate = user?.role === "Hostel Gate"

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

  const hostelGateNavItems = [
    { name: "Add Student Entry", icon: MdSpaceDashboard, section: "main", path: "/hostel-gate" },
    { name: "Student Entries", icon: FaUserClock, section: "main", path: "/hostel-gate/entries" },
    { name: "Attendance", icon: FaQrcode, section: "main", path: "/hostel-gate/attendance" },
    { name: "Visitors", icon: FaUsers, section: "main", path: "/hostel-gate/visitors" },
    { name: "My Tasks", icon: FaTasks, section: "main", path: "/hostel-gate/my-tasks" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/hostel-gate/lost-and-found" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  const guardNavItems = [
    // { name: "Add Student Entry", icon: MdSpaceDashboard, section: "main", path: "/guard" },
    // { name: "Student Entries", icon: FaUserClock, section: "main", path: "/guard/entries" },
    { name: "Attendance", icon: FaQrcode, section: "main", path: "/guard" },
    // { name: "Visitors", icon: FaUsers, section: "main", path: "/guard/visitors" },
    { name: "My Tasks", icon: FaTasks, section: "main", path: "/guard/my-tasks" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/guard/lost-and-found" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  // const navItems = isHostelGate ? hostelGateNavItems : guardNavItems
  //   // { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/guard" },
  //   { name: isHostelGate ? "Student Entry" : "Add Student Entry", icon: FaUserPlus, section: "main", path: isHostelGate ? "/hostel-gate" : "/guard" },
  //   // { name: "Add Student Entry", icon: FaUserPlus, section: "main", path: "/guard/add-entry" },
  //   { name: "Student Entries", icon: FaUserClock, section: "main", path: isHostelGate ? "/hostel-gate/entries" : "/guard/entries" },
  //   { name: "Attendance", icon: FaQrcode, section: "main", path: isHostelGate ? "/hostel-gate/attendance" : "/guard/attendance" },
  //   // { name: "Add Visitors", icon: FaUserPlus, section: "main", path: "/guard/visitors/add" },
  //   { name: "Visitors", icon: FaUsers, section: "main", path: isHostelGate ? "/hostel-gate/visitors" : "/guard/visitors" },
  //   { name: "Lost and Found", icon: FaSearch, section: "main", path: isHostelGate ? "/hostel-gate/lost-and-found" : "/guard/lost-and-found" },
  //   // { name: "Alerts", icon: FaExclamationTriangle, section: "main", path: "/guard/alerts", isAlert: true },
  //   { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  // ]

  const navItems = isHostelGate ? hostelGateNavItems : guardNavItems

  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 min-h-screen">
      <Sidebar navItems={navItems} />
      <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
        <Outlet />
      </div>
    </div>
  )
}

export default SecurityLayout
