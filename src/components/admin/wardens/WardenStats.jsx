import { StatCards } from "@/components/ui"
import { FaUsers } from "react-icons/fa"
import { MdVerified } from "react-icons/md"
import { FaBuilding, FaUserTie } from "react-icons/fa"
import { GYMKHANA_SUBROLE_OPTIONS } from "../../../constants/adminConstants"

const WardenStats = ({ wardens, staffType = "warden" }) => {
  const isGymkhana = staffType === "gymkhana"
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : staffType === "hostelSupervisor" ? "Hostel Supervisor" : "Gymkhana"

  if (isGymkhana) {
    const totalUsers = wardens.length
    const baseStats = [
      {
        title: "Total Gymkhana",
        value: totalUsers,
        subtitle: "All Gymkhana user accounts",
        icon: <FaUsers style={{ fontSize: "var(--icon-xl)" }} />,
        color: "var(--color-primary)",
      },
    ]

    const statIconBySubRole = {
      "GS Gymkhana": <MdVerified style={{ fontSize: "var(--icon-xl)" }} />,
      "President Gymkhana": <FaUserTie style={{ fontSize: "var(--icon-xl)" }} />,
      "Election Officer": <FaBuilding style={{ fontSize: "var(--icon-xl)" }} />,
      Councils: <FaBuilding style={{ fontSize: "var(--icon-xl)" }} />,
      Committee: <FaBuilding style={{ fontSize: "var(--icon-xl)" }} />,
      "Mega Events": <FaBuilding style={{ fontSize: "var(--icon-xl)" }} />,
    }

    const statColorBySubRole = {
      "GS Gymkhana": "var(--color-success)",
      "President Gymkhana": "var(--color-warning)",
      "Election Officer": "var(--color-info)",
      Councils: "var(--color-primary)",
      Committee: "var(--color-danger)",
      "Mega Events": "var(--color-success)",
    }

    const statSubtitleBySubRole = {
      "GS Gymkhana": "General Secretary accounts",
      "President Gymkhana": "President Gymkhana accounts",
      "Election Officer": "Election officer accounts",
      Councils: "Council member accounts",
      Committee: "Committee member accounts",
      "Mega Events": "Mega events accounts",
    }

    const statsData = baseStats.concat(
      GYMKHANA_SUBROLE_OPTIONS.map(({ value, label }) => ({
        title: label,
        value: wardens.filter((user) => user.subRole === value).length,
        subtitle: statSubtitleBySubRole[value] || `${label} accounts`,
        icon: statIconBySubRole[value] || <FaBuilding style={{ fontSize: "var(--icon-xl)" }} />,
        color: statColorBySubRole[value] || "var(--color-info)",
      }))
    )

    return <StatCards stats={statsData} columns={4} />
  }

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
