import { Routes, Route } from "react-router-dom";
import SDashboard from "../pages/student/SDashboard";
import LoginPage from "../pages/LoginPage";
import WardenDashboard from "../pages/warden/DashboardWarden";
import Complaints from "../pages/student/Complaints";

import GuardDashboard from "../pages/guard/GDashboard"
import AddVisitor from "../pages/guard/AddVisitor"

import Complaint from "../pages/warden/Complaint";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes for student related pages  */}
      <Route path="/api/v0/student/dashboard" element={<SDashboard/>} />
      <Route path="/api/v0/student/complaints" element={<Complaints />} />
          
      <Route path="/" element={<SDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/warden/dashboard" element={<WardenDashboard />} />

      <Route path="/guard/dashboard" element={<GuardDashboard/>} />
      <Route path="/AddVisitor/dashboard" element={<AddVisitor/>} />

      <Route path="/warden/complaint" element={<Complaint/>} />
        
    </Routes>
  )
}

export default AppRoutes
