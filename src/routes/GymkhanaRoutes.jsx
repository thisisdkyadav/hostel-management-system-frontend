import { lazy, Suspense } from "react"
import { Navigate, Routes, Route } from "react-router-dom"
import GymkhanaLayout from "../layouts/GymkhanaLayout"

// Gymkhana pages
const DashboardPage = lazy(() => import("../pages/gymkhana/DashboardPage"))
const ElectionsPage = lazy(() => import("../pages/common/ElectionsPage"))
const GymkhanaEventsPage = lazy(() => import("../pages/common/GymkhanaEventsPage"))
const MegaEventsPage = lazy(() => import("../pages/common/MegaEventsPage"))
const ProfilePage = lazy(() => import("../pages/common/ProfilePage"))

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import AccessDenied from "../components/common/AccessDenied"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

import { ProtectedRoute, useAuth } from "../contexts/AuthProvider.jsx"

const gymkhanaPrefetchLoaders = [
  () => import("../pages/gymkhana/DashboardPage"),
  () => import("../pages/common/ElectionsPage"),
  () => import("../pages/common/GymkhanaEventsPage"),
  () => import("../pages/common/MegaEventsPage"),
  () => import("../pages/common/ProfilePage"),
]

const GymkhanaRolePrefetch = () => {
  useBackgroundPrefetch(gymkhanaPrefetchLoaders)
  return null
}

const normalizeSubRole = (subRole = "") =>
  String(subRole || "").trim().toLowerCase().replace(/\s+/g, " ")

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
    <Suspense fallback={<LoadingPage message="Loading Gymkhana Portal..." />}>
      <GymkhanaRolePrefetch />
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
    </Suspense>
  </ProtectedRoute>
)

export default GymkhanaRoutes
