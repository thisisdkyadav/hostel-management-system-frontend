import { Routes, Route } from "react-router-dom"
import StudentLayout from "../layouts/StudentLayout.jsx"

// Student-specific pages
import {
    DashboardPage as StudentDashboard,
    IDCardPage,
    UndertakingsPage,
    SecurityPage
} from "../pages/student"

// Common pages
import {
    VisitorRequestsPage,
    ComplaintsPage,
    ProfilePage,
    LostAndFoundPage,
    EventsPage,
    NotificationCenterPage
} from "../pages/common"

// Warden pages (shared)
import { FeedbacksPage } from "../pages/warden"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const StudentRoutes = () => (
    <ProtectedRoute allowedRoles={["Student"]}>
        <Routes>
            <Route element={<StudentLayout />}>
                <Route index element={<StudentDashboard />} />
                <Route path="complaints" element={<ComplaintsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="lost-and-found" element={<LostAndFoundPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="feedbacks" element={<FeedbacksPage />} />
                <Route path="notifications" element={<NotificationCenterPage />} />
                <Route path="visitors" element={<VisitorRequestsPage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="id-card" element={<IDCardPage />} />
                <Route path="undertakings" element={<UndertakingsPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default StudentRoutes
