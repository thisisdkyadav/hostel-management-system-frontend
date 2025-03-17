import React from "react";
import Sidebar from "../../components/Warden/Sidebar";
import Card from "../../components/Warden/Card";
import Events from "../../components/Warden/Events";
import Notification from "../../components/Warden/Notification";
import IssueNotice from "../../components/Warden/Issuenotice";
import { FaBuilding } from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="flex bg-[#EFF3F4] min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Warden</h1>
            <p className="text-sm text-gray-500">13 Feb 2025</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white text-red-500 px-4 py-2 rounded-md shadow">
              Alert
            </button>
            <span className="font-medium text-gray-700">Warden</span>
          </div>
        </header>

        {/* Top Section Grid */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* Left Column */}
          <div className="col-span-8">
            {/* C.V. RAMAN Section */}
            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <div className="flex items-center gap-2 mb-3">
                {/* 28x28 pixel hostel icon */}
                <div className="w-7 h-7 flex items-center justify-center">
                  <FaBuilding className="w-5 h-5 text-[#1360AB]" />
                </div>
                <h2 className="text-xl font-bold">C.V. RAMAN</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Residents */}
                <div className="bg-[#1360AB] text-white rounded-xl p-4 flex flex-col items-center">
                  <span className="text-sm">Residents</span>
                  <span className="text-2xl font-bold">0</span>
                </div>
                
                {/* Room Occupied */}
                <div className="bg-[#1360AB] text-white rounded-xl p-4 flex flex-col items-center">
                  <span className="text-sm">Room Occupied</span>
                  <span className="text-2xl font-bold">0</span>
                </div>
              </div>
            </div>

            {/* Pending Complaints Cards */}
            <div className="flex justify-center space-x-6">
              <Card type="pending" count={5} />
              <Card type="pending" count={5} />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-4">
            <Events />
            <Notification />
          </div>
        </div>

        {/* Bottom Section Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Half - Reserved for future content */}
          <div className="col-span-6">
            {/* This space is intentionally left empty for future content */}
          </div>

          {/* Right Half - Issue Notice */}
          <div className="col-span-6">
            <IssueNotice />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
