import React from "react";

const ComplaintsStatsM = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-white p-4 rounded-[12px] shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Total</p>
        <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
      </div>
      
      <div className="bg-white p-4 rounded-[12px] shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Pending</p>
        <p className="text-2xl md:text-3xl font-bold text-amber-500">{stats.pending}</p>
      </div>
      
      <div className="bg-white p-4 rounded-[12px] shadow-sm">
        <p className="text-sm text-gray-500 mb-1">In Progress</p>
        <p className="text-2xl md:text-3xl font-bold text-blue-500">{stats.inProgress}</p>
      </div>
      
      <div className="bg-white p-4 rounded-[12px] shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Resolved</p>
        <p className="text-2xl md:text-3xl font-bold text-green-500">{stats.resolved}</p>
      </div>
    </div>
  );
};

export default ComplaintsStatsM;