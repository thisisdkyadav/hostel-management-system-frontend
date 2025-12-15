import Sidebar from "../components/Sidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { FaUser, FaClipboardList, FaBuilding, FaUserTie, FaUsers, FaSignOutAlt, FaSearch, FaCalendarAlt, FaExchangeAlt, FaBoxes, FaTasks, FaBell, FaFileSignature } from "react-icons/fa"
import { MdSpaceDashboard } from "react-icons/md"
import WardenProvider from "../contexts/WardenProvider"
import { useAuth } from "../contexts/AuthProvider"
import { HiAnnotation } from "react-icons/hi"

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
    { name: "Dashboard", icon: MdSpaceDashboard, section: "main", path: "/hostel-supervisor" },
    { name: "Units and Rooms", icon: FaBuilding, section: "main", path: `/hostel-supervisor/hostels/${user?.hostel?.name}`, pathPattern: "^/hostel-supervisor/hostels(/.*)?$" },
    { name: "Students", icon: FaUsers, section: "main", path: "/hostel-supervisor/students" },
    { name: "Leaves", icon: FaCalendarAlt, section: "main", path: "/hostel-supervisor/leaves" },
    { name: "Student Inventory", icon: FaBoxes, section: "main", path: "/hostel-supervisor/student-inventory" },
    { name: "My Tasks", icon: FaTasks, section: "main", path: "/hostel-supervisor/my-tasks" },
    { name: "Lost and Found", icon: FaSearch, section: "main", path: "/hostel-supervisor/lost-and-found" },
    { name: "Events", icon: FaCalendarAlt, section: "main", path: "/hostel-supervisor/events" },
    // { name: "Room Change Requests", icon: FaExchangeAlt, section: "main", path: "/hostel-supervisor/room-change-requests" },
    { name: "Visitors", icon: FaUserTie, section: "main", path: "/hostel-supervisor/visitors" },
    { name: "Notifications", icon: FaBell, section: "main", path: "/hostel-supervisor/notifications" },
    { name: "Complaints", icon: FaClipboardList, section: "main", path: "/hostel-supervisor/complaints" },
    { name: "Feedbacks", icon: HiAnnotation, section: "main", path: "/hostel-supervisor/feedbacks" },
    { name: "Undertakings", icon: FaFileSignature, section: "main", path: "/hostel-supervisor/undertakings" },
    { name: "Profile", icon: FaUser, section: "bottom", path: "/hostel-supervisor/profile" },
    { name: "Logout", icon: FaSignOutAlt, section: "bottom", action: handleLogout },
  ]

  return (
    <WardenProvider>
      <div className="flex flex-col md:flex-row bg-[#f0f4f9] min-h-screen">
        <Sidebar navItems={navItems} />
        <div className="flex-1 h-screen overflow-auto pt-16 md:pt-0">
          <Outlet />
        </div>
      </div>
    </WardenProvider>
  )
}

export default HostelSupervisorLayout
