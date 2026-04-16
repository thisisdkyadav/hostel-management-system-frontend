import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import HostelSupervisorLayout from "../layouts/HostelSupervisorLayout.jsx"

// Warden-specific pages (shared with Warden role)
const WardenDashboard = lazy(() => import("../pages/warden/DashboardPage"))
const StudentInventoryPage = lazy(() => import("../pages/warden/StudentInventoryPage"))
const FeedbacksPage = lazy(() => import("../pages/warden/FeedbacksPage"))
const WardenUndertakings = lazy(() => import("../pages/warden/UndertakingsPage"))

// Common pages
const UnitsAndRoomsPage = lazy(() => import("../pages/common/UnitsAndRoomsPage"))
const ComplaintsPage = lazy(() => import("../pages/common/ComplaintsPage"))
const LeavesPage = lazy(() => import("../pages/common/LeavesPage"))
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

const hostelSupervisorPrefetchLoaders = [
  () => import("../pages/warden/DashboardPage"),
  () => import("../pages/warden/StudentInventoryPage"),
  () => import("../pages/warden/FeedbacksPage"),
  () => import("../pages/warden/UndertakingsPage"),
  () => import("../pages/common/UnitsAndRoomsPage"),
  () => import("../pages/common/ComplaintsPage"),
  () => import("../pages/common/LeavesPage"),
  () => import("../pages/common/StudentsPage"),
  () => import("../pages/common/VisitorRequestsPage"),
  () => import("../pages/common/NotificationCenterPage"),
  () => import("../pages/common/LostAndFoundPage"),
  () => import("../pages/common/EventsPage"),
  () => import("../pages/common/ProfilePage"),
  () => import("../pages/common/MyTasksPage"),
]

const HostelSupervisorRolePrefetch = () => {
  useBackgroundPrefetch(hostelSupervisorPrefetchLoaders)
  return null
}

const HostelSupervisorRoutes = () => (
  <ProtectedRoute allowedRoles={["Hostel Supervisor"]}>
    <Suspense fallback={<LoadingPage message="Loading Hostel Supervisor Portal..." />}>
      <HostelSupervisorRolePrefetch />
      <Routes>
        <Route element={<HostelSupervisorLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.dashboard" fallback={<NotFoundPage />}>
                <WardenDashboard />
              </RouteAccessGuard>
            }
          />
          <Route
            path="hostels/:hostelName"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.hostels" fallback={<NotFoundPage />}>
                <UnitsAndRoomsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="hostels/:hostelName/units/:unitNumber"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.hostels" fallback={<NotFoundPage />}>
                <UnitsAndRoomsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="complaints"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.complaints" fallback={<NotFoundPage />}>
                <ComplaintsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="leaves"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.leaves" fallback={<NotFoundPage />}>
                <LeavesPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="students"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.students" fallback={<NotFoundPage />}>
                <StudentsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="visitors"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.visitors" fallback={<NotFoundPage />}>
                <VisitorRequestsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="notifications"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.notifications" fallback={<NotFoundPage />}>
                <NotificationCenterPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="lost-and-found"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.lostAndFound" fallback={<NotFoundPage />}>
                <LostAndFoundPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="events"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.events" fallback={<NotFoundPage />}>
                <EventsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="student-inventory"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.studentInventory" fallback={<NotFoundPage />}>
                <StudentInventoryPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="profile"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.profile" fallback={<NotFoundPage />}>
                <ProfilePage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="feedbacks"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.feedbacks" fallback={<NotFoundPage />}>
                <FeedbacksPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="undertakings"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.undertakings" fallback={<NotFoundPage />}>
                <WardenUndertakings />
              </RouteAccessGuard>
            }
          />
          <Route
            path="my-tasks"
            element={
              <RouteAccessGuard routeKey="route.hostelSupervisor.myTasks" fallback={<NotFoundPage />}>
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

export default HostelSupervisorRoutes
