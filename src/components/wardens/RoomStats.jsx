import React from "react"
import { FaBuilding, FaDoorOpen, FaUserCheck, FaUserAltSlash } from "react-icons/fa"
import { IoStatsChart } from "react-icons/io5"
import { StatCards } from "@/components/ui"

const RoomStats = ({ rooms, totalCount }) => {
  // Calculate room statistics
  const totalRooms = totalCount || rooms.length || 0
  const occupiedRooms = rooms.filter((room) => room.currentOccupancy > 0).length
  const fullRooms = rooms.filter((room) => room.currentOccupancy >= room.capacity).length
  const emptyRooms = rooms.filter((room) => room.currentOccupancy === 0).length
  const activeRooms = rooms.filter((room) => room.status === "Active").length

  // Calculate percentages (handle division by zero)
  const occupiedPercentage = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  const roomStatsData = [
    {
      title: "Total Rooms",
      value: totalRooms,
      subtitle: "Available for allocation",
      icon: <FaDoorOpen style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-primary)",
    },
    {
      title: "Active Rooms",
      value: activeRooms,
      subtitle: `${totalRooms > 0 ? ((activeRooms / totalRooms) * 100).toFixed(1) : 0}% of total`,
      icon: <FaUserCheck style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-success)",
    },
    {
      title: "Full Rooms",
      value: fullRooms,
      subtitle: `${totalRooms > 0 ? ((fullRooms / totalRooms) * 100).toFixed(1) : 0}% at capacity`,
      icon: <FaUserAltSlash style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-danger)",
    },
    {
      title: "Occupancy Rate",
      value: `${occupiedPercentage}%`,
      subtitle: "Room utilization",
      icon: <IoStatsChart style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-warning)",
    },
  ]

  return <StatCards stats={roomStatsData} />
}

export default RoomStats
