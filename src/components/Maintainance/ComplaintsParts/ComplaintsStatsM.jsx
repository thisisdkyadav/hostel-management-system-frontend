import React from "react";

const ComplaintsStatsM = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6 border-b pb-6">
      <div className="text-center py-4 bg-[#f5f8ff] rounded-lg">
        <p className="text-3xl font-bold text-[#1360AB]">{stats.total}</p>
        <p className="text-sm text-gray-600">Total</p>
      </div>
      <div className="text-center py-4 bg-[#fff9f0] rounded-lg">
        <p className="text-3xl font-bold text-[#1360AB]">{stats.pending}</p>
        <p className="text-sm text-gray-600">Pending</p>
      </div>
      <div className="text-center py-4 bg-[#f0f7ff] rounded-lg">
        <p className="text-3xl font-bold text-[#1360AB]">{stats.inProgress}</p>
        <p className="text-sm text-gray-600">In Progress</p>
      </div>
      <div className="text-center py-4 bg-[#f0fff7] rounded-lg">
        <p className="text-3xl font-bold text-[#1360AB]">{stats.resolved}</p>
        <p className="text-sm text-gray-600">Resolved</p>
      </div>
    </div>
  );
};

export default ComplaintsStatsM;