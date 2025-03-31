import { Routes, Route } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
//--------------------------------below is student---------------------
import StudentDashboard from "../pages/student/Dashboard.jsx"
import StudentProfile from "../pages/student/Profile"
import Settings from "../pages/student/Settings.jsx"
import VisitorRequests from "../pages/VisitorRequests.jsx"
// -------------------------student ends here ----------------------------------

//--------------------------------below is maintenance---------------------
import MDashboard from "../pages/maintainance/MDashboard"

// -------------------------maintenance ends here ----------------------------------
import Complaint from "../pages/Complaints.jsx"
import Students from "../pages/Students"
import Events from "../pages/Events.jsx"
import Homepage from "../pages/Homepage.jsx"

// import related to warden
import WardenLayout from "../layouts/WardenLayout.jsx"
import WardenDashboard from "../pages/warden/Dashboard.jsx"
// import Complaint from "../pages/warden/Complaint"
// import Students from "../pages/warden/Students"

import SecurityLayout from "../layouts/SecurityLayout.jsx"
import GuardDashboard from "../pages/guard/Dashboard"
import AddVisitor from "../pages/guard/AddVisitor"
import Visitors from "../pages/Visitors"

// import related to admin
import AdminLayout from "../layouts/AdminLayout"
import AdminDashboard from "../pages/admin/Dashboard"
import AdminHostels from "../pages/admin/Hostels"
import AdminWarden from "../pages/admin/Wardens"
// import VisitorRequest from "../pages/admin/VisitorRequest"
// import AdminStudents from "../pages/admin/Students"
// import AdminComplaints from "../pages/admin/Complaints"
import SecurityLogins from "../pages/admin/SecurityLogins"
import LostAndFound from "../pages/LostAndFound.jsx"
import StudentLayout from "../layouts/StudentLayout.jsx"

import UpdatePassword from "../pages/admin/UpdatePassword.jsx"
import StudentEntries from "../pages/guard/StudentEntries.jsx"
import AddStudentEntry from "../pages/guard/AddStudentEntry.jsx"
import RoomChangeRequests from "../pages/warden/RoomChangeRequests.jsx"
import UnitsAndRooms from "../pages/warden/UnitsAndRooms.jsx"
import Profile from "../pages/Profile.jsx"
import MaintenanceStaff from "../pages/admin/MaintenanceStaff.jsx"
import { ProtectedRoute, useAuth } from "../contexts/AuthProvider.jsx"
import StudentFeedback from "../pages/student/Feedback.jsx"
import Feedbacks from "../pages/warden/Feedbacks.jsx"
import MaintenanceLayout from "../layouts/MaintenanceLayout.jsx"
import AdminAssociateWardens from "../pages/admin/AssociateWardens.jsx"
import AssociateWardenLayout from "../layouts/AssociateWardenLayout.jsx"
import NotificationCenter from "../pages/NotificationCenter"

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        {/* <Route index element={<Profile />} /> */}
        <Route path="complaints" element={<Complaint />} />
        <Route path="profile" element={<Profile />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="events" element={<Events />} />
        <Route path="feedback" element={<StudentFeedback />} />
        <Route path="feedbacks" element={<Feedbacks />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="settings" element={<Settings />} />
        <Route path="visitors" element={<VisitorRequests />} />
      </Route>

      {/* Routes for Maintenance related pages*/}
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute allowedRoles={["Maintenance Staff"]}>
            <MaintenanceLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MDashboard />} />
      </Route>

      <Route
        path="/warden"
        element={
          <ProtectedRoute allowedRoles={["Warden"]}>
            <WardenLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WardenDashboard />} />
        <Route path="hostels/:hostelName" element={<UnitsAndRooms />} />
        <Route path="hostels/:hostelName/units/:unitNumber" element={<UnitsAndRooms />} />
        <Route path="complaints" element={<Complaint />} />
        <Route path="students" element={<Students />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="events" element={<Events />} />
        {/* <Route path="room-change-requests" element={<RoomChangeRequests />} /> */}
        <Route path="profile" element={<Profile />} />
        <Route path="feedbacks" element={<Feedbacks />} />
      </Route>

      <Route
        path="/associate-warden"
        element={
          <ProtectedRoute allowedRoles={["Associate Warden"]}>
            <AssociateWardenLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WardenDashboard />} />
        <Route path="hostels/:hostelName" element={<UnitsAndRooms />} />
        <Route path="hostels/:hostelName/units/:unitNumber" element={<UnitsAndRooms />} />
        <Route path="complaints" element={<Complaint />} />
        <Route path="students" element={<Students />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="events" element={<Events />} />
        <Route path="room-change-requests" element={<RoomChangeRequests />} />
        <Route path="profile" element={<Profile />} />
        <Route path="feedbacks" element={<Feedbacks />} />
      </Route>

      {/* Routes for Guard related pages */}
      <Route
        path="/guard"
        element={
          <ProtectedRoute allowedRoles={["Security"]}>
            <SecurityLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GuardDashboard />} />
        <Route path="visitors/add" element={<AddVisitor />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="entries" element={<StudentEntries />} />
        <Route path="add-entry" element={<AddStudentEntry />} />
      </Route>

      {/* Routes for admin related pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="hostels" element={<AdminHostels />} />
        <Route path="hostels/:hostelName" element={<UnitsAndRooms />} />
        <Route path="hostels/:hostelName/units/:unitNumber" element={<UnitsAndRooms />} />
        <Route path="wardens" element={<AdminWarden />} />
        <Route path="associate-wardens" element={<AdminAssociateWardens />} />
        <Route path="students" element={<Students />} />
        <Route path="complaints" element={<Complaint />} />
        <Route path="security" element={<SecurityLogins />} />
        <Route path="visitors" element={<VisitorRequests />} />
        <Route path="lost-and-found" element={<LostAndFound />} />
        <Route path="events" element={<Events />} />
        <Route path="update-password" element={<UpdatePassword />} />
        <Route path="profile" element={<Profile />} />
        <Route path="maintenance" element={<MaintenanceStaff />} />
        <Route path="notifications" element={<NotificationCenter />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
