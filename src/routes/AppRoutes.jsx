import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"

// Public/Auth routes - Always loaded (not lazy)
import { HomePage, LoginPage, AboutPage, ContactPage, SSOLoginPage } from "../pages/auth"

// Utility pages - Always loaded
import NotFoundPage from "../pages/NotFoundPage"
import LoadingPage from "../pages/LoadingPage"

// Role-based routes - Lazy loaded (loads all pages for a role when user visits that role's routes)
const SuperAdminRoutes = lazy(() => import("./SuperAdminRoutes"))
const StudentRoutes = lazy(() => import("./StudentRoutes"))
const MaintenanceRoutes = lazy(() => import("./MaintenanceRoutes"))
const WardenRoutes = lazy(() => import("./WardenRoutes"))
const AssociateWardenRoutes = lazy(() => import("./AssociateWardenRoutes"))
const HostelSupervisorRoutes = lazy(() => import("./HostelSupervisorRoutes"))
const SecurityRoutes = lazy(() => import("./SecurityRoutes"))
const HostelGateRoutes = lazy(() => import("./HostelGateRoutes"))
const AdminRoutes = lazy(() => import("./AdminRoutes"))

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Always loaded, no Suspense needed */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/sso" element={<SSOLoginPage />} />

      {/* Role-based routes - Lazy loaded with Suspense */}
      <Route path="/super-admin/*" element={
        <Suspense fallback={<LoadingPage message="Loading Super Admin..." />}>
          <SuperAdminRoutes />
        </Suspense>
      } />
      <Route path="/student/*" element={
        <Suspense fallback={<LoadingPage message="Loading Student Portal..." />}>
          <StudentRoutes />
        </Suspense>
      } />
      <Route path="/maintenance/*" element={
        <Suspense fallback={<LoadingPage message="Loading Maintenance Portal..." />}>
          <MaintenanceRoutes />
        </Suspense>
      } />
      <Route path="/warden/*" element={
        <Suspense fallback={<LoadingPage message="Loading Warden Portal..." />}>
          <WardenRoutes />
        </Suspense>
      } />
      <Route path="/associate-warden/*" element={
        <Suspense fallback={<LoadingPage message="Loading Associate Warden Portal..." />}>
          <AssociateWardenRoutes />
        </Suspense>
      } />
      <Route path="/hostel-supervisor/*" element={
        <Suspense fallback={<LoadingPage message="Loading Hostel Supervisor Portal..." />}>
          <HostelSupervisorRoutes />
        </Suspense>
      } />
      <Route path="/guard/*" element={
        <Suspense fallback={<LoadingPage message="Loading Security Portal..." />}>
          <SecurityRoutes />
        </Suspense>
      } />
      <Route path="/hostel-gate/*" element={
        <Suspense fallback={<LoadingPage message="Loading Hostel Gate Portal..." />}>
          <HostelGateRoutes />
        </Suspense>
      } />
      <Route path="/admin/*" element={
        <Suspense fallback={<LoadingPage message="Loading Admin Portal..." />}>
          <AdminRoutes />
        </Suspense>
      } />

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
