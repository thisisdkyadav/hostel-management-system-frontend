import { Routes, Route } from "react-router-dom"
import MaintenanceLayout from "../layouts/MaintenanceLayout.jsx"

// Maintenance-specific pages
import { MaintenancePage, AttendancePage as MaintenanceAttendance } from "../pages/maintenance"

// Common pages
import { MyTasksPage, LeavesPage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const MaintenanceRoutes = () => (
    <ProtectedRoute allowedRoles={["Maintenance Staff"]}>
        <Routes>
            <Route element={<MaintenanceLayout />}>
                <Route
                    index
                    element={
                        <RouteAccessGuard routeKey="route.maintenance.dashboard" fallback={<NotFoundPage />}>
                            <MaintenancePage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="attendance"
                    element={
                        <RouteAccessGuard routeKey="route.maintenance.attendance" fallback={<NotFoundPage />}>
                            <MaintenanceAttendance />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="my-tasks"
                    element={
                        <RouteAccessGuard routeKey="route.maintenance.myTasks" fallback={<NotFoundPage />}>
                            <MyTasksPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="leaves"
                    element={
                        <RouteAccessGuard routeKey="route.maintenance.leaves" fallback={<NotFoundPage />}>
                            <LeavesPage />
                        </RouteAccessGuard>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default MaintenanceRoutes
