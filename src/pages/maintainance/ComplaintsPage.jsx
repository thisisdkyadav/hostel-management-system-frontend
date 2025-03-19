import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Maintainance/SidebarM";
import ComplaintsM from "../../components/Maintainance/ComplaintsM";
import { FaUser } from "react-icons/fa";

const ComplaintsPage = () => {
  // Sample complaint data
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: "Broken Window",
      category: "Civil",
      description: "Broken Window due to storm. Glass shards need to be cleaned up and window frame needs repair. This is a safety hazard for students.",
      priority: "High",
      status: "In Progress",
      location: "Block E - Room 103",
      date: "Mar 18, 2025, 8:46 PM",
      assignedTo: "John Doe"
    },
    {
      id: 2,
      title: "Water Leakage",
      category: "Water",
      description: "Water leaking from ceiling in bathroom. The leak is causing mold growth and damage to the ceiling tiles. Floor is slippery and dangerous.",
      priority: "Medium",
      status: "Pending",
      location: "Block E - Room 105",
      date: "Mar 18, 2025, 6:46 PM",
      assignedTo: "Unassigned"
    },
    {
      id: 3,
      title: "Electrical Socket Not Working",
      category: "Electrical",
      description: "The wall socket near the desk is not working. Students cannot charge their devices or use desk lamps.",
      priority: "Low",
      status: "Pending",
      location: "Block D - Room 201",
      date: "Mar 17, 2025, 2:30 PM",
      assignedTo: "Unassigned"
    }
  ]);

  // Stats state
  const [stats, setStats] = useState({
    total: 3,
    pending: 2,
    inProgress: 1,
    resolved: 0
  });

  // Update stats whenever complaints change
  useEffect(() => {
    const newStats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === "Pending").length,
      inProgress: complaints.filter(c => c.status === "In Progress").length,
      resolved: complaints.filter(c => c.status === "Resolved").length
    };
    setStats(newStats);
  }, [complaints]);

  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      <Sidebar />

      <div className="ml-60 px-10 py-6 w-full">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-2xl px-3 font-bold">Complaints</h1>
          <div className="flex items-center space-x-6">
            <button className="bg-white text-red-600 px-5 py-2 shadow-md rounded-[12px]">
              ⚠ Alert
            </button>
            <button className="flex items-center space-x-2 text-black text-base px-5 py-2 rounded-[12px] hover:text-gray-600">
              <FaUser className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>
        </header>

        <div className="mt-4">
          <ComplaintsM 
            complaints={complaints}
            setComplaints={setComplaints}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;