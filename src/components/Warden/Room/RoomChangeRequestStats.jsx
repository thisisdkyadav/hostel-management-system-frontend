import React from "react"
import { FaExchangeAlt, FaClock, FaCheck, FaTimes } from "react-icons/fa"
import { IoStatsChart } from "react-icons/io5"
import StatCards from "../../common/StatCards"

const RoomChangeRequestStats = ({ requests, totalCount }) => {
  // Calculate statistics
  const getPendingCount = () => {
    return requests.filter((req) => req.status === "Pending").length
  }

  const getApprovedCount = () => {
    return requests.filter((req) => req.status === "Approved").length
  }

  const getRejectedCount = () => {
    return requests.filter((req) => req.status === "Rejected").length
  }

  const getPendingRate = () => {
    return totalCount > 0 ? Math.round((getPendingCount() / totalCount) * 100) : 0
  }

  const statsData = [
    {
      title: "Total Requests",
      value: totalCount,
      subtitle: "Room change requests",
      icon: <FaExchangeAlt className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Pending",
      value: getPendingCount(),
      subtitle: `${getPendingRate()}% of total requests`,
      icon: <FaClock className="text-2xl" />,
      color: "#eab308", // yellow
    },
    {
      title: "Approved",
      value: getApprovedCount(),
      subtitle: "Successfully processed",
      icon: <FaCheck className="text-2xl" />,
      color: "#22c55e", // green
    },
    {
      title: "Rejected",
      value: getRejectedCount(),
      subtitle: "Denied requests",
      icon: <FaTimes className="text-2xl" />,
      color: "#ef4444", // red
    },
  ]

  return <StatCards stats={statsData} />
}

export default RoomChangeRequestStats
