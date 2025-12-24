import { Routes, Route } from "react-router-dom"
import AdminLayout from "../layouts/AdminLayout"
import AdminDashboard from "../pages/admin/Dashboard"
import LiveCheckInOut from "../pages/admin/LiveCheckInOut.jsx"
import AdminHostels from "../pages/admin/Hostels"
import UnitsAndRooms from "../pages/UnitsAndRooms.jsx"
import AdminAdminManagement from "../pages/admin/AdminManagement.jsx"
import AdminWarden from "../pages/admin/Wardens"
import AdminAssociateWardens from "../pages/admin/AssociateWardens.jsx"
import AdminHostelSupervisors from "../pages/admin/HostelSupervisors.jsx"
import Students from "../pages/Students"
import Inventory from "../pages/admin/Inventory.jsx"
import Complaint from "../pages/Complaints.jsx"
import Leaves from "../pages/Leaves.jsx"
import SecurityLogins from "../pages/admin/SecurityLogins"
import VisitorRequests from "../pages/VisitorRequests.jsx"
import LostAndFound from "../pages/LostAndFound.jsx"
import Events from "../pages/Events.jsx"
import UpdatePassword from "../pages/admin/UpdatePassword.jsx"
import AdminSettings from "../pages/admin/Settings"
import Profile from "../pages/Profile.jsx"
import MaintenanceStaff from "../pages/admin/MaintenanceStaff.jsx"
import NotificationCenter from "../pages/NotificationCenter"
import Feedbacks from "../pages/warden/Feedbacks.jsx"
import Others from "../pages/admin/Others.jsx"
import TaskManagement from "../pages/admin/TaskManagement.jsx"
import Sheet from "../pages/admin/Sheet.jsx"
import { ProtectedRoute } from "../contexts/AuthProvider.jsx"

const AdminRoutes = () => (
    <ProtectedRoute allowedRoles={["Admin"]}>
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="live-checkinout" element={<LiveCheckInOut />} />
                <Route path="hostels" element={<AdminHostels />} />
                <Route path="hostels/:hostelName" element={<UnitsAndRooms />} />
                <Route path="hostels/:hostelName/units/:unitNumber" element={<UnitsAndRooms />} />
                <Route path="administrators" element={<AdminAdminManagement />} />
                <Route path="wardens" element={<AdminWarden />} />
                <Route path="associate-wardens" element={<AdminAssociateWardens />} />
                <Route path="hostel-supervisors" element={<AdminHostelSupervisors />} />
                <Route path="students" element={<Students />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="complaints" element={<Complaint />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="security" element={<SecurityLogins />} />
                <Route path="visitors" element={<VisitorRequests />} />
                <Route path="lost-and-found" element={<LostAndFound />} />
                <Route path="events" element={<Events />} />
                <Route path="update-password" element={<UpdatePassword />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="maintenance" element={<MaintenanceStaff />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="feedbacks" element={<Feedbacks />} />
                <Route path="others" element={<Others />} />
                <Route path="task-management" element={<TaskManagement />} />
                <Route path="sheet" element={<Sheet />} />
            </Route>
        </Routes>
    </ProtectedRoute>
)

export default AdminRoutes
