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
import RouteAccessGuard from "../components/authz/RouteAccessGuard"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const WardenRoutes = () => (
    <ProtectedRoute allowedRoles={["Warden"]}>
        <Routes>
            <Route element={<WardenLayout />}>
                <Route
                    index
                    element={
                        <RouteAccessGuard routeKey="route.warden.dashboard" fallback={<NotFoundPage />}>
                            <WardenDashboard />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="hostels/:hostelName"
                    element={
                        <RouteAccessGuard routeKey="route.warden.hostels" fallback={<NotFoundPage />}>
                            <UnitsAndRoomsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="hostels/:hostelName/units/:unitNumber"
                    element={
                        <RouteAccessGuard routeKey="route.warden.hostels" fallback={<NotFoundPage />}>
                            <UnitsAndRoomsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="complaints"
                    element={
                        <RouteAccessGuard routeKey="route.warden.complaints" fallback={<NotFoundPage />}>
                            <ComplaintsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="students"
                    element={
                        <RouteAccessGuard routeKey="route.warden.students" fallback={<NotFoundPage />}>
                            <StudentsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="visitors"
                    element={
                        <RouteAccessGuard routeKey="route.warden.visitors" fallback={<NotFoundPage />}>
                            <VisitorRequestsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="notifications"
                    element={
                        <RouteAccessGuard routeKey="route.warden.notifications" fallback={<NotFoundPage />}>
                            <NotificationCenterPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="lost-and-found"
                    element={
                        <RouteAccessGuard routeKey="route.warden.lostAndFound" fallback={<NotFoundPage />}>
                            <LostAndFoundPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="events"
                    element={
                        <RouteAccessGuard routeKey="route.warden.events" fallback={<NotFoundPage />}>
                            <EventsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="student-inventory"
                    element={
                        <RouteAccessGuard routeKey="route.warden.studentInventory" fallback={<NotFoundPage />}>
                            <StudentInventoryPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <RouteAccessGuard routeKey="route.warden.profile" fallback={<NotFoundPage />}>
                            <ProfilePage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="feedbacks"
                    element={
                        <RouteAccessGuard routeKey="route.warden.feedbacks" fallback={<NotFoundPage />}>
                            <FeedbacksPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="undertakings"
                    element={
                        <RouteAccessGuard routeKey="route.warden.undertakings" fallback={<NotFoundPage />}>
                            <WardenUndertakings />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="my-tasks"
                    element={
                        <RouteAccessGuard routeKey="route.warden.myTasks" fallback={<NotFoundPage />}>
                            <MyTasksPage />
                        </RouteAccessGuard>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default WardenRoutes
