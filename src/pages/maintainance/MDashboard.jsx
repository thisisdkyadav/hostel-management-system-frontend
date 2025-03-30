import React, { useState } from "react";
import ComplaintsM from "../../components/maintenance/ComplaintsM";
import FilterTabs from "../../components/common/FilterTabs";
import { MAINTENANCE_FILTER_TABS } from "../../constants/adminConstants";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthProvider";

const MDashboard = () => {
  const { user } = useAuth();
  // Set default active tab as "all"
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="w-full flex-1 p-4 md:p-6 mt-12 md:mt-0">
      <header className="flex justify-between items-center w-full px-3 py-4 rounded-[12px]">
        <h1 className="text-xl md:text-2xl px-3 font-bold">Dashboard</h1>
        <button className="flex items-center space-x-2 text-black text-base px-3 md:px-5 py-2 rounded-[12px] hover:text-gray-600">
          <FaUser className="w-4 h-4 md:w-5 md:h-5 text-[#1360AB]" />
          <div>
            <span className="hidden sm:inline">{user?.name}</span>
            <span className="hidden sm:inline"> | </span>
            <span className="hidden sm:inline">{user?.role}</span>
          </div>
        </button>
      </header>

      {/* Filter Tabs for Maintenance complaints */}
      <div className="my-4">
        <FilterTabs tabs={MAINTENANCE_FILTER_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="pr-0 md:pr-6">
        {/* Pass the active tab (e.g., filter) to ComplaintsM if needed */}
        <ComplaintsM filterTab={activeTab} />
      </div>
    </div>
  );
};

export default MDashboard;
