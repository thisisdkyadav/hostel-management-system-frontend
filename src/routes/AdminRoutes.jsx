import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import AdminLayout from "../layouts/AdminLayout"

// Admin-specific pages
const AdminDashboard = lazy(() => import("../pages/admin/DashboardPage"))
const LiveCheckInOutPage = lazy(() => import("../pages/admin/LiveCheckInOutPage"))
const FaceScannersPage = lazy(() => import("../pages/admin/FaceScannersPage"))
const AdminHostels = lazy(() => import("../pages/admin/HostelsPage"))
const AdminAdminManagement = lazy(() => import("../pages/admin/AdminManagementPage"))
const AdminWarden = lazy(() => import("../pages/admin/WardensPage"))
const AdminAssociateWardens = lazy(() => import("../pages/admin/AssociateWardensPage"))
const AdminHostelSupervisors = lazy(() => import("../pages/admin/HostelSupervisorsPage"))
const GymkhanaManagementPage = lazy(() => import("../pages/admin/GymkhanaManagementPage"))
const InventoryPage = lazy(() => import("../pages/admin/InventoryPage"))
const SecurityLoginsPage = lazy(() => import("../pages/admin/SecurityLoginsPage"))
const UpdatePasswordPage = lazy(() => import("../pages/admin/UpdatePasswordPage"))
const AdminSettings = lazy(() => import("../pages/admin/SettingsPage"))
const MaintenanceStaffPage = lazy(() => import("../pages/admin/MaintenanceStaffPage"))
const OthersPage = lazy(() => import("../pages/admin/OthersPage"))
const TaskManagementPage = lazy(() => import("../pages/admin/TaskManagementPage"))
const SheetPage = lazy(() => import("../pages/admin/SheetPage"))

// Common pages
const UnitsAndRoomsPage = lazy(() => import("../pages/common/UnitsAndRoomsPage"))
const StudentsPage = lazy(() => import("../pages/common/StudentsPage"))
const ComplaintsPage = lazy(() => import("../pages/common/ComplaintsPage"))
const DisciplinaryProcessPage = lazy(() => import("../pages/common/DisciplinaryProcessPage"))
const AppointmentsPage = lazy(() => import("../pages/common/AppointmentsPage"))
const LeavesPage = lazy(() => import("../pages/common/LeavesPage"))
const VisitorRequestsPage = lazy(() => import("../pages/common/VisitorRequestsPage"))
const LostAndFoundPage = lazy(() => import("../pages/common/LostAndFoundPage"))
const EventsPage = lazy(() => import("../pages/common/EventsPage"))
const ElectionsPage = lazy(() => import("../pages/common/ElectionsPage"))
const GymkhanaEventsPage = lazy(() => import("../pages/common/GymkhanaEventsPage"))
const MegaEventsPage = lazy(() => import("../pages/common/MegaEventsPage"))
const ProfilePage = lazy(() => import("../pages/common/ProfilePage"))
const NotificationCenterPage = lazy(() => import("../pages/common/NotificationCenterPage"))
const OverallBestPerformerPage = lazy(() => import("../pages/common/OverallBestPerformerPage"))

// Warden pages (shared)
const FeedbacksPage = lazy(() => import("../pages/warden/FeedbacksPage"))

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"

import { ProtectedRoute, useAuth } from "../contexts/AuthProvider.jsx"
import { isCsoAdminSubRole } from "../constants/navigationConfig"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

const adminPrefetchLoaders = [
  () => import("../pages/admin/DashboardPage"),
  () => import("../pages/admin/LiveCheckInOutPage"),
  () => import("../pages/admin/FaceScannersPage"),
  () => import("../pages/admin/HostelsPage"),
  () => import("../pages/admin/AdminManagementPage"),
  () => import("../pages/admin/WardensPage"),
  () => import("../pages/admin/AssociateWardensPage"),
  () => import("../pages/admin/HostelSupervisorsPage"),
  () => import("../pages/admin/GymkhanaManagementPage"),
  () => import("../pages/admin/InventoryPage"),
  () => import("../pages/admin/SecurityLoginsPage"),
  () => import("../pages/admin/UpdatePasswordPage"),
  () => import("../pages/admin/SettingsPage"),
  () => import("../pages/admin/MaintenanceStaffPage"),
  () => import("../pages/admin/OthersPage"),
  () => import("../pages/admin/TaskManagementPage"),
  () => import("../pages/admin/SheetPage"),
  () => import("../pages/common/UnitsAndRoomsPage"),
  () => import("../pages/common/StudentsPage"),
  () => import("../pages/common/ComplaintsPage"),
  () => import("../pages/common/DisciplinaryProcessPage"),
  () => import("../pages/common/AppointmentsPage"),
  () => import("../pages/common/LeavesPage"),
  () => import("../pages/common/VisitorRequestsPage"),
  () => import("../pages/common/LostAndFoundPage"),
  () => import("../pages/common/EventsPage"),
  () => import("../pages/common/ElectionsPage"),
  () => import("../pages/common/GymkhanaEventsPage"),
  () => import("../pages/common/MegaEventsPage"),
  () => import("../pages/common/ProfilePage"),
  () => import("../pages/common/NotificationCenterPage"),
  () => import("../pages/common/OverallBestPerformerPage"),
  () => import("../pages/warden/FeedbacksPage"),
]

const AdminRolePrefetch = () => {
  useBackgroundPrefetch(adminPrefetchLoaders)
  return null
}

const AdminRoutes = () => {
  const { user } = useAuth()
  const isCsoAdmin = isCsoAdminSubRole(user)
  const guardRoute = (routeKey, element) => (
    <RouteAccessGuard routeKey={routeKey} fallback={<NotFoundPage />}>
      {element}
    </RouteAccessGuard>
  )

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <Suspense fallback={<LoadingPage message="Loading Admin Portal..." />}>
        <AdminRolePrefetch />
        <Routes>
          <Route element={<AdminLayout />}>
            {isCsoAdmin ? (
              <>
                <Route index element={guardRoute("route.admin.liveCheckInOut", <Navigate to="live-checkinout" replace />)} />
                <Route path="live-checkinout" element={guardRoute("route.admin.liveCheckInOut", <LiveCheckInOutPage />)} />
                <Route path="lc" element={guardRoute("route.admin.liveCheckInOut", <LiveCheckInOutPage />)} />
                <Route path="fs" element={guardRoute("route.admin.faceScanners", <FaceScannersPage />)} />
                <Route path="face-scanners" element={guardRoute("route.admin.faceScanners", <FaceScannersPage />)} />
                <Route path="profile" element={guardRoute("route.admin.profile", <ProfilePage />)} />
                <Route path="*" element={<Navigate to="live-checkinout" replace />} />
              </>
            ) : (
              <>
                <Route index element={guardRoute("route.admin.dashboard", <AdminDashboard />)} />
                <Route path="live-checkinout" element={guardRoute("route.admin.liveCheckInOut", <LiveCheckInOutPage />)} />
                <Route path="lc" element={guardRoute("route.admin.liveCheckInOut", <LiveCheckInOutPage />)} />
                <Route path="fs" element={guardRoute("route.admin.faceScanners", <FaceScannersPage />)} />
                <Route path="face-scanners" element={guardRoute("route.admin.faceScanners", <FaceScannersPage />)} />
                <Route path="hostels" element={guardRoute("route.admin.hostels", <AdminHostels />)} />
                <Route path="hostels/:hostelName" element={guardRoute("route.admin.hostels", <UnitsAndRoomsPage />)} />
                <Route path="hostels/:hostelName/units/:unitNumber" element={guardRoute("route.admin.hostels", <UnitsAndRoomsPage />)} />
                <Route path="administrators" element={guardRoute("route.admin.administrators", <AdminAdminManagement />)} />
                <Route path="wardens" element={guardRoute("route.admin.wardens", <AdminWarden />)} />
                <Route path="associate-wardens" element={guardRoute("route.admin.associateWardens", <AdminAssociateWardens />)} />
                <Route path="hostel-supervisors" element={guardRoute("route.admin.hostelSupervisors", <AdminHostelSupervisors />)} />
                <Route path="gymkhana" element={guardRoute("route.admin.gymkhana", <GymkhanaManagementPage />)} />
                <Route path="students" element={guardRoute("route.admin.students", <StudentsPage />)} />
                <Route path="inventory" element={guardRoute("route.admin.inventory", <InventoryPage />)} />
                <Route path="complaints" element={guardRoute("route.admin.complaints", <ComplaintsPage />)} />
                <Route path="disciplinary-process" element={guardRoute("route.admin.disciplinaryProcess", <DisciplinaryProcessPage />)} />
                <Route path="appointments" element={guardRoute("route.admin.appointments", <AppointmentsPage />)} />
                <Route path="jr-appointments" element={guardRoute("route.admin.appointments", <AppointmentsPage />)} />
                <Route path="leaves" element={guardRoute("route.admin.leaves", <LeavesPage />)} />
                <Route path="security" element={guardRoute("route.admin.security", <SecurityLoginsPage />)} />
                <Route path="visitors" element={guardRoute("route.admin.visitors", <VisitorRequestsPage />)} />
                <Route path="lost-and-found" element={guardRoute("route.admin.lostAndFound", <LostAndFoundPage />)} />
                <Route path="events" element={guardRoute("route.admin.events", <EventsPage />)} />
                <Route path="gymkhana-events" element={guardRoute("route.admin.gymkhanaEvents", <GymkhanaEventsPage />)} />
                <Route path="mega-events" element={guardRoute("route.admin.megaEvents", <MegaEventsPage />)} />
                <Route path="overall-best-performer" element={guardRoute("route.admin.overallBestPerformer", <OverallBestPerformerPage />)} />
                <Route path="elections" element={guardRoute("route.admin.elections", <ElectionsPage />)} />
                <Route path="update-password" element={guardRoute("route.admin.updatePassword", <UpdatePasswordPage />)} />
                <Route path="settings" element={guardRoute("route.admin.settings", <AdminSettings />)} />
                <Route path="profile" element={guardRoute("route.admin.profile", <ProfilePage />)} />
                <Route path="maintenance" element={guardRoute("route.admin.maintenance", <MaintenanceStaffPage />)} />
                <Route path="notifications" element={guardRoute("route.admin.notifications", <NotificationCenterPage />)} />
                <Route path="feedbacks" element={guardRoute("route.admin.feedbacks", <FeedbacksPage />)} />
                <Route path="others" element={guardRoute("route.admin.others", <OthersPage />)} />
                <Route path="task-management" element={guardRoute("route.admin.taskManagement", <TaskManagementPage />)} />
                <Route path="sheet" element={guardRoute("route.admin.sheet", <SheetPage />)} />
                <Route path="*" element={<NotFoundPage />} />
              </>
            )}
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  )
}

export default AdminRoutes
