import { Routes, Route } from "react-router-dom"
import AssociateWardenLayout from "../layouts/AssociateWardenLayout.jsx"

// Warden-specific pages (shared with Warden role)
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

const AssociateWardenRoutes = () => (
    <ProtectedRoute allowedRoles={["Associate Warden"]}>
        <Routes>
            <Route element={<AssociateWardenLayout />}>
                <Route
                    index
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.dashboard" fallback={<NotFoundPage />}>
                            <WardenDashboard />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="hostels/:hostelName"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.hostels" fallback={<NotFoundPage />}>
                            <UnitsAndRoomsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="hostels/:hostelName/units/:unitNumber"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.hostels" fallback={<NotFoundPage />}>
                            <UnitsAndRoomsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="complaints"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.complaints" fallback={<NotFoundPage />}>
                            <ComplaintsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="students"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.students" fallback={<NotFoundPage />}>
                            <StudentsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="visitors"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.visitors" fallback={<NotFoundPage />}>
                            <VisitorRequestsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="notifications"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.notifications" fallback={<NotFoundPage />}>
                            <NotificationCenterPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="lost-and-found"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.lostAndFound" fallback={<NotFoundPage />}>
                            <LostAndFoundPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="events"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.events" fallback={<NotFoundPage />}>
                            <EventsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="student-inventory"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.studentInventory" fallback={<NotFoundPage />}>
                            <StudentInventoryPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.profile" fallback={<NotFoundPage />}>
                            <ProfilePage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="feedbacks"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.feedbacks" fallback={<NotFoundPage />}>
                            <FeedbacksPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="undertakings"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.undertakings" fallback={<NotFoundPage />}>
                            <WardenUndertakings />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="my-tasks"
                    element={
                        <RouteAccessGuard routeKey="route.associateWarden.myTasks" fallback={<NotFoundPage />}>
                            <MyTasksPage />
                        </RouteAccessGuard>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default AssociateWardenRoutes
