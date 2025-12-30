import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import {
  UserPlus,
  Clock,
  Keyboard,
  Users,
  ListTodo,
  Search,
  LogOut
} from "lucide-react"
import WardenProvider, { useWarden } from "../contexts/WardenProvider"
import QRScannerProvider from "../contexts/QRScannerProvider"
import NotificationProvider from "../contexts/NotificationProvider"
import { useAuth } from "../contexts/AuthProvider"

const HostelGateLayout = () => {
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
    { name: "Add Student Entry", icon: UserPlus, section: "main", path: "/hostel-gate" },
    { name: "Student Entries", icon: Clock, section: "main", path: "/hostel-gate/entries" },
    { name: "Scanner Entries", icon: Keyboard, section: "main", path: "/hostel-gate/scanner-entries" },
    { name: "Visitors", icon: Users, section: "main", path: "/hostel-gate/visitors" },
    { name: "My Tasks", icon: ListTodo, section: "main", path: "/hostel-gate/my-tasks" },
    { name: "Lost and Found", icon: Search, section: "main", path: "/hostel-gate/lost-and-found" },
    { name: "Logout", icon: LogOut, section: "bottom", action: handleLogout },
  ]

  return (
    <NotificationProvider>
      <QRScannerProvider>
        <div className="flex flex-col md:flex-row min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }} >
          <Sidebar navItems={navItems} />
          <div className="flex-1 overflow-auto pt-16 md:pt-0" style={{ height: '100vh' }} >
            <Outlet />
          </div>
        </div>
      </QRScannerProvider>
    </NotificationProvider>
  )
}

export default HostelGateLayout
