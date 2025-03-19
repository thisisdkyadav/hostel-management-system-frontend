import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Maintainance/SidebarM";
import Notification from "../../components/Maintainance/NotificationM";
import ComplaintsM from "../../components/Maintainance/ComplaintsM";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const MDashboard = () => {
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

  // Alert state
  const [alertTriggered, setAlertTriggered] = useState(false);

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
      {/* Left Sidebar - Fixed */}
      <div className="fixed left-0 top-0 z-10">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="ml-60 flex-1 px-6 py-6">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-2xl px-3 font-bold">Dashboard</h1>
          <div className="flex items-center space-x-6">
            <Link to="/maintainance/alert">
              <button className="bg-white text-red-600 px-5 py-2 shadow-md rounded-[12px]">
                ⚠ Alert
              </button>
            </Link>
            <button className="flex items-center space-x-2 text-black text-base px-5 py-2 rounded-[12px] hover:text-gray-600">
              <FaUser className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="pr-72"> {/* Add right padding to make space for notification panel */}
          <ComplaintsM 
            complaints={complaints}
            setComplaints={setComplaints}
            stats={stats}
          />
        </div>
      </div>
      
      {/* Right Notification Panel - Fixed */}
      <div className="fixed right-0 top-0 w-72 h-screen pt-21 pr-6 pb-6">
        <div className="h-full overflow-hidden flex flex-col">
          <div className="flex-1 mt-16"> {/* Add margin-top to align with content */}
            <Notification 
              alertTriggered={alertTriggered}
              onAlertClear={() => setAlertTriggered(false)}
              compact={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MDashboard;