import { Routes, Route } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
//--------------------------------below is student---------------------
import SDashboard from "../pages/student/SDashboard.jsx"
import Complaints from "../pages/student/Complaints"
import Profile from "../pages/student/Profile"
import Settings from "../pages/student/Settings.jsx"
// import LostAndFound from "../pages/student/LostAndFound.jsx"
// -------------------------student ends here ----------------------------------

//--------------------------------below is maintenance---------------------
import MDashboard from "../pages/maintainance/MDashboard"

// -------------------------maintenance ends here ----------------------------------
import Complaint from "../pages/Complaints.jsx"
import Students from "../pages/Students"
import Events from "../pages/Events.jsx"

// import related to warden
import WardenLayout from "../layouts/WardenLayout.jsx"
import WardenDashboard from "../pages/warden/DashboardWarden"
// import Complaint from "../pages/warden/Complaint"
import DataPage from "../pages/warden/DataPage"
// import Students from "../pages/warden/Students"

import SecurityLayout from "../layouts/SecurityLayout.jsx"
import GuardDashboard from "../pages/guard/Dashboard"
import AddVisitor from "../pages/guard/AddVisitor"
import Visitors from "../pages/guard/Visitors"

// import related to admin
import AdminLayout from "../layouts/AdminLayout"
import AdminDashboard from "../pages/admin/Dashboard"
import AdminHostels from "../pages/admin/Hostels"
import AdminWarden from "../pages/admin/Wardens"
// import AdminStudents from "../pages/admin/Students"
// import AdminComplaints from "../pages/admin/Complaints"
import SecurityLogins from "../pages/admin/SecurityLogins"
import LostAndFound from "../pages/LostAndFound.jsx"
import StudentLayout from "../layouts/StudentLayout.jsx"

import UpdatePassword from "../pages/UpdatePassword.jsx"
import StudentEntries from "../pages/guard/StudentEntries.jsx"
import AddStudentEntry from "../pages/guard/AddStudentEntry.jsx"
import RoomChangeRequests from "../pages/warden/RoomChangeRequests.jsx"

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<SDashboard />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="profile" element={<Profile />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="events" element={<Events />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<SDashboard />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Routes for Maintenance related pages*/}
      <Route path="/maintainance/dashboard" element={<MDashboard />} />

      <Route path="/warden" element={<WardenLayout />}>
        <Route index element={<WardenDashboard />} />
        <Route path="complaints" element={<Complaint />} />
        <Route path="data" element={<DataPage />} />
        <Route path="students" element={<Students />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="events" element={<Events />} />
        <Route path="room-change-requests" element={<RoomChangeRequests />} />
      </Route>

      {/* Routes for Guard related pages */}
      <Route path="/guard" element={<SecurityLayout />}>
        <Route index element={<GuardDashboard />} />
        <Route path="visitors/add" element={<AddVisitor />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="entries" element={<StudentEntries />} />
        <Route path="add-entry" element={<AddStudentEntry />} />
      </Route>

      {/* Routes for admin related pages */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="hostels" element={<AdminHostels />} />
        <Route path="wardens" element={<AdminWarden />} />
        <Route path="students" element={<Students />} />
        <Route path="complaints" element={<Complaint />} />
        <Route path="security" element={<SecurityLogins />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="events" element={<Events />} />
        <Route path="update-password" element={<UpdatePassword />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
