import { Routes, Route } from "react-router-dom"
import SDashboard from "../pages/student/SDashboard"
import LoginPage from "../pages/LoginPage"
import WardenDashboard from "../pages/warden/DashboardWarden"
import Complaints from "../pages/student/Complaints"
import Profile from "../pages/student/Profile"

import GuardDashboard from "../pages/guard/GDashboard"
import AddVisitor from "../pages/guard/AddVisitor"
import Complaint from "../pages/warden/Complaint"
import DataPage from "../pages/warden/DataPage";
// import related to maintainance
import MDashboard from "../pages/maintainance/MDashboard"
import ScheduleM from "../pages/maintainance/ScheduleM"
import ComplaintsPage from "../pages/maintainance/ComplaintsPage"
// import related to admin
import AdminLayout from "../layouts/AdminLayout"
import AdminDashboard from "../pages/admin/Dashboard"
import AdminHostels from "../pages/admin/Hostels"
import AdminWarden from "../pages/admin/Wardens"
import AdminStudents from "../pages/admin/Students"
import AdminComplaints from "../pages/admin/Complaints"

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes for student related pages  */}
      <Route path="/api/v0/student/dashboard" element={<SDashboard />} />
      <Route path="/api/v0/student/complaints" element={<Complaints />} />
      <Route path="/api/v0/student/profile" element={<Profile />} />

      <Route path="/" element={<SDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/warden/dashboard" element={<WardenDashboard />} />
      <Route path="/warden/data" element={<DataPage />} />

      <Route path="/guard/dashboard" element={<GuardDashboard />} />
      <Route path="/AddVisitor/dashboard" element={<AddVisitor />} />
      <Route path="/warden/complaint" element={<Complaint />} />

      {/* Routes for maintenance related pages*/}
      <Route path="/maintainance/dashboard" element={<MDashboard />} />
      <Route path="/maintainance/complaints" element={<ComplaintsPage />} />
      <Route path="/maintainance/schedule" element={<ScheduleM />} />
      <Route path= "/maintainance/alert" element={<AlertPage />} />

      {/* Routes for admin related pages */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="hostels" element={<AdminHostels />} />
        <Route path="wardens" element={<AdminWarden />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="complaints" element={<AdminComplaints />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes