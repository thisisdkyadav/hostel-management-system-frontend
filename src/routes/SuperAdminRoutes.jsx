import { Routes, Route } from "react-router-dom"
import SuperAdminLayout from "../layouts/SuperAdminLayout.jsx"

// SuperAdmin-specific pages
import {
    DashboardPage as SuperAdminDashboard,
    AdminManagementPage as SuperAdminAdminManagement,
    ApiKeyManagementPage
} from "../pages/superadmin"

// Common pages
import { ProfilePage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const SuperAdminRoutes = () => (
    <ProtectedRoute allowedRoles={["Super Admin"]}>
        <Routes>
            <Route element={<SuperAdminLayout />}>
                <Route
                    index
                    element={
                        <RouteAccessGuard routeKey="route.superAdmin.dashboard" fallback={<NotFoundPage />}>
                            <SuperAdminDashboard />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="admins"
                    element={
                        <RouteAccessGuard routeKey="route.superAdmin.admins" fallback={<NotFoundPage />}>
                            <SuperAdminAdminManagement />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="api-keys"
                    element={
                        <RouteAccessGuard routeKey="route.superAdmin.apiKeys" fallback={<NotFoundPage />}>
                            <ApiKeyManagementPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <RouteAccessGuard routeKey="route.superAdmin.profile" fallback={<NotFoundPage />}>
                            <ProfilePage />
                        </RouteAccessGuard>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default SuperAdminRoutes
