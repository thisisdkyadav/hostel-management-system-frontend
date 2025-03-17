import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import WardenDashboard from "../pages/warden/DashboardWarden";

const AppRoutes = () => {
  return (
    <Routes>
     
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/warden/dashboard" element={<WardenDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
