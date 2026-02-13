/**
 * Centralized Navigation Configuration
 * 
 * This file contains all navigation items for all roles in the application.
 * Each role has a function that returns its navigation items, accepting
 * a handleLogout callback and optionally user data for dynamic paths.
 */

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
  LogOut,
  Clock,
  Keyboard,
  CheckSquare,
  UserRoundCheck,
  FileSignature,
  IdCard,
  Scan
} from "lucide-react"

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Creates a logout nav item
 */
const createLogoutItem = (handleLogout) => ({
  name: "Logout",
  icon: LogOut,
  section: "bottom",
  action: handleLogout
})

/**
 * Creates a profile nav item for a given base path
 */
const createProfileItem = (basePath) => ({
  name: "Profile",
  icon: User,
  section: "bottom",
  path: `${basePath}/profile`
})

// ============================================
// ADMIN NAVIGATION
// ============================================

export const getAdminNavItems = (handleLogout) => [
  { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/admin" },
  { name: "Hostels", icon: Building2, section: "main", path: "/admin/hostels", pathPattern: "^/admin/hostels(/.*)?$" },
  { name: "Students", icon: Users, section: "main", path: "/admin/students" },
  { name: "Sheet View", icon: Table2, section: "main", path: "/admin/sheet", isNew: true },
  { name: "Inventory", icon: Package, section: "main", path: "/admin/inventory" },
  { name: "Notifications", icon: Bell, section: "main", path: "/admin/notifications" },
  { name: "Task Management", icon: ListTodo, section: "main", path: "/admin/task-management" },
  { name: "Visitor Accommodation", icon: BedDouble, section: "main", path: "/admin/visitors" },
  { name: "Events", icon: CalendarDays, section: "main", path: "/admin/events" },
  { name: "Gymkhana Events", icon: CalendarDays, section: "main", path: "/admin/gymkhana-events" },
  { name: "Complaints", icon: ClipboardCheck, section: "main", path: "/admin/complaints" },
  { name: "Disciplinary Process", icon: ShieldCheck, section: "main", path: "/admin/disciplinary-process" },
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
  createProfileItem("/admin"),
  createLogoutItem(handleLogout),
]

// ============================================
// SUPER ADMIN NAVIGATION
// ============================================

export const getSuperAdminNavItems = (handleLogout) => [
  { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/super-admin" },
  { name: "Admin Management", icon: UserCog, section: "main", path: "/super-admin/admins" },
  { name: "API Keys", icon: KeyRound, section: "main", path: "/super-admin/api-keys" },
  createProfileItem("/super-admin"),
  createLogoutItem(handleLogout),
]

// ============================================
// WARDEN NAVIGATION
// ============================================

export const getWardenNavItems = (handleLogout, user) => [
  { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/warden" },
  { name: "Units and Rooms", icon: Building2, section: "main", path: `/warden/hostels/${user?.hostel?.name}`, pathPattern: "^/warden/hostels(/.*)?$" },
  { name: "Students", icon: Users, section: "main", path: "/warden/students" },
  { name: "Student Inventory", icon: Package, section: "main", path: "/warden/student-inventory" },
  { name: "My Tasks", icon: ListTodo, section: "main", path: "/warden/my-tasks" },
  { name: "Lost and Found", icon: Search, section: "main", path: "/warden/lost-and-found" },
  { name: "Events", icon: CalendarDays, section: "main", path: "/warden/events" },
  { name: "Visitors", icon: UserRoundCheck, section: "main", path: "/warden/visitors" },
  { name: "Notifications", icon: Bell, section: "main", path: "/warden/notifications" },
  { name: "Complaints", icon: ClipboardCheck, section: "main", path: "/warden/complaints" },
  { name: "Feedbacks", icon: MessageCircle, section: "main", path: "/warden/feedbacks" },
  { name: "Undertakings", icon: FileSignature, section: "main", path: "/warden/undertakings" },
  createProfileItem("/warden"),
  createLogoutItem(handleLogout),
]

// ============================================
// ASSOCIATE WARDEN NAVIGATION
// ============================================

export const getAssociateWardenNavItems = (handleLogout, user) => [
  { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/associate-warden" },
  { name: "Units and Rooms", icon: Building2, section: "main", path: `/associate-warden/hostels/${user?.hostel?.name}`, pathPattern: "^/associate-warden/hostels(/.*)?$" },
  { name: "Students", icon: Users, section: "main", path: "/associate-warden/students" },
  { name: "Student Inventory", icon: Package, section: "main", path: "/associate-warden/student-inventory" },
  { name: "My Tasks", icon: ListTodo, section: "main", path: "/associate-warden/my-tasks" },
  { name: "Lost and Found", icon: Search, section: "main", path: "/associate-warden/lost-and-found" },
  { name: "Events", icon: CalendarDays, section: "main", path: "/associate-warden/events" },
  { name: "Visitors", icon: UserRoundCheck, section: "main", path: "/associate-warden/visitors" },
  { name: "Notifications", icon: Bell, section: "main", path: "/associate-warden/notifications" },
  { name: "Complaints", icon: ClipboardCheck, section: "main", path: "/associate-warden/complaints" },
  { name: "Feedbacks", icon: MessageCircle, section: "main", path: "/associate-warden/feedbacks" },
  { name: "Undertakings", icon: FileSignature, section: "main", path: "/associate-warden/undertakings" },
  createProfileItem("/associate-warden"),
  createLogoutItem(handleLogout),
]

// ============================================
// HOSTEL SUPERVISOR NAVIGATION
// ============================================

export const getHostelSupervisorNavItems = (handleLogout, user) => [
  { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/hostel-supervisor" },
  { name: "Units and Rooms", icon: Building2, section: "main", path: `/hostel-supervisor/hostels/${user?.hostel?.name}`, pathPattern: "^/hostel-supervisor/hostels(/.*)?$" },
  { name: "Students", icon: Users, section: "main", path: "/hostel-supervisor/students" },
  { name: "Leaves", icon: CalendarOff, section: "main", path: "/hostel-supervisor/leaves" },
  { name: "Student Inventory", icon: Package, section: "main", path: "/hostel-supervisor/student-inventory" },
  { name: "My Tasks", icon: ListTodo, section: "main", path: "/hostel-supervisor/my-tasks" },
  { name: "Lost and Found", icon: Search, section: "main", path: "/hostel-supervisor/lost-and-found" },
  { name: "Events", icon: CalendarDays, section: "main", path: "/hostel-supervisor/events" },
  { name: "Visitors", icon: UserRoundCheck, section: "main", path: "/hostel-supervisor/visitors" },
  { name: "Notifications", icon: Bell, section: "main", path: "/hostel-supervisor/notifications" },
  { name: "Complaints", icon: ClipboardCheck, section: "main", path: "/hostel-supervisor/complaints" },
  { name: "Feedbacks", icon: MessageCircle, section: "main", path: "/hostel-supervisor/feedbacks" },
  { name: "Undertakings", icon: FileSignature, section: "main", path: "/hostel-supervisor/undertakings" },
  createProfileItem("/hostel-supervisor"),
  createLogoutItem(handleLogout),
]

// ============================================
// HOSTEL GATE NAVIGATION
// ============================================

export const getHostelGateNavItems = (handleLogout) => [
  { name: "Add Student Entry", icon: UserPlus, section: "main", path: "/hostel-gate" },
  { name: "Student Entries", icon: Clock, section: "main", path: "/hostel-gate/entries" },
  { name: "Scanner Entries", icon: Keyboard, section: "main", path: "/hostel-gate/scanner-entries" },
  { name: "Face Scanner", icon: Scan, section: "main", path: "/hostel-gate/face-scanner-entries" },
  { name: "Visitors", icon: Users, section: "main", path: "/hostel-gate/visitors" },
  { name: "My Tasks", icon: ListTodo, section: "main", path: "/hostel-gate/my-tasks" },
  { name: "Lost and Found", icon: Search, section: "main", path: "/hostel-gate/lost-and-found" },
  createLogoutItem(handleLogout),
]

// ============================================
// SECURITY (GUARD) NAVIGATION
// ============================================

export const getSecurityNavItems = (handleLogout, user) => {
  const isHostelGate = user?.role === "Hostel Gate"

  if (isHostelGate) {
    return [
      { name: "Add Student Entry", icon: UserPlus, section: "main", path: "/hostel-gate" },
      { name: "Student Entries", icon: Clock, section: "main", path: "/hostel-gate/entries" },
      { name: "Attendance", icon: CheckSquare, section: "main", path: "/hostel-gate/attendance" },
      { name: "Visitors", icon: Users, section: "main", path: "/hostel-gate/visitors" },
      { name: "My Tasks", icon: ListTodo, section: "main", path: "/hostel-gate/my-tasks" },
      { name: "Lost and Found", icon: Search, section: "main", path: "/hostel-gate/lost-and-found" },
      createLogoutItem(handleLogout),
    ]
  }

  // Guard nav items
  return [
    { name: "Attendance", icon: CheckSquare, section: "main", path: "/guard" },
    { name: "My Tasks", icon: ListTodo, section: "main", path: "/guard/my-tasks" },
    { name: "Lost and Found", icon: Search, section: "main", path: "/guard/lost-and-found" },
    createLogoutItem(handleLogout),
  ]
}

// ============================================
// MAINTENANCE NAVIGATION
// ============================================

export const getMaintenanceNavItems = (handleLogout) => [
  { name: "Complaints", icon: ClipboardCheck, section: "main", path: "/maintenance" },
  { name: "Leaves", icon: CalendarOff, section: "main", path: "/maintenance/leaves" },
  { name: "My Tasks", icon: ListTodo, section: "main", path: "/maintenance/my-tasks" },
  { name: "Attendance", icon: CheckSquare, section: "main", path: "/maintenance/attendance" },
  createLogoutItem(handleLogout),
]

// ============================================
// STUDENT NAVIGATION
// ============================================

export const getStudentNavItems = (handleLogout, notificationsCount = 0) => [
  { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/student" },
  { name: "Complaints", icon: ClipboardCheck, section: "main", path: "/student/complaints" },
  { name: "Disciplinary Process", icon: ShieldCheck, section: "main", path: "/student/disciplinary-process" },
  { name: "Lost and Found", icon: Search, section: "main", path: "/student/lost-and-found" },
  { name: "Events", icon: CalendarDays, section: "main", path: "/student/events" },
  { name: "Visitors", icon: Users, section: "main", path: "/student/visitors" },
  { name: "Feedbacks", icon: MessageCircle, section: "main", path: "/student/feedbacks" },
  { name: "Notifications", icon: Bell, section: "main", path: "/student/notifications", badge: notificationsCount },
  { name: "Security", icon: ShieldCheck, section: "main", path: "/student/security" },
  { name: "ID Card", icon: IdCard, section: "main", path: "/student/id-card" },
  { name: "Undertakings", icon: FileSignature, section: "main", path: "/student/undertakings" },
  createProfileItem("/student"),
  createLogoutItem(handleLogout),
]

// ============================================
// GYMKHANA NAVIGATION
// ============================================

export const getGymkhanaNavItems = (handleLogout) => [
  { name: "Dashboard", icon: LayoutDashboard, section: "main", path: "/gymkhana" },
  { name: "Events", icon: CalendarDays, section: "main", path: "/gymkhana/events" },
  createProfileItem("/gymkhana"),
  createLogoutItem(handleLogout),
]

/**
 * PWA bottom bar main items (4 primary items shown in bottom bar)
 */
export const getStudentPwaBottomBarMainItems = () => [
  { name: "Home", icon: LayoutDashboard, path: "/student" },
  { name: "Complaints", icon: ClipboardCheck, path: "/student/complaints" },
  { name: "Lost & Found", icon: Search, path: "/student/lost-and-found" },
  { name: "Events", icon: CalendarDays, path: "/student/events" },
]

/**
 * Get hidden items for PWA bottom bar dropdown
 * (all items except the main 4)
 */
export const getStudentPwaHiddenItems = (allNavItems) => {
  const mainItems = getStudentPwaBottomBarMainItems()
  return allNavItems.filter((item) => !mainItems.some((mainItem) => mainItem.path === item.path))
}
