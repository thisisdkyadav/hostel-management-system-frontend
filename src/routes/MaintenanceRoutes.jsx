import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import MaintenanceLayout from "../layouts/MaintenanceLayout.jsx"

// Maintenance-specific pages
const MaintenancePage = lazy(() => import("../pages/maintenance/MaintenancePage"))
const MaintenanceAttendance = lazy(() => import("../pages/maintenance/AttendancePage"))

// Common pages
const MyTasksPage = lazy(() => import("../pages/common/MyTasksPage"))
const LeavesPage = lazy(() => import("../pages/common/LeavesPage"))

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const maintenancePrefetchLoaders = [
  () => import("../pages/maintenance/MaintenancePage"),
  () => import("../pages/maintenance/AttendancePage"),
  () => import("../pages/common/MyTasksPage"),
  () => import("../pages/common/LeavesPage"),
]

const MaintenanceRolePrefetch = () => {
  useBackgroundPrefetch(maintenancePrefetchLoaders)
  return null
}

const MaintenanceRoutes = () => (
  <ProtectedRoute allowedRoles={["Maintenance Staff"]}>
    <Suspense fallback={<LoadingPage message="Loading Maintenance Portal..." />}>
      <MaintenanceRolePrefetch />
      <Routes>
        <Route element={<MaintenanceLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.maintenance.dashboard" fallback={<NotFoundPage />}>
                <MaintenancePage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="attendance"
            element={
              <RouteAccessGuard routeKey="route.maintenance.attendance" fallback={<NotFoundPage />}>
                <MaintenanceAttendance />
              </RouteAccessGuard>
            }
          />
          <Route
            path="my-tasks"
            element={
              <RouteAccessGuard routeKey="route.maintenance.myTasks" fallback={<NotFoundPage />}>
                <MyTasksPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="leaves"
            element={
              <RouteAccessGuard routeKey="route.maintenance.leaves" fallback={<NotFoundPage />}>
                <LeavesPage />
              </RouteAccessGuard>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  </ProtectedRoute>
)

export default MaintenanceRoutes
