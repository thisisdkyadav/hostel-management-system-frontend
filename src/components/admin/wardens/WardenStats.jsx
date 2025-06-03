import StatCards from "../../common/StatCards"
import { FaUsers } from "react-icons/fa"
import { MdVerified } from "react-icons/md"
import { FaBuilding } from "react-icons/fa"

const WardenStats = ({ wardens, staffType = "warden" }) => {
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : "Hostel Supervisor"
  const totalWardens = wardens.length
  const assignedWardens = wardens.filter((w) => w.hostelIds && w.hostelIds.length > 0).length
  const unassignedWardens = totalWardens - assignedWardens

  const statsData = [
    {
      title: `Total ${staffTitle}s`,
      value: totalWardens,
      subtitle: staffType === "warden" ? "Managing faculty members" : staffType === "associateWarden" ? "Supporting faculty members" : "Supervising staff members",
      icon: <FaUsers className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Assigned",
      value: assignedWardens,
      subtitle: "Currently assigned",
      icon: <MdVerified className="text-2xl" />,
      color: "#22c55e",
    },
    {
      title: "Unassigned",
      value: unassignedWardens,
      subtitle: "Available to assign",
      icon: <FaBuilding className="text-2xl" />,
      color: "#f97316",
    },
  ]

  return <StatCards stats={statsData} columns={3} />
}

export default WardenStats
