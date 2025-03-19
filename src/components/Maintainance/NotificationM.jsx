import React, { useState, useEffect, useRef } from "react";
import { IoNotificationsOutline, IoCloseOutline } from "react-icons/io5";
import { FaExclamationTriangle, FaCheck, FaTools, FaWrench, FaBell, FaSpinner } from "react-icons/fa";
import { maintenanceApi } from "../../services/apiService";

const Notification = ({ alertTriggered, onAlertClear, compact = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHighlight, setShowHighlight] = useState(false);
  
  const notificationRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await maintenanceApi.getNotifications({
        limit: 30,
        sort: 'timestamp',
        order: 'desc'
      });
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    
    // Setup WebSocket for real-time notifications
    const socket = maintenanceApi.subscribeToUpdates(
      (data) => {
        if (data.type === 'notification') {
          // Add new notification at the beginning of the list
          const newNotification = {
            id: data.id,
            type: data.notificationType || 'update',
            message: data.message,
            timestamp: "Just now",
            read: false,
            priority: data.priority || "normal"
          };
          
          setNotifications(prevNotifications => 
            [newNotification, ...prevNotifications]
          );
          
          // Highlight new high-priority notifications
          if (data.priority === 'high' || data.notificationType === 'alert') {
            setShowHighlight(true);
            setTimeout(() => setShowHighlight(false), 2000);
          }
        }
      },
      (error) => console.error("WebSocket error:", error)
    );
    
    // Cleanup
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  // Handle alert trigger
  useEffect(() => {
    if (alertTriggered) {
      setShowHighlight(true);
      if (notificationRef.current) {
        notificationRef.current.scrollIntoView({ behavior: "smooth" });
      }
      
      // Reset highlight after animation
      const timer = setTimeout(() => {
        setShowHighlight(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [alertTriggered]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await maintenanceApi.markNotificationAsRead(id);
      setNotifications(
        notifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Silently fail - we'll leave it unread
    }
  };

  // Clear notification
  const clearNotification = async (id) => {
    try {
      await maintenanceApi.clearNotification(id);
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (err) {
      console.error("Error clearing notification:", err);
      // If API call fails, still remove from UI but show message
      setNotifications(notifications.filter(notification => notification.id !== id));
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      await maintenanceApi.clearAllNotifications();
      setNotifications([]);
      if (onAlertClear) onAlertClear();
    } catch (err) {
      console.error("Error clearing all notifications:", err);
      // If API call fails, still clear UI
      setNotifications([]);
      if (onAlertClear) onAlertClear();
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'task':
        return <FaTools className="text-[#1360AB]" />;
      case 'update':
        return <FaCheck className="text-green-600" />;
      case 'reminder':
        return <FaBell className="text-amber-500" />;
      default:
        return <FaWrench className="text-[#1360AB]" />;
    }
  };

  return (
    <div 
      ref={notificationRef}
      className={`bg-white shadow-[0px_1px_20px_rgba(0,0,0,0.06)] rounded-[20px] h-full flex flex-col ${
        showHighlight ? "ring-2 ring-red-500 transition-all duration-300" : ""
      }`}
    >
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <IoNotificationsOutline className="text-[#1360AB] text-xl" />
            <h3 className="font-semibold text-lg">Notifications</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#1360AB] text-white text-xs px-2 py-1 rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
            <button 
              onClick={clearAll}
              className="text-sm text-[#1360AB] font-medium hover:underline"
              disabled={loading || notifications.length === 0}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="p-2 flex-1 overflow-y-auto custom-scrollbar"
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="text-[#1360AB] animate-spin text-xl" />
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={fetchNotifications}
              className="text-[#1360AB] text-sm hover:underline"
            >
              Retry
            </button>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg relative border-l-4 ${
                  notification.read 
                    ? "bg-gray-50 border-gray-300" 
                    : notification.type === "alert"
                      ? "bg-red-50 border-red-500"
                      : "bg-[#E4F1FF] border-[#1360AB]"
                }`}
              >
                <div className="flex">
                  <div className="mr-3 mt-0.5 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? "text-gray-600" : "text-gray-800 font-medium"}`}>
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-400">
                        {notification.timestamp}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-[#1360AB] hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => clearNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <IoCloseOutline size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FaBell className="text-gray-300 text-3xl mx-auto mb-2" />
            <p className="text-gray-500">No notifications</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1360AB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0f4c8a;
        }
      `}</style>
    </div>
  );
};

export default Notification;