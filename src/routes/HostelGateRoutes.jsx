import { Routes, Route } from "react-router-dom"
import HostelGateLayout from "../layouts/HostelGateLayout.jsx"

// Guard-specific pages
import {
    AddStudentEntryPage,
    StudentEntriesPage,
    ScannerEntriesPage,
    HostelGateAttendancePage
} from "../pages/guard"

// Common pages
import { VisitorRequestsPage, LostAndFoundPage, MyTasksPage } from "../pages/common"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"

import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const HostelGateRoutes = () => (
    <ProtectedRoute allowedRoles={["Hostel Gate"]}>
        <Routes>
            <Route element={<HostelGateLayout />}>
                <Route index element={<AddStudentEntryPage />} />
                <Route path="visitors" element={<VisitorRequestsPage />} />
                <Route path="lost-and-found" element={<LostAndFoundPage />} />
                <Route path="entries" element={<StudentEntriesPage />} />
                <Route path="scanner-entries" element={<ScannerEntriesPage />} />
                <Route path="attendance" element={<HostelGateAttendancePage />} />
                <Route path="my-tasks" element={<MyTasksPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default HostelGateRoutes
