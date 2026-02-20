import { Routes, Route } from "react-router-dom"
import SecurityLayout from "../layouts/SecurityLayout.jsx"

// Guard-specific pages
import { AttendancePage } from "../pages/guard"

// Common pages
import { LostAndFoundPage, MyTasksPage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const SecurityRoutes = () => (
    <ProtectedRoute allowedRoles={["Security"]}>
        <Routes>
            <Route element={<SecurityLayout />}>
                <Route
                    index
                    element={
                        <RouteAccessGuard routeKey="route.security.attendance" fallback={<NotFoundPage />}>
                            <AttendancePage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="lost-and-found"
                    element={
                        <RouteAccessGuard routeKey="route.security.lostAndFound" fallback={<NotFoundPage />}>
                            <LostAndFoundPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="my-tasks"
                    element={
                        <RouteAccessGuard routeKey="route.security.myTasks" fallback={<NotFoundPage />}>
                            <MyTasksPage />
                        </RouteAccessGuard>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default SecurityRoutes
