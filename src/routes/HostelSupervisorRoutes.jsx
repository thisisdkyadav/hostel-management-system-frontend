import { Routes, Route } from "react-router-dom"
import HostelSupervisorLayout from "../layouts/HostelSupervisorLayout.jsx"

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
    LeavesPage,
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

const HostelSupervisorRoutes = () => (
    <ProtectedRoute allowedRoles={["Hostel Supervisor"]}>
        <Routes>
            <Route element={<HostelSupervisorLayout />}>
                <Route
                    index
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.dashboard" fallback={<NotFoundPage />}>
                            <WardenDashboard />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="hostels/:hostelName"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.hostels" fallback={<NotFoundPage />}>
                            <UnitsAndRoomsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="hostels/:hostelName/units/:unitNumber"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.hostels" fallback={<NotFoundPage />}>
                            <UnitsAndRoomsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="complaints"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.complaints" fallback={<NotFoundPage />}>
                            <ComplaintsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="leaves"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.leaves" fallback={<NotFoundPage />}>
                            <LeavesPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="students"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.students" fallback={<NotFoundPage />}>
                            <StudentsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="visitors"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.visitors" fallback={<NotFoundPage />}>
                            <VisitorRequestsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="notifications"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.notifications" fallback={<NotFoundPage />}>
                            <NotificationCenterPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="lost-and-found"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.lostAndFound" fallback={<NotFoundPage />}>
                            <LostAndFoundPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="events"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.events" fallback={<NotFoundPage />}>
                            <EventsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="student-inventory"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.studentInventory" fallback={<NotFoundPage />}>
                            <StudentInventoryPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.profile" fallback={<NotFoundPage />}>
                            <ProfilePage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="feedbacks"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.feedbacks" fallback={<NotFoundPage />}>
                            <FeedbacksPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="undertakings"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.undertakings" fallback={<NotFoundPage />}>
                            <WardenUndertakings />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="my-tasks"
                    element={
                        <RouteAccessGuard routeKey="route.hostelSupervisor.myTasks" fallback={<NotFoundPage />}>
                            <MyTasksPage />
                        </RouteAccessGuard>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default HostelSupervisorRoutes
