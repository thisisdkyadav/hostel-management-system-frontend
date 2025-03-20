import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Maintainance/SidebarM";
import ComplaintsM from "../../components/Maintainance/ComplaintsM";
import { FaUser } from "react-icons/fa";
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
    // Removed WebSocket setup, as it is no longer in use
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

  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      <div className="fixed left-0 top-0 z-10">
        <Sidebar />
      </div>

      <div className="ml-60 flex-1 px-6 py-6">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-2xl px-3 font-bold">Dashboard</h1>
          <button className="flex items-center space-x-2 text-black text-base px-5 py-2 rounded-[12px] hover:text-gray-600">
            <FaUser className="w-5 h-5" />
            <span>Profile</span>
          </button>
        </header>

        <div className="pr-6">
          {loading ? (
            <div className="bg-white p-8 rounded-[20px] shadow-md flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1360AB]"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-8 rounded-[20px] shadow-md text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={fetchData}
                className="bg-[#1360AB] text-white px-4 py-2 rounded-md"
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