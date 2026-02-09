import { Routes, Route } from "react-router-dom"
import GymkhanaLayout from "../layouts/GymkhanaLayout"

// Gymkhana pages
import DashboardPage from "../pages/gymkhana/DashboardPage"
import { GymkhanaEventsPage, ProfilePage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const GymkhanaRoutes = () => (
    <ProtectedRoute allowedRoles={["Gymkhana"]}>
        <Routes>
            <Route element={<GymkhanaLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="events" element={<GymkhanaEventsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default GymkhanaRoutes
