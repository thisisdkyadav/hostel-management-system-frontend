import React from "react"
import { FaClipboardList, FaRegCheckCircle } from "react-icons/fa"
import { MdOutlineWatchLater, MdPriorityHigh } from "react-icons/md"
import { TbProgressCheck } from "react-icons/tb"
import StatCards from "./StatCards"

const ComplaintStats = ({ complaints }) => {
  const totalComplaints = complaints.length
  const newComplaints = complaints.filter((c) => c.status === "Pending").length
  const inProgressComplaints = complaints.filter((c) => c.status === "In Progress").length
  const resolvedComplaints = complaints.filter((c) => c.status === "Resolved").length
  const urgentComplaints = complaints.filter((c) => c.priority === "Urgent").length

  const statsData = [
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
      value: newComplaints,
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
      title: "Urgent",
      value: urgentComplaints,
      subtitle: "High Priority",
      icon: <MdPriorityHigh className="text-2xl" />,
      color: "#ef4444", // red-500
      iconColor: "text-red-500",
    },
  ]

  return <StatCards stats={statsData} columns={5} />
}

export default ComplaintStats
