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
      icon: <FaUsers style={{ fontSize: 'var(--icon-xl)' }} />,
      color: "var(--color-primary)",
    },
    {
      title: "Assigned",
      value: assignedWardens,
      subtitle: "Currently assigned",
      icon: <MdVerified style={{ fontSize: 'var(--icon-xl)' }} />,
      color: "var(--color-success)",
    },
    {
      title: "Unassigned",
      value: unassignedWardens,
      subtitle: "Available to assign",
      icon: <FaBuilding style={{ fontSize: 'var(--icon-xl)' }} />,
      color: "var(--color-warning)",
    },
  ]

  return <StatCards stats={statsData} columns={3} />
}

export default WardenStats
