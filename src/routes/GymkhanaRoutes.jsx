import { Routes, Route } from "react-router-dom"
import GymkhanaLayout from "../layouts/GymkhanaLayout"

// Gymkhana pages
import DashboardPage from "../pages/gymkhana/DashboardPage"
import { GymkhanaEventsPage, MegaEventsPage, ProfilePage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const GymkhanaRoutes = () => (
    <ProtectedRoute allowedRoles={["Gymkhana"]}>
        <Routes>
            <Route element={<GymkhanaLayout />}>
                <Route
                    index
                    element={
                        <RouteAccessGuard routeKey="route.gymkhana.dashboard" fallback={<NotFoundPage />}>
                            <DashboardPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="events"
                    element={
                        <RouteAccessGuard routeKey="route.gymkhana.events" fallback={<NotFoundPage />}>
                            <GymkhanaEventsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="mega-events"
                    element={
                        <RouteAccessGuard routeKey="route.gymkhana.megaEvents" fallback={<NotFoundPage />}>
                            <MegaEventsPage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <RouteAccessGuard routeKey="route.gymkhana.profile" fallback={<NotFoundPage />}>
                            <ProfilePage />
                        </RouteAccessGuard>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default GymkhanaRoutes
