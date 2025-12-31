import { Routes, Route } from "react-router-dom"
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
    LeavesPage,
    VisitorRequestsPage,
    LostAndFoundPage,
    EventsPage,
    ProfilePage,
    NotificationCenterPage
} from "../pages/common"

// Warden pages (shared)
import { FeedbacksPage } from "../pages/warden"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const AdminRoutes = () => (
    <ProtectedRoute allowedRoles={["Admin"]}>
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="live-checkinout" element={<LiveCheckInOutPage />} />
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
                <Route path="leaves" element={<LeavesPage />} />
                <Route path="security" element={<SecurityLoginsPage />} />
                <Route path="visitors" element={<VisitorRequestsPage />} />
                <Route path="lost-and-found" element={<LostAndFoundPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="update-password" element={<UpdatePasswordPage />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="maintenance" element={<MaintenanceStaffPage />} />
                <Route path="notifications" element={<NotificationCenterPage />} />
                <Route path="feedbacks" element={<FeedbacksPage />} />
                <Route path="others" element={<OthersPage />} />
                <Route path="task-management" element={<TaskManagementPage />} />
                <Route path="sheet" element={<SheetPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default AdminRoutes
