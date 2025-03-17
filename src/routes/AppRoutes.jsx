import { Routes, Route } from "react-router-dom";
import SDashboard from "../pages/student/SDashboard";
import LoginPage from "../pages/LoginPage";
const AppRoutes = () => {
  return (
    <Routes>
     
      <Route path="/" element={<SDashboard />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
