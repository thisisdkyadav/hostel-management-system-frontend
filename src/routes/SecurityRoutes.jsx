import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import SecurityLayout from "../layouts/SecurityLayout.jsx"

// Guard-specific pages
const AttendancePage = lazy(() => import("../pages/guard/AttendancePage"))

// Common pages
const LostAndFoundPage = lazy(() => import("../pages/common/LostAndFoundPage"))
const MyTasksPage = lazy(() => import("../pages/common/MyTasksPage"))

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const securityPrefetchLoaders = [
  () => import("../pages/guard/AttendancePage"),
  () => import("../pages/common/LostAndFoundPage"),
  () => import("../pages/common/MyTasksPage"),
]

const SecurityRolePrefetch = () => {
  useBackgroundPrefetch(securityPrefetchLoaders)
  return null
}

const SecurityRoutes = () => (
  <ProtectedRoute allowedRoles={["Security"]}>
    <Suspense fallback={<LoadingPage message="Loading Security Portal..." />}>
      <SecurityRolePrefetch />
      <Routes>
        <Route element={<SecurityLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.security.attendance" fallback={<NotFoundPage />}>
                <AttendancePage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="lost-and-found"
            element={
              <RouteAccessGuard routeKey="route.security.lostAndFound" fallback={<NotFoundPage />}>
                <LostAndFoundPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="my-tasks"
            element={
              <RouteAccessGuard routeKey="route.security.myTasks" fallback={<NotFoundPage />}>
                <MyTasksPage />
              </RouteAccessGuard>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  </ProtectedRoute>
)

export default SecurityRoutes
