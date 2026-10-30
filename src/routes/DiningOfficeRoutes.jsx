const InternAccommodationPage = lazy(() => import("../pages/common/InternAccommodationPage"))
import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import DiningOfficeLayout from "../layouts/DiningOfficeLayout"
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const DashboardPage = lazy(() => import("../pages/dining-office/DashboardPage"))
// Operational dining admin pages — reused as-is from the admin portal. They are
// path-aware (billing pages derive their base from the URL) so the same
// components render under /dining-office/* for the Office sub-role.
const CaterersPage = lazy(() => import("../pages/admin/CaterersPage"))
const DiningPeriodsPage = lazy(() => import("../pages/admin/DiningPeriodsPage"))
const DiningRebatesPage = lazy(() => import("../pages/admin/DiningRebatesPage"))
const DiningBillingPage = lazy(() => import("../pages/admin/DiningBillingPage"))
const DiningBillingDetailPage = lazy(() => import("../pages/admin/DiningBillingDetailPage"))
const BillingCyclesPage = lazy(() => import("../pages/admin/BillingCyclesPage"))
// The caterer Meal Records and Live Feed, across every caterer.
const DiningMealRecordsPage = lazy(() => import("../pages/common/DiningMealRecordsPage"))
const DailyMealsPage = lazy(() => import("../pages/common/DailyMealsPage"))
const DiningLiveFeedPage = lazy(() => import("../pages/common/DiningLiveFeedPage"))
// Who is allocated to which caterer, period by period.
const DiningAllocationsPage = lazy(() => import("../pages/common/DiningAllocationsPage"))
// Yes/no student attributes (e.g. Jain food) and their answers.
const DiningTagsPage = lazy(() => import("../pages/common/DiningTagsPage"))

const guardRoute = (routeKey, element) => (
  <RouteAccessGuard routeKey={routeKey} fallback={<NotFoundPage />}>
    {element}
  </RouteAccessGuard>
)

const DiningOfficeRoutes = () => (
  <ProtectedRoute allowedRoles={["Dining"]} allowedSubRoles={["Office"]}>
    <Suspense fallback={<LoadingPage message="Loading Dining Office..." />}>
      <Routes>
        <Route element={<DiningOfficeLayout />}>
          <Route path="intern-accommodation" element={<RouteAccessGuard routeKey="route.dining.internAccommodation" fallback={<NotFoundPage />}><InternAccommodationPage /></RouteAccessGuard>} />
          <Route index element={guardRoute("route.diningOffice.dashboard", <DashboardPage />)} />
          <Route path="caterers" element={guardRoute("route.admin.caterers", <CaterersPage />)} />
          <Route path="dining-periods" element={guardRoute("route.admin.diningPeriods", <DiningPeriodsPage />)} />
          <Route path="allocations" element={guardRoute("route.admin.diningAllocations", <DiningAllocationsPage home="/dining-office" />)} />
          <Route path="dining-tags" element={guardRoute("route.admin.diningTags", <DiningTagsPage />)} />
          <Route path="dining-rebates" element={guardRoute("route.admin.diningRebates", <DiningRebatesPage />)} />
          <Route path="dining-billing" element={guardRoute("route.admin.diningBilling", <DiningBillingPage />)} />
          <Route path="dining-billing/:billingPeriodId" element={guardRoute("route.admin.diningBilling", <DiningBillingDetailPage />)} />
          <Route path="billing-cycles" element={guardRoute("route.admin.diningBilling", <BillingCyclesPage />)} />
          <Route path="billing-cycles/:periodId" element={guardRoute("route.admin.diningBilling", <BillingCyclesPage />)} />
          <Route path="daily-meals" element={guardRoute("route.admin.caterers", <DailyMealsPage home="/dining-office" />)} />
          <Route path="meal-records" element={guardRoute("route.admin.caterers", <DiningMealRecordsPage home="/dining-office" />)} />
        </Route>
        {/* Full-screen display: no sidebar or header. */}
        <Route path="live" element={guardRoute("route.admin.caterers", <DiningLiveFeedPage home="/dining-office" />)} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </ProtectedRoute>
)

export default DiningOfficeRoutes
