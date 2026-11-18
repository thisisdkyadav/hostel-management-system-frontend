const InternAccommodationPage = lazy(() => import("../pages/common/InternAccommodationPage"))
import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import AcademicsLayout from "../layouts/AcademicsLayout"

// TEMP: Best Performer hidden from Academics (see route below).
// const OverallBestPerformerPage = lazy(() => import("../pages/common/OverallBestPerformerPage"))
const ProfilePage = lazy(() => import("../pages/common/ProfilePage"))

import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

const academicsPrefetchLoaders = [
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
          <Route path="intern-accommodation" element={<RouteAccessGuard routeKey="route.academics.internAccommodation" fallback={<NotFoundPage />}><InternAccommodationPage /></RouteAccessGuard>} />
          {/* TEMP: Best Performer hidden from Academics; home goes to Intern Accommodation.
              Restore the route below and the nav item in navigationConfig.js to bring it back. */}
          <Route index element={<Navigate to="intern-accommodation" replace />} />
          {/* <Route
            path="overall-best-performer"
            element={(
              <RouteAccessGuard routeKey="route.academics.bestPerformer" fallback={<NotFoundPage />}>
                <OverallBestPerformerPage />
              </RouteAccessGuard>
            )}
          /> */}
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
