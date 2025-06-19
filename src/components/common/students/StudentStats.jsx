import { FaUsers } from "react-icons/fa"
import { BsGenderMale, BsGenderFemale } from "react-icons/bs"
import { IoMdSchool } from "react-icons/io"
import StatCards from "../StatCards"
import { useEffect, useState } from "react"
import { dashboardApi } from "../../../services/dashboardApi"

// Shimmer loader component for stats
const StatCardShimmer = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-200 relative overflow-hidden">
    <div className="animate-pulse flex flex-col">
      <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
      <div className="h-8 w-16 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 w-32 bg-gray-200 rounded"></div>
    </div>
    <div className="absolute right-4 top-4">
      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
  </div>
)

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCardShimmer />
      <StatCardShimmer />
      <StatCardShimmer />
    </div>
  ) : (
    <StatCards stats={statsData} columns={3} />
  )
}

export default StudentStats
