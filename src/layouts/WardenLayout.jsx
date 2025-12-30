import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  ListTodo,
  Search,
  CalendarDays,
  UserRoundCheck,
  Bell,
  ClipboardList,
  MessageCircle,
  FileSignature,
  User,
  LogOut
} from "lucide-react"
import WardenProvider, { useWarden } from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"

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
    { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/warden" },
    { name: "Units and Rooms", icon: Building2, section: "main", path: `/warden/hostels/${user?.hostel?.name}`, pathPattern: "^/warden/hostels(/.*)?$" },
    { name: "Students", icon: Users, section: "main", path: "/warden/students" },
    { name: "Student Inventory", icon: Package, section: "main", path: "/warden/student-inventory" },
    { name: "My Tasks", icon: ListTodo, section: "main", path: "/warden/my-tasks" },
    { name: "Lost and Found", icon: Search, section: "main", path: "/warden/lost-and-found" },
    { name: "Events", icon: CalendarDays, section: "main", path: "/warden/events" },
    // { name: "Room Change Requests", icon: FaExchangeAlt, section: "main", path: "/warden/room-change-requests" },
    { name: "Visitors", icon: UserRoundCheck, section: "main", path: "/warden/visitors" },
    { name: "Notifications", icon: Bell, section: "main", path: "/warden/notifications" },
    { name: "Complaints", icon: ClipboardList, section: "main", path: "/warden/complaints" },
    { name: "Feedbacks", icon: MessageCircle, section: "main", path: "/warden/feedbacks" },
    { name: "Undertakings", icon: FileSignature, section: "main", path: "/warden/undertakings" },
    { name: "Profile", icon: User, section: "bottom", path: "/warden/profile" },
    { name: "Logout", icon: LogOut, section: "bottom", action: handleLogout },
  ]

  return (
    <WardenProvider>
      <div className="flex flex-col md:flex-row min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }} >
        <Sidebar navItems={navItems} />
        <div className="flex-1 overflow-auto pt-16 md:pt-0" style={{ height: '100vh' }} >
          <Outlet />
        </div>
      </div>
    </WardenProvider>
  )
}

export default WardenLayout
