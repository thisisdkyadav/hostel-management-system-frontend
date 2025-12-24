import { Routes, Route } from "react-router-dom"
import StudentLayout from "../layouts/StudentLayout.jsx"
import StudentDashboard from "../pages/student/Dashboard.jsx"
import VisitorRequests from "../pages/VisitorRequests.jsx"
import IDCard from "../pages/student/IDCard.jsx"
import Undertakings from "../pages/student/Undertakings.jsx"
import Complaint from "../pages/Complaints.jsx"
import Profile from "../pages/Profile.jsx"
import LostAndFound from "../pages/LostAndFound.jsx"
import Events from "../pages/Events.jsx"
import Feedbacks from "../pages/warden/Feedbacks.jsx"
import NotificationCenter from "../pages/NotificationCenter"
import Security from "../pages/student/Security.jsx"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const StudentRoutes = () => (
    <ProtectedRoute allowedRoles={["Student"]}>
        <Routes>
            <Route element={<StudentLayout />}>
                <Route index element={<StudentDashboard />} />
                <Route path="complaints" element={<Complaint />} />
                <Route path="profile" element={<Profile />} />
                <Route path="lost-and-found" element={<LostAndFound />} />
                <Route path="events" element={<Events />} />
                <Route path="feedbacks" element={<Feedbacks />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="visitors" element={<VisitorRequests />} />
                <Route path="security" element={<Security />} />
                <Route path="id-card" element={<IDCard />} />
                <Route path="undertakings" element={<Undertakings />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default StudentRoutes
