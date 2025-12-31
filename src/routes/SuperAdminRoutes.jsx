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

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const SuperAdminRoutes = () => (
    <ProtectedRoute allowedRoles={["Super Admin"]}>
        <Routes>
            <Route element={<SuperAdminLayout />}>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="admins" element={<SuperAdminAdminManagement />} />
                <Route path="api-keys" element={<ApiKeyManagementPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default SuperAdminRoutes
