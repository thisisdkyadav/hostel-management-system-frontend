import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  UserPlus,
  Clock,
  CheckSquare,
  Users,
  ListTodo,
  Search,
  LogOut
} from "lucide-react"
import { useAuth } from "../contexts/AuthProvider"

const SecurityLayout = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth ? useAuth() : { logout: () => { }, user: null }
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
    { name: "Add Student Entry", icon: UserPlus, section: "main", path: "/hostel-gate" },
    { name: "Student Entries", icon: Clock, section: "main", path: "/hostel-gate/entries" },
    { name: "Attendance", icon: CheckSquare, section: "main", path: "/hostel-gate/attendance" },
    { name: "Visitors", icon: Users, section: "main", path: "/hostel-gate/visitors" },
    { name: "My Tasks", icon: ListTodo, section: "main", path: "/hostel-gate/my-tasks" },
    { name: "Lost and Found", icon: Search, section: "main", path: "/hostel-gate/lost-and-found" },
    { name: "Logout", icon: LogOut, section: "bottom", action: handleLogout },
  ]

  const guardNavItems = [
    // { name: "Add Student Entry", icon: LayoutDashboard, section: "main", path: "/guard" },
    // { name: "Student Entries", icon: Clock, section: "main", path: "/guard/entries" },
    { name: "Attendance", icon: CheckSquare, section: "main", path: "/guard" },
    // { name: "Visitors", icon: Users, section: "main", path: "/guard/visitors" },
    { name: "My Tasks", icon: ListTodo, section: "main", path: "/guard/my-tasks" },
    { name: "Lost and Found", icon: Search, section: "main", path: "/guard/lost-and-found" },
    { name: "Logout", icon: LogOut, section: "bottom", action: handleLogout },
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
    <div className="flex flex-col md:flex-row min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }} >
      <Sidebar navItems={navItems} />
      <div className="flex-1 overflow-auto pt-16 md:pt-0" style={{ height: '100vh' }} >
        <Outlet />
      </div>
    </div>
  )
}

export default SecurityLayout
