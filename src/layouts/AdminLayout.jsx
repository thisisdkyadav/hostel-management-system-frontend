import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Building2,
  Users,
  Table2,
  Package,
  Bell,
  ListTodo,
  BedDouble,
  CalendarDays,
  MessageSquareWarning,
  CalendarOff,
  Search,
  MessageCircle,
  ShieldCheck,
  UserCog,
  UserCheck,
  ClipboardCheck,
  Shield,
  Wrench,
  UserPlus,
  KeyRound,
  Settings,
  User,
  LogOut
} from "lucide-react"
import AdminProvider from "../contexts/AdminProvider"
import { useAuth } from "../contexts/AuthProvider"

const AdminLayout = () => {
  const navigate = useNavigate()
  const { logout } = useAuth ? useAuth() : { logout: () => { } }

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
    { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/admin" },
    { name: "Hostels", icon: Building2, section: "main", path: "/admin/hostels", pathPattern: "^/admin/hostels(/.*)?$" },
    { name: "Students", icon: Users, section: "main", path: "/admin/students" },
    { name: "Sheet View", icon: Table2, section: "main", path: "/admin/sheet", isNew: true },
    { name: "Inventory", icon: Package, section: "main", path: "/admin/inventory" },
    { name: "Notifications", icon: Bell, section: "main", path: "/admin/notifications" },
    { name: "Task Management", icon: ListTodo, section: "main", path: "/admin/task-management" },
    { name: "Visitor Accomodation", icon: BedDouble, section: "main", path: "/admin/visitors" },
    { name: "Events", icon: CalendarDays, section: "main", path: "/admin/events" },
    { name: "Complaints", icon: MessageSquareWarning, section: "main", path: "/admin/complaints" },
    { name: "Leaves", icon: CalendarOff, section: "main", path: "/admin/leaves" },
    { name: "Lost and Found", icon: Search, section: "main", path: "/admin/lost-and-found" },
    { name: "Feedbacks", icon: MessageCircle, section: "main", path: "/admin/feedbacks" },
    { name: "HCU Staff", icon: ShieldCheck, section: "main", path: "/admin/administrators" },
    { name: "Wardens", icon: UserCog, section: "main", path: "/admin/wardens" },
    { name: "Associate Wardens", icon: UserCheck, section: "main", path: "/admin/associate-wardens" },
    { name: "Hostel Supervisors", icon: ClipboardCheck, section: "main", path: "/admin/hostel-supervisors" },
    { name: "Security", icon: Shield, section: "main", path: "/admin/security" },
    { name: "Maintenance Staff", icon: Wrench, section: "main", path: "/admin/maintenance" },
    { name: "Others", icon: UserPlus, section: "main", path: "/admin/others" },
    { name: "Update Password", icon: KeyRound, section: "main", path: "/admin/update-password" },
    { name: "Settings", icon: Settings, section: "main", path: "/admin/settings" },
    { name: "Profile", icon: User, section: "bottom", path: "/admin/profile" },
    { name: "Logout", icon: LogOut, section: "bottom", action: handleLogout },
  ]

  return (
    <AdminProvider>

      <div className="flex flex-col md:flex-row min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }} >
        <Sidebar navItems={navItems} />
        <div className="flex-1 overflow-auto pt-16 md:pt-0" style={{ height: '100vh' }} >
          <Outlet />
        </div>
      </div>
    </AdminProvider>
  )
}

export default AdminLayout
