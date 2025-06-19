import { FaUsers } from "react-icons/fa"
import { BsGenderMale, BsGenderFemale } from "react-icons/bs"
import { IoMdSchool } from "react-icons/io"
import StatCards from "../StatCards"
import { useEffect, useState } from "react"
import { dashboardApi } from "../../../services/dashboardApi"

const StudentStats = () => {
  const [studentCounts, setStudentCounts] = useState({
    total: 0,
    boys: 0,
    girls: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentCounts = async () => {
      try {
        setLoading(true)
        const response = await dashboardApi.getStudentCount()
        setStudentCounts(response.data.count || { total: 0, boys: 0, girls: 0 })
      } catch (error) {
        console.error("Failed to fetch student counts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentCounts()
  }, [])

  const statsData = [
    {
      title: "Total Students",
      value: studentCounts.total,
      subtitle: "Currently enrolled",
      icon: <FaUsers className="text-2xl" />,
      color: "#1360AB",
    },
    {
      title: "Male Students",
      value: studentCounts.boys,
      subtitle: studentCounts.total > 0 ? `${((studentCounts.boys / studentCounts.total) * 100).toFixed(1)}% of total` : "0% of total",
      icon: <BsGenderMale className="text-2xl" />,
      color: "#3b82f6", // blue-600
    },
    {
      title: "Female Students",
      value: studentCounts.girls,
      subtitle: studentCounts.total > 0 ? `${((studentCounts.girls / studentCounts.total) * 100).toFixed(1)}% of total` : "0% of total",
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

  return loading ? (
    <div className="w-full h-24 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-t-[#1360AB] rounded-full animate-spin"></div>
    </div>
  ) : (
    <StatCards stats={statsData} columns={3} />
  )
}

export default StudentStats
