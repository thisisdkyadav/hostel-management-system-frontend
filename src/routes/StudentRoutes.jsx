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

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const StudentRoutes = () => (
    <ProtectedRoute allowedRoles={["Student"]}>
        <Routes>
            <Route element={<StudentLayout />}>
                <Route
                    index
                    element={
                        <RouteAccessGuard routeKey="route.student.dashboard" fallback={<NotFoundPage />}>
                            <StudentDashboard />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="complaints"
                    element={
                        <RouteAccessGuard routeKey="route.student.complaints" fallback={<NotFoundPage />}>
                            <ComplaintsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <RouteAccessGuard routeKey="route.student.profile" fallback={<NotFoundPage />}>
                            <ProfilePage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="lost-and-found"
                    element={
                        <RouteAccessGuard routeKey="route.student.lostAndFound" fallback={<NotFoundPage />}>
                            <LostAndFoundPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="events"
                    element={
                        <RouteAccessGuard routeKey="route.student.events" fallback={<NotFoundPage />}>
                            <EventsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="feedbacks"
                    element={
                        <RouteAccessGuard routeKey="route.student.feedbacks" fallback={<NotFoundPage />}>
                            <FeedbacksPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="notifications"
                    element={
                        <RouteAccessGuard routeKey="route.student.notifications" fallback={<NotFoundPage />}>
                            <NotificationCenterPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="visitors"
                    element={
                        <RouteAccessGuard routeKey="route.student.visitors" fallback={<NotFoundPage />}>
                            <VisitorRequestsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="security"
                    element={
                        <RouteAccessGuard routeKey="route.student.security" fallback={<NotFoundPage />}>
                            <SecurityPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="id-card"
                    element={
                        <RouteAccessGuard routeKey="route.student.idCard" fallback={<NotFoundPage />}>
                            <IDCardPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="undertakings"
                    element={
                        <RouteAccessGuard routeKey="route.student.undertakings" fallback={<NotFoundPage />}>
                            <UndertakingsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default StudentRoutes
