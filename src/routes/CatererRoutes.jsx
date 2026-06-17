import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import CatererLayout from "../layouts/CatererLayout"
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const DashboardPage = lazy(() => import("../pages/caterer/DashboardPage"))
const MealVerificationPage = lazy(() => import("../pages/caterer/MealVerificationPage"))

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
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </ProtectedRoute>
)

export default CatererRoutes
