import React, { useState } from "react";
import Sidebar from "../../components/Maintainance/SidebarM";
import Notification from "../../components/Maintainance/NotificationM";
import { FaUser, FaBell, FaFilter } from "react-icons/fa";

const AlertPage = () => {
  const [alertTriggered, setAlertTriggered] = useState(false);

  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content with proper margin */}
      <div className="ml-60 px-10 py-6 w-full">
        <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
          <h1 className="text-2xl px-3 font-bold">Alerts & Notifications</h1>
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

        <div className="flex flex-col gap-6 mt-4">
          {/* Alert Controls Section */}
          <div className="bg-white shadow-md p-6 rounded-[20px]">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Alert Controls</h3>
              <div className="flex space-x-3">
                <button 
                  className="bg-[#1360AB] text-white px-4 py-2 rounded-md text-sm flex items-center space-x-1"
                  onClick={() => setAlertTriggered(true)}
                >
                  <FaBell className="mr-1" />
                  <span>Test Alert</span>
                </button>
                <button className="bg-[#1360AB] text-white px-4 py-2 rounded-md text-sm flex items-center space-x-1">
                  <FaFilter className="mr-1" />
                  <span>Filter</span>
                </button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="bg-[#E4F1FF] p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-[#1360AB]">4</p>
                <p className="text-sm text-gray-600">Total Alerts</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">1</p>
                <p className="text-sm text-gray-600">Urgent</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">1</p>
                <p className="text-sm text-gray-600">Important</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">2</p>
                <p className="text-sm text-gray-600">Regular</p>
              </div>
            </div>
          </div>

          {/* Full Notification Panel */}
          <div className="w-full max-w-7xl mx-auto">
            <Notification 
              alertTriggered={alertTriggered}
              onAlertClear={() => setAlertTriggered(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPage;