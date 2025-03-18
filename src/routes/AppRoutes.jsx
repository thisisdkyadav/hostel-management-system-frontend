import { Routes, Route } from "react-router-dom";
import SDashboard from "../pages/student/SDashboard";
import LoginPage from "../pages/LoginPage";
import WardenDashboard from "../pages/warden/DashboardWarden";
import GuardDashboard from "../pages/guard/GDashboard"
import AddVisitor from "../pages/guard/AddVisitor"
const AppRoutes = () => {
  return (
    <Routes>
     
      <Route path="/" element={<SDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/warden/dashboard" element={<WardenDashboard />} />
      <Route path="/guard/dashboard" element={<GuardDashboard/>} />
      <Route path="/AddVisitor/dashboard" element={<AddVisitor/>} />
    </Routes>
  );
};

export default AppRoutes;
