import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Maintainance/SidebarM";
import Notification from "../../components/Maintainance/NotificationM";
import ComplaintsM from "../../components/Maintainance/ComplaintsM";
import { FaUser } from "react-icons/fa";
import { maintenanceApi } from "../../services/apiService";

const MDashboard = () => {
  const navigate = useNavigate();
  
  // State for data
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch complaints and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch complaints
        const complaintsData = await maintenanceApi.getComplaints({
          limit: 10,
          sort: 'date',
          order: 'desc'
        });
        
        setComplaints(complaintsData);
        
        // Fetch stats separately for better performance
        const statsData = await maintenanceApi.getStats();
        setStats(statsData);
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again.");
        
        // Set sample data for development if API fails
        setComplaints([
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
        
        setStats({
          total: 3,
          pending: 2,
          inProgress: 1,
          resolved: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Setup WebSocket for real-time updates
    const setupWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.hostname}:5000/ws/complaints`;
      
      try {
        const socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          console.log('WebSocket connection established for complaints');
          // Authenticate the WebSocket if needed
        };
        
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_complaint') {
            setComplaints(prev => [data.complaint, ...prev]);
            setStats(prev => ({
              ...prev,
              total: prev.total + 1,
              pending: prev.pending + 1
            }));
            
            // Trigger alert if high priority
            if (data.complaint.priority === "High") {
              setAlertTriggered(true);
              setTimeout(() => setAlertTriggered(false), 3000);
            }
          } else if (data.type === 'update_complaint') {
            // Update complaint in the list
            setComplaints(prev => prev.map(complaint => 
              complaint.id === data.id ? { ...complaint, ...data.updates } : complaint
            ));
            
            // Update stats if status changed
            if (data.updates.status) {
              updateStatsForStatusChange(data.oldStatus, data.updates.status);
            }
          }
        };
        
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        return socket;
      } catch (err) {
        console.error('Failed to establish WebSocket connection:', err);
        return null;
      }
    };
    
    const socket = setupWebSocket();
    
    return () => {
      if (socket) socket.close();
    };
  }, []);

  // Update stats when a complaint status changes
  const updateStatsForStatusChange = (oldStatus, newStatus) => {
    setStats(prev => {
      const updated = { ...prev };
      
      // Decrement the old status count
      if (oldStatus === "Pending") updated.pending--;
      else if (oldStatus === "In Progress") updated.inProgress--;
      else if (oldStatus === "Resolved") updated.resolved--;
      
      // Increment the new status count
      if (newStatus === "Pending") updated.pending++;
      else if (newStatus === "In Progress") updated.inProgress++;
      else if (newStatus === "Resolved") updated.resolved++;
      
      return updated;
    });
  };

  // Update complaint status
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Find complaint and get current status
      const complaint = complaints.find(c => c.id === id);
      const oldStatus = complaint.status;
      
      // Optimistically update UI
      setComplaints(complaints.map(c => {
        if (c.id === id) {
          return { ...c, status: newStatus };
        }
        return c;
      }));
      
      updateStatsForStatusChange(oldStatus, newStatus);
      
      // Make API call
      await maintenanceApi.updateComplaintStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to update complaint status:", err);
      // Revert changes on error
      alert("Failed to update status. Please try again.");
      
      // Refresh data
      maintenanceApi.getComplaints()
        .then(data => setComplaints(data))
        .catch(error => console.error("Error refreshing data:", error));
    }
  };
  
  // Handle alert button click
  const handleAlertClick = () => {
    navigate("/maintainance/alert");
  };

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
            <button 
              onClick={handleAlertClick}
              className="bg-white text-red-600 px-5 py-2 shadow-md rounded-[12px]"
            >
              ⚠ Alert
            </button>
            <button className="flex items-center space-x-2 text-black text-base px-5 py-2 rounded-[12px] hover:text-gray-600">
              <FaUser className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="pr-72"> {/* Add right padding to make space for notification panel */}
          {loading ? (
            <div className="bg-white p-8 rounded-[20px] shadow-md flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1360AB]"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          ) : error ? (
            <div className="bg-white p-8 rounded-[20px] shadow-md text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
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
              updateStatus={handleStatusChange}
            />
          )}
        </div>
      </div>
      
      {/* Right Notification Panel - Fixed */}
      <div className="fixed right-0 top-0 w-72 h-screen pt-6 pr-6 pb-6">
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