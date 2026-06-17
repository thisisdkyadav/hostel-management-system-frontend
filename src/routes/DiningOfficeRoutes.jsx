import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import DiningOfficeLayout from "../layouts/DiningOfficeLayout"
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const DashboardPage = lazy(() => import("../pages/dining-office/DashboardPage"))

const DiningOfficeRoutes = () => (
  <ProtectedRoute allowedRoles={["Dining"]} allowedSubRoles={["Office"]}>
    <Suspense fallback={<LoadingPage message="Loading Dining Office..." />}>
      <Routes>
        <Route element={<DiningOfficeLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.diningOffice.dashboard" fallback={<NotFoundPage />}>
                <DashboardPage />
              </RouteAccessGuard>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </ProtectedRoute>
)

export default DiningOfficeRoutes
