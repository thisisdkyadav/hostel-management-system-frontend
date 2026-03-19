import React from "react"
import { FaClipboardList, FaRegCheckCircle } from "react-icons/fa"
import { MdOutlineWatchLater, MdPriorityHigh } from "react-icons/md"
import { TbProgressCheck } from "react-icons/tb"
import { StatCards } from "@/components/ui"

const ComplaintStats = ({ statsData, loading, entityLabel = "Complaints" }) => {
  const normalizedStats = statsData?.data || statsData || {}
  const entityLabelLower = entityLabel.toLowerCase()

  const totalComplaints = normalizedStats.total || 0
  const pendingComplaints = normalizedStats.pending || 0
  const inProgressComplaints = normalizedStats.inProgress || 0
  const resolvedComplaints = normalizedStats.resolved || 0
  const forwardedToIDOComplaints = normalizedStats.forwardedToIDO || 0

  const statsCards = [
    {
      title: "Total",
      value: totalComplaints,
      subtitle: entityLabel,
      icon: <FaClipboardList style={{ fontSize: 'var(--icon-2xl)' }} />,
      color: "var(--color-primary)",
      iconColor: "var(--color-primary)",
    },
    {
      title: "Pending",
      value: pendingComplaints,
      subtitle: `Pending ${entityLabel}`,
      icon: <MdOutlineWatchLater style={{ fontSize: 'var(--icon-2xl)' }} />,
      color: "var(--color-info)",
      iconColor: "var(--color-info)",
    },
    {
      title: "In Progress",
      value: inProgressComplaints,
      subtitle: `${entityLabel} In Progress`,
      icon: <TbProgressCheck style={{ fontSize: 'var(--icon-2xl)' }} />,
      color: "var(--color-warning)",
      iconColor: "var(--color-warning)",
    },
    {
      title: "Resolved",
      value: resolvedComplaints,
      subtitle: entityLabelLower === "issues" ? "Fixed Issues" : `Resolved ${entityLabel}`,
      icon: <FaRegCheckCircle style={{ fontSize: 'var(--icon-2xl)' }} />,
      color: "var(--color-success)",
      iconColor: "var(--color-success)",
    },
    {
      title: "Forwarded to IDO",
      value: forwardedToIDOComplaints,
      subtitle: `Escalated ${entityLabel}`,
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
  
  return <StatCards stats={statsCards} columns={STATS_COLUMNS} loading={loading} loadingCount={STATS_COLUMNS} />
}

export default ComplaintStats
