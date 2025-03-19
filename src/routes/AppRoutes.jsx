import { Routes, Route } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import WardenDashboard from "../pages/warden/DashboardWarden"
//--------------------------------below is student---------------------
import SDashboard from "../pages/student/SDashboard.jsx"
import Complaints from "../pages/student/Complaints"
import Profile from "../pages/student/Profile"
import LostAndFound from "../pages/student/LostAndFound.jsx"
// -------------------------student ends here ----------------------------------
import GuardDashboard from "../pages/guard/GDashboard"
import AddVisitor from "../pages/guard/AddVisitor"
import Complaint from "../pages/warden/Complaint"
import DataPage from "../pages/warden/DataPage";
// import related to maintainance
import MDashboard from "../pages/maintainance/MDashboard"
import ScheduleM from "../pages/maintainance/ScheduleM"
import ComplaintsPage from "../pages/maintainance/ComplaintsPage"
import AlertPage from "../pages/maintainance/AlertPage"
// import related to admin
import AdminLayout from "../layouts/AdminLayout"
import AdminDashboard from "../pages/admin/Dashboard"
import AdminHostels from "../pages/admin/Hostels"
import AdminWarden from "../pages/admin/Wardens"
import AdminStudents from "../pages/admin/Students"
import AdminComplaints from "../pages/admin/Complaints"


const AppRoutes = () => {
  return (
    <Routes>
       {/* Routes for student related pages  */}
        <Route path="/api/v0/student/dashboard" element={<SDashboard/>} />
        <Route path="/api/v0/student/complaints" element={<Complaints />} />
        <Route path='/maintainance/schedule' element={<ScheduleM />} />
        <Route path = "/maintainance/complaints" element={<ComplaintsPage />} />
        <Route path = "/maintainance/alert" element={<AlertPage />} />
        <Route path = "maintainance/dashboard" element={<MDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/warden/dashboard" element={<WardenDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
