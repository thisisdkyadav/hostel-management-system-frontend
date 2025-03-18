import { Routes, Route } from "react-router-dom";
import SDashboard from "../pages/student/SDashboard";
import LoginPage from "../pages/LoginPage";
import WardenDashboard from "../pages/warden/DashboardWarden";
import MDashboard from "../pages/maintainance/MDashboard";
import ScheduleM from "../components/Maintainance/ScheduleM";
import ComplaintsPage from "../components/Maintainance/ComplaintsPage";
const AppRoutes = () => {
  return (
    <Routes>
     
      <Route path="/" element={<SDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/warden/dashboard" element={<WardenDashboard />} />
      <Route path="/maintainance/dashboard" element={<MDashboard />} />
      <Route path="/maintainance/complaints" element={<ComplaintsPage />} /> 
      <Route path="/maintainance/schedule" element={<ScheduleM />} /> 
</Routes>
  );
};

export default AppRoutes;
