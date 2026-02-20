import { Routes, Route } from "react-router-dom"
import HostelGateLayout from "../layouts/HostelGateLayout.jsx"

// Guard-specific pages
import {
    AddStudentEntryPage,
    StudentEntriesPage,
    ScannerEntriesPage,
    FaceScannerEntriesPage,
    HostelGateAttendancePage,
    AppointmentsGatePage
} from "../pages/guard"

// Common pages
import { VisitorRequestsPage, LostAndFoundPage, MyTasksPage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"
import RouteAccessGuard from "../components/authz/RouteAccessGuard"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const HostelGateRoutes = () => (
    <ProtectedRoute allowedRoles={["Hostel Gate"]}>
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
    </ProtectedRoute>
)

export default HostelGateRoutes

