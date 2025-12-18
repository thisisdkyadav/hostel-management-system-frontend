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
      icon: <FaClipboardList style={{ fontSize: 'var(--icon-2xl)' }} />,
      color: "var(--color-primary)",
      iconColor: "var(--color-primary)",
    },
    {
      title: "Pending",
      value: pendingComplaints,
      subtitle: "Pending Review",
      icon: <MdOutlineWatchLater style={{ fontSize: 'var(--icon-2xl)' }} />,
      color: "var(--color-info)",
      iconColor: "var(--color-info)",
    },
    {
      title: "In Progress",
      value: inProgressComplaints,
      subtitle: "Being Handled",
      icon: <TbProgressCheck style={{ fontSize: 'var(--icon-2xl)' }} />,
      color: "var(--color-warning)",
      iconColor: "var(--color-warning)",
    },
    {
      title: "Resolved",
      value: resolvedComplaints,
      subtitle: "Fixed Issues",
      icon: <FaRegCheckCircle style={{ fontSize: 'var(--icon-2xl)' }} />,
      color: "var(--color-success)",
      iconColor: "var(--color-success)",
    },
    {
      title: "Forwarded to IDO",
      value: forwardedToIDOComplaints,
      subtitle: "Escalated",
      icon: <MdPriorityHigh style={{ fontSize: 'var(--icon-2xl)' }} />,
      color: "var(--color-orange-text)",
      iconColor: "var(--color-orange-text)",
    },
    // {
    //   title: "Urgent",
    //   value: urgentComplaints,
    //   subtitle: "High Priority",
    //   icon: <MdPriorityHigh style={{ fontSize: 'var(--icon-2xl)' }} />,
    //   color: "var(--color-danger)",
    //   iconColor: "var(--color-danger)",
    // },
  ]

  const STATS_COLUMNS = 5;
  
  return <StatCards stats={statsCards} columns={STATS_COLUMNS} />
}

export default ComplaintStats
