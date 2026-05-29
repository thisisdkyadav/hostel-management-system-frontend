import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import AcademicsLayout from "../layouts/AcademicsLayout"

const OverallBestPerformerPage = lazy(() => import("../pages/common/OverallBestPerformerPage"))
const ProfilePage = lazy(() => import("../pages/common/ProfilePage"))

import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

const academicsPrefetchLoaders = [
  () => import("../pages/common/OverallBestPerformerPage"),
  () => import("../pages/common/ProfilePage"),
]

const AcademicsRolePrefetch = () => {
  useBackgroundPrefetch(academicsPrefetchLoaders)
  return null
}

const AcademicsRoutes = () => (
  <ProtectedRoute allowedRoles={["Academics"]}>
    <Suspense fallback={<LoadingPage message="Loading Academics Portal..." />}>
      <AcademicsRolePrefetch />
      <Routes>
        <Route element={<AcademicsLayout />}>
          <Route index element={<Navigate to="overall-best-performer" replace />} />
          <Route
            path="overall-best-performer"
            element={(
              <RouteAccessGuard routeKey="route.academics.bestPerformer" fallback={<NotFoundPage />}>
                <OverallBestPerformerPage />
              </RouteAccessGuard>
            )}
          />
          <Route
            path="profile"
            element={(
              <RouteAccessGuard routeKey="route.academics.profile" fallback={<NotFoundPage />}>
                <ProfilePage />
              </RouteAccessGuard>
            )}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  </ProtectedRoute>
)

export default AcademicsRoutes
