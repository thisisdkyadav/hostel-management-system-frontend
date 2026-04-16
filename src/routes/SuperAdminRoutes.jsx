import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import SuperAdminLayout from "../layouts/SuperAdminLayout.jsx"

// SuperAdmin-specific pages
const SuperAdminDashboard = lazy(() => import("../pages/superadmin/DashboardPage"))
const SuperAdminAdminManagement = lazy(() => import("../pages/superadmin/AdminManagementPage"))
const ApiKeyManagementPage = lazy(() => import("../pages/superadmin/ApiKeyManagementPage"))
const SuperAdminAuthzManagement = lazy(() => import("../pages/superadmin/AuthzManagementPage"))
const SuperAdminAuthzHelpPage = lazy(() => import("../pages/superadmin/AuthzHelpPage"))

// Common pages
const ProfilePage = lazy(() => import("../pages/common/ProfilePage"))

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const superAdminPrefetchLoaders = [
  () => import("../pages/superadmin/DashboardPage"),
  () => import("../pages/superadmin/AdminManagementPage"),
  () => import("../pages/superadmin/ApiKeyManagementPage"),
  () => import("../pages/superadmin/AuthzManagementPage"),
  () => import("../pages/superadmin/AuthzHelpPage"),
  () => import("../pages/common/ProfilePage"),
]

const SuperAdminRolePrefetch = () => {
  useBackgroundPrefetch(superAdminPrefetchLoaders)
  return null
}

const SuperAdminRoutes = () => (
  <ProtectedRoute allowedRoles={["Super Admin"]}>
    <Suspense fallback={<LoadingPage message="Loading Super Admin..." />}>
      <SuperAdminRolePrefetch />
      <Routes>
        <Route element={<SuperAdminLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.superAdmin.dashboard" fallback={<NotFoundPage />}>
                <SuperAdminDashboard />
              </RouteAccessGuard>
            }
          />
          <Route
            path="admins"
            element={
              <RouteAccessGuard routeKey="route.superAdmin.admins" fallback={<NotFoundPage />}>
                <SuperAdminAdminManagement />
              </RouteAccessGuard>
            }
          />
          <Route
            path="api-keys"
            element={
              <RouteAccessGuard routeKey="route.superAdmin.apiKeys" fallback={<NotFoundPage />}>
                <ApiKeyManagementPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="authz"
            element={
              <RouteAccessGuard routeKey="route.superAdmin.authz" fallback={<NotFoundPage />}>
                <SuperAdminAuthzManagement />
              </RouteAccessGuard>
            }
          />
          <Route
            path="authz/help"
            element={
              <RouteAccessGuard routeKey="route.superAdmin.authz" fallback={<NotFoundPage />}>
                <SuperAdminAuthzHelpPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="profile"
            element={
              <RouteAccessGuard routeKey="route.superAdmin.profile" fallback={<NotFoundPage />}>
                <ProfilePage />
              </RouteAccessGuard>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  </ProtectedRoute>
)

export default SuperAdminRoutes
