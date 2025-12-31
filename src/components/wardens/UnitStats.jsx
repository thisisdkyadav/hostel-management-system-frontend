import React from "react"
import { FaBuilding, FaDoorOpen, FaUserCheck, FaUserAltSlash } from "react-icons/fa"
import { IoStatsChart } from "react-icons/io5"
import { StatCards } from "@/components/ui"

const UnitStats = ({ units, rooms, currentView, totalCount }) => {
  // Calculate statistics
  const getUnitStats = () => {
    const totalUnits = units.length
    const totalRooms = units.reduce((acc, unit) => acc + (unit.roomCount || 0), 0)
    const occupancy = units.reduce((acc, unit) => acc + (unit.occupancy || 0), 0)
    const capacity = units.reduce((acc, unit) => acc + (unit.capacity || 0), 0)
    const occupancyRate = totalRooms > 0 ? Math.round((occupancy / capacity) * 100) : 0

    return { totalUnits, totalRooms, occupancy, occupancyRate }
  }

  const getRoomStats = () => {
    const totalRooms = rooms.length
    const activeRooms = rooms.filter((room) => room.status === "Active").length
    const fullRooms = rooms.filter((room) => (room.capacity ? room.currentOccupancy >= room.capacity : 0)).length
    const totalOccupancy = rooms.reduce((acc, room) => acc + (room.currentOccupancy || 0), 0)
    const totalCapacity = rooms.reduce((acc, room) => acc + (room.capacity || 0), 0)
    const occupancyRate = totalRooms > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0

    return { totalRooms, activeRooms, fullRooms, occupancyRate }
  }

  const stats = currentView === "units" ? getUnitStats() : getRoomStats()

  const unitStatsData = [
    {
      title: "Total Units",
      value: stats.totalUnits,
      subtitle: "Hostel units",
      icon: <FaBuilding style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-primary)",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      subtitle: "Across all units",
      icon: <FaDoorOpen style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-success)",
    },
    {
      title: "Total Occupancy",
      value: stats.occupancy,
      subtitle: `${stats.totalRooms > 0 ? ((stats.occupancy / stats.totalRooms) * 100).toFixed(1) : 0}% of total`,
      icon: <FaUserCheck style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-info)",
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      subtitle: "Room utilization",
      icon: <IoStatsChart style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-warning)",
    },
  ]

  const roomStatsData = [
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      subtitle: "Available for allocation",
      icon: <FaDoorOpen style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-primary)",
    },
    {
      title: "Active Rooms",
      value: stats.activeRooms,
      subtitle: `${stats.totalRooms > 0 ? ((stats.activeRooms / stats.totalRooms) * 100).toFixed(1) : 0}% of total`,
      icon: <FaUserCheck style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-success)",
    },
    {
      title: "Full Rooms",
      value: stats.fullRooms,
      subtitle: `${stats.totalRooms > 0 ? ((stats.fullRooms / stats.totalRooms) * 100).toFixed(1) : 0}% at capacity`,
      icon: <FaUserAltSlash style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-danger)",
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      subtitle: "Room utilization",
      icon: <IoStatsChart style={{ fontSize: "var(--font-size-3xl)" }} />,
      color: "var(--color-warning)",
    },
  ]

  return <StatCards stats={currentView === "units" ? unitStatsData : roomStatsData} />
}

export default UnitStats
