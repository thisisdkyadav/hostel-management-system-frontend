import React from "react"
import { FaBuilding, FaDoorOpen, FaUserCheck, FaUserAltSlash } from "react-icons/fa"
import { IoStatsChart } from "react-icons/io5"
import StatCards from "../admin/StatCards"

const UnitStats = ({ units, rooms, currentView, totalCount }) => {
  // Calculate statistics
  const getUnitStats = () => {
    const totalUnits = units.length
    const totalRooms = units.reduce((acc, unit) => acc + (unit.roomCount || 0), 0)
    const occupiedRooms = units.reduce((acc, unit) => acc + (unit.occupiedRoomCount || 0), 0)
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    return { totalUnits, totalRooms, occupiedRooms, occupancyRate }
  }

  const getRoomStats = () => {
    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter((room) => room.currentOccupancy > 0).length
    const fullRooms = rooms.filter((room) => room.currentOccupancy >= room.capacity).length
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    return { totalRooms, occupiedRooms, fullRooms, occupancyRate }
  }

  const stats = currentView === "units" ? getUnitStats() : getRoomStats()

  const unitStatsData = [
    {
      title: "Total Units",
      value: stats.totalUnits,
      subtitle: "Hostel units",
      icon: <FaBuilding className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      subtitle: "Across all units",
      icon: <FaDoorOpen className="text-2xl" />,
      color: "#22c55e", // green-500
    },
    {
      title: "Occupied Rooms",
      value: stats.occupiedRooms,
      subtitle: `${stats.totalRooms > 0 ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) : 0}% of total`,
      icon: <FaUserCheck className="text-2xl" />,
      color: "#6366f1", // indigo-500
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      subtitle: "Room utilization",
      icon: <IoStatsChart className="text-2xl" />,
      color: "#eab308", // yellow-500
    },
  ]

  const roomStatsData = [
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      subtitle: "Available for allocation",
      icon: <FaDoorOpen className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Occupied Rooms",
      value: stats.occupiedRooms,
      subtitle: `${stats.totalRooms > 0 ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1) : 0}% of total`,
      icon: <FaUserCheck className="text-2xl" />,
      color: "#22c55e", // green-500
    },
    {
      title: "Full Rooms",
      value: stats.fullRooms,
      subtitle: `${stats.totalRooms > 0 ? ((stats.fullRooms / stats.totalRooms) * 100).toFixed(1) : 0}% at capacity`,
      icon: <FaUserAltSlash className="text-2xl" />,
      color: "#ef4444", // red-500
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      subtitle: "Room utilization",
      icon: <IoStatsChart className="text-2xl" />,
      color: "#eab308", // yellow-500
    },
  ]

  return <StatCards stats={currentView === "units" ? unitStatsData : roomStatsData} />
}

export default UnitStats
