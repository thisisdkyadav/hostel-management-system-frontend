import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import HostelGateLayout from "../layouts/HostelGateLayout.jsx"

// Guard-specific pages
const AddStudentEntryPage = lazy(() => import("../pages/guard/AddStudentEntryPage"))
const StudentEntriesPage = lazy(() => import("../pages/guard/StudentEntriesPage"))
const ScannerEntriesPage = lazy(() => import("../pages/guard/ScannerEntriesPage"))
const FaceScannerEntriesPage = lazy(() => import("../pages/guard/FaceScannerEntriesPage"))
const HostelGateAttendancePage = lazy(() => import("../pages/guard/HostelGateAttendancePage"))
const AppointmentsGatePage = lazy(() => import("../pages/guard/AppointmentsGatePage"))

// Common pages
const VisitorRequestsPage = lazy(() => import("../pages/common/VisitorRequestsPage"))
const LostAndFoundPage = lazy(() => import("../pages/common/LostAndFoundPage"))
const MyTasksPage = lazy(() => import("../pages/common/MyTasksPage"))

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"
import useBackgroundPrefetch from "../hooks/useBackgroundPrefetch"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const hostelGatePrefetchLoaders = [
  () => import("../pages/guard/AddStudentEntryPage"),
  () => import("../pages/guard/StudentEntriesPage"),
  () => import("../pages/guard/ScannerEntriesPage"),
  () => import("../pages/guard/FaceScannerEntriesPage"),
  () => import("../pages/guard/HostelGateAttendancePage"),
  () => import("../pages/guard/AppointmentsGatePage"),
  () => import("../pages/common/VisitorRequestsPage"),
  () => import("../pages/common/LostAndFoundPage"),
  () => import("../pages/common/MyTasksPage"),
]

const HostelGateRolePrefetch = () => {
  useBackgroundPrefetch(hostelGatePrefetchLoaders)
  return null
}

const HostelGateRoutes = () => (
  <ProtectedRoute allowedRoles={["Hostel Gate"]}>
    <Suspense fallback={<LoadingPage message="Loading Hostel Gate Portal..." />}>
      <HostelGateRolePrefetch />
      <Routes>
        <Route element={<HostelGateLayout />}>
          <Route
            index
            element={
              <RouteAccessGuard routeKey="route.hostelGate.dashboard" fallback={<NotFoundPage />}>
                <AddStudentEntryPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="visitors"
            element={
              <RouteAccessGuard routeKey="route.hostelGate.visitors" fallback={<NotFoundPage />}>
                <VisitorRequestsPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="lost-and-found"
            element={
              <RouteAccessGuard routeKey="route.hostelGate.lostAndFound" fallback={<NotFoundPage />}>
                <LostAndFoundPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="entries"
            element={
              <RouteAccessGuard routeKey="route.hostelGate.entries" fallback={<NotFoundPage />}>
                <StudentEntriesPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="scanner-entries"
            element={
              <RouteAccessGuard routeKey="route.hostelGate.scannerEntries" fallback={<NotFoundPage />}>
                <ScannerEntriesPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="face-scanner-entries"
            element={
              <RouteAccessGuard routeKey="route.hostelGate.faceScannerEntries" fallback={<NotFoundPage />}>
                <FaceScannerEntriesPage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="attendance"
            element={
              <RouteAccessGuard routeKey="route.hostelGate.attendance" fallback={<NotFoundPage />}>
                <HostelGateAttendancePage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="appointments"
            element={
              <RouteAccessGuard routeKey="route.hostelGate.appointments" fallback={<NotFoundPage />}>
                <AppointmentsGatePage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="jr-appointments"
            element={
              <RouteAccessGuard routeKey="route.hostelGate.appointments" fallback={<NotFoundPage />}>
                <AppointmentsGatePage />
              </RouteAccessGuard>
            }
          />
          <Route
            path="my-tasks"
            element={
              <RouteAccessGuard routeKey="route.hostelGate.myTasks" fallback={<NotFoundPage />}>
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

export default HostelGateRoutes
