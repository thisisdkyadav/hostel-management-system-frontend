import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import WardenLayout from "../layouts/WardenLayout.jsx"

// Warden-specific pages
const WardenDashboard = lazy(() => import("../pages/warden/DashboardPage"))
const StudentInventoryPage = lazy(() => import("../pages/warden/StudentInventoryPage"))
const FeedbacksPage = lazy(() => import("../pages/warden/FeedbacksPage"))
const WardenUndertakings = lazy(() => import("../pages/warden/UndertakingsPage"))

// Common pages
const UnitsAndRoomsPage = lazy(() => import("../pages/common/UnitsAndRoomsPage"))
const ComplaintsPage = lazy(() => import("../pages/common/ComplaintsPage"))
const StudentsPage = lazy(() => import("../pages/common/StudentsPage"))
const VisitorRequestsPage = lazy(() => import("../pages/common/VisitorRequestsPage"))
const NotificationCenterPage = lazy(() => import("../pages/common/NotificationCenterPage"))
const LostAndFoundPage = lazy(() => import("../pages/common/LostAndFoundPage"))
const EventsPage = lazy(() => import("../pages/common/EventsPage"))
const ProfilePage = lazy(() => import("../pages/common/ProfilePage"))
const MyTasksPage = lazy(() => import("../pages/common/MyTasksPage"))

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const wardenPrefetchLoaders = [
  () => import("../pages/warden/DashboardPage"),
  () => import("../pages/warden/StudentInventoryPage"),
  () => import("../pages/warden/FeedbacksPage"),
  () => import("../pages/warden/UndertakingsPage"),
  () => import("../pages/common/UnitsAndRoomsPage"),
  () => import("../pages/common/ComplaintsPage"),
  () => import("../pages/common/StudentsPage"),
  () => import("../pages/common/VisitorRequestsPage"),
  () => import("../pages/common/NotificationCenterPage"),
  () => import("../pages/common/LostAndFoundPage"),
  () => import("../pages/common/EventsPage"),
  () => import("../pages/common/ProfilePage"),
  () => import("../pages/common/MyTasksPage"),
]

const WardenRolePrefetch = () => {
  useBackgroundPrefetch(wardenPrefetchLoaders)
  return null
}

const WardenRoutes = () => (
  <ProtectedRoute allowedRoles={["Warden"]}>
    <Suspense fallback={<LoadingPage message="Loading Warden Portal..." />}>
      <WardenRolePrefetch />
      <Routes>
        <Route element={<WardenLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.warden.dashboard" fallback={<NotFoundPage />}>
                <WardenDashboard />
              </RouteAccessGuard>
            }
          />
          <Route
            path="hostels/:hostelName"
            element={
              <RouteAccessGuard routeKey="route.warden.hostels" fallback={<NotFoundPage />}>
                <UnitsAndRoomsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="hostels/:hostelName/units/:unitNumber"
            element={
              <RouteAccessGuard routeKey="route.warden.hostels" fallback={<NotFoundPage />}>
                <UnitsAndRoomsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="complaints"
            element={
              <RouteAccessGuard routeKey="route.warden.complaints" fallback={<NotFoundPage />}>
                <ComplaintsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="students"
            element={
              <RouteAccessGuard routeKey="route.warden.students" fallback={<NotFoundPage />}>
                <StudentsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="visitors"
            element={
              <RouteAccessGuard routeKey="route.warden.visitors" fallback={<NotFoundPage />}>
                <VisitorRequestsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="notifications"
            element={
              <RouteAccessGuard routeKey="route.warden.notifications" fallback={<NotFoundPage />}>
                <NotificationCenterPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="lost-and-found"
            element={
              <RouteAccessGuard routeKey="route.warden.lostAndFound" fallback={<NotFoundPage />}>
                <LostAndFoundPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="events"
            element={
              <RouteAccessGuard routeKey="route.warden.events" fallback={<NotFoundPage />}>
                <EventsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="student-inventory"
            element={
              <RouteAccessGuard routeKey="route.warden.studentInventory" fallback={<NotFoundPage />}>
                <StudentInventoryPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="profile"
            element={
              <RouteAccessGuard routeKey="route.warden.profile" fallback={<NotFoundPage />}>
                <ProfilePage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="feedbacks"
            element={
              <RouteAccessGuard routeKey="route.warden.feedbacks" fallback={<NotFoundPage />}>
                <FeedbacksPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="undertakings"
            element={
              <RouteAccessGuard routeKey="route.warden.undertakings" fallback={<NotFoundPage />}>
                <WardenUndertakings />
              </RouteAccessGuard>
            }
          />
          <Route
            path="my-tasks"
            element={
              <RouteAccessGuard routeKey="route.warden.myTasks" fallback={<NotFoundPage />}>
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

export default WardenRoutes
