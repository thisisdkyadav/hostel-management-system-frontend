import { Routes, Route } from "react-router-dom"
import WardenLayout from "../layouts/WardenLayout.jsx"

// Warden-specific pages
import {
    DashboardPage as WardenDashboard,
    StudentInventoryPage,
    FeedbacksPage,
    UndertakingsPage as WardenUndertakings
} from "../pages/warden"

// Common pages
import {
    UnitsAndRoomsPage,
    ComplaintsPage,
    StudentsPage,
    VisitorRequestsPage,
    NotificationCenterPage,
    LostAndFoundPage,
    EventsPage,
    ProfilePage,
    MyTasksPage
} from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const WardenRoutes = () => (
    <ProtectedRoute allowedRoles={["Warden"]}>
        <Routes>
            <Route element={<WardenLayout />}>
                <Route index element={<WardenDashboard />} />
                <Route path="hostels/:hostelName" element={<UnitsAndRoomsPage />} />
                <Route path="hostels/:hostelName/units/:unitNumber" element={<UnitsAndRoomsPage />} />
                <Route path="complaints" element={<ComplaintsPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="visitors" element={<VisitorRequestsPage />} />
                <Route path="notifications" element={<NotificationCenterPage />} />
                <Route path="lost-and-found" element={<LostAndFoundPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="student-inventory" element={<StudentInventoryPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="feedbacks" element={<FeedbacksPage />} />
                <Route path="undertakings" element={<WardenUndertakings />} />
                <Route path="my-tasks" element={<MyTasksPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default WardenRoutes
