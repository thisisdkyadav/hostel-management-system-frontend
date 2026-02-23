import { FaUsers } from "react-icons/fa"
import { BsGenderMale, BsGenderFemale } from "react-icons/bs"
import { StatCards } from "@/components/ui"
import { useEffect, useState } from "react"
import { dashboardApi } from "../../../service"

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
      icon: <FaUsers style={{ fontSize: "var(--font-size-2xl)" }} />,
      color: "var(--color-primary)",
    },
    {
      title: "Male Students",
      value: studentCounts.boys,
      subtitle: studentCounts.total > 0 ? `${((studentCounts.boys / studentCounts.total) * 100).toFixed(1)}% of total` : "0% of total",
      icon: <BsGenderMale style={{ fontSize: "var(--font-size-2xl)" }} />,
      color: "var(--color-info)",
    },
    {
      title: "Female Students",
      value: studentCounts.girls,
      subtitle: studentCounts.total > 0 ? `${((studentCounts.girls / studentCounts.total) * 100).toFixed(1)}% of total` : "0% of total",
      icon: <BsGenderFemale style={{ fontSize: "var(--font-size-2xl)" }} />,
      color: "var(--color-girls-text)",
    },
  ]

  return <StatCards stats={statsData} columns={3} loading={loading} loadingCount={3} />
}

export default StudentStats
