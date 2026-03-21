import { StatCards } from "@/components/ui"
import { FaUsers } from "react-icons/fa"
import { MdVerified } from "react-icons/md"
import { FaBuilding, FaUserTie } from "react-icons/fa"

const WardenStats = ({ wardens, staffType = "warden" }) => {
  const isGymkhana = staffType === "gymkhana"
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : staffType === "hostelSupervisor" ? "Hostel Supervisor" : "Gymkhana"

  if (isGymkhana) {
    const totalUsers = wardens.length
    const gsCount = wardens.filter((user) => user.subRole === "GS Gymkhana").length
    const presidentCount = wardens.filter((user) => user.subRole === "President Gymkhana").length
    const electionOfficerCount = wardens.filter((user) => user.subRole === "Election Officer").length

    const statsData = [
      {
        title: "Total Gymkhana",
        value: totalUsers,
        subtitle: "All Gymkhana user accounts",
        icon: <FaUsers style={{ fontSize: "var(--icon-xl)" }} />,
        color: "var(--color-primary)",
      },
      {
        title: "GS Gymkhana",
        value: gsCount,
        subtitle: "General Secretary accounts",
        icon: <MdVerified style={{ fontSize: "var(--icon-xl)" }} />,
        color: "var(--color-success)",
      },
      {
        title: "President",
        value: presidentCount,
        subtitle: "President Gymkhana accounts",
        icon: <FaUserTie style={{ fontSize: "var(--icon-xl)" }} />,
        color: "var(--color-warning)",
      },
      {
        title: "Election Officer",
        value: electionOfficerCount,
        subtitle: "Election officer accounts",
        icon: <FaBuilding style={{ fontSize: "var(--icon-xl)" }} />,
        color: "var(--color-info)",
      },
    ]

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
