import React from "react"
import { FaBuilding, FaDoorOpen, FaUserCheck, FaUserAltSlash } from "react-icons/fa"
import { IoStatsChart } from "react-icons/io5"
import StatCards from "../common/StatCards"

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
      icon: <FaDoorOpen className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Active Rooms",
      value: activeRooms,
      subtitle: `${totalRooms > 0 ? ((activeRooms / totalRooms) * 100).toFixed(1) : 0}% of total`,
      icon: <FaUserCheck className="text-2xl" />,
      color: "#22c55e", // green-500
    },
    {
      title: "Full Rooms",
      value: fullRooms,
      subtitle: `${totalRooms > 0 ? ((fullRooms / totalRooms) * 100).toFixed(1) : 0}% at capacity`,
      icon: <FaUserAltSlash className="text-2xl" />,
      color: "#ef4444", // red-500
    },
    {
      title: "Occupancy Rate",
      value: `${occupiedPercentage}%`,
      subtitle: "Room utilization",
      icon: <IoStatsChart className="text-2xl" />,
      color: "#eab308", // yellow-500
    },
  ]

  return <StatCards stats={roomStatsData} />
}

export default RoomStats
