import { Routes, Route } from "react-router-dom"

// Public/Auth routes
import { HomePage, LoginPage, AboutPage, ContactPage, SSOLoginPage } from "../pages/auth"

// Utility pages
import NotFoundPage from "../pages/NotFoundPage"

// Role-based routes
import SuperAdminRoutes from "./SuperAdminRoutes"
import StudentRoutes from "./StudentRoutes"
import MaintenanceRoutes from "./MaintenanceRoutes"
import WardenRoutes from "./WardenRoutes"
import AssociateWardenRoutes from "./AssociateWardenRoutes"
import HostelSupervisorRoutes from "./HostelSupervisorRoutes"
import SecurityRoutes from "./SecurityRoutes"
import HostelGateRoutes from "./HostelGateRoutes"
import AdminRoutes from "./AdminRoutes"

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/sso" element={<SSOLoginPage />} />

      {/* Role-based routes */}
      <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
      <Route path="/student/*" element={<StudentRoutes />} />
      <Route path="/maintenance/*" element={<MaintenanceRoutes />} />
      <Route path="/warden/*" element={<WardenRoutes />} />
      <Route path="/associate-warden/*" element={<AssociateWardenRoutes />} />
      <Route path="/hostel-supervisor/*" element={<HostelSupervisorRoutes />} />
      <Route path="/guard/*" element={<SecurityRoutes />} />
      <Route path="/hostel-gate/*" element={<HostelGateRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
