import React from "react"
import { FaClipboardList, FaRegCheckCircle } from "react-icons/fa"
import { MdOutlineWatchLater, MdPriorityHigh } from "react-icons/md"
import { TbProgressCheck } from "react-icons/tb"
import StatCards from "../common/StatCards"
import LoadingState from "../common/LoadingState"

const ComplaintStats = ({ statsData, loading }) => {
  if (loading) {
    return <LoadingState />
  }

  // Default values if statsData is not available
  const totalComplaints = statsData?.total || 0
  const pendingComplaints = statsData?.pending || 0
  const inProgressComplaints = statsData?.inProgress || 0
  const resolvedComplaints = statsData?.resolved || 0
  const forwardedToIDOComplaints = statsData?.forwardedToIDO || 0
  // const urgentComplaints = statsData?.urgent || 0

  const statsCards = [
    {
      title: "Total",
      value: totalComplaints,
      subtitle: "Complaints",
      icon: <FaClipboardList className="text-2xl" />,
      color: "#1360AB",
      iconColor: "text-[#1360AB]",
    },
    {
      title: "Pending",
      value: pendingComplaints,
      subtitle: "Pending Review",
      icon: <MdOutlineWatchLater className="text-2xl" />,
      color: "#3b82f6",
      iconColor: "text-blue-500",
    },
    {
      title: "In Progress",
      value: inProgressComplaints,
      subtitle: "Being Handled",
      icon: <TbProgressCheck className="text-2xl" />,
      color: "#eab308", // yellow-500
      iconColor: "text-yellow-500",
    },
    {
      title: "Resolved",
      value: resolvedComplaints,
      subtitle: "Fixed Issues",
      icon: <FaRegCheckCircle className="text-2xl" />,
      color: "#22c55e", // green-500
      iconColor: "text-green-500",
    },
    {
      title: "Forwarded to IDO",
      value: forwardedToIDOComplaints,
      subtitle: "Escalated",
      icon: <MdPriorityHigh className="text-2xl" />,
      color: "#f97316", // orange-500
      iconColor: "text-orange-500",
    },
    // {
    //   title: "Urgent",
    //   value: urgentComplaints,
    //   subtitle: "High Priority",
    //   icon: <MdPriorityHigh className="text-2xl" />,
    //   color: "#ef4444", // red-500
    //   iconColor: "text-red-500",
    // },
  ]

  return <StatCards stats={statsCards} columns={5} />
}

export default ComplaintStats
