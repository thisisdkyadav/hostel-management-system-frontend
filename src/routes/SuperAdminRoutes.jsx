import { Routes, Route } from "react-router-dom"
import SuperAdminLayout from "../layouts/SuperAdminLayout.jsx"
import SuperAdminDashboard from "../pages/superadmin/Dashboard.jsx"
import SuperAdminAdminManagement from "../pages/superadmin/AdminManagement.jsx"
import ApiKeyManagement from "../pages/superadmin/ApiKeyManagement.jsx"
import Profile from "../pages/Profile.jsx"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const SuperAdminRoutes = () => (
    <ProtectedRoute allowedRoles={["Super Admin"]}>
        <Routes>
            <Route element={<SuperAdminLayout />}>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="admins" element={<SuperAdminAdminManagement />} />
                <Route path="api-keys" element={<ApiKeyManagement />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default SuperAdminRoutes
