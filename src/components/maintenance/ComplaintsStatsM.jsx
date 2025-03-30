import React, { useState, useEffect } from 'react';
import { maintenanceApi } from "../../services/apiService";

const ComplaintsStatsM = ({ filter }) => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Build params based on the provided filter
        const params = {};
        // If a filter is provided and isn't "all", add the category filter
        if (filter && filter !== "all") {
          params.category = filter;
        }
        // You can add more filtering fields if needed:
        // if (otherFilter) { params.other = otherFilter }
        const queryString = new URLSearchParams(params).toString();
        const statsData = await maintenanceApi.getStats(queryString);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [filter]);

  const safeStats = {
    total: stats?.total || 0,
    pending: stats?.pending || 0,
    inProgress: stats?.inProgress || 0,
    resolved: stats?.resolved || 0,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
      <div className="bg-white p-3 md:p-4 rounded-[12px] shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Total</p>
        <p className="text-xl md:text-2xl lg:text-3xl font-bold">{safeStats.total}</p>
      </div>
      
      <div className="bg-white p-3 md:p-4 rounded-[12px] shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Pending</p>
        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-amber-500">{safeStats.pending}</p>
      </div>
      
      <div className="bg-white p-3 md:p-4 rounded-[12px] shadow-sm">
        <p className="text-sm text-gray-500 mb-1">In Progress</p>
        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-500">{safeStats.inProgress}</p>
      </div>
      
      <div className="bg-white p-3 md:p-4 rounded-[12px] shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Resolved</p>
        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-500">{safeStats.resolved}</p>
      </div>
    </div>
  );
};

export default ComplaintsStatsM;
