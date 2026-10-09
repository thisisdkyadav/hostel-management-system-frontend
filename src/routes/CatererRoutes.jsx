import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import CatererLayout from "../layouts/CatererLayout"
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const DashboardPage = lazy(() => import("../pages/caterer/DashboardPage"))
const MealVerificationPage = lazy(() => import("../pages/caterer/MealVerificationPage"))
const MealRecordsPage = lazy(() => import("../pages/caterer/MealRecordsPage"))
const RebatesPage = lazy(() => import("../pages/caterer/RebatesPage"))
const LiveFeedPage = lazy(() => import("../pages/caterer/LiveFeedPage"))

const CatererRoutes = () => (
  <ProtectedRoute allowedRoles={["Dining"]} allowedSubRoles={["Caterer"]}>
    <Suspense fallback={<LoadingPage message="Loading Caterer Portal..." />}>
      <Routes>
        <Route element={<CatererLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.caterer.dashboard" fallback={<NotFoundPage />}>
                <DashboardPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="meal-verification"
            element={
              <RouteAccessGuard routeKey="route.caterer.mealVerification" fallback={<NotFoundPage />}>
                <MealVerificationPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="meal-records"
            element={
              <RouteAccessGuard routeKey="route.caterer.mealRecords" fallback={<NotFoundPage />}>
                <MealRecordsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="rebates"
            element={
              <RouteAccessGuard routeKey="route.caterer.rebates" fallback={<NotFoundPage />}>
                <RebatesPage />
              </RouteAccessGuard>
            }
          />
        </Route>
        {/* Full-screen display: no sidebar or header. Same feed data as Current Meal, so the same route key. */}
        <Route
          path="live"
          element={
            <RouteAccessGuard routeKey="route.caterer.mealVerification" fallback={<NotFoundPage />}>
              <LiveFeedPage />
            </RouteAccessGuard>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </ProtectedRoute>
)

export default CatererRoutes
