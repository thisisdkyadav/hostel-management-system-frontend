import React from "react"
import { FaRegCalendarAlt, FaBell, FaUsers } from "react-icons/fa"
import { StatCards, LoadingState } from "@/components/ui"

const NotificationStats = ({ stats, loading }) => {
  if (loading) {
    return <LoadingState />
  }

  const statItems = [
    {
      title: "Total",
      value: stats?.total || 0,
      subtitle: "Notifications",
      icon: <FaBell style={{ fontSize: "var(--icon-2xl)" }} />,
      color: "var(--color-primary)",
    },
    {
      title: "Active",
      value: stats?.active || 0,
      subtitle: "Currently Live",
      icon: <FaUsers style={{ fontSize: "var(--icon-2xl)" }} />,
      color: "var(--color-success)",
    },
    {
      title: "Expired",
      value: stats?.expired || 0,
      subtitle: "Past Expiry Date",
      icon: <FaRegCalendarAlt style={{ fontSize: "var(--icon-2xl)" }} />,
      color: "var(--color-danger)",
    },
  ]

  return <StatCards stats={statItems} columns={3} />
}

export default NotificationStats
