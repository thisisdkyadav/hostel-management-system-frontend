import { Routes, Route } from "react-router-dom"
import SecurityLayout from "../layouts/SecurityLayout.jsx"
import Attendance from "../pages/guard/Attendance.jsx"
import LostAndFound from "../pages/LostAndFound.jsx"
import MyTasks from "../pages/MyTasks.jsx"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const SecurityRoutes = () => (
    <ProtectedRoute allowedRoles={["Security"]}>
        <Routes>
            <Route element={<SecurityLayout />}>
                <Route index element={<Attendance />} />
                <Route path="lost-and-found" element={<LostAndFound />} />
                <Route path="my-tasks" element={<MyTasks />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default SecurityRoutes
