import StatCards from "../../common/StatCards"
import { FaUserShield } from "react-icons/fa"
import { MdVerified } from "react-icons/md"
import { FaBuilding } from "react-icons/fa"
import { IoMdTime } from "react-icons/io"

const SecurityStats = ({ securityStaff }) => {
  const totalSecurity = securityStaff.length
  const assignedSecurity = securityStaff.filter((s) => s.hostelId).length
  const unassignedSecurity = securityStaff.filter((s) => !s.hostelId).length

  // Calculate shifts distribution
  const morningShifts = securityStaff.filter((s) => s.shift === "morning").length
  const eveningShifts = securityStaff.filter((s) => s.shift === "evening").length
  const nightShifts = securityStaff.filter((s) => s.shift === "night").length

  const mostCommonShift = morningShifts >= eveningShifts && morningShifts >= nightShifts ? "Morning" : eveningShifts >= nightShifts ? "Evening" : "Night"

  const statsData = [
    {
      title: "Total Security",
      value: totalSecurity,
      subtitle: "Security staff members",
      icon: <FaUserShield style={{ fontSize: 'var(--font-size-2xl)' }} />,
      color: "#1360AB",
    },
    {
      title: "Assigned Staff",
      value: assignedSecurity,
      subtitle: "Currently assigned",
      icon: <MdVerified style={{ fontSize: 'var(--font-size-2xl)' }} />,
      color: "#22c55e", // green-500
    },
    {
      title: "Unassigned",
      value: unassignedSecurity,
      subtitle: "Available to assign",
      icon: <FaBuilding style={{ fontSize: 'var(--font-size-2xl)' }} />,
      color: "#f97316", // orange-500
    },
    // {
    //   title: "Primary Shift",
    //   value: mostCommonShift,
    //   subtitle: "Most common",
    //   icon: <IoMdTime className="text-2xl" />,
    //   color: "#1360AB",
    // },
  ]

  return <StatCards stats={statsData} columns={3} />
}

export default SecurityStats
