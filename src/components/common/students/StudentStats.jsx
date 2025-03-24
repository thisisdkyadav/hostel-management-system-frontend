import { FaUsers } from "react-icons/fa"
import { BsGenderMale, BsGenderFemale } from "react-icons/bs"
import { IoMdSchool } from "react-icons/io"
import StatCards from "../StatCards"

const StudentStats = ({ students }) => {
  const totalStudents = students.length
  const maleStudents = students.filter((s) => s.gender === "Male").length
  const femaleStudents = students.filter((s) => s.gender === "Female").length

  const statsData = [
    {
      title: "Total Students",
      value: totalStudents,
      subtitle: "Currently enrolled",
      icon: <FaUsers className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Male Students",
      value: maleStudents,
      subtitle: `${((maleStudents / totalStudents) * 100).toFixed(1)}% of total`,
      icon: <BsGenderMale className="text-2xl" />,
      color: "#3b82f6", // blue-600
    },
    {
      title: "Female Students",
      value: femaleStudents,
      subtitle: `${((femaleStudents / totalStudents) * 100).toFixed(1)}% of total`,
      icon: <BsGenderFemale className="text-2xl" />,
      color: "#ec4899", // pink-500
    },
    // {
    //   title: "Active Status",
    //   value: activeStudents,
    //   subtitle: `${((activeStudents / totalStudents) * 100).toFixed(1)}% active students`,
    //   icon: <IoMdSchool className="text-2xl" />,
    //   color: "#22c55e", // green-500
    // },
  ]

  return <StatCards stats={statsData} columns={3} />
}

export default StudentStats
