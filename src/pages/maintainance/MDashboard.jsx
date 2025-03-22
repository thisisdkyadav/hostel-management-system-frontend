import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Maintainance/SidebarM";
import ComplaintsM from "../../components/Maintainance/ComplaintsM";
import { FaUser, FaBars } from "react-icons/fa";
import { maintenanceApi } from "../../services/apiService";

const MDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update stats based on complaints data
  const updateStatsFromComplaints = (data) => {
    const newStats = {
      total: data.length,
      pending: data.filter((c) => c.status === "Pending").length,
      inProgress: data.filter((c) => c.status === "In Progress").length,
      resolved: data.filter((c) => c.status === "Resolved").length,
    };
    setStats(newStats);
  };

  // Fetch complaints and stats from the API
  const fetchData = async () => {
    try {
      setLoading(true);
      const complaintsData = await maintenanceApi.getComplaints();
      setComplaints(complaintsData);
      updateStatsFromComplaints(complaintsData);

      const statsData = await maintenanceApi.getStats();
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update complaint status with optimistic update
  const handleStatusChange = async (id, newStatus) => {
    try {
      const complaint = complaints.find((c) => c.id === id);
      const oldStatus = complaint.status;
      const updatedComplaints = complaints.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c
      );
      setComplaints(updatedComplaints);
      updateStatsFromComplaints(updatedComplaints);
      await maintenanceApi.updateComplaintStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to update complaint status:", err);
      alert("Failed to update status. Please try again.");
      fetchData();
    }
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row bg-[#EFF3F4] min-h-screen">
      {/* Mobile sidebar toggle - only visible on small screens */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <button 
          onClick={toggleSidebar}
          className="bg-[#1360AB] text-white p-2 rounded-md"
        >
          <FaBars />
        </button>
      </div>

      {/* Sidebar - hidden on mobile, shown when toggled or on larger screens */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-[5] md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="w-full md:ml-60 flex-1 p-4 md:p-6 mt-12 md:mt-0">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-xl md:text-2xl px-3 font-bold">Dashboard</h1>
          <button className="flex items-center space-x-2 text-black text-base px-3 md:px-5 py-2 rounded-[12px] hover:text-gray-600">
            <FaUser className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        </header>

        <div className="pr-0 md:pr-6">
          {loading ? (
            <div className="bg-white p-4 md:p-8 rounded-[20px] shadow-md flex flex-col items-center justify-center h-60">
              <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-[#1360AB]"></div>
              <p className="mt-4 text-gray-600 text-sm md:text-base">Loading dashboard data...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-4 md:p-8 rounded-[20px] shadow-md text-center">
              <p className="text-red-500 mb-4 text-sm md:text-base">{error}</p>
              <button 
                onClick={fetchData}
                className="bg-[#1360AB] text-white px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-md"
              >
                Retry
              </button>
            </div>
          ) : (
            <ComplaintsM 
              complaints={complaints}
              setComplaints={setComplaints}
              stats={stats}
              onUpdateStatus={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MDashboard;