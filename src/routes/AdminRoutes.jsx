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

import { ProtectedRoute, useAuth } from "../contexts/AuthProvider.jsx"
import { isCsoAdminSubRole } from "../constants/navigationConfig"

const AdminRoutes = () => {
    const { user } = useAuth()
    const isCsoAdmin = isCsoAdminSubRole(user)

    return (
        <ProtectedRoute allowedRoles={["Admin"]}>
            <Routes>
                <Route element={<AdminLayout />}>
                    {isCsoAdmin ? (
                        <>
                            <Route index element={<Navigate to="live-checkinout" replace />} />
                            <Route path="live-checkinout" element={<LiveCheckInOutPage />} />
                            <Route path="lc" element={<LiveCheckInOutPage />} /> {/* temp shortcut */}
                            <Route path="fs" element={<FaceScannersPage />} /> {/* temp shortcut */}
                            <Route path="face-scanners" element={<FaceScannersPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="*" element={<Navigate to="live-checkinout" replace />} />
                        </>
                    ) : (
                        <>
                            <Route index element={<AdminDashboard />} />
                            <Route path="live-checkinout" element={<LiveCheckInOutPage />} />
                            <Route path="lc" element={<LiveCheckInOutPage />} /> {/* temp shortcut */}
                            <Route path="fs" element={<FaceScannersPage />} /> {/* temp shortcut */}
                            <Route path="face-scanners" element={<FaceScannersPage />} />
                            <Route path="hostels" element={<AdminHostels />} />
                            <Route path="hostels/:hostelName" element={<UnitsAndRoomsPage />} />
                            <Route path="hostels/:hostelName/units/:unitNumber" element={<UnitsAndRoomsPage />} />
                            <Route path="administrators" element={<AdminAdminManagement />} />
                            <Route path="wardens" element={<AdminWarden />} />
                            <Route path="associate-wardens" element={<AdminAssociateWardens />} />
                            <Route path="hostel-supervisors" element={<AdminHostelSupervisors />} />
                            <Route path="students" element={<StudentsPage />} />
                            <Route path="inventory" element={<InventoryPage />} />
                            <Route path="complaints" element={<ComplaintsPage />} />
                            <Route path="disciplinary-process" element={<DisciplinaryProcessPage />} />
                            <Route path="appointments" element={<AppointmentsPage />} />
                            <Route path="jr-appointments" element={<AppointmentsPage />} />
                            <Route path="leaves" element={<LeavesPage />} />
                            <Route path="security" element={<SecurityLoginsPage />} />
                            <Route path="visitors" element={<VisitorRequestsPage />} />
                            <Route path="lost-and-found" element={<LostAndFoundPage />} />
                            <Route path="events" element={<EventsPage />} />
                            <Route path="gymkhana-events" element={<GymkhanaEventsPage />} />
                            <Route path="mega-events" element={<MegaEventsPage />} />
                            <Route path="update-password" element={<UpdatePasswordPage />} />
                            <Route path="settings" element={<AdminSettings />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="maintenance" element={<MaintenanceStaffPage />} />
                            <Route path="notifications" element={<NotificationCenterPage />} />
                            <Route path="feedbacks" element={<FeedbacksPage />} />
                            <Route path="others" element={<OthersPage />} />
                            <Route path="task-management" element={<TaskManagementPage />} />
                            <Route path="sheet" element={<SheetPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </>
                    )}
                </Route>
            </Routes>
        </ProtectedRoute>
    )
}

export default AdminRoutes
