import React, { useState, useEffect, useRef } from "react";
import { IoNotificationsOutline, IoCloseOutline } from "react-icons/io5";
import { FaExclamationTriangle, FaCheck, FaTools, FaWrench, FaBell } from "react-icons/fa";

const Notification = ({ alertTriggered, onAlertClear }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "alert",
      message: "Urgent: Water leakage in Block E needs immediate attention",
      timestamp: "10 mins ago",
      read: false
    },
    {
      id: 2,
      type: "task",
      message: "New maintenance task assigned: Electrical repair in Room 201",
      timestamp: "30 mins ago",
      read: false
    },
    {
      id: 3,
      type: "update",
      message: "2 complaints have been resolved today",
      timestamp: "2 hours ago",
      read: true
    },
    {
      id: 4,
      type: "reminder",
      message: "Weekly maintenance check for Block F due tomorrow",
      timestamp: "4 hours ago",
      read: true
    }
  ]);

  const [showHighlight, setShowHighlight] = useState(false);
  const notificationRef = useRef(null);

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
  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Clear notification
  const clearNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
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
      className={`bg-white shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-5 rounded-[20px] w-full transition-all duration-300 ${
        showHighlight ? "ring-2 ring-red-500" : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <IoNotificationsOutline className="text-[#1360AB] text-xl" />
          <h3 className="font-semibold text-lg">Notifications</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-[#1360AB] text-white text-xs px-2 py-1 rounded-full">
            {notifications.filter(n => !n.read).length}
          </span>
          {onAlertClear && (
            <button 
              onClick={onAlertClear}
              className="text-sm text-[#1360AB] font-medium hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-3 rounded-lg relative border-l-4 ${
                notification.read 
                  ? "bg-gray-50 border-gray-300" 
                  : notification.type === "alert"
                    ? "bg-red-50 border-red-500"
                    : "bg-blue-50 border-[#1360AB]"
              }`}
            >
              <div className="flex">
                <div className="mr-3 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${notification.read ? "text-gray-600" : "text-gray-800 font-medium"}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.timestamp}
                  </p>
                </div>
                <button 
                  onClick={() => clearNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IoCloseOutline size={18} />
                </button>
              </div>
              
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-xs text-[#1360AB] mt-2 hover:underline"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <FaBell className="text-gray-300 text-3xl mx-auto mb-2" />
            <p className="text-gray-500">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;