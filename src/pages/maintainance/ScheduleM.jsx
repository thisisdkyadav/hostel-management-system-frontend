import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Sidebar from "../../components/Maintainance/SidebarM";
import { FaClock, FaTools, FaUser, FaSpinner } from "react-icons/fa";
import { maintenanceApi } from "../../services/apiService";

const ScheduleM = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format the selected date to match the keys in the schedules object
  const formattedDate = selectedDate.toISOString().split("T")[0];
  const timeSlots = schedules[formattedDate] || [];

  // Helper function to format time from Date object
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle alert click
  const handleAlertClick = () => {
    navigate("/maintainance/alert");
  };

  // Fetch schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        
        // Get date ranges for the calendar view
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const data = await maintenanceApi.getSchedule({
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0]
        });
        
        // Transform data into the format needed by the component
        const schedulesMap = {};
        data.forEach(task => {
          const dateStr = new Date(task.scheduledDate).toISOString().split('T')[0];
          
          if (!schedulesMap[dateStr]) {
            schedulesMap[dateStr] = [];
          }
          
          schedulesMap[dateStr].push({
            id: task.id,
            time: formatTime(new Date(task.scheduledDate)),
            task: task.description,
            status: task.status,
            location: task.location
          });
        });
        
        setSchedules(schedulesMap);
        setError(null);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Failed to load schedule. Please try again later.");
        
        // Fallback data for development/demo
        setSchedules({
          "2025-03-18": [
            { time: "10:00 AM", task: "Maintenance Check - Block E, Room 103", status: "Completed" },
            { time: "2:30 PM", task: "Plumbing Repair - Block E, Room 105", status: "Pending" },
          ],
          "2025-03-19": [
            { time: "11:00 AM", task: "Electrical Inspection - Block D, Room 202", status: "In Progress" },
            { time: "3:00 PM", task: "HVAC Maintenance - Block C, Room 301", status: "Pending" },
          ],
          "2025-03-20": [
            { time: "9:30 AM", task: "WiFi Router Replacement - Block F, Common Room", status: "Pending" },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();

    // Set up WebSocket connection for real-time schedule updates
    const socket = maintenanceApi.subscribeToUpdates(
      // Message handler
      (data) => {
        if (data.type === 'schedule_updated') {
          fetchSchedules(); // Refresh schedule data when updates occur
        }
      },
      // Error handler
      (error) => {
        console.error("WebSocket error:", error);
      }
    );

    // Cleanup function
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  // Update task status
  const updateTaskStatus = async (id, newStatus) => {
    try {
      await maintenanceApi.updateTaskStatus(id, newStatus);
      
      // Update local state
      setSchedules(prev => {
        const newSchedules = { ...prev };
        
        // Find and update the task in the correct date
        Object.keys(newSchedules).forEach(date => {
          newSchedules[date] = newSchedules[date].map(task => 
            task.id === id ? { ...task, status: newStatus } : task
          );
        });
        
        return newSchedules;
      });
    } catch (err) {
      console.error("Error updating task status:", err);
      alert("Failed to update task status. Please try again.");
    }
  };

  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      <Sidebar />

      <div className="ml-60 px-10 py-6 w-full">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-2xl px-3 font-bold">Schedule</h1>
          <div className="flex items-center space-x-6">
            <button 
              className="bg-white text-red-600 px-5 py-2 shadow-md rounded-[12px]"
              onClick={handleAlertClick}
            >
              ⚠ Alert
            </button>
            <button className="flex items-center space-x-2 text-black text-base px-5 py-2 rounded-[12px] hover:text-gray-600">
              <FaUser className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>
        </header>

        <div className="mt-4 flex gap-6">
          {/* Calendar Section */}
          <div className="w-1/3 bg-white p-6 rounded-[20px] shadow-md">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="w-full"
              tileClassName={({ date }) => {
                const dateStr = date.toISOString().split("T")[0];
                return schedules[dateStr] ? "has-schedule" : null;
              }}
            />
            <style jsx global>{`
              .react-calendar {
                border: none;
                font-family: Arial, sans-serif;
                width: 100%;
              }
              .react-calendar__tile--active {
                background: #1360AB !important;
                color: white;
              }
              .react-calendar__tile--active:enabled:hover,
              .react-calendar__tile--active:enabled:focus {
                background: #1360AB !important;
              }
              .react-calendar__tile:enabled:hover,
              .react-calendar__tile:enabled:focus {
                background-color: #e6f0ff;
              }
              .has-schedule {
                position: relative;
              }
              .has-schedule::after {
                content: '•';
                position: absolute;
                bottom: 5px;
                left: 50%;
                transform: translateX(-50%);
                color: #1360AB;
                font-size: 20px;
              }
            `}</style>
          </div>

          {/* Schedule Details Section */}
          <div className="w-2/3 bg-white p-6 rounded-[20px] shadow-md">
            <div className="flex items-center mb-4">
              <FaClock className="text-[#1360AB] mr-2" />
              <h4 className="text-lg font-semibold">
                Schedule for {selectedDate.toDateString()}
              </h4>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="text-[#1360AB] animate-spin text-3xl" />
                <span className="ml-3 text-gray-500">Loading schedule...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 bg-red-50 rounded-md">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-[#1360AB] text-white rounded-md"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-[#E4F1FF] shadow-md border-l-4 border-[#1360AB] hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-[#1360AB] text-white p-2 rounded-full mr-3">
                            <FaTools />
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{slot.time}</p>
                            <p className="text-sm text-gray-700">{slot.task}</p>
                            {slot.location && (
                              <p className="text-xs text-gray-500 mt-1">{slot.location}</p>
                            )}
                          </div>
                        </div>
                        <div className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${slot.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            slot.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}
                        `}>
                          {slot.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 bg-[#f8f9fa] rounded-md">
                    <FaClock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg">No tasks scheduled for this day.</p>
                    <p className="text-sm text-gray-400">Select a different date to view scheduled tasks</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleM;