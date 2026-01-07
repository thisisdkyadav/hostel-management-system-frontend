import { Routes, Route } from "react-router-dom"
import SecurityLayout from "../layouts/SecurityLayout.jsx"

// Guard-specific pages
import { AttendancePage } from "../pages/guard"

// Common pages
import { LostAndFoundPage, MyTasksPage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const SecurityRoutes = () => (
    <ProtectedRoute allowedRoles={["Security"]}>
        <Routes>
            <Route element={<SecurityLayout />}>
                <Route index element={<AttendancePage />} />
                <Route path="lost-and-found" element={<LostAndFoundPage />} />
                <Route path="my-tasks" element={<MyTasksPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default SecurityRoutes
