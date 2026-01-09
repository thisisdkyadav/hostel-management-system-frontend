import { StatCards } from "@/components/ui"
import { Building, Bed, UserRound, Sparkles } from "lucide-react"

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
      icon: <Building size={20} />,
      color: "var(--color-primary)",
    },
    {
      title: "Total Rooms",
      value: totalRooms,
      subtitle: "Available for allocation",
      icon: <Bed size={20} />,
      color: "var(--color-primary)",
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      subtitle: "Current utilization",
      icon: <UserRound size={20} />,
      color: "var(--color-success)",
    },
    {
      title: "Available Rooms",
      value: availableRooms,
      subtitle: "Ready for allocation",
      icon: <Sparkles size={20} />,
      color: "var(--color-warning)",
    },
  ]

  return <StatCards stats={statsData} />
}

export default HostelStats
