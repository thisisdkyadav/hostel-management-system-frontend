import { Routes, Route } from "react-router-dom"
import HostelGateLayout from "../layouts/HostelGateLayout.jsx"
import AddStudentEntry from "../pages/guard/AddStudentEntry.jsx"
import VisitorRequests from "../pages/VisitorRequests.jsx"
import LostAndFound from "../pages/LostAndFound.jsx"
import StudentEntries from "../pages/guard/StudentEntries.jsx"
import ScannerEntries from "../pages/guard/ScannerEntries.jsx"
import HostelGateAttendance from "../pages/guard/HostelGateAttendance.jsx"
import MyTasks from "../pages/MyTasks.jsx"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const HostelGateRoutes = () => (
    <ProtectedRoute allowedRoles={["Hostel Gate"]}>
        <Routes>
            <Route element={<HostelGateLayout />}>
                <Route index element={<AddStudentEntry />} />
                <Route path="visitors" element={<VisitorRequests />} />
                <Route path="lost-and-found" element={<LostAndFound />} />
                <Route path="entries" element={<StudentEntries />} />
                <Route path="scanner-entries" element={<ScannerEntries />} />
                <Route path="attendance" element={<HostelGateAttendance />} />
                <Route path="my-tasks" element={<MyTasks />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default HostelGateRoutes
