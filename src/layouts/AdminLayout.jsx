import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaTools, FaUser, FaCog, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaSignOutAlt, FaShieldAlt, FaSearch, FaCalendarAlt, FaExchangeAlt, FaBell, FaBoxes, FaTasks, FaUserShield } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import AdminProvider from "../contexts/AdminProvider"
import { useAuth } from "../contexts/AuthProvider"
import { HiAnnotation } from "react-icons/hi"

const AdminLayout = () => {
  const navigate = useNavigate()
  const { logout } = useAuth ? useAuth() : { logout: () => {} }

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
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/admin" },
    { name: "Hostels", icon: FaBuilding, section: "main", path: "/admin/hostels", pathPattern: "^/admin/hostels(/.*)?$" },
    { name: "Students", icon: FaUsers, section: "main", path: "/admin/students" },
    { name: "Inventory", icon: FaBoxes, section: "main", path: "/admin/inventory" },
    { name: "Notifications", icon: FaBell, section: "main", path: "/admin/notifications" },
    { name: "Task Management", icon: FaTasks, section: "main", path: "/admin/task-management" },
    { name: "Visitor Accomodation", icon: FaExchangeAlt, section: "main", path: "/admin/visitors" },
    { name: "Events", icon: FaCalendarAlt, section: "main", path: "/admin/events" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/admin/complaints" },
    { name: "Leaves", icon: FaCalendarAlt, section: "main", path: "/admin/leaves" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/admin/lost-and-found" },
    { name: "Feedbacks", icon: HiAnnotation, section: "main", path: "/admin/feedbacks" },
    { name: "HCU Staff", icon: FaUserShield, section: "main", path: "/admin/administrators" },
    { name: "Wardens", icon: FaUserTie, section: "main", path: "/admin/wardens" },
    { name: "Associate Wardens", icon: FaUserTie, section: "main", path: "/admin/associate-wardens" },
    { name: "Hostel Supervisors", icon: FaUserTie, section: "main", path: "/admin/hostel-supervisors" },
    { name: "Security", icon: FaShieldAlt, section: "main", path: "/admin/security" },
    { name: "Maintenance Staff", icon: FaTools, section: "main", path: "/admin/maintenance" },
    { name: "Others", icon: FaUserTie, section: "main", path: "/admin/others" },
    { name: "Update Password", icon: FaCog, section: "main", path: "/admin/update-password" },
    { name: "Settings", icon: FaCog, section: "main", path: "/admin/settings" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/admin/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <AdminProvider>
      <div className="flex flex-col md:flex-row min-h-screen relative">
        {/* Animated Background */}
        <div 
          className="fixed inset-0 overflow-hidden pointer-events-none"
          style={{
            zIndex: -1,
            background: 'linear-gradient(135deg, #f5f9ff 0%, #e8f1fe 50%, #ffffff 100%)',
          }}
        >
          {/* Gradient Orb 1 - Top Left */}
          <div 
            className="absolute rounded-full animate-orb-float"
            style={{
              top: '-10%',
              left: '-5%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(11, 87, 208, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
              opacity: 0.5,
            }}
          />
          {/* Gradient Orb 2 - Bottom Right */}
          <div 
            className="absolute rounded-full animate-orb-float"
            style={{
              bottom: '-10%',
              right: '-5%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(59, 125, 232, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
              opacity: 0.5,
              animationDelay: '5s',
            }}
          />
          {/* Gradient Orb 3 - Center */}
          <div 
            className="absolute rounded-full animate-orb-float"
            style={{
              top: '50%',
              left: '30%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(107, 163, 245, 0.12) 0%, transparent 70%)',
              filter: 'blur(80px)',
              opacity: 0.5,
              animationDelay: '10s',
            }}
          />
        </div>

        <Sidebar navItems={navItems} />
        <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
          <Outlet />
        </div>
      </div>
    </AdminProvider>
  )
}

export default AdminLayout
