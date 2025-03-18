import { Routes, Route } from "react-router-dom"
import SDashboard from "../pages/student/SDashboard"
import LoginPage from "../pages/LoginPage"
import WardenDashboard from "../pages/warden/DashboardWarden"
import AdminLayout from "../layouts/AdminLayout"
import AdminDashboard from "../pages/admin/Dashboard"
import AdminHostels from "../pages/admin/Hostels"
import AdminWarden from "../pages/admin/Wardens"
import AdminStudents from "../pages/admin/Students"
import AdminComplaints from "../pages/admin/Complaints"

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/warden/dashboard" element={<WardenDashboard />} />

      {/* Admin routes with nested structure */}
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
