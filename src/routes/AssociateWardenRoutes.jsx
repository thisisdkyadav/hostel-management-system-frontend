import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import AssociateWardenLayout from "../layouts/AssociateWardenLayout.jsx"

// Warden-specific pages (shared with Warden role)
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

const associateWardenPrefetchLoaders = [
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

const AssociateWardenRolePrefetch = () => {
  useBackgroundPrefetch(associateWardenPrefetchLoaders)
  return null
}

const AssociateWardenRoutes = () => (
  <ProtectedRoute allowedRoles={["Associate Warden"]}>
    <Suspense fallback={<LoadingPage message="Loading Associate Warden Portal..." />}>
      <AssociateWardenRolePrefetch />
      <Routes>
        <Route element={<AssociateWardenLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.associateWarden.dashboard" fallback={<NotFoundPage />}>
                <WardenDashboard />
              </RouteAccessGuard>
            }
          />
          <Route
            path="hostels/:hostelName"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.hostels" fallback={<NotFoundPage />}>
                <UnitsAndRoomsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="hostels/:hostelName/units/:unitNumber"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.hostels" fallback={<NotFoundPage />}>
                <UnitsAndRoomsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="complaints"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.complaints" fallback={<NotFoundPage />}>
                <ComplaintsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="students"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.students" fallback={<NotFoundPage />}>
                <StudentsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="visitors"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.visitors" fallback={<NotFoundPage />}>
                <VisitorRequestsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="notifications"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.notifications" fallback={<NotFoundPage />}>
                <NotificationCenterPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="lost-and-found"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.lostAndFound" fallback={<NotFoundPage />}>
                <LostAndFoundPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="events"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.events" fallback={<NotFoundPage />}>
                <EventsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="student-inventory"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.studentInventory" fallback={<NotFoundPage />}>
                <StudentInventoryPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="profile"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.profile" fallback={<NotFoundPage />}>
                <ProfilePage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="feedbacks"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.feedbacks" fallback={<NotFoundPage />}>
                <FeedbacksPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="undertakings"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.undertakings" fallback={<NotFoundPage />}>
                <WardenUndertakings />
              </RouteAccessGuard>
            }
          />
          <Route
            path="my-tasks"
            element={
              <RouteAccessGuard routeKey="route.associateWarden.myTasks" fallback={<NotFoundPage />}>
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

export default AssociateWardenRoutes
