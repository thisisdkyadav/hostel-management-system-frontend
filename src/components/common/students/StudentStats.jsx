import { useEffect, useState } from "react"
import { Mars, Users, Venus } from "lucide-react"
import { StatCards } from "hzero"
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

  const share = (count) =>
    studentCounts.total > 0 ? `${((count / studentCounts.total) * 100).toFixed(1)}% of total` : "0% of total"

  const statsData = [
    {
      title: "Total Students",
      value: studentCounts.total,
      subtitle: "Currently enrolled",
      icon: <Users />,
      color: "var(--color-primary)",
    },
    {
      title: "Male Students",
      value: studentCounts.boys,
      subtitle: share(studentCounts.boys),
      icon: <Mars />,
      color: "var(--color-info)",
    },
    {
      title: "Female Students",
      value: studentCounts.girls,
      subtitle: share(studentCounts.girls),
      icon: <Venus />,
      color: "var(--color-girls-text)",
    },
  ]

  return <StatCards stats={statsData} columns={3} loading={loading} loadingCount={3} />
}

export default StudentStats
