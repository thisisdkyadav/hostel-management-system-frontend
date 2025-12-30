import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarOff,
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
import WardenProvider from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"

const HostelSupervisorLayout = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

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
    { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/hostel-supervisor" },
    { name: "Units and Rooms", icon: Building2, section: "main", path: `/hostel-supervisor/hostels/${user?.hostel?.name}`, pathPattern: "^/hostel-supervisor/hostels(/.*)?$" },
    { name: "Students", icon: Users, section: "main", path: "/hostel-supervisor/students" },
    { name: "Leaves", icon: CalendarOff, section: "main", path: "/hostel-supervisor/leaves" },
    { name: "Student Inventory", icon: Package, section: "main", path: "/hostel-supervisor/student-inventory" },
    { name: "My Tasks", icon: ListTodo, section: "main", path: "/hostel-supervisor/my-tasks" },
    { name: "Lost and Found", icon: Search, section: "main", path: "/hostel-supervisor/lost-and-found" },
    { name: "Events", icon: CalendarDays, section: "main", path: "/hostel-supervisor/events" },
    // { name: "Room Change Requests", icon: FaExchangeAlt, section: "main", path: "/hostel-supervisor/room-change-requests" },
    { name: "Visitors", icon: UserRoundCheck, section: "main", path: "/hostel-supervisor/visitors" },
    { name: "Notifications", icon: Bell, section: "main", path: "/hostel-supervisor/notifications" },
    { name: "Complaints", icon: ClipboardList, section: "main", path: "/hostel-supervisor/complaints" },
    { name: "Feedbacks", icon: MessageCircle, section: "main", path: "/hostel-supervisor/feedbacks" },
    { name: "Undertakings", icon: FileSignature, section: "main", path: "/hostel-supervisor/undertakings" },
    { name: "Profile", icon: User, section: "bottom", path: "/hostel-supervisor/profile" },
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

export default HostelSupervisorLayout
