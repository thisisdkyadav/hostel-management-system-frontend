import { Routes, Route } from "react-router-dom"
import MaintenanceLayout from "../layouts/MaintenanceLayout.jsx"
import MaintenancePage from "../pages/maintainance/MaintenancePage"
import MaintenanceAttendance from "../pages/maintainance/Attendance.jsx"
import MyTasks from "../pages/MyTasks.jsx"
import Leaves from "../pages/Leaves.jsx"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const MaintenanceRoutes = () => (
    <ProtectedRoute allowedRoles={["Maintenance Staff"]}>
        <Routes>
            <Route element={<MaintenanceLayout />}>
                <Route index element={<MaintenancePage />} />
                <Route path="attendance" element={<MaintenanceAttendance />} />
                <Route path="my-tasks" element={<MyTasks />} />
                <Route path="leaves" element={<Leaves />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default MaintenanceRoutes
