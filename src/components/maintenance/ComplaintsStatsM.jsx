import React, { useState, useEffect } from "react";
import { FaClipboardList, FaRegCheckCircle } from "react-icons/fa";
import { MdOutlineWatchLater, MdPriorityHigh } from "react-icons/md";
import { TbProgressCheck } from "react-icons/tb";
import StatCards from "../common/StatCards";
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
        const params = {};
        if (filter && filter !== "all") {
          params.category = filter;
        }
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

  const statsData = [
    {
      title: "Total",
      value: safeStats.total,
      subtitle: "Complaints",
      icon: <FaClipboardList className="text-2xl" />,
      color: "#1360AB",
      iconColor: "text-[#1360AB]",
    },
    {
      title: "Pending",
      value: safeStats.pending,
      subtitle: "Pending Review",
      icon: <MdOutlineWatchLater className="text-2xl" />,
      color: "#3b82f6",
      iconColor: "text-blue-500",
    },
    {
      title: "In Progress",
      value: safeStats.inProgress,
      subtitle: "Being Handled",
      icon: <TbProgressCheck className="text-2xl" />,
      color: "#eab308", // yellow-500
      iconColor: "text-yellow-500",
    },
    {
      title: "Resolved",
      value: safeStats.resolved,
      subtitle: "Fixed Issues",
      icon: <FaRegCheckCircle className="text-2xl" />,
      color: "#22c55e", // green-500
      iconColor: "text-green-500",
    },
  ];

  return <StatCards stats={statsData} />;
};

export default ComplaintsStatsM;
