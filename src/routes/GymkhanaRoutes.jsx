import { Navigate, Routes, Route } from "react-router-dom"
import GymkhanaLayout from "../layouts/GymkhanaLayout"

// Gymkhana pages
import DashboardPage from "../pages/gymkhana/DashboardPage"
import { ElectionsPage, GymkhanaEventsPage, MegaEventsPage, ProfilePage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import AccessDenied from "../components/common/AccessDenied"

import { ProtectedRoute, useAuth } from "../contexts/AuthProvider.jsx"

const normalizeSubRole = (subRole = "") => String(subRole || "").trim().toLowerCase().replace(/\s+/g, " ")

const ElectionOfficerOnly = ({ children }) => {
    const { user, getHomeRoute } = useAuth()

    if (normalizeSubRole(user?.subRole) !== "election officer") {
        return (
            <AccessDenied
                message="Only Gymkhana election officers can access the elections workspace."
                to={getHomeRoute()}
            />
        )
    }

    return children
}

const NonElectionOfficerOnly = ({ children }) => {
    const { user, getHomeRoute } = useAuth()

    if (normalizeSubRole(user?.subRole) === "election officer") {
        return (
            <AccessDenied
                message="Election officers can only access the elections workspace."
                to={getHomeRoute()}
            />
        )
    }

    return children
}

const GymkhanaHomePage = () => {
    const { user } = useAuth()

    if (normalizeSubRole(user?.subRole) === "election officer") {
        return <Navigate to="/gymkhana/elections" replace />
    }

    return <DashboardPage />
}

const GymkhanaRoutes = () => (
    <ProtectedRoute allowedRoles={["Gymkhana"]}>
        <Routes>
            <Route element={<GymkhanaLayout />}>
                <Route
                    index
                    element={
                        <RouteAccessGuard routeKey="route.gymkhana.dashboard" fallback={<NotFoundPage />}>
                            <GymkhanaHomePage />
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="events"
                    element={
                        <RouteAccessGuard routeKey="route.gymkhana.events" fallback={<NotFoundPage />}>
                            <NonElectionOfficerOnly>
                                <GymkhanaEventsPage />
                            </NonElectionOfficerOnly>
                        </RouteAccessGuard>
                    }
                />
                <Route
                    path="mega-events"
                    element={
                        <RouteAccessGuard routeKey="route.gymkhana.megaEvents" fallback={<NotFoundPage />}>
                            <NonElectionOfficerOnly>
                                <MegaEventsPage />
                            </NonElectionOfficerOnly>
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
                <Route
                    path="elections"
                    element={
                        <RouteAccessGuard routeKey="route.gymkhana.elections" fallback={<NotFoundPage />}>
                            <ElectionOfficerOnly>
                                <ElectionsPage />
                            </ElectionOfficerOnly>
                        </RouteAccessGuard>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default GymkhanaRoutes
