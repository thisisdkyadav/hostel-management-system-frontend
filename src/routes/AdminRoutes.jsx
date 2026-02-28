import { Routes, Route, Navigate } from "react-router-dom"
import AdminLayout from "../layouts/AdminLayout"

// Admin-specific pages
import {
    DashboardPage as AdminDashboard,
    LiveCheckInOutPage,
    FaceScannersPage,
    HostelsPage as AdminHostels,
    AdminManagementPage as AdminAdminManagement,
    WardensPage as AdminWarden,
    AssociateWardensPage as AdminAssociateWardens,
    HostelSupervisorsPage as AdminHostelSupervisors,
    InventoryPage,
    SecurityLoginsPage,
    UpdatePasswordPage,
    SettingsPage as AdminSettings,
    MaintenanceStaffPage,
    OthersPage,
    TaskManagementPage,
    SheetPage
} from "../pages/admin"

// Common pages
import {
    UnitsAndRoomsPage,
    StudentsPage,
    ComplaintsPage,
    DisciplinaryProcessPage,
    AppointmentsPage,
    LeavesPage,
    VisitorRequestsPage,
    LostAndFoundPage,
    EventsPage,
    GymkhanaEventsPage,
    MegaEventsPage,
    ProfilePage,
    NotificationCenterPage
} from "../pages/common"

// Warden pages (shared)
import { FeedbacksPage } from "../pages/warden"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"

import { ProtectedRoute, useAuth } from "../contexts/AuthProvider.jsx"
import { isCsoAdminSubRole } from "../constants/navigationConfig"

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
            <Routes>
                <Route element={<AdminLayout />}>
                    {isCsoAdmin ? (
                        <>
                            <Route index element={guardRoute("route.admin.liveCheckInOut", <Navigate to="live-checkinout" replace />)} />
                            <Route path="live-checkinout" element={guardRoute("route.admin.liveCheckInOut", <LiveCheckInOutPage />)} />
                            <Route path="lc" element={guardRoute("route.admin.liveCheckInOut", <LiveCheckInOutPage />)} /> {/* temp shortcut */}
                            <Route path="fs" element={guardRoute("route.admin.faceScanners", <FaceScannersPage />)} /> {/* temp shortcut */}
                            <Route path="face-scanners" element={guardRoute("route.admin.faceScanners", <FaceScannersPage />)} />
                            <Route path="profile" element={guardRoute("route.admin.profile", <ProfilePage />)} />
                            <Route path="*" element={<Navigate to="live-checkinout" replace />} />
                        </>
                    ) : (
                        <>
                            <Route index element={guardRoute("route.admin.dashboard", <AdminDashboard />)} />
                            <Route path="live-checkinout" element={guardRoute("route.admin.liveCheckInOut", <LiveCheckInOutPage />)} />
                            <Route path="lc" element={guardRoute("route.admin.liveCheckInOut", <LiveCheckInOutPage />)} /> {/* temp shortcut */}
                            <Route path="fs" element={guardRoute("route.admin.faceScanners", <FaceScannersPage />)} /> {/* temp shortcut */}
                            <Route path="face-scanners" element={guardRoute("route.admin.faceScanners", <FaceScannersPage />)} />
                            <Route path="hostels" element={guardRoute("route.admin.hostels", <AdminHostels />)} />
                            <Route path="hostels/:hostelName" element={guardRoute("route.admin.hostels", <UnitsAndRoomsPage />)} />
                            <Route path="hostels/:hostelName/units/:unitNumber" element={guardRoute("route.admin.hostels", <UnitsAndRoomsPage />)} />
                            <Route path="administrators" element={guardRoute("route.admin.administrators", <AdminAdminManagement />)} />
                            <Route path="wardens" element={guardRoute("route.admin.wardens", <AdminWarden />)} />
                            <Route path="associate-wardens" element={guardRoute("route.admin.associateWardens", <AdminAssociateWardens />)} />
                            <Route path="hostel-supervisors" element={guardRoute("route.admin.hostelSupervisors", <AdminHostelSupervisors />)} />
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
        </ProtectedRoute>
    )
}

export default AdminRoutes
