import StatCards from "../../common/StatCards"
import { FaBuilding, FaBed } from "react-icons/fa"
import { MdOutlinePersonOutline } from "react-icons/md"
import { GiVacuumCleaner } from "react-icons/gi"

const HostelStats = ({ hostels }) => {
  const totalHostels = hostels.length
  const totalRooms = hostels.reduce((acc, hostel) => acc + hostel.totalRooms, 0)
  const occupancyRate = Math.round((hostels.reduce((acc, hostel) => acc + hostel.occupiedRooms, 0) / hostels.reduce((acc, hostel) => acc + hostel.totalRooms, 0)) * 100 || 0)
  const availableRooms = hostels.reduce((acc, hostel) => acc + (hostel.totalRooms - hostel.occupiedRooms), 0)

  const statsData = [
    {
      title: "Total Hostels",
      value: totalHostels,
      subtitle: "Across campus",
      icon: <FaBuilding className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Total Rooms",
      value: totalRooms,
      subtitle: "Available for allocation",
      icon: <FaBed className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      subtitle: "Current utilization",
      icon: <MdOutlinePersonOutline className="text-2xl" />,
      color: "#22c55e",
    },
    {
      title: "Available Rooms",
      value: availableRooms,
      subtitle: "Ready for allocation",
      icon: <GiVacuumCleaner className="text-2xl" />,
      color: "#f97316",
    },
  ]

  return <StatCards stats={statsData} />
}

export default HostelStats
