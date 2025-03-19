import StatCards from "./StatCards"
import { FaUsers } from "react-icons/fa"
import { MdVerified } from "react-icons/md"
import { FaBuilding } from "react-icons/fa"
import { BsCalendarCheck } from "react-icons/bs"

const WardenStats = ({ wardens }) => {
  const totalWardens = wardens.length
  const activeWardens = wardens.filter((w) => w.status === "active").length
  const unassignedWardens = wardens.filter((w) => w.status === "unassigned").length
  const averageExperience = Math.round(wardens.reduce((acc, warden) => acc + warden.experience, 0) / wardens.length || 0)

  const statsData = [
    {
      title: "Total Wardens",
      value: totalWardens,
      subtitle: "Managing faculty members",
      icon: <FaUsers className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Active Wardens",
      value: activeWardens,
      subtitle: "Currently assigned",
      icon: <MdVerified className="text-2xl" />,
      color: "#22c55e", // green-500
    },
    {
      title: "Unassigned",
      value: unassignedWardens,
      subtitle: "Available to assign",
      icon: <FaBuilding className="text-2xl" />,
      color: "#f97316", // orange-500
    },
    {
      title: "Avg. Experience",
      value: `${averageExperience} yrs`,
      subtitle: "Of service",
      icon: <BsCalendarCheck className="text-2xl" />,
      color: "#1360AB",
    },
  ]

  return <StatCards stats={statsData} />
}

export default WardenStats
