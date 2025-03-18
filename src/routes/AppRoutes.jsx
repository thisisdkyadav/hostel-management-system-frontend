import { Routes, Route } from "react-router-dom";
import SDashboard from "../pages/student/SDashboard";
import LoginPage from "../pages/LoginPage";
import WardenDashboard from "../pages/warden/DashboardWarden";
import Complaint from "../pages/warden/Complaint";
const AppRoutes = () => {
  return (
    <Routes>
     
      <Route path="/" element={<SDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/warden/dashboard" element={<WardenDashboard />} />
      <Route path="/warden/complaint" element={<Complaint/>} />
    </Routes>
  );
};

export default AppRoutes;
