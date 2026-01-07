import { Routes, Route } from "react-router-dom"
import MaintenanceLayout from "../layouts/MaintenanceLayout.jsx"

// Maintenance-specific pages
import { MaintenancePage, AttendancePage as MaintenanceAttendance } from "../pages/maintenance"

// Common pages
import { MyTasksPage, LeavesPage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const MaintenanceRoutes = () => (
    <ProtectedRoute allowedRoles={["Maintenance Staff"]}>
        <Routes>
            <Route element={<MaintenanceLayout />}>
                <Route index element={<MaintenancePage />} />
                <Route path="attendance" element={<MaintenanceAttendance />} />
                <Route path="my-tasks" element={<MyTasksPage />} />
                <Route path="leaves" element={<LeavesPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default MaintenanceRoutes
