import { Routes, Route } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import WardenDashboard from "../pages/warden/DashboardWarden"
//--------------------------------below is student---------------------
import SDashboard from "../pages/student/SDashboard.jsx"
import Complaints from "../pages/student/Complaints"
import Profile from "../pages/student/Profile"
import LostAndFound from "../pages/student/LostAndFound.jsx"
// -------------------------student ends here ----------------------------------
import Complaint from "../pages/warden/Complaint"
import DataPage from "../pages/warden/DataPage"

//--------------------------------below is maintenance---------------------
import MDashboard from "../pages/maintainance/MDashboard"

// -------------------------maintenance ends here ----------------------------------

import SecurityLayout from "../layouts/SecurityLayout.jsx"
import GuardDashboard from "../pages/guard/Dashboard"
import AddVisitor from "../pages/guard/AddVisitor"
import Visitors from "../pages/guard/Visitors.jsx"

// import related to admin
import AdminLayout from "../layouts/AdminLayout"
import AdminDashboard from "../pages/admin/Dashboard"
import AdminHostels from "../pages/admin/Hostels"
import AdminWarden from "../pages/admin/Wardens"
import AdminStudents from "../pages/admin/Students"
import AdminComplaints from "../pages/admin/Complaints"
import SecurityLogins from "../pages/admin/SecurityLogins.jsx"

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/api/v0/student/dashboard" element={<SDashboard />} />
      <Route path="/api/v0/student/complaints" element={<Complaints />} />
      <Route path="/api/v0/student/profile" element={<Profile />} />
      <Route path="/api/v0/student/lost-and-found" element={<LostAndFound />} />

      <Route path="/" element={<SDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/warden/dashboard" element={<WardenDashboard />} />
      <Route path="/warden/data" element={<DataPage />} />

      <Route path="/warden/complaint" element={<Complaint />} />

      {/* Routes for Maintenance related pages*/}
      <Route path="/maintainance/dashboard" element={<MDashboard />} />


      {/* Routes for Guard related pages */}
      <Route path="/guard" element={<SecurityLayout />}>
        <Route index element={<GuardDashboard />} />
        <Route path="visitors/add" element={<AddVisitor />} />
        <Route path="visitors" element={<Visitors />} />
      </Route>

      {/* Routes for admin related pages */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="hostels" element={<AdminHostels />} />
        <Route path="wardens" element={<AdminWarden />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="security" element={<SecurityLogins />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
