import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import StudentLayout from "../layouts/StudentLayout.jsx"

// Student-specific pages
const StudentDashboard = lazy(() => import("../pages/student/DashboardPage"))
const IDCardPage = lazy(() => import("../pages/student/IDCardPage"))
const UndertakingsPage = lazy(() => import("../pages/student/UndertakingsPage"))
const SecurityPage = lazy(() => import("../pages/student/SecurityPage"))

// Common pages
const VisitorRequestsPage = lazy(() => import("../pages/common/VisitorRequestsPage"))
const ComplaintsPage = lazy(() => import("../pages/common/ComplaintsPage"))
const ProfilePage = lazy(() => import("../pages/common/ProfilePage"))
const LostAndFoundPage = lazy(() => import("../pages/common/LostAndFoundPage"))
const EventsPage = lazy(() => import("../pages/common/EventsPage"))
const ElectionsPage = lazy(() => import("../pages/common/ElectionsPage"))
const NotificationCenterPage = lazy(() => import("../pages/common/NotificationCenterPage"))
const OverallBestPerformerPage = lazy(() => import("../pages/common/OverallBestPerformerPage"))

// Warden pages (shared)
const FeedbacksPage = lazy(() => import("../pages/warden/FeedbacksPage"))

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const studentPrefetchLoaders = [
  () => import("../pages/student/DashboardPage"),
  () => import("../pages/student/IDCardPage"),
  () => import("../pages/student/UndertakingsPage"),
  () => import("../pages/student/SecurityPage"),
  () => import("../pages/common/VisitorRequestsPage"),
  () => import("../pages/common/ComplaintsPage"),
  () => import("../pages/common/ProfilePage"),
  () => import("../pages/common/LostAndFoundPage"),
  () => import("../pages/common/EventsPage"),
  () => import("../pages/common/ElectionsPage"),
  () => import("../pages/common/NotificationCenterPage"),
  () => import("../pages/common/OverallBestPerformerPage"),
  () => import("../pages/warden/FeedbacksPage"),
]

const StudentRolePrefetch = () => {
  useBackgroundPrefetch(studentPrefetchLoaders)
  return null
}

const StudentRoutes = () => (
  <ProtectedRoute allowedRoles={["Student"]}>
    <Suspense fallback={<LoadingPage message="Loading Student Portal..." />}>
      <StudentRolePrefetch />
      <Routes>
        <Route element={<StudentLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.student.dashboard" fallback={<NotFoundPage />}>
                <StudentDashboard />
              </RouteAccessGuard>
            }
          />
          <Route
            path="complaints"
            element={
              <RouteAccessGuard routeKey="route.student.complaints" fallback={<NotFoundPage />}>
                <ComplaintsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="profile"
            element={
              <RouteAccessGuard routeKey="route.student.profile" fallback={<NotFoundPage />}>
                <ProfilePage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="lost-and-found"
            element={
              <RouteAccessGuard routeKey="route.student.lostAndFound" fallback={<NotFoundPage />}>
                <LostAndFoundPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="events"
            element={
              <RouteAccessGuard routeKey="route.student.events" fallback={<NotFoundPage />}>
                <EventsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="feedbacks"
            element={
              <RouteAccessGuard routeKey="route.student.feedbacks" fallback={<NotFoundPage />}>
                <FeedbacksPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="notifications"
            element={
              <RouteAccessGuard routeKey="route.student.notifications" fallback={<NotFoundPage />}>
                <NotificationCenterPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="visitors"
            element={
              <RouteAccessGuard routeKey="route.student.visitors" fallback={<NotFoundPage />}>
                <VisitorRequestsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="security"
            element={
              <RouteAccessGuard routeKey="route.student.security" fallback={<NotFoundPage />}>
                <SecurityPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="id-card"
            element={
              <RouteAccessGuard routeKey="route.student.idCard" fallback={<NotFoundPage />}>
                <IDCardPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="undertakings"
            element={
              <RouteAccessGuard routeKey="route.student.undertakings" fallback={<NotFoundPage />}>
                <UndertakingsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="overall-best-performer"
            element={
              <RouteAccessGuard routeKey="route.student.overallBestPerformer" fallback={<NotFoundPage />}>
                <OverallBestPerformerPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="elections"
            element={
              <RouteAccessGuard routeKey="route.student.elections" fallback={<NotFoundPage />}>
                <ElectionsPage />
              </RouteAccessGuard>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  </ProtectedRoute>
)

export default StudentRoutes
