import { Routes, Route } from "react-router-dom";
import SDashboard from "../pages/student/SDashboard";
import LoginPage from "../pages/LoginPage";
import WardenDashboard from "../pages/warden/DashboardWarden";
import Complaints from "../pages/student/Complaints";

const AppRoutes = () => {
  return (
    <Routes>
       {/* Routes for student related pages  */}
        <Route path="/api/v0/student/dashboard" element={<SDashboard/>} />
        <Route path="/api/v0/student/complaints" element={<Complaints />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/warden/dashboard" element={<WardenDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
