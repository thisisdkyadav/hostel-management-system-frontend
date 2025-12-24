import { Routes, Route } from "react-router-dom"
import HostelSupervisorLayout from "../layouts/HostelSupervisorLayout.jsx"
import WardenDashboard from "../pages/warden/Dashboard.jsx"
import UnitsAndRooms from "../pages/UnitsAndRooms.jsx"
import Complaint from "../pages/Complaints.jsx"
import Leaves from "../pages/Leaves.jsx"
import Students from "../pages/Students"
import VisitorRequests from "../pages/VisitorRequests.jsx"
import NotificationCenter from "../pages/NotificationCenter"
import LostAndFound from "../pages/LostAndFound.jsx"
import Events from "../pages/Events.jsx"
import StudentInventory from "../pages/warden/StudentInventory.jsx"
import Profile from "../pages/Profile.jsx"
import Feedbacks from "../pages/warden/Feedbacks.jsx"
import WardenUndertakings from "../pages/warden/Undertakings.jsx"
import MyTasks from "../pages/MyTasks.jsx"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const HostelSupervisorRoutes = () => (
    <ProtectedRoute allowedRoles={["Hostel Supervisor"]}>
        <Routes>
            <Route element={<HostelSupervisorLayout />}>
                <Route index element={<WardenDashboard />} />
                <Route path="hostels/:hostelName" element={<UnitsAndRooms />} />
                <Route path="hostels/:hostelName/units/:unitNumber" element={<UnitsAndRooms />} />
                <Route path="complaints" element={<Complaint />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="students" element={<Students />} />
                <Route path="visitors" element={<VisitorRequests />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="lost-and-found" element={<LostAndFound />} />
                <Route path="events" element={<Events />} />
                <Route path="student-inventory" element={<StudentInventory />} />
                <Route path="profile" element={<Profile />} />
                <Route path="feedbacks" element={<Feedbacks />} />
                <Route path="undertakings" element={<WardenUndertakings />} />
                <Route path="my-tasks" element={<MyTasks />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default HostelSupervisorRoutes
