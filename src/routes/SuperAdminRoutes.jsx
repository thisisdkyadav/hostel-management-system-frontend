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

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const SuperAdminRoutes = () => (
    <ProtectedRoute allowedRoles={["Super Admin"]}>
        <Routes>
            <Route element={<SuperAdminLayout />}>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="admins" element={<SuperAdminAdminManagement />} />
                <Route path="api-keys" element={<ApiKeyManagementPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default SuperAdminRoutes
